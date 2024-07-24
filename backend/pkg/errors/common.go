package appErrors

const (
	ErrServerErr          AppError = "ERR_SERVER_ERR"
	ErrRequestTimeout     AppError = "ERR_REQUEST_TIMEOUT"
	ErrGeneralServerError AppError = "ERR_GENERAL_SERVER_ERROR"
	ErrForbidden          AppError = "ERR_FORBIDDEN"
	ErrNotFound           AppError = "ErrNotFound"
)
