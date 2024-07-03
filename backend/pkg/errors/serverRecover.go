package appErrors

import (
	sLog "github.com/create-go-app/fiber-go-template/platform/logger/serverLogger"
	"github.com/gofiber/fiber/v2"
	recover2 "github.com/gofiber/fiber/v2/middleware/recover"
	"runtime/debug"
)

func NewRecoverMiddleware() func(c *fiber.Ctx) error {

	return newCustomFiberRecoverMiddleware(recover2.Config{
		Next: func(c *fiber.Ctx) bool {
			return false
		},
		EnableStackTrace: true,
		StackTraceHandler: func(c *fiber.Ctx, e interface{}) {
			if errString, ok := e.(string); ok {
				sLog.Panic().Str("Panic Reason : ", errString).Msg(string(debug.Stack()))
			}
		},
	})

}

// newCustomFiberRecoverMiddleware Need to customize the recover middleware to handling error messages...
func newCustomFiberRecoverMiddleware(config recover2.Config) fiber.Handler {
	return func(c *fiber.Ctx) (err error) {
		if config.Next != nil && config.Next(c) {
			return c.Next()
		}

		defer func() {
			if r := recover(); r != nil {
				if config.EnableStackTrace {
					config.StackTraceHandler(c, r)
				}

				err = fiber.NewError(fiber.StatusInternalServerError, "Severe server Error!")
			}
		}()

		return c.Next()
	}
}
