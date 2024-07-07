package authStore

import (
	"github.com/create-go-app/fiber-go-template/platform/database"
	"github.com/gofiber/fiber/v2/middleware/session"
	"github.com/gofiber/fiber/v2/utils"
	"github.com/gofiber/storage/redis"
	"time"
)

const MaxLoginAttempts = 2

const UserAccountLockDuration = time.Hour

type Params struct {
	SessionStore *session.Store
	DB           *database.Params
}

func InitSessionStore(db *database.Params) Params {
	if MaxSessionLife == 0 {
		panic("SESSION_COOKIE_LIFETIME is not set!!!")
	}
	if MaxTokenLife == 0 {
		panic("TOKEN_LIFETIME is not set!!!")
	}

	store := session.New(session.Config{
		CookieHTTPOnly: true,
		Expiration:     time.Hour * time.Duration(MaxSessionLife),
		//TODO: -use redis for this.
		Storage:      redis.New(),
		CookieSecure: true,
		KeyGenerator: utils.UUIDv4,

		CookiePath: "/",
	})
	store.RegisterType(UserSessionData{})
	return Params{
		DB:           db,
		SessionStore: store,
	}
}
