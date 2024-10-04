"use client";

import { useEffect, useState } from "react";

export const useIsClientMounted = (): boolean => {
	const [isMounted, setIsMounted] = useState<boolean>(false);
	if (typeof window === "undefined") return false;

	useEffect(() => {
		setIsMounted(true);
	}, []);

	return isMounted;
};
