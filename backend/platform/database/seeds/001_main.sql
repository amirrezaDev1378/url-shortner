-- TODO: separate into multiple files if needed

-- +goose Up
INSERT INTO users (email, password, created_at, updated_at)
VALUES ('devuser@uos.com', '$2a$10$43I440xOMN7yIyFWjMnSyuLix2RtoeXR010BwY0zCziMQcLCcvLJO', NOW(), NOW());

INSERT INTO urls
    (created_by, slug, general_redirect_path, ios_redirect_path, type)
VALUES ((SELECT id FROM users WHERE email = 'devuser@uos.com'), 'd_test_direct_url',
        'https://www.google.com', 'https://www.facebook.com', 'direct');

INSERT INTO urls
    (created_by, slug, general_redirect_path, ios_redirect_path, type)
VALUES ((SELECT id FROM users WHERE email = 'devuser@uos.com'), 's_test_static_url',
        'https://www.google.com', 'https://time.ir', 'static');


INSERT INTO static_urls
    (url_id, general_content, ios_content)
VALUES ((SELECT id FROM urls WHERE slug = 's_test_static_url'), '<h1>This google bro, i swear.</h1>',
        '<h1>I hate yall apple fans!</h1>');

-- +goose Down
DELETE
FROM urls
WHERE slug = 's_test_static_url'
   OR slug = 'd_test_direct_url';

DELETE
FROM static_urls
WHERE url_id = (SELECT id FROM urls WHERE slug = 's_test_static_url');

DELETE
FROM users
WHERE email = 'devuser@uos.com';
