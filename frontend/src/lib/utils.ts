import { createdFirstUrlKey } from "@/lib/constans.ts";

export const userHasCreatedURlBefore = (): boolean => {
	if (typeof window === "undefined") return false;
	return localStorage.getItem(createdFirstUrlKey) === "true";
};

export const setUserHasCreatedURlBefore = (): void => {
	if (typeof window === "undefined") return;
	localStorage.setItem(createdFirstUrlKey, "true");
};

export const redirect = (url: string) => {
	window.location.assign(url);
};
