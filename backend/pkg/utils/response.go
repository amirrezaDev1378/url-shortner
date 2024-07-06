package utils

import (
	"encoding/json"
	appErrors "github.com/create-go-app/fiber-go-template/pkg/errors"
	sLog "github.com/create-go-app/fiber-go-template/platform/logger/serverLogger"
)

type ResponseType struct {
	Data interface{} `json:"data"`
}

func (t ResponseType) ToJson() string {
	jsonData, err := json.Marshal(t.Data)
	if err != nil {
		sLog.Error().Err(err).Msg("Error while marshalling response")
		return Response(appErrors.ErrGeneralServerError).ToJson()
	}
	return string(jsonData)
}
func Response(data interface{}) ResponseType {
	return ResponseType{
		Data: data,
	}
}
