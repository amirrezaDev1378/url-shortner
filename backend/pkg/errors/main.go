package appErrors

import (
	"errors"
	sLog "github.com/create-go-app/fiber-go-template/platform/logger/serverLogger"
	"github.com/gofiber/fiber/v2"
	"os"
	"sync"
)

type errorResponse struct {
	ErrorMessage string `json:"error_message"`
}

type ServerError struct {
	Status  int
	Message interface{}
	Error   error
}

var isDevelopment bool = os.Getenv("STAGE_STATUS") == "develop"

var emptyServerError = ServerError{}

func EmptyServerErr() ServerError {
	return emptyServerError
}

func (e *ServerError) IsNotEmpty() bool {
	return e.Message != nil || e.Status != 0 || e.Error != nil
}
func (e *ServerError) SetStatus(status int) *ServerError {
	e.Status = status
	return e
}

func (e *ServerError) SetMessage(message interface{}) *ServerError {
	msg, ok := message.(string)
	if !ok {
		sLog.Error().Msgf("Error message is not a string 1: %v", message)
	}
	e.Message = msg
	return e
}

func (e *ServerError) Send(c *fiber.Ctx) error {
	if e.Status == 0 {
		e.Status = fiber.StatusInternalServerError
	}
	msg, _ := e.Message.(string)

	if msg == "" {
		msg = "InternalServerErrorCode2"
		sLog.Error().Msgf("Error message can not be represented as string: %v", e)
	}

	var response = errorResponse{
		ErrorMessage: msg,
	}

	if e.Error != nil {
		response.ErrorMessage = e.Error.Error()
	}

	err := c.Status(e.Status).JSON(response)
	if err != nil {
		return err
	}
	if isDevelopment && e.Message == "" {
		sLog.Error().Msgf("No message provided for error with status : %v", e.Status)
	}

	return nil
}
func (e *ServerError) GetError() error {
	if e.Error != nil {
		return e.Error
	}
	msg, ok := e.Message.(string)
	if !ok {
		sLog.Error().Msgf("Error message is not a string 3: %v", msg)
	}
	return errors.New(msg)
}

type AppError string

func (e AppError) String() string {
	return string(e)
}

func (e AppError) Status() int {
	status := statusCodes[e]
	if status == 0 {
		sLog.Warn().Msgf("No status code found for error : %v", e)
		return fiber.StatusInternalServerError
	}
	return status
}

var errorsCache = make(map[AppError]error)
var errorsCacheMutex sync.Mutex

func (e AppError) Error() error {
	errorsCacheMutex.Lock()
	defer errorsCacheMutex.Unlock()
	if err, ok := errorsCache[e]; ok {
		return err
	}
	errorsCache[e] = errors.New(string(e))

	return errors.New(string(e))
}

var serverErrorsCache = make(map[AppError]*ServerError)
var serverErrorsCacheMutex sync.Mutex

func (e AppError) ServerError() ServerError {
	// not returning a pointer because safety reasons
	serverErrorsCacheMutex.Lock()
	defer serverErrorsCacheMutex.Unlock()
	if err, ok := serverErrorsCache[e]; ok {
		return *err
	}
	newErr := &ServerError{Status: e.Status(), Message: e.Error().Error()}
	serverErrorsCache[e] = newErr

	return *newErr
}
func (e AppError) SendCtx(c *fiber.Ctx) error {
	err := e.ServerError()
	return err.Send(c)
}

var safeInternalError = errors.New(ErrServerErr.String())

func SafeServerError(err error) error {
	if err != nil {
		return safeInternalError
	}
	return nil
}
