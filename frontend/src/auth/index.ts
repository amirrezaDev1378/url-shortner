import { useStore } from "@nanostores/react";
import { $AuthStore } from "@/stores/auth.ts";
import { useEffect } from "react";
import authServices from "@/services/auth.ts";
import { handleServiceError } from "@/lib/services.ts";

export const useInitAuth = () => {
	const { user, authError, isLoading, isAuthenticated } = useStore($AuthStore);
	if (typeof window === "undefined") $AuthStore.setKey("isLoading", true);
	useEffect(() => {
		if (user || isLoading || isAuthenticated || authError) return;
		$AuthStore.setKey("isLoading", true);
		authServices
			.getUserInfo()
			.then((r) => {
				if (!r?.data?.id) throw new Error("unknown error");
				$AuthStore.set({
					user: {
						id: r.data.id,
						email: r.data.email,
						name: r.data.name,
						avatar: r.data.avatar,
					},
					isAuthenticated: true,
					isLoading: false,
				});
			})
			.catch((e) => {
				$AuthStore.set({
					authError: handleServiceError(e),
					isAuthenticated: false,
				});
			})
			.finally(() => {
				if (isLoading) $AuthStore.setKey("isLoading", false);
			});
	}, []);
};

export const useAuthStore = () => {
	const store = useStore($AuthStore);
	return store;
};
