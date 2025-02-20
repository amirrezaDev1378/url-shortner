import React, { type FC } from "react";
import { Button } from "@UI/button.tsx";
import authServices from "@/services/auth.ts";
import { FcGoogle } from "react-icons/fc";
import { redirect } from "@/lib/utils.ts";
import { toast } from "@/hooks/useToast.ts";

const AvailableProviders = [
	{
		name: "google",
		title: "Google",
		icon: FcGoogle,
	},
];

const OAuthProviders: FC = () => {
	const OAuthEnabled = !!import.meta.env.PUBLIC_OAUTH_PROVIDERS;
	if (!OAuthEnabled) return null;

	const providers = import.meta.env.PUBLIC_OAUTH_PROVIDERS?.replaceAll(/\s/g, "")?.split(",");
	if (!providers || providers?.length === 0) throw new Error("OAuth is enabled but no OAuth providers found");

	const handleProviderLogin = (provider: (typeof AvailableProviders)[number]["name"]) => () => {
		authServices.requestOauthLink(provider).then(({ redirectUrl, error }) => {
			if (error || !redirectUrl)
				return toast({
					variant: "destructive",
					title: "Something went wrong.",
				});
			redirect(redirectUrl);
		});
	};

	return (
		<div className={"w-full"}>
			<div className={"my-3 flex w-full flex-row items-center gap-1.5"}>
				<div className={"flex grow basis-0 border-b border-gray-300"}></div>
				<p className={"uppercase"}>OR</p>
				<div className={"flex grow basis-0 border-b border-gray-300"}></div>
			</div>
			<div className={"flex flex-col items-center gap-2"}>
				{AvailableProviders.map((p) => (
					<Button className={"flex w-full flex-row items-center"} key={p.name} onClick={handleProviderLogin(p.name)} title={p.title}>
						<p.icon className={"mr-2 h-4 w-4"} />
						Continue with {p.title}
					</Button>
				))}
			</div>
		</div>
	);
};

export default OAuthProviders;
