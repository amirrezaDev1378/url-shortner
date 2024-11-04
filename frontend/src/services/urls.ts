import { appRequest } from "@/lib/request.ts";
import type { CreateUrlRequest, CreateUrlResponse, DeleteUrlRequest, DeleteUrlResponse, GetAllUrlsResponse } from "@/models/generated.ts";
import { handleServiceError, type ServiceResponse } from "@/lib/services.ts";
import type { AxiosResponse } from "axios";

const CreateUrlService = async (params: CreateUrlRequest): Promise<ServiceResponse<CreateUrlResponse>> => {
	const res = await appRequest
		.post<CreateUrlRequest, AxiosResponse<CreateUrlResponse>>("/urls/create", {
			general_redirect_path: params.general_redirect_path,
			ios_redirect_path: params.ios_redirect_path,
			type: params.type,
			expiration: params.expiration,
		})
		.catch((e) => e);

	const error = handleServiceError(res);
	if (error?.code) return { error };

	return { data: res.data };
};

const DeleteUrlService = async (params: DeleteUrlRequest): Promise<ServiceResponse<DeleteUrlResponse>> => {
	const res = await appRequest.delete<DeleteUrlRequest, AxiosResponse<DeleteUrlResponse>>(`/urls/delete/${params.id}`).catch((e) => e);

	const error = handleServiceError(res);
	if (error?.code) return { error };

	return { data: res.data };
};

const GetAllUrlsService = async (): Promise<ServiceResponse<GetAllUrlsResponse>> => {
	const res = await appRequest.get("/urls/get-all").catch((e) => e);

	const error = handleServiceError(res);
	if (error?.code) return { error };

	return { data: res.data };
};

export { CreateUrlService, GetAllUrlsService, DeleteUrlService };
