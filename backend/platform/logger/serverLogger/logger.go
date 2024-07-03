package sLog

import (
	"context"
	"fmt"
	"github.com/pkg/errors"
	"github.com/rs/zerolog"
	"io"
)

var zerologInstance zerolog.Logger

func Output(w io.Writer) zerolog.Logger {
	return zerologInstance.Output(w)
}

func With() zerolog.Context {
	return zerologInstance.With()
}

func Level(level zerolog.Level) zerolog.Logger {
	return zerologInstance.Level(level)
}

func Sample(s zerolog.Sampler) zerolog.Logger {
	return zerologInstance.Sample(s)
}

func Hook(h zerolog.Hook) zerolog.Logger {
	return zerologInstance.Hook(h)
}

func Err(err error) *zerolog.Event {
	return zerologInstance.Err(err)
}

func Trace() *zerolog.Event {
	return zerologInstance.Trace()
}

// Debug logs a message with debug level & won't save it to the database
func Debug() *zerolog.Event {
	return zerologInstance.Debug()
}

func Info() *zerolog.Event {
	return zerologInstance.Info()
}

func Warn() *zerolog.Event {
	return zerologInstance.Warn()
}

func Error() *zerolog.Event {
	return zerologInstance.Error()
}

// TODO - decide about this
// We won't need this, and it's better that won't be available
//func Fatal() *zerolog.Event {
//	return zerologInstance.Fatal()
//}

// Panic logs a message with panic level but !WILL NOT PANIC!
func Panic() *zerolog.Event {
	return zerologInstance.WithLevel(zerolog.PanicLevel)
}

func WithLevel(level zerolog.Level) *zerolog.Event {
	return zerologInstance.WithLevel(level)
}
func WithScoopLogger(scoop string) *zerolog.Logger {
	logger := zerologInstance.With().Str("scoop", scoop).Logger()
	return &logger
}

func Log() *zerolog.Event {
	return zerologInstance.Log()
}

func Print(v ...interface{}) {
	zerologInstance.Debug().CallerSkipFrame(1).Msg(fmt.Sprint(v...))
}

func Printf(format string, v ...interface{}) {
	zerologInstance.Debug().CallerSkipFrame(1).Msgf(format, v...)
}

func Ctx(ctx context.Context) *zerolog.Logger {
	return zerolog.Ctx(ctx)
}

func WithStackTrace(err error) *zerolog.Event {
	//// check if error is stacked
	if !hasStackTrace(err) {
		err = errors.WithStack(err)
	}

	return zerologInstance.WithLevel(zerolog.ErrorLevel).Stack().Err(err)

}
func hasStackTrace(err error) bool {
	_, ok := err.(interface {
		StackTrace() errors.StackTrace
	})
	return ok
}
