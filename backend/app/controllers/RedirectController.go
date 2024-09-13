package controllers

import (
	"fmt"
	"github.com/create-go-app/fiber-go-template/app/services"
	"github.com/create-go-app/fiber-go-template/platform/cache"
	"github.com/create-go-app/fiber-go-template/platform/database"
	sLog "github.com/create-go-app/fiber-go-template/platform/logger/serverLogger"
	"github.com/gofiber/fiber/v2"
	"strings"
)

const RedirectMatchRegex = "^(?i)[A-Za-z0-9_]+$"

//TODO - this  controller is returning improper errors and exposes the error to the user use static html for it...

// RedirectController ! Do not use this in the controller, it is only for the main.go file
func RedirectController(app *fiber.App, db *database.Params, redisClients cache.RedisClients) {
	r := app.Group("")
	urlService := services.UrlService{
		DB:     db,
		Redis:  redisClients,
		Logger: sLog.WithScoopLogger("URL_SERVICE_REDIRECT_CONTROLLER"),
	}
	// direct redirect
	r.Get(fmt.Sprintf("/d:<regex(%v)>", RedirectMatchRegex), func(c *fiber.Ctx) error {
		urlData, err := urlService.GetDirectUrlBySlug(c.Context(), strings.Replace(c.Path(), "/", "", 1))
		if err != nil {
			return err
		}
		c.Set("Cache-Control", fmt.Sprintf("public, max-age=%v", urlData.Expiry.Seconds()))
		if urlData.IosRedirectPath != "" {
			UA := c.Get("User-Agent")
			if strings.Contains(UA, "iPhone") || strings.Contains(UA, "iPad") {
				return c.Redirect(urlData.IosRedirectPath, fiber.StatusFound)
			}
		}
		return c.Redirect(urlData.GeneralRedirectPath, fiber.StatusFound)
	})

	// static redirect
	r.Get(fmt.Sprintf("/s:slug<regex(%v)>", RedirectMatchRegex), func(c *fiber.Ctx) error {

		content, err := urlService.GetStaticUrlBySlug(c, strings.Replace(c.Path(), "/", "", 1))
		if err != nil {
			return err
		}
		c.Set("Cache-Control", "public, max-age=31536000") // 1 year in seconds
		c.Set("Content-Type", "text/html; charset=utf-8")
		return c.SendString(content)
	})
}
