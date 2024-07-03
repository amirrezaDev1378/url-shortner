package utils

import (
	"errors"
	"github.com/go-playground/validator/v10"
	"github.com/jackc/pgx/v5/pgtype"
	"reflect"
)

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
