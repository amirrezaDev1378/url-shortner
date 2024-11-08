import { initIdsRequest } from "@/lib/request.ts";
import type { UserInfoResponse } from "@/models/generated.ts";

const idsRequest = initIdsRequest();

const requestOauthLink = async (provider: string) => {
	if (!provider) throw new Error("No Provider Provided.");
	return await idsRequest
		.post(`/oauth/${provider}/login`)
		.then(({ data }) => {
			if (!data?.redirectUrl) throw new Error("Invalid response");
			return {
				error: false,
				redirectUrl: data.redirectUrl as string,
			};
		})
		.catch(() => ({
			error: true,
			redirectUrl: null,
		}));
};

const handleOAuthLogin = async (params: { provider: string; code: string; state: string }) => {
	const { code, state, provider } = params;
	if (!provider) throw new Error("No Provider Provided.");
	await idsRequest
		.post(`/oauth/${provider}/callback`, {
			code,
			state,
		})
		.then(({ data }) => {
			if (data.token) localStorage.setItem("token", data.token);
		});
};

const createAccountWithEmail = async ({ email, password }: { email: string; password: string }) => {
	const r = await idsRequest.post("/email/register", {
		email,
		password,
	});
	if (!r.data.success) throw new Error("Something went wrong");
	return r;
};

const loginWithEmail = async ({ email, password }: { email: string; password: string }) => {
	const r = await idsRequest.post("/email/login", {
		email,
		password,
	});
	if (!r.data.success) throw new Error("Something went wrong");
	return r;
};

const getUserInfo = async () => {
	const r = await idsRequest.get<UserInfoResponse>("/user/user-info");
	if (!r.data.id) throw new Error("Something went wrong");
	return r;
};

const logoutUser = async () => {
	return await idsRequest.post<unknown>("/user/logout");
};

const authServices = {
	requestOauthLink,
	handleOAuthLogin,
	createAccountWithEmail,
	loginWithEmail,
	getUserInfo,
	logoutUser,
};

export default authServices;
