package appErrors

const (
	ErrBadRequest            AppError = "ERR_BAD_REQUEST"
	ErrInvalidCSRF           AppError = "ERR_INVALID_CSRF"
	ErrInvalidProvider       AppError = " ERR_INVALID_PROVIDER"
	ErrInvalidPayload        AppError = "ERR_INVALID_PAYLOAD"
	ErrProviderError         AppError = "ERR_PROVIDER_ERROR"
	ErrSessionCreationFailed AppError = "ERR_SESSION_CREATION_FAILED"
	ErrTooMuchRequests       AppError = "ERR_TOO_MUCH_REQUESTS"
	ErrUserNotFound          AppError = "ERR_USER_NOT_FOUND"
	ErrUserLocked            AppError = "ERR_USER_LOCKED"
	ErrAccessingOAuthUser    AppError = "ERR_ACCESSING_OAUTH_USER"
	ErrFailedToDestroyCookie AppError = "ERR_FAILED_TO_DESTROY_COOKIE"
)

const (
	ErrFailedToUpdateUser AppError = "ERR_FAILED_TO_UPDATE_USER"
)
