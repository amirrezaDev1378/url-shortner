package appErrors

var statusCodes = map[AppError]int{
	"ERR_BAD_REQUEST":              400,
	"ERR_INVALID_CSRF":             400,
	"ERR_INVALID_PROVIDER":         400,
	"ERR_INVALID_PAYLOAD":          400,
	"ERR_PROVIDER_ERROR":           502,
	"ERR_SESSION_CREATION_FAILED":  500,
	"ERR_TOO_MUCH_REQUESTS":        429,
	"ERR_USER_NOT_FOUND":           404,
	"ERR_USER_LOCKED":              423,
	"ERR_ACCESSING_OAUTH_USER":     500,
	"ERR_FAILED_TO_DESTROY_COOKIE": 500,
	"ERR_FAILED_TO_UPDATE_USER":    500,
	"ERR_SERVER_ERR":               500,
	"ERR_REQUEST_TIMEOUT":          408,
	"ERR_GENERAL_SERVER_ERROR":     500,
	"ERR_FORBIDDEN":                403,
	"ERR_INVALID_HTML_CONTENT":     400,
	"ERR_NOT_FOUND":                404,
}
