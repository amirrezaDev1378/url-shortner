package sLog

import (
	"github.com/rs/zerolog"
	"runtime"
	"sync"
)

type AddParentFunctionNameHook struct{}

var addParentFunctionNameHookPool = sync.Pool{
	New: func() interface{} {
		return make([]uintptr, 1)
	},
}

func (h *AddParentFunctionNameHook) Run(e *zerolog.Event, level zerolog.Level, msg string) {
	if level != zerolog.PanicLevel && level != zerolog.FatalLevel && level != zerolog.ErrorLevel && level != zerolog.DebugLevel {
		return
	}

	pc := addParentFunctionNameHookPool.Get().([]uintptr)
	defer addParentFunctionNameHookPool.Put(pc)

	if n := runtime.Callers(3, pc); n != 0 {
		fn := runtime.FuncForPC(pc[0])
		if fn != nil {
			e.Str("function-name", fn.Name())
			return
		}
	}
	e.Str("function-name", "unknown")

}
