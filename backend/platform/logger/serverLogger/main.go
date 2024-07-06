package sLog

import (
	"database/sql"
	"github.com/create-go-app/fiber-go-template/pkg/configs"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/pkgerrors"
	"io"
	"log"
	"os"
	"path"
	"regexp"
	"sync"
	"time"
)

var matchLevelRegex = regexp.MustCompile(`"level"\s*:\s*"([^"]+)"`)

const logDBFile = "./server-logs.sqlite3"
const maxDBLogRows = 50 * 1000 // 10k
var cwd, _ = os.Getwd()

// fileUpdateInterval the duration of time between file operations
const fileUpdateInterval = time.Second * 5

const createLogTableQuery = `
	CREATE TABLE IF NOT EXISTS logs (
		id INTEGER PRIMARY KEY ,
		timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		level TEXT,
		message TEXT
	);

`

var loggerInitialized = false

var (
	logChannel = make(chan DBLogs, 100) // Buffered channel to store logs
)

func initLogDB() (*sql.DB, error) {
	db, err := sql.Open("sqlite3", path.Join(cwd, logDBFile))
	if err != nil {
		log.Fatal("Failed to open log database", err)
		return nil, err
	}
	_, err = db.Exec(createLogTableQuery)
	if err != nil {
		log.Fatal("Failed to create log table", err)
		return nil, err
	}

	return db, nil
}

type DBLogs struct {
	level   zerolog.Level
	message string
}

type dbWriter struct {
	db *sql.DB
}

type consoleWriter struct {
	enabled bool
	writer  io.Writer
}

func (w *consoleWriter) Disable() {
	w.enabled = false
}
func (w *consoleWriter) Enable() {
	w.enabled = true
}
func (w *consoleWriter) IsEnabled() bool {
	return w.enabled
}

func (w *consoleWriter) Init() {
	w.writer = &zerolog.ConsoleWriter{Out: os.Stdout, TimeFormat: "2006-01-02 15:04:05"}
}

func (w *consoleWriter) Write(p []byte) (int, error) {
	if w.enabled {
		return w.writer.Write(p)
	}

	return len(p), nil
}

func (w *dbWriter) Write(p []byte) (n int, err error) {
	// Yes, this is not beautiful, but it's faster than parse the whole log message
	levelMatches := matchLevelRegex.FindStringSubmatch(string(p))
	level, err := zerolog.ParseLevel(levelMatches[1])
	if err != nil {
		return 0, err
	}

	if level == zerolog.DebugLevel {
		return len(p), nil
	}

	logChannel <- DBLogs{level: level, message: string(p)}
	return len(p), nil
}
func (w *dbWriter) logCollector() {
	ticker := time.NewTicker(fileUpdateInterval)
	defer ticker.Stop()

	var logs []DBLogs
	var mu sync.Mutex

	for {
		select {
		case logEntry := <-logChannel:
			mu.Lock()
			logs = append(logs, logEntry)
			// TODO decide if this a good thing todo or not?
			if logEntry.level == zerolog.PanicLevel {
				w.WriteToDB(logs)
				logs = nil
			}
			mu.Unlock()
		case <-ticker.C:
			mu.Lock()
			if len(logs) > 0 {
				w.WriteToDB(logs)
				logs = nil
			}
			mu.Unlock()
		}
	}
}
func (w *dbWriter) WriteToDB(logs []DBLogs) {
	tx, err := w.db.Begin()
	if err != nil {
		log.Printf("Failed to start logs transaction, reason: %v\n", err)
		return
	}
	for _, targetLog := range logs {
		_, err := tx.Exec("INSERT INTO main.logs (level, message) VALUES (?, ?)", targetLog.level.String(), targetLog.message)
		if err != nil {
			log.Printf("Failed to write log to database, reason: %v\n", err)
		}
	}
	err = tx.Commit()
	if err != nil {
		log.Printf("Failed to write log to database, reason: %v\n", err)
	}
	// TODO add a another job for this
	w.checkDBSize()
}
func (w *dbWriter) checkDBSize() {
	/*
		If you are getting disk / io errors, it is because WSL won't lock sqlite database properly
	*/

	log.Printf("Checking log database size\n")
	tx, err := w.db.Begin()
	if err != nil {
		log.Printf("Failed to start logs transaction: %v\n", err)
		return
	}
	defer tx.Rollback()

	_, err = tx.Exec("DELETE FROM main.logs  WHERE id IN (SELECT id FROM main.logs ORDER BY TIMESTAMP ASC LIMIT MAX(0,((SELECT COUNT(*) FROM main.logs) - $MAX_ROWS)))", maxDBLogRows)
	if err != nil {
		log.Printf("Failed to delete old logs: %v\n", err)
	}

	err = tx.Commit()
	if err != nil {
		log.Printf("Failed to commit transaction: %v\n", err)
	}

	_, err = w.db.Exec("VACUUM")
	if err != nil {
		log.Printf("Failed to vacuum logs: %v\n", err)
	}
}
func InitLogger() {
	if loggerInitialized {
		panic("ASSS")
	}
	db, err := initLogDB()
	if err != nil {
		panic(err)
	}
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnixMs
	zerolog.ErrorStackMarshaler = pkgerrors.MarshalStack

	ConsoleWriter := consoleWriter{}
	ConsoleWriter.Init()

	if configs.IsDev() {
		ConsoleWriter.Enable()
	}

	DBLogWriter := &dbWriter{db}
	logger := zerolog.New(zerolog.MultiLevelWriter(&ConsoleWriter, DBLogWriter)).With().Timestamp().Logger()

	zerologInstance = logger

	go DBLogWriter.logCollector()

	loggerInitialized = true
}
