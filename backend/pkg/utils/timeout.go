package utils

import (
	"context"
	"errors"
	appErrors "github.com/create-go-app/fiber-go-template/pkg/errors"
	"github.com/gofiber/fiber/v2"
	"time"
)

// SetExecutionTimeOut sets the execution timeout for the request
// and returns the cancel function and the error handler
// don't forget to defer the cancel function.
func SetExecutionTimeOut(ctx *fiber.Ctx, timeout time.Duration) (cancelFunc context.CancelFunc, errorHandler func(err error) error) {
	c, cancel := context.WithTimeout(ctx.UserContext(), timeout)
	ctx.SetUserContext(c)
	handleErr := func(err error) error {
		if err == nil {
			return nil
		}
		if errors.Is(err, context.DeadlineExceeded) {
			serverError := appErrors.ServerError{}
			return serverError.SetStatus(fiber.StatusRequestTimeout).SetMessage(appErrors.ErrRequestTimeout).Send(ctx)
		}
		return err
	}
	return cancel, handleErr

}
