import type { AxiosResponse } from "axios";

export interface ServiceError {
	code: number;
	message: string;
}

export interface ServiceResponse<T extends any> {
	data?: T;
	error?: ServiceError;
}

export const handleServiceError = (result: AxiosResponse): ServiceError | null => {
	const hasError = result instanceof Error;
	if (!hasError) return null;
	return {
		code: result.status,
		message: result.data?.message || "ERR_UNKNOWN_ERR",
	};
};
