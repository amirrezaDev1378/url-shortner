FROM golang:1.23-alpine AS builder
RUN apk add build-base

WORKDIR /build

COPY go.mod go.sum ./
RUN go env -w GO111MODULE=on
RUN go env -w GOPROXY=https://goproxy.cn,direct
RUN go mod download

COPY . .

ENV CGO_ENABLED=1
RUN go build -ldflags="-s -w" -o apiserver ./cmd/main.go

FROM alpine:latest

# WORKDIR /app

COPY --from=builder  "/build/.env.prod" "/app/.env"
COPY --from=builder "/build/apiserver" "/app/apiserver"

EXPOSE 3033

CMD ["./app/apiserver"]

