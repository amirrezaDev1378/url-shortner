package main

import (
	"errors"
	"github.com/create-go-app/fiber-go-template/app/controllers"
	"github.com/create-go-app/fiber-go-template/cmd/jobs"
	"github.com/create-go-app/fiber-go-template/pkg/configs"
	appErrors "github.com/create-go-app/fiber-go-template/pkg/errors"
	"github.com/create-go-app/fiber-go-template/pkg/utils"
	"github.com/create-go-app/fiber-go-template/platform/auth"
	authConfig "github.com/create-go-app/fiber-go-template/platform/auth/config"
	"github.com/create-go-app/fiber-go-template/platform/cache"
	"github.com/create-go-app/fiber-go-template/platform/database"
	sLog "github.com/create-go-app/fiber-go-template/platform/logger/serverLogger"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	_ "github.com/joho/godotenv/autoload" // load .env file automatically
	"os"
	"strconv"
	"time"
)

// FiberConfig func for configuration Fiber app.
// See: https://docs.gofiber.io/api/fiber#config
func FiberConfig() fiber.Config {
	// Define server settings.
	readTimeoutSecondsCount, _ := strconv.Atoi(os.Getenv("SERVER_READ_TIMEOUT"))

	// Return Fiber configuration.
	return fiber.Config{
		ReadTimeout: time.Second * time.Duration(readTimeoutSecondsCount),
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			message := appErrors.ErrServerErr.String()
			var e *fiber.Error
			if configs.IsDev() {
				message = err.Error()
			}
			if errors.As(err, &e) {
				code = e.Code
				message = e.Message
			}
			sLog.Error().Err(err).Msg("unhandled handler error")
			c.Set(fiber.HeaderContentType, fiber.MIMETextPlainCharsetUTF8)
			return c.Status(code).SendString(message)
		},
	}
}

func main() {
	time.Local = time.UTC
	sLog.InitLogger()
	config := FiberConfig()

	app := fiber.New(config)
	apiRouter := app.Group("/api/v1")

	queries, dbConnection, ctx := database.InitDatabase()
	redisClients, err := cache.RedisConnection()
	if err != nil {
		return
	}

	databaseParams := database.Params{
		DBContext:  ctx,
		DBPool:     dbConnection,
		AppQueries: queries,
	}

	// ! important ! initialize the redirect router before doing anything else
	controllers.RedirectController(app, &databaseParams, redisClients)

	//TODO: check if it's ok that redirect controller is also applying here
	app.Use(
		cors.New(cors.Config{
			AllowOrigins:     os.Getenv("FRONTEND_URL"), // Allow all origins.
			AllowCredentials: true,
		}),
		// using standard logger here, no need for zero logger...
		logger.New(),
		appErrors.NewRecoverMiddleware(),
	)
	authParams := authConfig.Params{
		DB: &databaseParams,
	}
	auth.InitAuth(apiRouter, &authParams)

	appControllers := controllers.AppControllers{
		DB:    &databaseParams,
		Redis: redisClients,
	}
	appControllers.InitControllers(apiRouter)

	backgroundJobs := jobs.Config{
		DB:    &databaseParams,
		Redis: redisClients,
	}

	backgroundJobs.InitJobs()

	// Start server (with or without graceful shutdown)
	if os.Getenv("STAGE_STATUS") == "dev" {
		utils.StartServer(app)
	} else {
		utils.StartServerWithGracefulShutdown(app)
	}

}
