package cache

import (
	"context"
	"fmt"
	"os"
	"strconv"

	"github.com/create-go-app/fiber-go-template/pkg/utils"

	"github.com/redis/go-redis/v9"
)

type RedisClients struct {
	DirectUrlClient *redis.Client
	StaticUrlClient *redis.Client
	isValid         bool
}

func (c *RedisClients) IsValid() bool {
	return c.isValid
}

// RedisConnection func for connect to Redis server.
func RedisConnection() (RedisClients, error) {
	clients := RedisClients{}
	// Get Redis database numbers from environment variables.
	urlDbNumber, err := strconv.Atoi(os.Getenv("REDIS_URL_DB_NUMBER"))
	if err != nil {
		return clients, fmt.Errorf("invalid REDIS_URL_DB_NUMBER: %v", err)
	}

	persistUrlDbNumber, err := strconv.Atoi(os.Getenv("REDIS_PERSIST_URL_DB_NUMBER"))
	if err != nil {
		return clients, fmt.Errorf("invalid REDIS_PERSIST_URL_DB_NUMBER: %v", err)
	}

	// Build Redis connection URL.
	redisConnURL, err := utils.ConnectionURLBuilder("redis")
	if err != nil {
		return clients, fmt.Errorf("failed to build Redis connection URL: %v", err)
	}

	// Create Redis clients.
	urlClient, err := newRedisClient(redisConnURL, urlDbNumber)
	if err != nil {
		return clients, fmt.Errorf("failed to create URL Redis client: %v", err)
	}

	persistedUrlsClient, err := newRedisClient(redisConnURL, persistUrlDbNumber)
	if err != nil {
		return clients, fmt.Errorf("failed to create persisted URLs Redis client: %v", err)
	}
	clients.DirectUrlClient = urlClient
	clients.StaticUrlClient = persistedUrlsClient
	// TODO add a better validation
	clients.isValid = true
	return clients, nil
}
func newRedisClient(addr string, db int) (*redis.Client, error) {
	options := &redis.Options{
		Addr:     addr,
		Password: os.Getenv("REDIS_PASSWORD"),
		DB:       db,
	}

	client := redis.NewClient(options)
	if _, err := client.Ping(context.Background()).Result(); err != nil {
		return nil, fmt.Errorf("redis connection failed: %v", err)
	}

	return client, nil
}
