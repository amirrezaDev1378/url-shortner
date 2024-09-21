import { initIdsRequest } from "@/lib/request.ts";

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

const createAccountWithEmail = ({ email, password }: { email: string; password: string }) => {
	return idsRequest
		.post("/email/register", {
			email,
			password,
		})
		.then((r) => {
			if (!r.data.success) throw new Error("Something went wrong");
			return r;
		});
};

const loginWithEmail = ({ email, password }: { email: string; password: string }) => {
	return idsRequest
		.post("/email/login", {
			email,
			password,
		})
		.then((r) => {
			if (!r.data.success) throw new Error("Something went wrong");
			return r;
		});
};

const authServices = {
	requestOauthLink,
	handleOAuthLogin,
	createAccountWithEmail,
	loginWithEmail,
};

export default authServices;
