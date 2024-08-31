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
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/rs/zerolog"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"
	"time"
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
	// TODO add this feature for static urls again
	//if (params.Type == "direct" && params.Slug[0] != 'd') || (params.Type == "static" && params.Slug[0] != 's') {
	//	return 0, appErrors.ErrInvalidPayload.Error()
	//}

	tx, err := s.DB.DBPool.Begin(ctx)
	if err != nil {
		s.Logger.Error().Err(err).Msg("Error while creating transaction")
		return 0, err
	}

	defer tx.Rollback(ctx)

	qtx := s.DB.AppQueries.WithTx(tx)

	createResult, err := qtx.CreateUrl(ctx, *params)
	if err != nil {
		s.Logger.Error().Err(err).Msg("Error while running create url query")
		return 0, err
	}
	if params.Type == "direct" {
		err := s.setDirectUrlInRedis(ctx, createResult.Slug, UrlRedirectPathsData{
			GeneralRedirectPath: params.GeneralRedirectPath,
			IosRedirectPath:     params.IosRedirectPath.String,
		}, params.ExpiresAt.Time)
		if err != nil {
			s.Logger.Error().Err(err).Msg("Error while setting direct url in redis")
			return 0, err
		}
	}
	if params.Type == "static" {
		err = s.createStaticURL(ctx, qtx, createResult.ID, createResult.Slug, params)
		if err != nil {
			s.Logger.Error().Err(err).Msg("Error while running create static url query")
			return 0, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		s.Logger.Error().Err(err).Msg("Error while committing transaction")
		return 0, err
	}
	return createResult.ID, nil
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
	tx, err := s.DB.DBPool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		s.Logger.Error().Err(err).Msg("Error while creating transaction")
		return appErrors.ErrGeneralServerError.ServerError()
	}

	urlIDInt, err := strconv.Atoi(urlID)
	if err != nil {
		s.Logger.Error().Err(err).Msg("Error while converting urlID to int")
		return appErrors.ErrGeneralServerError.ServerError()
	}

	row, err := s.DB.AppQueries.GetUrlById(ctx, int32(urlIDInt))
	if err != nil {
		if database.IsNoRowsErr(err) {
			return appErrors.ErrNotFound.ServerError()
		}
		s.Logger.Error().Err(err).Msg("Error while getting url by id")
		return appErrors.ErrGeneralServerError.ServerError()
	}

	if !utils.CompareUUIDWithString(row.CreatedBy, userID) {
		return appErrors.ErrForbidden.ServerError()
	}

	if row.Deleted {
		return appErrors.ErrForbidden.ServerError()
	}

	updatedUrlProps := dbQueries.UpdateUrlPropsParams{
		Disabled: params.Disabled,
		Deleted:  params.Deleted,
		ID:       int32(urlIDInt),
	}

	if err := s.DB.AppQueries.UpdateUrlProps(ctx, updatedUrlProps); err != nil {
		s.Logger.Error().Err(err).Msg("Error while updating url props")
		return appErrors.ErrGeneralServerError.ServerError()
	}

	if err := s.handleUrlPropsChange(ctx, row, params); err != nil {
		s.Logger.Error().Err(err).Msg("Error while handling url props change")
		return appErrors.ErrGeneralServerError.ServerError()
	}

	if err := tx.Commit(ctx); err != nil {
		s.Logger.Error().Err(err).Msg("Error while committing transaction")
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
		err = s.setDirectUrlInRedis(ctx, slug, redirectPaths, urlRedirectPaths.ExpiresAt.Time)
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
func (s *UrlService) createStaticURL(ctx context.Context, qtx *dbQueries.Queries, urlID int32, slug string, params *dbQueries.CreateUrlParams) error {
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

	if err := s.setStaticUrlInRedis(ctx, slug, generalDeviceType, generalPageContent, params.ExpiresAt.Time); err != nil {
		return err
	}
	if err := s.setStaticUrlInRedis(ctx, slug, iosDeviceType, iosPageContent, params.ExpiresAt.Time); err != nil {
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
		return "", errors.New("getStaticUrlFromDB -- invalid device type")
	}

	if err != nil {
		return "", err
	}
	if content == "" {
		return "", errors.New("content not found")
	}

	urlData, err := s.DB.AppQueries.GetUrlBySlug(ctx, slug)
	if err != nil {
		return "", err
	}

	if err := s.setStaticUrlInRedis(ctx, slug, deviceType, content, urlData.ExpiresAt.Time); err != nil {
		return "", err
	}

	return content, nil
}

func (s *UrlService) setDirectUrlInRedis(ctx context.Context, slug string, redirectUrl UrlRedirectPathsData, exp time.Time) error {
	err := s.Redis.DirectUrlClient.HSet(ctx, slug, generalRedirectPathRedisKey, redirectUrl.GeneralRedirectPath, iosRedirectPathRedisKey, redirectUrl.IosRedirectPath).Err()
	if err != nil {
		return err
	}

	if !exp.IsZero() {
		return s.Redis.DirectUrlClient.ExpireAt(ctx, slug, exp).Err()
	}
	return nil
}
func (s *UrlService) setStaticUrlInRedis(ctx context.Context, slug, deviceType, content string, exp time.Time) error {
	switch deviceType {
	case iosDeviceType:
		if err := s.Redis.StaticUrlClient.HSet(ctx, slug, iosRedirectPathRedisKey, content).Err(); err != nil {
			return err
		}
	case generalDeviceType:
		if err := s.Redis.StaticUrlClient.HSet(ctx, slug, generalRedirectPathRedisKey, content).Err(); err != nil {
			return err
		}
	default:
		return errors.New("setStaticUrlInRedis -- invalid device type")
	}

	if !exp.IsZero() {
		return s.Redis.StaticUrlClient.ExpireAt(ctx, slug, exp).Err()
	}
	return nil
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

func (s *UrlService) handleUrlPropsChange(ctx context.Context, row dbQueries.GetUrlByIdRow, updatedProps UrlUpdatableProps) error {
	shouldDeleteFromRedis := updatedProps.Deleted || updatedProps.Disabled
	if shouldDeleteFromRedis {
		return s.deleteUrlFromRedis(ctx, row.Slug)
	}
	switch row.Type {
	case "direct":
		return s.setDirectUrlInRedis(ctx, row.Slug, UrlRedirectPathsData{
			IosRedirectPath:     row.IosRedirectPath.String,
			GeneralRedirectPath: row.GeneralRedirectPath,
		}, row.ExpiresAt.Time)
	case "static":
		staticUrl, err := s.DB.AppQueries.GetStaticUrlByUrlID(ctx, row.ID)
		if err != nil {
			return err
		}
		if staticUrl.IosContent.Valid {
			err := s.setStaticUrlInRedis(ctx, row.Slug, iosDeviceType, staticUrl.IosContent.String, row.ExpiresAt.Time)
			if err != nil {
				return err
			}
		}

		return s.setStaticUrlInRedis(ctx, row.Slug, generalDeviceType, staticUrl.GeneralContent, row.ExpiresAt.Time)
	default:
		s.Logger.Error().Msg("Invalid url type")
		return errors.New("invalid url type provided " + string(row.Type))
	}
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
