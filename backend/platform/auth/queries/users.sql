-- name: GetUserById :one
SELECT *
FROM USERS
WHERE ID = $1
LIMIT 1;


-- name: CreateUser :one
INSERT INTO USERS (ID, CREATED_AT, UPDATED_AT, LAST_LOGIN, PASSWORD, CREATED_BY_OAUTH, EMAIL, RESET_PASSWORD_EXPIRES,
                   AVATAR, NAME)
VALUES (UUID_GENERATE_V4(), NOW(), NOW(), NOW(), $1, $2, $3, NULL, $4, $5)
RETURNING ID;

-- name: GetUserByEmail :one
SELECT * FROM USERS WHERE EMAIL = $1 LIMIT 1;

-- name: UpdateUser :exec
UPDATE USERS
SET UPDATED_AT             = NOW(),
    PASSWORD               = COALESCE($1, PASSWORD),
    AVATAR                 = COALESCE($2, AVATAR),
    RESET_PASSWORD_TOKEN   = COALESCE($3, RESET_PASSWORD_TOKEN),
    RESET_PASSWORD_EXPIRES = COALESCE($4, RESET_PASSWORD_EXPIRES)
WHERE ID = $5;


-- name: CheckUserExists :one
SELECT EXISTS (SELECT 1 FROM USERS WHERE EMAIL = $1) AS USER_EXISTS;
