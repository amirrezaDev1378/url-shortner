package authHandlers

import (
	"errors"
	"github.com/create-go-app/fiber-go-template/app/models"
	appErrors "github.com/create-go-app/fiber-go-template/pkg/errors"
	"github.com/create-go-app/fiber-go-template/pkg/utils"
	authConfig "github.com/create-go-app/fiber-go-template/platform/auth/config"
	authStore "github.com/create-go-app/fiber-go-template/platform/auth/store"
	dbQueries "github.com/create-go-app/fiber-go-template/platform/database/generated"
	sLog "github.com/create-go-app/fiber-go-template/platform/logger/serverLogger"
	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type UpdateUserParams struct {
	Avatar   pgtype.Text `json:"avatar" validate:"omitempty,url"`
	Password string      `json:"password" validate:"omitempty,min=6,max=100"`
}

type AuthStatusResponse struct {
	SessionExpiry string `json:"sessionExpiry"`
}

func (u UpdateUserParams) isZero() bool {
	return u.Avatar.String == "" && u.Password == ""
}
func UsersController(router fiber.Router, p *authConfig.Params) {

	router.Get("/status", PrivateRouteMiddleware, func(ctx *fiber.Ctx) error {
		errorRes := appErrors.ServerError{}
		user, err := p.Store.GetUserSessionData(ctx)
		if err != nil {
			sLog.WithStackTrace(err).Msg("Failed to get user session data")
			return errorRes.SetMessage(appErrors.ErrServerErr).SetStatus(fiber.StatusInternalServerError).Send(ctx)
		}
		if err := ctx.JSON(AuthStatusResponse{SessionExpiry: user.SessionExpiry}); err != nil {
			sLog.WithStackTrace(err).Send()
			return errorRes.SetMessage(appErrors.ErrServerErr).SetStatus(fiber.StatusInternalServerError).Send(ctx)
		}
		return nil
	})
	router.Get("/user/user-info", PrivateRouteMiddleware, func(ctx *fiber.Ctx) error {
		//todo update error messages
		generalServerErr := appErrors.ErrGeneralServerError.ServerError()
		sessionData, err := p.Store.GetUserSessionData(ctx)
		if err != nil {
			if errors.Is(err, authStore.ErrInvalidTokenData) {
				return appErrors.ErrForbidden.SendCtx(ctx)
			}
			sLog.Error().Err(err).Msg("Failed to get user session data")
			return generalServerErr.Send(ctx)
		}
		userID := pgtype.UUID{}

		if scanErr := userID.Scan(sessionData.UserId); scanErr != nil {
			return generalServerErr.Send(ctx)
		}
		user, err := p.DB.AppQueries.GetUserById(ctx.UserContext(), userID)

		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return appErrors.ErrForbidden.SendCtx(ctx)
			}
			sLog.WithStackTrace(err).Send()
			return generalServerErr.Send(ctx)
		}

		if err := ctx.JSON(models.UserInfoResponse{ID: sessionData.UserId, Email: user.Email}); err != nil {
			sLog.WithStackTrace(err).Send()
			return generalServerErr.Send(ctx)
		}
		return nil
	})
	router.Put("/user/update", PrivateRouteMiddleware, func(ctx *fiber.Ctx) error {
		errorRes := appErrors.ServerError{}
		updateParams := UpdateUserParams{}
		err := ctx.BodyParser(&updateParams)
		if err != nil {
			return errorRes.SetMessage(appErrors.ErrInvalidPayload).SetStatus(fiber.StatusBadRequest).Send(ctx)
		}
		v := utils.NewPgTypeValidator()
		err = v.Struct(updateParams)
		if err != nil {
			return errorRes.SetMessage(appErrors.ErrInvalidPayload).SetStatus(fiber.StatusBadRequest).Send(ctx)
		}

		if updateParams.isZero() {
			return errorRes.SetMessage(appErrors.ErrInvalidPayload).SetStatus(fiber.StatusBadRequest).Send(ctx)
		}

		newPassword := updateParams.Password
		if newPassword != "" {
			hashed, errHashing := authStore.HashPassword(updateParams.Password)
			if errHashing != nil {
				return errorRes.SetMessage(appErrors.ErrFailedToUpdateUser).SetStatus(fiber.StatusInternalServerError).Send(ctx)
			}
			newPassword = hashed
		}
		userID := pgtype.UUID{}
		if err = userID.Scan(ctx.Locals("userID")); err != nil {
			return errorRes.SetMessage(appErrors.ErrFailedToUpdateUser).SetStatus(123).Send(ctx)
		}
		err = p.DB.AppQueries.UpdateUser(ctx.UserContext(), dbQueries.UpdateUserParams{
			Avatar:   updateParams.Avatar,
			Password: newPassword,
			ID:       userID,
		})

		if err != nil {
			return errorRes.SetMessage(appErrors.ErrFailedToUpdateUser).SetStatus(fiber.StatusInternalServerError).Send(ctx)
		}

		return ctx.SendStatus(fiber.StatusOK)
	})

	router.Post("/user/logout", PrivateRouteMiddleware, func(ctx *fiber.Ctx) error {
		errorRes := appErrors.ServerError{}
		err := p.Store.DestroySessionCookie(ctx)
		if err != nil {
			return errorRes.SetMessage(appErrors.ErrFailedToDestroyCookie).SetStatus(fiber.StatusInternalServerError).Send(ctx)
		}
		return ctx.SendStatus(fiber.StatusOK)
	})
}
