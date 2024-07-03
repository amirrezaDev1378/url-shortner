-- name: UpdateFailedLoginAttempts :exec
UPDATE users
SET login_attempts = $1,
    locked_until   = $2
WHERE id = $3;

-- name: UserLoginWithOAuth :one
UPDATE USERS
SET UPDATED_AT = NOW(),
    LAST_LOGIN = NOW()
WHERE EMAIL = $1
RETURNING ID;

-- name: UserLoginWithCredential :exec
UPDATE users
SET updated_at = now(),
    locked_until = NULL,
    login_attempts = 0,
    last_login = now()
WHERE id = $1;
