enum AuthErrorsList {
	ErrBadRequest = "ERR_BAD_REQUEST",
	ErrUserAlreadyExists = "ERR_USER_ALREADY_EXISTS",
	ErrInvalidCredentials = "ERR_INVALID_CREDENTIALS",
	ErrInvalidSession = "ERR_INVALID_SESSION",
	ErrInvalidCSRF = "ERR_INVALID_CSRF",
	ErrInvalidProvider = " ERR_INVALID_PROVIDER",
	ErrInvalidPayload = "ERR_INVALID_PAYLOAD",
	ErrProviderError = "ERR_PROVIDER_ERROR",
	ErrSessionCreationFailed = "ERR_SESSION_CREATION_FAILED",
	ErrTooMuchRequests = "ERR_TOO_MUCH_REQUESTS",
	ErrUserNotFound = "ERR_USER_NOT_FOUND",
	ErrUserLocked = "ERR_USER_LOCKED",
	ErrAccessingOAuthUser = "ERR_ACCESSING_OAUTH_USER",
	ErrFailedToDestroyCookie = "ERR_FAILED_TO_DESTROY_COOKIE",
}

export default AuthErrorsList;
