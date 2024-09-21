import AuthErrorsList from "@/services/error/messages/auth.ts";
import type { ReactNode } from "react";

export type AuthErrorMessagesType = {
	[key in AuthErrorsList | "Unknown" | string]?: string | ReactNode;
};

/**
 * This is a list of human friendly error descriptions.
 */
export const AuthErrorDescriptions: AuthErrorMessagesType = {
	[AuthErrorsList.ErrUserAlreadyExists]: (
		<div className={"text-white"}>
			User with the provided email already exists.
			<br />
			If you have already registered,{" "}
			<a className={"underline hover:text-neutral-300"} href="/login">
				login here.
			</a>
			<br />
			If you have forgotten your password,{" "}
			<a className={"underline hover:text-neutral-300"} href="/reset-password">
				reset it here.
			</a>
		</div>
	),
	[AuthErrorsList.ErrInvalidCredentials]: "The provided email or password is incorrect.",
	[AuthErrorsList.ErrTooMuchRequests]: "You have tried to login too many times. Please try again later.",
	[AuthErrorsList.ErrUserNotFound]: "We could not find a user with the provided credentials.",
	[AuthErrorsList.ErrUserLocked]: "You have tried to login too many times. Please try again later.",
	Unknown: "Something went wrong. Please try again later and if the problem persists, contact the support.",
};
