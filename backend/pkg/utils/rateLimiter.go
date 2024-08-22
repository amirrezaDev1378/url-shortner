package utils

import (
	"errors"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"log"
	"time"
)

type RateLimiterConfig struct {
	Max        int
	Expiration time.Duration
}

func (c RateLimiterConfig) validate() error {
	if c.Max <= 0 {
		return errors.New("max must be greater than 0")
	}
	if c.Expiration <= 0 {
		return errors.New("expiration must be greater than 0")
	}
	return nil
}

func (c RateLimiterConfig) Middleware() func(ctx *fiber.Ctx) error {
	if err := c.validate(); err != nil {
		log.Panicf("Err while validating RateLimiterConfig %v", err)
		return nil
	}
	return limiter.New(limiter.Config{
		Max:        c.Max,
		Expiration: c.Expiration,
		//TODO :- decide later
		//KeyGenerator: func(c *fiber.Ctx) string {
		//	return c.IP()
		//},
		SkipFailedRequests:     true,
		SkipSuccessfulRequests: false,
		LimiterMiddleware:      limiter.SlidingWindow{},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": "Too many requests, please try again later.",
			})
		},
	})
}
