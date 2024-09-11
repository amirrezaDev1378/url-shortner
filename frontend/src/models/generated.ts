// Code generated by tygo. DO NOT EDIT.

//////////
// source: urls.go

export interface BaseUrl {
	slug: string;
	general_redirect_path: string;
	ios_redirect_path: string;
}
export interface CreateUrlBase {
	general_redirect_path: string;
	ios_redirect_path: string;
}
export interface UrlResponse extends BaseUrl {
	id: string;
	created_at: string;
}
export interface CreateUrlRequest extends CreateUrlBase {
	type: string;
	expiration: string;
}
export interface UpdateUrlRequest extends CreateUrlBase {
	id: string;
}
export interface DeleteUrlRequest {
	id: string;
}
export type GetAllUrlsResponse = UrlResponse[];
export interface GetRandomSlugResponse {
	slug: string;
}
