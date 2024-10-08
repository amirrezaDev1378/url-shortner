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

export const convertShortedURLsToDate = (url: string): URL | null => {
	if (!url) return null;

	const createdUrl = new URL(import.meta.env.PUBLIC_URLS_DOMAIN);
	createdUrl.pathname = url;

	return createdUrl;
};
