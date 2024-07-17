-- name: GetUrlById :one
SELECT id, slug, general_redirect_path, ios_redirect_path, created_at,created_by,type,deleted,disabled
FROM urls
WHERE id = $1;

-- name: GetUrlBySlug :one
SELECT general_redirect_path, ios_redirect_path
FROM urls
WHERE slug = $1 AND deleted = false AND disabled = false;

-- name: CreateUrl :one
INSERT INTO urls (created_by, slug, general_redirect_path, ios_redirect_path, type)
VALUES ($1, $2, $3, $4, $5) RETURNING id;

-- name: UpdateUrlProps :exec
UPDATE urls
SET updated_at            = NOW(),
    deleted               = COALESCE($1, deleted),
    disabled              = COALESCE($2, disabled)
WHERE id = $3;

-- name: DeleteUrlByID :exec
DELETE
FROM urls
WHERE id = $1;

-- name: GetUrlsByUser :many
SELECT id, slug, ios_redirect_path, general_redirect_path, created_at
FROM urls
WHERE created_by = $1 AND deleted = false
LIMIT $2;


-- name: CreateStaticUrl :exec
INSERT INTO static_urls (url_id, general_content, ios_content)
VALUES ($1, $2, $3);

-- name: UpdateStaticUrl :exec
UPDATE static_urls
SET general_content = $1 AND ios_content = $2
WHERE url_id = $3;

-- name: DeleteStaticUrlByOwnerID :exec
DELETE FROM static_urls
WHERE url_id = $1;

-- name: GetStaticUrlGeneralContent :one
SELECT general_content
FROM static_urls
WHERE url_id = (SELECT id FROM urls WHERE slug = $1 AND deleted = false AND disabled = false);

-- name: GetStaticUrlIOSContent :one
SELECT ios_content
FROM static_urls
WHERE url_id = (SELECT id FROM urls WHERE slug = $1 AND deleted = false AND disabled = false);

