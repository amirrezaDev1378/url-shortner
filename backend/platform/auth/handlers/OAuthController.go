package authHandlers

import (
	"context"
	appErrors "github.com/create-go-app/fiber-go-template/pkg/errors"
	"github.com/create-go-app/fiber-go-template/platform/auth/config"
	sLog "github.com/create-go-app/fiber-go-template/platform/logger/serverLogger"

	"github.com/create-go-app/fiber-go-template/platform/auth/store"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"io"
	"net/http"
)

type OAuthCallbackPayload struct {
	Code  string `json:"code" validate:"required"`
	State string `json:"state" validate:"required"`
}

type OAuthCallbackResponse struct {
	Success bool `json:"success"`
}

type OAuthLoginResponse struct {
	RedirectUrl string `json:"redirectUrl"`
}

func OAuthController(router fiber.Router, authParams *authConfig.Params, config *authConfig.OAuthConfig) {

	router.Post("/oauth/:provider/login", func(ctx *fiber.Ctx) error {
		provider := ctx.Params("provider")
		ProviderConfig := config.Providers[provider]
		if ProviderConfig.ClientSecret == "" {
			return ctx.Status(fiber.StatusBadRequest).SendString(appErrors.ErrInvalidProvider.String())
		}
		redirectUrl := ProviderConfig.AuthCodeURL("TODO: -add csrf protection")
		response := OAuthLoginResponse{redirectUrl}
		ctx.JSON(response)
		return nil
	})
	router.Post("/oauth/:provider/callback", func(ctx *fiber.Ctx) error {
		ServerError := appErrors.ServerError{}
		provider := ctx.Params("provider")
		ProviderConfig := config.Providers[provider]
		if ProviderConfig.ClientSecret == "" {
			return ServerError.SetStatus(400).SetMessage(appErrors.ErrInvalidProvider).Send(ctx)
		}

		payload := OAuthCallbackPayload{}
		err := ctx.BodyParser(&payload)
		if err = ctx.BodyParser(&payload); err != nil {
			return ServerError.SetStatus(400).SetMessage(appErrors.ErrInvalidPayload).Send(ctx)
		}

		v := validator.New()
		if err = v.Struct(payload); err != nil {
			return ServerError.SetStatus(400).SetMessage(appErrors.ErrInvalidPayload).Send(ctx)
		}

		if payload.State != "TODO: -add csrf protection" || payload.Code == "" {
			return ServerError.SetStatus(403).SetMessage(appErrors.ErrInvalidCSRF).Send(ctx)
		}

		token, err := ProviderConfig.Exchange(context.Background(), payload.Code)
		if err != nil {
			return ServerError.SetStatus(fiber.StatusForbidden).SetMessage(appErrors.ErrProviderError).Send(ctx)
		}
		resp, err := http.Get(ProviderConfig.UserInfoUrl + token.AccessToken)

		if err != nil {
			return ServerError.SetStatus(fiber.StatusBadRequest).SetMessage(appErrors.ErrProviderError).Send(ctx)
		}
		userByte, err := io.ReadAll(resp.Body)
		if err != nil {
			return ServerError.SetStatus(fiber.StatusBadRequest).SetMessage(appErrors.ErrProviderError).Send(ctx)
		}
		user := authStore.StorableUser{
			OAuthUser: true,
		}

		if err = user.FillJson(userByte); err != nil {
			return ServerError.SetStatus(fiber.StatusBadRequest).SetMessage(appErrors.ErrProviderError).Send(ctx)
		}
		userExists, err := authParams.Store.UserExists(ctx.UserContext(), user)
		var userId string
		var AuthError = appErrors.ServerError{}
		if userExists {
			userId, AuthError = authParams.Store.LoginWithOAuth(ctx.UserContext(), user)
		} else {
			userId, AuthError = authParams.Store.CreateUserWithOAuth(ctx.UserContext(), user)
		}
		if AuthError.IsNotEmpty() {
			return AuthError.Send(ctx)
		}

		err = authParams.Store.CreateSessionCookie(ctx, userId)
		if err != nil {
			sLog.WithStackTrace(err).Send()
			return ServerError.SetStatus(fiber.StatusInternalServerError).SetMessage(appErrors.ErrSessionCreationFailed).Send(ctx)
		}

		return ctx.JSON(OAuthCallbackResponse{true})
	})

}
