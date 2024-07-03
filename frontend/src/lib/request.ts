import axios, {type AxiosInstance} from "axios";

// This is a function because we don't want to create a new instance of axios for all pages, only ones that require this...

let _idsRequest: AxiosInstance;
export const initIdsRequest = () => {
    if (_idsRequest) return _idsRequest;
    _idsRequest = axios.create({
        baseURL: import.meta.env.PUBLIC_IDS_URL,
        withCredentials: true,
    });
    return _idsRequest;
};

export const authRequest = axios.create({});




