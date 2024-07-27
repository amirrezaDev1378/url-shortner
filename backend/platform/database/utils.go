package database

import (
	"errors"
	"github.com/jackc/pgx/v5"
)

func IsNoRowsErr(err error) bool {
	if err == nil {
		return false
	}
	return errors.Is(pgx.ErrNoRows, err)
}
