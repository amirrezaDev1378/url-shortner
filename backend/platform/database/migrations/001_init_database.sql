-- +goose Up
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE users
(
    id                     UUID                 DEFAULT UUID_GENERATE_V4() PRIMARY KEY,
    created_at             TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login             TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    email                  VARCHAR(80) NOT NULL UNIQUE,
    password               TEXT        NOT NULL,
    avatar                 TEXT        NULL,
    login_attempts         INT         NOT NULL DEFAULT 0,
    locked_until           TIMESTAMP   NULL,
    created_by_oauth       BOOLEAN              DEFAULT FALSE,
    reset_password_token   TEXT        NULL,
    reset_password_expires DATE        NULL
);

CREATE TYPE valid_url_types AS ENUM ('direct', 'static');
CREATE TABLE urls
(
    id                    SERIAL             NOT NULL UNIQUE PRIMARY KEY,
    created_at            DATE               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATE               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by            uuid               NOT NULL,
    slug                  VARCHAR(50) UNIQUE NOT NULL,
    general_redirect_path VARCHAR(900)       NOT NULL,
    ios_redirect_path     VARCHAR(900),
    type                  valid_url_types    NOT NULL DEFAULT 'direct',
    CONSTRAINT "url_owner_relation" FOREIGN KEY ("created_by") REFERENCES users ("id")
);


CREATE TABLE static_urls
(
    id              uuid    NOT NULL UNIQUE DEFAULT UUID_GENERATE_V4(),
    updated_at      DATE    NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    url_id          INTEGER NOT NULL UNIQUE,
    general_content TEXT    NOT NULL,
    ios_content     TEXT,
    CONSTRAINT static_urls_relation FOREIGN KEY ("url_id") REFERENCES urls ("id"),
    -- maximum 1mb of html content allowed
    -- TODO: check if this is the best policy
    CONSTRAINT general_content_check CHECK (OCTET_LENGTH(general_content) <= 1024 * 1024 * 1),
    CONSTRAINT ios_content_check CHECK (OCTET_LENGTH(ios_content) <= 1024 * 1024 * 1),
    PRIMARY KEY ("id")
);

-- +goose Down
DROP TABLE static_urls;

DROP TABLE urls;
DROP TYPE valid_url_types;

DROP TABLE users;
