package database

import (
	"context"
	dbQueries "github.com/create-go-app/fiber-go-template/platform/database/generated"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Params struct {
	AppQueries *dbQueries.Queries
	DBPool     *pgxpool.Pool
	DBContext  context.Context
}

func (p *Params) ValidateDBParams() {
	if p.AppQueries == nil {
		panic("AppQueries is not defined!")
	}
	if p.DBPool == nil {
		panic("DBPool is not defined!")
	}
	if p.DBContext == nil {
		panic("DBContext is not defined!")
	}
}

func InitDatabase() (*dbQueries.Queries, *pgxpool.Pool, context.Context) {
	ctx, dbConnection, err := PostgreSQLConnection()
	if err != nil {
		panic(err)
	}
	dbConnection.Stat()
	queries := dbQueries.New(dbConnection)

	return queries, dbConnection, ctx

}
