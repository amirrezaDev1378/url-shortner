package jobs

import (
	"github.com/create-go-app/fiber-go-template/platform/cache"
	"github.com/create-go-app/fiber-go-template/platform/database"
)

type Config struct {
	DB    *database.Params
	Redis cache.RedisClients
}

func (c *Config) InitJobs() {
	c.DB.ValidateDBParams()
	if !c.Redis.IsValid() {
		panic("No Redis Instance Provided")
	}
	// initialize jobs...
	go c.deleteExpiredUrlsJob()

}
