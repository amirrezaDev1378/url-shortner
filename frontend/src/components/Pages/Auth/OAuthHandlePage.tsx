import React, { type FC, useEffect, useState } from "react";
import authServices from "@/services/auth.ts";
import { Skeleton } from "@UI/skeleton.tsx";
import { redirect } from "@/lib/utils.ts";

type OAuthStates = "init" | "service_loading" | "error" | "success";

const OAuthStateComponents: { [key in OAuthStates]: FC } = {
	service_loading: () => (
		<Skeleton className={"flex min-h-40 items-center justify-center p-4 text-2xl"}>We're authenticating you. Please wait...</Skeleton>
	),
	init: () => OAuthStateComponents["service_loading"]({}),
	error: () => {
		useEffect(() => {
			setTimeout(() => {
				redirect("/auth/login");
			}, 3000);
		}, []);
		return (
			<div className={"rounded-2xl bg-red-500 p-4 text-black"}>
				<p>Something went wrong. You will be redirected to the login page.</p>
			</div>
		);
	},
	success: () => {
		useEffect(() => {
			setTimeout(() => {
				redirect("/panel");
			}, 2000);
		}, []);
		return (
			<div className={"rounded-2xl bg-green-200 p-4 text-black"}>
				<p>Successfully Authenticated, You Will Be Redirected To Your Destination Shortly...</p>
			</div>
		);
	},
};

const OAuthHandlePage: FC = () => {
	const [handlingState, setHandlingState] = useState<OAuthStates>("init");

	useEffect(() => {
		if (handlingState === "service_loading") return;
		setHandlingState("service_loading");
		const url = new URL(window.location.href);
		const provider = url.searchParams.get("provider");
		const code = url.searchParams.get("code");
		const error = url.searchParams.get("error");
		const state = url.searchParams.get("state");
		if (error) return setHandlingState("error");
		if (!code || !state) return setHandlingState("error");
		if (!provider) return setHandlingState("error");
		authServices
			.handleOAuthLogin({
				provider,
				code,
				state,
			})
			.then(() => {
				setHandlingState("success");
			})
			.catch(() => setHandlingState("error"));
	}, []);

	const StateComponent = OAuthStateComponents[handlingState];
	return (
		<div>
			<StateComponent />
		</div>
	);
};

export default OAuthHandlePage;
