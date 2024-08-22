package controllers

import (
	"errors"
	"github.com/create-go-app/fiber-go-template/app/models"
	"github.com/create-go-app/fiber-go-template/app/services"
	appErrors "github.com/create-go-app/fiber-go-template/pkg/errors"
	"github.com/create-go-app/fiber-go-template/pkg/utils"
	authHandlers "github.com/create-go-app/fiber-go-template/platform/auth/handlers"
	"github.com/create-go-app/fiber-go-template/platform/database"
	dbQueries "github.com/create-go-app/fiber-go-template/platform/database/generated"
	sLog "github.com/create-go-app/fiber-go-template/platform/logger/serverLogger"
	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v5/pgtype"
	"strconv"
	"time"
)

const maxTempUrlExpiration = time.Hour * 24 * 31

func (ac *AppControllers) UrlsControllers(router fiber.Router) {
	urlRouter := router.Group("/urls")

	logger := sLog.WithScoopLogger("URLS_CONTROLLER")
	urlService := services.UrlService{
		DB:     ac.DB,
		Redis:  ac.Redis,
		Logger: sLog.WithScoopLogger("URL_SERVICE_CONTROLLER"),
	}

	// not authenticated routes
	router.Post("/temp-urls/create", func(ctx *fiber.Ctx) error {
		cancel, handleError := utils.SetExecutionTimeOut(ctx, time.Second*12)
		defer cancel()

		requestBody := utils.SafeStruct[models.CreateUrlRequest]{}
		if err := requestBody.CtxBodyParser(ctx); err != nil {
			logger.Debug().Err(err).Msg("Error while parsing request body")

			return handleError(appErrors.ErrInvalidPayload.SendCtx(ctx))
		}

		payload := requestBody.Values()

		if payload.Type != "direct" {
			return handleError(appErrors.ErrInvalidPayload.SendCtx(ctx))
		}

		expiresAt, err := utils.GetPGTimeStamp(payload.Expiration, time.RFC3339)
		if err != nil {
			return handleError(appErrors.ErrInvalidPayload.SendCtx(ctx))
		}
		isValidExpiration := expiresAt.Valid && !expiresAt.Time.Before(time.Now()) && !expiresAt.Time.After(time.Now().Add(maxTempUrlExpiration))
		if !isValidExpiration {
			return handleError(appErrors.ErrInvalidPayload.SendCtx(ctx))
		}

		urlID, err := urlService.CreateURl(ctx.UserContext(), &dbQueries.CreateUrlParams{
			CreatedBy: pgtype.UUID{},
			Type:      dbQueries.ValidUrlTypes(payload.Type),
			IosRedirectPath: pgtype.Text{
				Valid:  true,
				String: payload.IosRedirectPath,
			},
			GeneralRedirectPath: payload.GeneralRedirectPath,
			Slug:                payload.Slug,
			ExpiresAt:           expiresAt,
		})

		if err != nil {
			if errors.Is(err, appErrors.ErrInvalidPayload.Error()) {
				return handleError(appErrors.ErrInvalidPayload.SendCtx(ctx))
			}
			if database.ParseDbError(err).Code == pgerrcode.UniqueViolation {
				return handleError(appErrors.ErrSlugAlreadyExists.SendCtx(ctx))
			}
			logger.Error().Err(err).Msg("Error while creating url")
			return appErrors.ErrGeneralServerError.Error()
		}
		ctx.Status(201).SendString(strconv.Itoa(int(urlID)))
		return nil
	})
	router.Post("/urls/get-random-slug", utils.RateLimiterConfig{Max: 5, Expiration: time.Minute}.Middleware(), func(ctx *fiber.Ctx) error {
		cancel, handleError := utils.SetExecutionTimeOut(ctx, time.Second*12)
		defer cancel()
		response := utils.ResponseType[models.GetRandomSlugResponse]{}

		slug, err := urlService.GetRandomSlug(ctx.Context())
		if err.IsNotEmpty() {
			return handleError(appErrors.ErrGeneralServerError.Error())
		}
		response.Fill(models.GetRandomSlugResponse{Slug: slug})

		return response.SendCtx(ctx)
	})

	// authenticated routes
	urlRouter.Use(authHandlers.PrivateRouteMiddleware)
	urlRouter.Post("/create", func(ctx *fiber.Ctx) error {
		cancel, handleError := utils.SetExecutionTimeOut(ctx, time.Second*12)
		defer cancel()

		requestBody := utils.SafeStruct[models.CreateUrlRequest]{}
		if err := requestBody.CtxBodyParser(ctx); err != nil {
			return handleError(appErrors.ErrInvalidPayload.SendCtx(ctx))
		}

		payload := requestBody.Values()

		userID, err := utils.GetUUIDFromString(ctx.Locals("userID"))
		if err != nil {
			logger.Err(err).Msg("Error while scanning userID")
			return handleError(appErrors.ErrGeneralServerError.Error())
		}

		expiresAt := pgtype.Timestamp{Valid: false}
		if payload.Expiration != "" {
			err = expiresAt.Scan(payload.Expiration)
			if err != nil || !expiresAt.Valid {
				logger.Err(err).Msg("Error while scanning expiration")
				return handleError(appErrors.ErrGeneralServerError.SendCtx(ctx))
			}
		}

		urlID, err := urlService.CreateURl(ctx.UserContext(), &dbQueries.CreateUrlParams{
			CreatedBy: userID,
			Type:      dbQueries.ValidUrlTypes(payload.Type),
			IosRedirectPath: pgtype.Text{
				Valid:  true,
				String: payload.IosRedirectPath,
			},
			GeneralRedirectPath: payload.GeneralRedirectPath,
			Slug:                payload.Slug,
			ExpiresAt:           expiresAt,
		})

		if err != nil {
			if errors.Is(err, appErrors.ErrInvalidPayload.Error()) {
				return handleError(appErrors.ErrInvalidPayload.SendCtx(ctx))
			}
			logger.Error().Err(err).Msg("Error while creating url")
			return appErrors.ErrGeneralServerError.Error()
		}
		ctx.Status(201).SendString(strconv.Itoa(int(urlID)))
		return nil
	})
	urlRouter.Get("/get-all", func(ctx *fiber.Ctx) error {
		urls, err := urlService.GetAllUrlsByUserID(ctx.UserContext(), ctx.Locals("userID").(string))
		if err.IsNotEmpty() {
			return err.Send(ctx)
		}
		return ctx.JSON(urls)
	})
	urlRouter.Get("/get-by-id/:id<int>", func(ctx *fiber.Ctx) error {
		url, err := urlService.GetUrlByID(ctx.UserContext(), ctx.Locals("userID"), ctx.Params("id"))
		if err.IsNotEmpty() {
			return err.Send(ctx)
		}
		return ctx.JSON(url)
	})
	urlRouter.Delete("/delete/:id<int>", func(ctx *fiber.Ctx) error {
		err := urlService.UpdateUrlProps(ctx.Context(), ctx.Locals("userID"), ctx.Params("id"), services.UrlUpdatableProps{
			Deleted: true,
		})
		if err.IsNotEmpty() {
			return err.Send(ctx)
		}
		return ctx.Status(201).Send(nil)
	})
	urlRouter.Put("/disable/:id<int>", func(ctx *fiber.Ctx) error {
		err := urlService.UpdateUrlProps(ctx.Context(), ctx.Locals("userID"), ctx.Params("id"), services.UrlUpdatableProps{
			Disabled: true,
		})
		if err.IsNotEmpty() {
			return err.Send(ctx)
		}
		return ctx.Status(201).Send(nil)
	})
	urlRouter.Put("/enable/:id<int>", func(ctx *fiber.Ctx) error {
		err := urlService.UpdateUrlProps(ctx.Context(), ctx.Locals("userID"), ctx.Params("id"), services.UrlUpdatableProps{
			Disabled: false,
		})
		if err.IsNotEmpty() {
			return err.Send(ctx)
		}
		return ctx.Status(201).Send(nil)
	})
}
