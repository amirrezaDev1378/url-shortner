package models

type UserInfoResponse struct {
	ID     string `json:"id"`
	Email  string `json:"email"`
	Avatar string `json:"avatar"`
	Name   string `json:"name"`
}
