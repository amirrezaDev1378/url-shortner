ifneq (,$(wildcard ./.env))
    include .env
    export
endif

.PHONY: clean critic security lint test build run
export PATH := $(PATH):/usr/local/go/bin:/home/amir/go/bin
export GOOSE_DRIVER=postgres
export GOOSE_DBSTRING = user=$(DB_USER) password=$(DB_PASSWORD) host=$(DB_HOST) port=$(DB_PORT) dbname=$(DB_NAME) sslmode=$(DB_SSL_MODE)
export GOROOT := $(shell go env GOROOT)
export GOPATH=/home/amir/go

install:
	docker pull redis
	go install github.com/pressly/goose/v3/cmd/goose@latest
	go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest
	go install github.com/bokwoon95/wgo@latest
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@v1.59.1
	go install -v github.com/go-critic/go-critic/cmd/gocritic@latest
	go install github.com/securego/gosec/v2/cmd/gosec@latest
	go install github.com/go-delve/delve/cmd/dlv@latest
clean:
	rm -rf ./build

critic:
	gocritic check -enableAll ./...

security:
	gosec ./...

lint:
	golangci-lint run ./... --enable-all

test: clean critic security lint
	go test -v -timeout 30s -coverprofile=cover.out -cover ./...
	go tool cover -func=cover.out

build: test
	 go -o bin/backend.exe build cmd/main.go

debugger:
	# --only-same-user=false is not safe it's just for WSL2
	dlv debug --headless --listen=127.0.0.1:2345 --api-version=2 --accept-multiclient --only-same-user=false cmd/main.go

watch:
	redis-server --daemonize yes
	gow  run cmd/main.go

sqlc-generate:
	sqlc generate

migrations.up:
	 goose -dir=./platform/database/migrations up

migrations.down:
	goose -dir=./platform/database/migrations down

migrations.redo:
	goose -dir=./platform/database/migrations redo
seeds.up:
	- goose -dir=./platform/database/seeds -table db_seeds_version down
	- goose -dir=./platform/database/seeds -table db_seeds_version up

migrations.status:
	goose -dir=./platform/database/migrations status

docker.run: docker.network docker.postgres swag docker.fiber docker.redis migrate.up

docker.network:
	docker network inspect dev-network >/dev/null 2>&1 || \
	docker network create -d bridge dev-network

docker.fiber.build:
	docker build -t fiber .

docker.fiber: docker.fiber.build
	docker run --rm -d \
		--name cgapp-fiber \
		--network dev-network \
		-p 5000:5000 \
		fiber

docker.postgres:
	docker run --rm -d \
		--name cgapp-postgres \
		--network dev-network \
		-e POSTGRES_USER=postgres \
		-e POSTGRES_PASSWORD=password \
		-e POSTGRES_DB=postgres \
		-v ${HOME}/dev-postgres/data/:/var/lib/postgresql/data \
		-p 5432:5432 \
		postgres

docker.redis:
	docker run --rm -d \
		--name cgapp-redis \
		--network dev-network \
		-p 6379:6379 \
		redis

docker.stop: docker.stop.fiber docker.stop.postgres docker.stop.redis

docker.stop.fiber:
	docker stop cgapp-fiber

docker.stop.postgres:
	docker stop cgapp-postgres

docker.stop.redis:
	docker stop cgapp-redis

temp-run-fe:
	cd ../frontend && bun dev
