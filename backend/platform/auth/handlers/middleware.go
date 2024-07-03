package authHandlers

import (
	authConfig "github.com/create-go-app/fiber-go-template/platform/auth/config"
	"github.com/gofiber/fiber/v2"
)

func noSurfing() {

}

var PrivateRouteMiddleware fiber.Handler

func InitPrivateRouteMiddleware(authParams *authConfig.Params) {
	PrivateRouteMiddleware = func(ctx *fiber.Ctx) error {

		user, err := authParams.Store.GetUserSessionData(ctx)
		userID := user.UserId
		if err == nil && userID != "" {
			ctx.Locals("userID", userID)
			return ctx.Next()
		}

		ctx.Status(fiber.StatusForbidden)
		return nil
	}
}
