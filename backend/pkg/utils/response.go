package utils

import (
	"encoding/json"
	"errors"
	"github.com/gofiber/fiber/v2"
)

type ResponseType[T comparable] struct {
	Data T `json:"data"`
}

func (r *ResponseType[T]) Fill(data T) {
	r.Data = data
}

func (r *ResponseType[T]) SendCtx(ctx *fiber.Ctx, optionalStatus ...int) error {
	status := 200
	if len(optionalStatus) > 0 && optionalStatus[0] > 0 {
		status = optionalStatus[0]
	}

	return ctx.Status(status).JSON(r)
}
func (r *ResponseType[T]) JSON() (string, error) {
	var zeroValue T
	if r.Data == zeroValue {
		return "", errors.New("error: ResponseType.Data is nil")
	}

	jsonBytes, err := json.Marshal(r)
	if err != nil {
		return "", err
	}
	return string(jsonBytes), nil
}

func CreateResponseType[T comparable](data T) ResponseType[T] {
	return ResponseType[T]{
		Data: data,
	}
}
