package controllers

import (
	"github.com/create-go-app/fiber-go-template/app/models"
	"github.com/create-go-app/fiber-go-template/app/services"
	appErrors "github.com/create-go-app/fiber-go-template/pkg/errors"
	"github.com/create-go-app/fiber-go-template/pkg/utils"
	authHandlers "github.com/create-go-app/fiber-go-template/platform/auth/handlers"
	dbQueries "github.com/create-go-app/fiber-go-template/platform/database/generated"
	sLog "github.com/create-go-app/fiber-go-template/platform/logger/serverLogger"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgtype"
	"strconv"
	"time"
)

func (ac *AppControllers) UrlsControllers(router fiber.Router) {
	r := router.Group("/urls")
	r.Use(authHandlers.PrivateRouteMiddleware)
	logger := sLog.WithScoopLogger("URLS_CONTROLLER")
	urlService := services.UrlService{
		DB:     ac.DB,
		Redis:  ac.Redis,
		Logger: sLog.WithScoopLogger("URL_SERVICE_CONTROLLER"),
	}

	r.Post("/create", func(ctx *fiber.Ctx) error {
		//TODO add to services
		cancel, handleError := utils.SetExecutionTimeOut(ctx, time.Second*12)
		defer cancel()

		invalidPayloadErr := appErrors.ErrInvalidPayload.ServerError()
		payload := models.CreateUrlRequest{}
		if err := ctx.BodyParser(&payload); err != nil {
			return handleError(invalidPayloadErr.Send(ctx))
		}
		v := validator.New()
		if err := v.Struct(payload); err != nil {
			return handleError(invalidPayloadErr.Send(ctx))
		}

		if (payload.Type == "direct" && payload.Slug[0] != 'd') || (payload.Type == "static" && payload.Slug[0] != 's') {
			return handleError(invalidPayloadErr.Send(ctx))
		}

		userID := pgtype.UUID{}
		err := userID.Scan(ctx.Locals("userID").(string))
		if err != nil {
			logger.Err(err).Msg("Error while scanning userID")
			return handleError(appErrors.ErrGeneralServerError.Error())
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
		})
		if err != nil {
			logger.Error().Err(err).Msg("Error while creating url")
			return handleError(appErrors.ErrGeneralServerError.Error())
		}
		ctx.Status(201).SendString(strconv.Itoa(int(urlID)))
		return nil
	})
	r.Get("/get-all", func(ctx *fiber.Ctx) error {
		urls, err := urlService.GetAllUrlsByUserID(ctx.UserContext(), ctx.Locals("userID").(string))
		if err.IsNotEmpty() {
			return err.Send(ctx)
		}
		return ctx.JSON(urls)
	})
	r.Get("/get-by-id/:id<int>", func(ctx *fiber.Ctx) error {
		url, err := urlService.GetUrlByID(ctx.UserContext(), ctx.Locals("userID"), ctx.Params("id"))
		if err.IsNotEmpty() {
			return err.Send(ctx)
		}
		return ctx.JSON(url)
	})
	r.Delete("/delete/:id<int>", func(ctx *fiber.Ctx) error {
		err := urlService.UpdateUrlProps(ctx.Context(), ctx.Locals("userID"), ctx.Params("id"), services.UrlUpdatableProps{
			Deleted: true,
		})
		if err.IsNotEmpty() {
			return err.Send(ctx)
		}
		return ctx.SendStatus(204)
	})
	r.Put("/disable/:id<int>", func(ctx *fiber.Ctx) error {
		err := urlService.UpdateUrlProps(ctx.Context(), ctx.Locals("userID"), ctx.Params("id"), services.UrlUpdatableProps{
			Disabled: true,
		})
		if err.IsNotEmpty() {
			return err.Send(ctx)
		}
		return ctx.SendStatus(204)
	})
}
