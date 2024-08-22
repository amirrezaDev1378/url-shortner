-- name: GetUrlById :one
SELECT id,
       slug,
       general_redirect_path,
       ios_redirect_path,
       created_at,
       created_by,
       type,
       deleted,
       disabled,
       expires_at
FROM urls
WHERE id = $1 AND deleted = false;

-- name: GetUrlBySlug :one
SELECT general_redirect_path, ios_redirect_path, expires_at
FROM urls
WHERE slug = $1 AND deleted = false AND disabled = false;

-- name: CreateUrl :one
INSERT INTO urls (created_by, slug, general_redirect_path, ios_redirect_path, type, expires_at)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id;

-- name: UpdateUrlProps :exec
UPDATE urls
SET updated_at = NOW(),
    deleted    = COALESCE($1, deleted),
    disabled   = COALESCE($2, disabled)
WHERE id = $3;

-- name: DeleteUrlByID :exec
DELETE
FROM urls
WHERE id = $1;

-- name: GetUrlsByUser :many
SELECT id, slug, ios_redirect_path, general_redirect_path, created_at, disabled
FROM urls
WHERE created_by = $1 AND deleted = false
ORDER BY created_at DESC
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


-- name: GetStaticUrlByUrlID :one
SELECT *
FROM static_urls
WHERE url_id = $1;

-- name: GetStaticUrlGeneralContent :one
SELECT general_content
FROM static_urls
WHERE url_id = (SELECT id FROM urls WHERE slug = $1 AND deleted = false AND disabled = false);

-- name: GetStaticUrlIOSContent :one
SELECT ios_content
FROM static_urls
WHERE url_id = (SELECT id FROM urls WHERE slug = $1 AND deleted = false AND disabled = false);

-- name: DeleteExpiredTempSlugs :exec
DELETE
FROM urls
WHERE expires_at < (NOW())
  AND (type = 'temp-slug');

-- name: DeleteExpiredUrls :exec
UPDATE urls
SET deleted  = TRUE,
    disabled = TRUE
WHERE expires_at < (NOW() + $1)
  AND type != 'temp-slug'
  AND (deleted != TRUE OR disabled != TRUE);


-- name: CreateRandomSlug :one
INSERT INTO urls (slug, general_redirect_path, type, expires_at, disabled)
VALUES ((SELECT base62_encode(COUNT(*)) FROM urls),
        '',
        'temp-slug',
        NOW() + INTERVAL '30 minutes',
        TRUE)
RETURNING slug;
