import { appRequest } from "@/lib/request.ts";
import type { CreateUrlRequest, CreateUrlResponse } from "@/models/generated.ts";
import { handleServiceError, type ServiceResponse } from "@/lib/services.ts";
import type { AxiosResponse } from "axios";

export const CreateTempUrlService = async (params: CreateUrlRequest): Promise<ServiceResponse<CreateUrlResponse>> => {
	const result = await appRequest
		.post<CreateUrlRequest, AxiosResponse<CreateUrlResponse>>("/temp-urls/create", params as CreateUrlRequest)
		.catch((e) => e);

	const error = handleServiceError(result);
	if (error?.code) return { error };

	return { data: result.data };
};
