-- +goose Up
-- +goose StatementBegin
CREATE OR REPLACE FUNCTION base62_encode(num BIGINT) RETURNS TEXT AS
$$
DECLARE
    alphabet  TEXT    := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_';
    base      INTEGER := 62;
    encoded   TEXT    := '';
    remainder INTEGER;
BEGIN
    IF num = 0 THEN
        RETURN SUBSTR(alphabet, 1, 1);
    END IF;
    WHILE num > 0
        LOOP
            remainder := (num % base) + 1;
            encoded := SUBSTR(alphabet, remainder, 1) || encoded;
            num := num / base;
        END LOOP;
    RETURN encoded;
END;
$$ LANGUAGE plpgsql;
-- +goose StatementEnd


-- +goose Down
DROP FUNCTION base62_encode(num BIGINT);
