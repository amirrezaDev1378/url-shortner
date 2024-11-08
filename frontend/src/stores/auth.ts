import { map } from "nanostores";
import type { ServiceError } from "@/lib/services.ts";
import authServices from "@/services/auth.ts";

interface AuthStoreParams {
	user?: {
		id: string;
		email: string;
		avatar?: string;
		name?: string;
	};
	isLoading?: boolean;
	isAuthenticated?: boolean;
	authError?: Partial<ServiceError>;
}

export interface AuthStoreActions {
	logout: () => Promise<boolean>;
}

export const $AuthStoreActions: AuthStoreActions = {
	logout: async (): Promise<boolean> => {
		try {
			await authServices.logoutUser();
			$AuthStore.set({
				isLoading: false,
				isAuthenticated: false,
			});
			return true;
		} catch (e) {
			return false;
		}
	},
};

const $AuthStore = map<AuthStoreParams>({} as AuthStoreParams);

export { $AuthStore, type AuthStoreParams };
