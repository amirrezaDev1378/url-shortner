import {initIdsRequest} from "@/lib/request.ts";

const idsRequest = initIdsRequest();

export const requestOauthLink = async (provider: string) => {
    if (!provider) throw new Error("No Provider Provided.");
    return await idsRequest.post(`/oauth/${provider}/login`).then(({data}) => {
        if (!data?.redirectUrl) throw new Error("Invalid response");
        return {
            error: false,
            redirectUrl: data.redirectUrl as string
        };
    }).catch(() => ({
        error: true,
        redirectUrl: null
    }));
};

export const handleOAuthLogin = async (params: { provider: string, code: string, state: string }) => {
    const {code, state, provider} = params;
    if (!provider) throw new Error("No Provider Provided.");
    await idsRequest.post(`/oauth/${provider}/callback`, {
        code,
        state
    } , {
        withCredentials:true
    }).then(({data}) => {
        if (data.token) localStorage.setItem("token", data.token);
    });
};
