package services

import (
	"context"
	"errors"
	"fmt"
	"github.com/PuerkitoBio/goquery"
	appErrors "github.com/create-go-app/fiber-go-template/pkg/errors"
	"github.com/create-go-app/fiber-go-template/pkg/utils"
	"github.com/create-go-app/fiber-go-template/platform/cache"
	"github.com/create-go-app/fiber-go-template/platform/database"
	dbQueries "github.com/create-go-app/fiber-go-template/platform/database/generated"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/rs/zerolog"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"
)

type UrlService struct {
	DB     *database.Params
	Redis  cache.RedisClients
	Logger *zerolog.Logger
}
type DeviceTypes struct {
	Types string `validate:"required,oneof=ios general"`
}

type UrlRedirectPathsData struct {
	GeneralRedirectPath string
	IosRedirectPath     string
}

type StaticUrlContent struct {
	GeneralContent string
	IosContent     string
}
type pageResultChan struct {
	err     error
	content string
	UA      string
}

type UrlUpdatableProps struct {
	Disabled bool `json:"disabled" validate:"omitempty,boolean"`
	Deleted  bool `json:"deleted" validate:"omitempty,boolean"`
}

const (
	iosRedirectPathRedisKey     = "irp"
	generalRedirectPathRedisKey = "grp"

	iosDeviceType     = "ios"
	generalDeviceType = "general"
)

func (s *UrlService) CreateURl(ctx context.Context, params *dbQueries.CreateUrlParams) (int32, error) {
	tx, err := s.DB.DBPool.Begin(ctx)
	if err != nil {
		s.Logger.Error().Err(err).Msg("Error while creating transaction")
		return 0, err
	}

	defer func(tx pgx.Tx, ctx context.Context) {
		err := tx.Rollback(ctx)
		if err != nil {
			s.Logger.Error().Msg(err.Error())
		}
	}(tx, ctx)

	qtx := s.DB.AppQueries.WithTx(tx)

	urlID, err := qtx.CreateUrl(ctx, *params)
	if err != nil {
		s.Logger.Error().Err(err).Msg("Error while running create url query")
		return 0, err
	}
	if params.Type == "static" {
		err = s.createStaticURL(ctx, qtx, urlID, params)
		if err != nil {
			s.Logger.Error().Err(err).Msg("Error while running create static url query")
			return 0, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		s.Logger.Error().Err(err).Msg("Error while committing transaction")
		return 0, err
	}
	return urlID, nil
}

func (s *UrlService) DeleteUrlByID(ctx context.Context, userID interface{}, urlID string) appErrors.ServerError {
	tx, err := s.DB.DBPool.Begin(ctx)
	sErr := appErrors.ErrGeneralServerError.ServerError()
	if err != nil {
		s.Logger.Error().Err(err).Msg("Error while creating transaction")
		return sErr
	}
	defer tx.Rollback(ctx)
	qtx := s.DB.AppQueries.WithTx(tx)
	urlIdInt, err := strconv.Atoi(urlID)
	uuid, err := utils.GetUUIDFromString(userID)
	if err != nil {
		s.Logger.Error().Err(err).Msg("Error while scanning userID")
		return sErr
	}

	row, err := qtx.GetUrlById(ctx, int32(urlIdInt))
	if err != nil {
		s.Logger.Error().Err(err).Msg("Error while getting url by id")
		return sErr
	}
	if row.CreatedBy.Bytes != uuid.Bytes {
		return appErrors.ErrForbidden.ServerError()
	}

	if row.Type == "static" {
		if err := qtx.DeleteStaticUrlByOwnerID(ctx, int32(urlIdInt)); err != nil {
			s.Logger.Error().Err(err).Msg("Error while deleting static url")
			return sErr
		}
	}

	if err := s.deleteUrlFromRedis(ctx, row.Slug); err != nil {
		s.Logger.Error().Err(err).Msg("Error while deleting url from redis")
		return sErr
	}

	if err := qtx.DeleteUrlByID(ctx, int32(urlIdInt)); err != nil {
		s.Logger.Error().Err(err).Msg("Error while deleting url by id")
		return sErr
	}

	if err := tx.Commit(ctx); err != nil {
		s.Logger.Error().Err(err).Msg("Error while committing transaction")
		return sErr
	}
	return appErrors.EmptyServerErr()
}
func (s *UrlService) GetAllUrlsByUserID(ctx context.Context, userID string) ([]dbQueries.GetUrlsByUserRow, appErrors.ServerError) {
	sErr := appErrors.ErrGeneralServerError.ServerError()
	userUUID, err := utils.GetUUIDFromString(userID)

	if err != nil {
		s.Logger.Error().Err(err).Msg("Error while scanning userID")
		return []dbQueries.GetUrlsByUserRow{}, sErr
	}

	urls, err := s.DB.AppQueries.GetUrlsByUser(ctx, dbQueries.GetUrlsByUserParams{
		CreatedBy: userUUID,
		Limit:     20,
	})

	if err != nil {
		s.Logger.Error().Err(err).Msg("Error while getting urls by user")
		return nil, sErr
	}
	if urls == nil {
		return []dbQueries.GetUrlsByUserRow{}, appErrors.EmptyServerErr()
	}
	return urls, appErrors.EmptyServerErr()
}
func (s *UrlService) GetUrlByID(ctx context.Context, userID interface{}, urlID string) (dbQueries.GetUrlByIdRow, appErrors.ServerError) {
	urlIDInt, err := strconv.Atoi(urlID)
	if err != nil {
		s.Logger.Error().Err(err).Msg("Error while converting urlID to int")
		return dbQueries.GetUrlByIdRow{}, appErrors.ErrGeneralServerError.ServerError()
	}
	row, err := s.DB.AppQueries.GetUrlById(ctx, int32(urlIDInt))
	if err != nil {
		s.Logger.Error().Err(err).Msg("Error while getting url by id")
		return dbQueries.GetUrlByIdRow{}, appErrors.ErrGeneralServerError.ServerError()
	}

	if !utils.CompareUUIDWithString(row.CreatedBy, userID) {
		return dbQueries.GetUrlByIdRow{}, appErrors.ErrForbidden.ServerError()
	}
	return row, appErrors.EmptyServerErr()
}
func (s *UrlService) GetDirectUrlBySlug(ctx context.Context, slug string) (UrlRedirectPathsData, error) {
	return s.getUrlRedirectPaths(ctx, slug)
}
func (s *UrlService) GetStaticUrlBySlug(c *fiber.Ctx, slug string) (string, error) {
	deviceType := generalDeviceType
	UA := c.Get("User-Agent")
	if strings.Contains(UA, "iPhone") || strings.Contains(UA, "iPad") {
		deviceType = iosDeviceType
	}
	content, err := s.getStaticUrlContent(c.Context(), slug, deviceType)
	return content, err
}
func (s *UrlService) UpdateUrlProps(ctx context.Context, userID interface{}, urlID string, params UrlUpdatableProps) appErrors.ServerError {

	urlIDInt, err := strconv.Atoi(urlID)
	if err != nil {
		s.Logger.Error().Err(err).Msg("Error while converting urlID to int")
		return appErrors.ErrGeneralServerError.ServerError()
	}
	row, err := s.DB.AppQueries.GetUrlById(ctx, int32(urlIDInt))
	if err != nil {
		s.Logger.Error().Err(err).Msg("Error while getting url by id")
		return appErrors.ErrGeneralServerError.ServerError()
	}

	if !utils.CompareUUIDWithString(row.CreatedBy, userID) {
		return appErrors.ErrForbidden.ServerError()
	}

	if row.Deleted {
		return appErrors.ErrForbidden.ServerError()
	}

	newProps := dbQueries.UpdateUrlPropsParams{
		Disabled: params.Disabled,
		Deleted:  params.Deleted,
	}

	if err := s.DB.AppQueries.UpdateUrlProps(ctx, newProps); err != nil {
		s.Logger.Error().Err(err).Msg("Error while updating url props")
		return appErrors.ErrGeneralServerError.ServerError()
	}
	return appErrors.EmptyServerErr()
}

func (s *UrlService) getUrlRedirectPaths(ctx context.Context, slug string) (UrlRedirectPathsData, error) {
	redirectPaths := UrlRedirectPathsData{}
	redirectPaths.IosRedirectPath = s.Redis.DirectUrlClient.HGet(ctx, slug, iosRedirectPathRedisKey).Val()
	redirectPaths.GeneralRedirectPath = s.Redis.DirectUrlClient.HGet(ctx, slug, generalRedirectPathRedisKey).Val()

	if redirectPaths.GeneralRedirectPath == "" {
		urlRedirectPaths, err := s.DB.AppQueries.GetUrlBySlug(ctx, slug)
		if err != nil {
			return redirectPaths, err
		}
		redirectPaths.GeneralRedirectPath = urlRedirectPaths.GeneralRedirectPath
		redirectPaths.IosRedirectPath = urlRedirectPaths.IosRedirectPath.String
		err = s.setDirectUrlInRedis(ctx, slug, redirectPaths)
		if err != nil {
			return redirectPaths, err
		}
	}
	return redirectPaths, nil
}

func (s *UrlService) getStaticUrlContent(ctx context.Context, slug, deviceType string) (string, error) {
	v := validator.New()

	if err := v.Struct(DeviceTypes{Types: deviceType}); err != nil {
		return "", err
	}

	var content string

	cachedContent, err := s.getStaticUrlFromRedis(ctx, slug, deviceType)
	if err != nil {
		return "", err
	}

	if cachedContent != "" {
		return cachedContent, nil
	}
	content, err = s.getStaticUrlFromDB(ctx, slug, deviceType)

	if err != nil {
		return "", err
	}
	return content, nil
}
func (s *UrlService) createStaticURL(ctx context.Context, qtx *dbQueries.Queries, urlID int32, params *dbQueries.CreateUrlParams) error {
	iosPageContent := ""
	generalPageContent := ""
	resultChan := make(chan pageResultChan)
	var wg sync.WaitGroup

	cancelableCtx, cancel := context.WithCancel(ctx)
	defer cancel()

	go func() {
		<-ctx.Done()
		cancel()
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		fetchAndParsePageWithUserAgent(cancelableCtx, params.GeneralRedirectPath, utils.UA_Windows, resultChan)
	}()

	if params.IosRedirectPath.Valid {
		wg.Add(1)
		go func() {
			defer wg.Done()
			fetchAndParsePageWithUserAgent(cancelableCtx, params.IosRedirectPath.String, utils.UA_IOS, resultChan)
		}()
	}

	go func() {
		wg.Wait()
		close(resultChan)
	}()

	for res := range resultChan {
		if res.err != nil {
			return res.err
		}
		if res.UA == utils.UA_Windows {
			generalPageContent = res.content
		} else {
			iosPageContent = res.content
		}
	}

	err := qtx.CreateStaticUrl(ctx, dbQueries.CreateStaticUrlParams{
		UrlID:          urlID,
		GeneralContent: generalPageContent,
		IosContent: pgtype.Text{
			String: iosPageContent,
			Valid:  true,
		},
	})

	if err != nil {
		return err
	}

	if err := s.setStaticUrlInRedis(ctx, params.Slug, generalDeviceType, generalPageContent); err != nil {
		return err
	}
	if err := s.setStaticUrlInRedis(ctx, params.Slug, iosDeviceType, iosPageContent); err != nil {
		return err
	}

	return nil
}
func (s *UrlService) getStaticUrlFromRedis(ctx context.Context, slug, deviceType string) (string, error) {
	switch deviceType {

	case iosDeviceType:
		if cachedContent := s.Redis.StaticUrlClient.HGet(ctx, slug, iosRedirectPathRedisKey).Val(); cachedContent != "" {
			return cachedContent, nil
		}
		break

	case generalDeviceType:
		if cachedContent := s.Redis.StaticUrlClient.HGet(ctx, slug, generalRedirectPathRedisKey).Val(); cachedContent != "" {
			return cachedContent, nil
		}
		break

	default:
		return "", errors.New("invalid device type4")
	}

	return "", nil
}
func (s *UrlService) getStaticUrlFromDB(ctx context.Context, slug, deviceType string) (string, error) {
	var content string
	var err error
	switch deviceType {
	case iosDeviceType:
		iosContent, getContentErr := s.DB.AppQueries.GetStaticUrlIOSContent(ctx, slug)
		if getContentErr != nil {
			return "", err
		}

		if iosContent.String == "" {
			content, err = s.DB.AppQueries.GetStaticUrlGeneralContent(ctx, slug)
			break
		}
		content = iosContent.String
		break
	case generalDeviceType:
		content, err = s.DB.AppQueries.GetStaticUrlGeneralContent(ctx, slug)
		break
	default:
		return "", errors.New("invalid device type2")
	}

	if err != nil {
		return "", err
	}
	if content == "" {
		return "", errors.New("content not found")
	}

	if err := s.setStaticUrlInRedis(ctx, slug, deviceType, content); err != nil {
		return "", err
	}

	return content, nil
}

func (s *UrlService) setDirectUrlInRedis(ctx context.Context, slug string, redirectUrl UrlRedirectPathsData) error {
	return s.Redis.DirectUrlClient.HSet(ctx, slug, generalRedirectPathRedisKey, redirectUrl.GeneralRedirectPath, iosRedirectPathRedisKey, redirectUrl.IosRedirectPath).Err()
}
func (s *UrlService) setStaticUrlInRedis(ctx context.Context, slug, deviceType, content string) error {
	switch deviceType {
	case iosDeviceType:
		return s.Redis.StaticUrlClient.HSet(ctx, slug, iosRedirectPathRedisKey, content).Err()
	case generalDeviceType:
		return s.Redis.StaticUrlClient.HSet(ctx, slug, generalRedirectPathRedisKey, content).Err()
	default:
		return errors.New("invalid device type1")
	}
}

func (s *UrlService) deleteUrlFromRedis(ctx context.Context, slug string) error {
	if err := s.Redis.DirectUrlClient.Del(ctx, slug).Err(); err != nil {
		return err
	}

	if err := s.Redis.StaticUrlClient.Del(ctx, slug).Err(); err != nil {
		return err
	}
	return nil
}

func fetchAndParsePageWithUserAgent(ctx context.Context, targetUrl, userAgent string, resChan chan pageResultChan) {
	httpClient := http.Client{}
	result := pageResultChan{
		UA: userAgent,
	}
	sendResult := func(err error, content string) {
		result.err = err
		result.content = content
		resChan <- result
	}
	req, err := http.NewRequestWithContext(ctx, "GET", targetUrl, http.NoBody)
	if err != nil {
		sendResult(err, "")
		return
	}
	req.Header.Set("User-Agent", userAgent)
	response, err := httpClient.Do(req)
	if err != nil {
		sendResult(err, "")
		return
	}
	if response == nil {
		sendResult(fmt.Errorf("failed to fetch %s: response is nil", targetUrl), "")
		return
	}
	defer response.Body.Close()

	// handle non-success full status codes
	if response.StatusCode > 399 {
		sendResult(fmt.Errorf("failed to fetch %s: status code %d", targetUrl, response.StatusCode), "")
		return
	}

	content, err := addBaseURlToHtmlLinks(response.Request.URL.String(), response.Body)
	if err != nil {
		sendResult(err, "")
		return
	}
	sendResult(nil, content)
}
func addBaseURlToHtmlLinks(fullUrl string, htmlContent io.Reader) (string, error) {
	parsedUrl, err := url.Parse(fullUrl)
	if err != nil {
		return "", err
	}

	doc, err := goquery.NewDocumentFromReader(htmlContent)
	if err != nil {
		return "", err
	}
	doc.Find("head").PrependHtml(fmt.Sprintf("<base href='%s://%s' />", parsedUrl.Scheme, parsedUrl.Host))
	if doc.Find("link[rel='icon']").Text() == "" {
		doc.Find("head").AppendHtml(fmt.Sprintf("<link rel='icon' href='%s://%s/favicon.ico' />", parsedUrl.Scheme, parsedUrl.Host))
	}

	return doc.Html()

}
