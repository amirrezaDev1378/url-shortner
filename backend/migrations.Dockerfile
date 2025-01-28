FROM alpine:latest

ADD https://github.com/pressly/goose/releases/download/v3.23.0/goose_linux_x86_64 /bin/goose
RUN chmod +x /bin/goose

WORKDIR /migrations
COPY ./platform/database/migrations/*.sql /migrations/

CMD ["goose", "-dir=./" , "up"]
