import { generalRequest } from "@/lib/request.ts";
import type { CreateUrlRequest } from "@/models/generated.ts";
import { handleServiceError, type ServiceResponse } from "@/lib/services.ts";

export const CreateTempUrlService = async (params: CreateUrlRequest): Promise<ServiceResponse<null>> => {
	const result = await generalRequest.post("/temp-urls/create", params as CreateUrlRequest).catch((e) => e);

	const error = handleServiceError(result);
	if (error) return { error };

	return { data: null };
};
