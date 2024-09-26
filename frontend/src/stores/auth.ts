import { map } from "nanostores";
import type { ServiceError } from "@/lib/services.ts";

interface AuthStoreParams {
	user?: {
		id: string;
		email: string;
	};
	isLoading?: boolean;
	isAuthenticated?: boolean;
	authError?: Partial<ServiceError>;
}

const $AuthStore = map<AuthStoreParams>({} as AuthStoreParams);

export { $AuthStore, type AuthStoreParams };
