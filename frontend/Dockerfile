FROM oven/bun:1.1.32-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN bun install
COPY . ./
RUN bun run build
CMD  ["bun", "run-server"]
