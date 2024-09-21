import { AxiosError } from "axios";

export interface ServiceError {
	code: number;
	message: string;
}

export interface ServiceResponse<T extends any> {
	data?: T;
	error?: ServiceError;
}

export interface ServerErrorResponse {
	error_message: string;
}

export const handleServiceError = (result: AxiosError<ServerErrorResponse>): Partial<ServiceError> => {
	const hasError = result instanceof Error;
	if (!hasError || !result) return {};
	return {
		code: result?.status || -1,
		message: result?.response?.data?.error_message || result?.message || "ERR_UNKNOWN_ERR",
	};
};
