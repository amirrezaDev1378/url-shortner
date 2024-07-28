package utils

import (
	"errors"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgtype"
	"reflect"
)

type SafeStruct[T any] struct {
	isValid bool
	values  T
}

// CtxBodyParser func for parsing request body and validating it.
// error can be validation error or fiber body parser error
func (s *SafeStruct[T]) CtxBodyParser(ctx *fiber.Ctx) error {
	if err := ctx.BodyParser(&s.values); err != nil {
		return err
	}

	if err := s.Validate(); err != nil {
		return err
	}

	return nil
}

func (s *SafeStruct[T]) Validate() error {
	if err := validator.New().Struct(s.values); err != nil {
		s.isValid = false
		return err
	}
	s.isValid = true
	return nil
}
func (s *SafeStruct[T]) IsValid() bool {
	return s.isValid
}

func (s *SafeStruct[T]) Values() T {
	return s.values
}

func (s *SafeStruct[T]) Fill(data T) {
	s.values = data
	s.isValid = false
}
func (s *SafeStruct[T]) SafeFill(data T) error {
	s.values = data
	if err := s.Validate(); err != nil {
		var zeroValue T
		s.values = zeroValue
		return err
	}
	return nil
}

// NewPgTypeValidator func for create a new validator for model fields.
func NewPgTypeValidator() *validator.Validate {
	// Create a new validator for a Book model.
	validate := validator.New()

	validate.RegisterCustomTypeFunc(ValidateValuer, pgtype.Text{}, pgtype.Bool{}, pgtype.Numeric{})
	return validate
}

// ValidateValuer implements validator.CustomTypeFunc
func ValidateValuer(field reflect.Value) interface{} {
	valuer := field.Interface()

	switch v := valuer.(type) {
	case pgtype.Text:
		return v.String
	case pgtype.Bool:
		return v.Bool
	case pgtype.Numeric:
		return v.Int
	default:
		return errors.New("invalid type provided")
	}
}
