-- TODO: separate into multiple files if needed

-- +goose Up
INSERT INTO users (email, password, created_at, updated_at)
VALUES ('devuser@uos.com', '$2a$10$43I440xOMN7yIyFWjMnSyuLix2RtoeXR010BwY0zCziMQcLCcvLJO', NOW(), NOW());

INSERT INTO urls
    (created_by, slug, general_redirect_path, ios_redirect_path)
VALUES ((SELECT id FROM users WHERE email = 'devuser@uos.com'), 'test',
        'https://www.google.com', 'https://www.facebook.com');

-- +goose Down
DELETE
FROM urls
WHERE slug = 'test';

DELETE
FROM users
WHERE email = 'devuser@uos.com';
