package controllers

import (
	"github.com/create-go-app/fiber-go-template/platform/cache"
	"github.com/create-go-app/fiber-go-template/platform/database"
	"github.com/gofiber/fiber/v2"
)

type AppControllers struct {
	DB    *database.Params
	Redis cache.RedisClients
}

func (ac *AppControllers) InitControllers(router fiber.Router) {
	ac.DB.ValidateDBParams()
	if !ac.Redis.IsValid() {
		panic("No Redis Instance Provided")
	}
	// initialize controllers...
	ac.UrlsControllers(router)
}
