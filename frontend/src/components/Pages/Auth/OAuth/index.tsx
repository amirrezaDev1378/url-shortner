import React, { type FC } from "react";
import { Button } from "@UI/button.tsx";
import { requestOauthLink } from "@/services/auth.ts";

// TODO : rename this
const OAuthUI: FC = () => {
	// TODO refactor this code

	const handleProviderLogin = (provider: string) => () => {
		requestOauthLink(provider).then(({ redirectUrl, error }) => {
			if (error || !redirectUrl) return alert("Errr");
			window.open(redirectUrl, "_blank");
		});
	};

	return (
		<div>
			Oauth Handler
			<Button onClick={handleProviderLogin("google")}>GOOGLE</Button>
		</div>
	);
};

export default OAuthUI;
