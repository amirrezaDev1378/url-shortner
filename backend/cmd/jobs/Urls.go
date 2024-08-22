package jobs

import (
	"context"
	sLog "github.com/create-go-app/fiber-go-template/platform/logger/serverLogger"
	"time"
)

const interval = time.Minute * 30

func (c *Config) deleteExpiredUrlsJob() {
	ticker := time.NewTicker(interval)
	ctx, cancel := context.WithCancel(context.Background())
	logger := sLog.WithScoopLogger("deleteExpiredUrlsJob")

	logger.Info().Msg("Delete expired urls job started.")

	defer cancel()

	for {
		select {
		case <-ctx.Done():
			logger.Info().Msg("Delete expired urls job stopped. Restarting...")
			if ticker.C != nil {
				ticker.Stop()
			}
			go c.deleteExpiredUrlsJob()
			return
		case <-ticker.C:
			go func() {
				logger.Info().Msg("Deleting expired urls...")
				tx, err := c.DB.DBPool.Begin(ctx)
				if err != nil {
					sLog.WithStackTrace(err).Send()
					cancel()
					return
				}
				defer tx.Rollback(ctx)
				qtx := c.DB.AppQueries.WithTx(tx)
				err = qtx.DeleteExpiredUrls(ctx, interval)
				if err != nil {
					sLog.WithStackTrace(err).Send()
					cancel()
					return
				}
				err = qtx.DeleteExpiredTempSlugs(ctx)
				if err != nil {
					sLog.WithStackTrace(err).Send()
					cancel()
					return
				}

				err = tx.Commit(ctx)
				if err != nil {
					sLog.WithStackTrace(err).Send()
					cancel()
					return
				}
			}()
		}
	}
}
