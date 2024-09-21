import AuthErrorsList from "@/services/error/messages/auth.ts";

export type AuthErrorMessagesType = {
	[key in AuthErrorsList | "Unknown" | string]?: string;
};

/**
 * This is a list of human friendly error descriptions.
 */
export const AuthErrorMessages: AuthErrorMessagesType = {
	[AuthErrorsList.ErrUserAlreadyExists]: "User with the provided email already exists.",
	[AuthErrorsList.ErrInvalidCredentials]: "The provided email or password is incorrect.",
	[AuthErrorsList.ErrTooMuchRequests]: "You have tried to login too many times. Please try again later.",
	[AuthErrorsList.ErrUserNotFound]: "We could not find a user with the provided credentials.",
	[AuthErrorsList.ErrUserLocked]: "You have tried to login too many times. Please try again later.",
	Unknown: "Something went wrong while creating your account. Please try again later and if the problem persists, contact the support.",
};
