package sLog

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
	"github.com/rs/zerolog"
	"github.com/stretchr/testify/assert"
	"log"
	"os"
	"path"
	"testing"
)

func Test_Begin(t *testing.T) {
	cwd = os.TempDir()
	log.Println(cwd)
}

func TestInitLogger(t *testing.T) {
	asserts := assert.New(t)

	asserts.NotPanics(InitLogger, "InitLogger should not panic")

	asserts.NotNil(zerologInstance, "Logger instance should be initialized")
	asserts.True(loggerInitialized, "Logger should be marked as initialized")
	asserts.NotEqual(zerologInstance, zerolog.Logger{}, "Logger instance should not be the same as zerolog.Logger{}")

}

func TestConsoleWriter_EnableDisable(t *testing.T) {
	writer := &consoleWriter{}
	writer.Init()
	asserts := assert.New(t)
	asserts.False(writer.IsEnabled(), "ConsoleWriter should be disabled by default")

	writer.Enable()
	asserts.True(writer.IsEnabled(), "ConsoleWriter should be enabled after calling Enable")

	writer.Disable()
	asserts.False(writer.IsEnabled(), "ConsoleWriter should be disabled after calling Disable")
}

func TestDBWriter_Write(t *testing.T) {
	asserts := assert.New(t)
	const testLogMessage = "test_log_message"
	Info().Msg(testLogMessage)
	db, err := sql.Open("sqlite3", path.Join(cwd, logDBFile))
	asserts.NoError(err, "Failed to open log database")
	q, err := db.Query("SELECT * FROM main.logs WHERE level = 'info' AND message LIKE $1 ", testLogMessage)
	asserts.NoError(err, "Failed to execute query")
	asserts.NotNil(q, "Exec should not be nil")
	var length int
	for q.Next() {
		length++
	}
	asserts.Equal(1, length, "Log should be written to the database and it shouldn't be duplicated")

}

/*
	TODO:- write more tests ...
	Will I ever do that ? I don't know
*/

func Test_End(t *testing.T) {
	cwd, _ = os.Getwd()
}
