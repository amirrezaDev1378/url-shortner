package database

import (
	"context"
	"errors"
	"fmt"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"os"
	"strconv"
	"time"
)

// PostgreSQLConnection func for connection to PostgreSQL database.
func PostgreSQLConnection() (context.Context, *pgxpool.Pool, error) {
	// Define database connection settings.
	maxConn, _ := strconv.Atoi(os.Getenv("DB_MAX_CONNECTIONS"))
	maxIdleConn, _ := strconv.Atoi(os.Getenv("DB_MAX_IDLE_CONNECTIONS"))
	maxLifetimeConn, _ := strconv.Atoi(os.Getenv("DB_MAX_LIFETIME_CONNECTIONS"))

	if maxConn > 101 || maxConn < 1 {
		return nil, nil, errors.New("DB_MAX_CONNECTIONS should be between 1 and 100")
	}
	if maxIdleConn > 16 || maxIdleConn < 1 {
		return nil, nil, errors.New("DB_MAX_IDLE_CONNECTIONS should be between 1 and 16")
	}
	if maxLifetimeConn > 60 || maxLifetimeConn < 1 {
		return nil, nil, errors.New("DB_MAX_LIFETIME_CONNECTIONS should be between 1 and 60")
	}
	ctx := context.Background()
	db, err := pgxpool.New(ctx, fmt.Sprintf("user=%s dbname=%s sslmode=disable host=%s port=%s password=%s",
		os.Getenv("DB_USER"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_PASSWORD"),
	))

	if err != nil {
		return nil, nil, err
	}
	db.Config().MaxConns = int32(maxConn)
	db.Config().MaxConnIdleTime = time.Minute * time.Duration(maxIdleConn)
	db.Config().MaxConnLifetime = time.Minute * time.Duration(maxLifetimeConn)

	// Health Check
	data, err := db.Query(ctx, `SELECT 1`)
	if err != nil {
		return nil, nil, err
	}
	data.Close()
	return ctx, db, nil
}

func ParseDbError(err error) pgconn.PgError {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return *pgErr
	}
	return pgconn.PgError{}
}
