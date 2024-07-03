package auth

import (
	appErrors "github.com/create-go-app/fiber-go-template/pkg/errors"
	authConfig "github.com/create-go-app/fiber-go-template/platform/auth/config"
	authHandlers "github.com/create-go-app/fiber-go-template/platform/auth/handlers"
	"github.com/create-go-app/fiber-go-template/platform/auth/store"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"time"
)

// ! TODO : there is huge issue with the auth system.
//	if user data changes or worse being deleted the session will still be valid for ever

func InitAuth(apiRouter fiber.Router, p *authConfig.Params) {
	p.DB.ValidateDBParams()
	p.Store = authStore.InitSessionStore(p.DB)

	OAuth := authConfig.OAuthConfig{
		Providers: make(map[string]authConfig.ProviderType),
	}
	OAuth.Providers = authConfig.GetOAuthProviders()
	router := apiRouter.Group("/auth")

	router.Use(limiter.New(limiter.Config{
		Max:        authConfig.MaxRequestsInMinute,
		Expiration: time.Minute,
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).SendString(appErrors.ErrTooMuchRequests.String())
		},
		SkipFailedRequests:     false,
		SkipSuccessfulRequests: false,
		LimiterMiddleware:      limiter.SlidingWindow{},
	}))

	authHandlers.InitPrivateRouteMiddleware(p)
	authHandlers.OAuthController(router, p, &OAuth)
	authHandlers.EmailAuthController(router, p)
	authHandlers.UsersController(router, p)
}
