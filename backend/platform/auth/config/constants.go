package authConfig

import (
	authStore "github.com/create-go-app/fiber-go-template/platform/auth/store"
	"github.com/create-go-app/fiber-go-template/platform/database"
)

const MaxRequestsInMinute = 20

type Params struct {
	Store authStore.Params
	DB    *database.Params
}
