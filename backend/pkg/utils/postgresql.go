package utils

import (
	"github.com/jackc/pgx/v5/pgtype"
	"time"
)

func GetUUIDFromString(userID interface{}) (pgtype.UUID, error) {
	UUID := pgtype.UUID{}
	err := UUID.Scan(userID)
	if err != nil {
		return pgtype.UUID{}, err
	}
	return UUID, nil

}

func GetStringFromUUID(userUUID pgtype.UUID) (string, error) {
	uuidVal, err := userUUID.Value()
	if err != nil {
		return "", err
	}
	uuidString, ok := uuidVal.(string)
	if !ok {
		return "", err
	}
	return uuidString, nil
}

func CompareUUIDWithString(uuid1 pgtype.UUID, uuid2 interface{}) bool {
	uuidVal, err := uuid1.Value()
	if err != nil {
		return false
	}
	uuidString, ok := uuidVal.(string)
	if !ok {
		return false
	}
	if uuidString == uuid2 {
		return true
	}
	return false
}

func GetPGTimeStamp(timeString string, format string) (pgtype.Timestamp, error) {
	parsedTime, err := time.Parse(format, timeString)
	if err != nil {
		return pgtype.Timestamp{}, err
	}
	return pgtype.Timestamp{Time: parsedTime, Valid: true}, nil
}
