package authHandlers

import (
	appErrors "github.com/create-go-app/fiber-go-template/pkg/errors"
	authConfig "github.com/create-go-app/fiber-go-template/platform/auth/config"
	authStore "github.com/create-go-app/fiber-go-template/platform/auth/store"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type RegisterWithCredentialPayload struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

type EmailAuthResponse struct {
	Success bool `json:"success"`
}

func EmailAuthController(router fiber.Router, authParams *authConfig.Params) {
	router.Post("/email/login", func(ctx *fiber.Ctx) error {
		serverErr := appErrors.ServerError{}
		payload := RegisterWithCredentialPayload{}

		if err := ctx.BodyParser(&payload); err != nil {
			return appErrors.ErrInvalidPayload.SendCtx(ctx)
		}
		v := validator.New()

		if err := v.Struct(payload); err != nil {
			return appErrors.ErrInvalidPayload.SendCtx(ctx)
		}
		user := authStore.StorableUser{
			Email:     payload.Email,
			Password:  payload.Password,
			OAuthUser: true,
		}

		err := user.Validate()
		if err != nil {
			return appErrors.ErrInvalidPayload.SendCtx(ctx)
		}

		userID, loginErr := authParams.Store.LoginWithCredentials(ctx.UserContext(), user)
		if loginErr.IsNotEmpty() {
			return loginErr.Send(ctx)
		}

		err = authParams.Store.CreateSessionCookie(ctx, userID)
		if err != nil {
			return serverErr.SetMessage(appErrors.ErrSessionCreationFailed).GetError()
		}

		return nil
	})
	router.Post("/email/register", func(ctx *fiber.Ctx) error {
		serverErr := appErrors.ServerError{}
		payload := RegisterWithCredentialPayload{}

		if err := ctx.BodyParser(&payload); err != nil {
			return appErrors.ErrInvalidPayload.SendCtx(ctx)
		}
		v := validator.New()

		if err := v.Struct(payload); err != nil {
			return appErrors.ErrInvalidPayload.SendCtx(ctx)
		}
		exists, err := authParams.DB.AppQueries.CheckUserExists(ctx.UserContext(), payload.Email)
		if err != nil {
			return serverErr.SetStatus(500).SetMessage(appErrors.ErrServerErr).Send(ctx)
		}
		if exists {
			return appErrors.ErrUserAlreadyExists.SendCtx(ctx)
		}

		user := authStore.StorableUser{
			Email:     payload.Email,
			Password:  payload.Password,
			OAuthUser: false,
		}
		err = user.Validate()

		userID, createUserErr := authParams.Store.CreateUserWithCredentials(ctx.UserContext(), user)

		if createUserErr.IsNotEmpty() {
			return createUserErr.Send(ctx)
		}

		if err = authParams.Store.CreateSessionCookie(ctx, userID); err != nil {
			return serverErr.SetStatus(500).SetMessage(appErrors.ErrBadRequest).Send(ctx)
		}

		return ctx.Status(201).JSON(&EmailAuthResponse{Success: true})
	})
}
