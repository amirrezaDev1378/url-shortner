import React, { type FC, useEffect, useState } from "react";
import { handleOAuthLogin } from "@/services/auth.ts";
import axios from "axios";
import type { TODO_TYPE } from "@/models/utils.ts";

const OAuthHandlePage: FC = () => {
	const [handlingState, setHandlingState] = useState<TODO_TYPE>(null);

	useEffect(() => {
		if (!handlingState) setHandlingState("loading");
		if (handlingState === "loading") return;
		const url = new URL(window.location.href);
		const provider = url.searchParams.get("provider");
		const code = url.searchParams.get("code");
		const error = url.searchParams.get("error");
		const state = url.searchParams.get("state");
		if (error) return setHandlingState("error");
		if (!code || !state) return setHandlingState("error_no_state_or_code");
		if (!provider) return setHandlingState("error_no_provider");
		handleOAuthLogin({
			provider,
			code,
			state,
		})
			.then(() => {
				setHandlingState("Done!!!");
			})
			.catch(() => setHandlingState("ERR"));
	}, []);
	return (
		<div>
			handling o-auth {handlingState && handlingState}
			<button
				onClick={() =>
					axios
						.get("https://127.0.0.1:3033/auth/fuck", {
							withCredentials: true,
						})
						.finally(() => setHandlingState("fucked "))
				}
			>
				fuck
			</button>
			<button
				onClick={() =>
					axios
						.get("https://127.0.0.1:3033/auth/users/user-info", {
							withCredentials: true,
						})
						.catch(() => setHandlingState("Unauthorized"))
				}
			>
				check cookies
			</button>
		</div>
	);
};

export default OAuthHandlePage;
