import React, { type FC } from "react";
import { useForm } from "react-hook-form";
import AppFormProvider from "@/components/Form/hook-form/app-form-provider.tsx";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@UI/button.tsx";
import RHFTextInput from "@/components/Form/hook-form/rhf-text-input.tsx";
import OAuthProviders from "@/components/Pages/Auth/OAuth";
import { LuMail } from "react-icons/lu";
import authServices from "@/services/auth.ts";
import { toast } from "@/hooks/useToast.ts";
import { handleServiceError } from "@/lib/services.ts";
import { AuthErrorDescriptions } from "@/services/error/descriptions/auth.tsx";

const loginFormSchema = z.strictObject({
	email: z
		.string({ errorMap: () => ({ message: "Please enter a valid email address." }) })
		.trim()
		.min(1)
		.email(),
	password: z.string({ message: "Invalid password." }).trim().min(6, { message: "Your password must be at least 6 characters long." }),
});

const LoginPage: FC = () => {
	const form = useForm<z.infer<typeof loginFormSchema>>({
		resolver: zodResolver(loginFormSchema),
		defaultValues: {
			email: "",
			password: "",
		},
		mode: "all",
	});
	const { handleSubmit } = form;

	const handleEmailLogin = handleSubmit(({ email, password }) => {
		authServices
			.loginWithEmail({ email, password })
			.then(() => {
				toast({
					type: "foreground",
					variant: "default",
					title: "Logged in successfully.",
					description: "Your are now logged in. You will be redirected to the panel.",
				});
				setTimeout(() => {
					window.location.replace("/panel");
				}, 500);
			})
			.catch((err) => {
				const serviceError = handleServiceError(err);

				toast({
					type: "foreground",
					variant: "destructive",
					title: "Something went wrong.",
					description: AuthErrorDescriptions[serviceError.message as string] || AuthErrorDescriptions.Unknown,
				});
			});
	});

	return (
		<div className="flex h-fit w-full items-center justify-center">
			<div className="flex h-fit w-[300px] flex-col items-center rounded-2xl border-2 border-solid border-neutral-800 bg-background p-4">
				<div className={"mb-5 w-full"}>
					<p className={"text-center text-[1.7rem] text-white"}>Login to account.</p>
					<a href="/auth/login" className={"block w-full text-center text-sm text-neutral-400 hover:text-neutral-300 hover:underline"}>
						Don't have an account? Create one.
					</a>
				</div>
				<AppFormProvider className={"flex w-full flex-col gap-4"} methods={form} preventDefault>
					<RHFTextInput animatedInput animateError placeholder={"Your email address."} label={"Email"} name={"email"} />
					<RHFTextInput animatedInput animateError placeholder={"Password"} label={"Password"} name={"password"} type={"password"} />

					<Button onClick={handleEmailLogin} type={"submit"} className={"flex flex-row items-center gap-2"}>
						<LuMail />
						Continue With Email
					</Button>
				</AppFormProvider>
				<OAuthProviders />
			</div>
			{/*<hr />*/}
			{/*<p>Fix these styles</p>*/}
			{/*<button*/}
			{/*	onClick={() => {*/}
			{/*		const cacelToken = new AbortController();*/}

			{/*		initIdsRequest().post(*/}
			{/*			"https://127.0.0.1:3033/api/v1/urls/create",*/}
			{/*			{*/}
			{/*				slug: "s" + Math.round(Math.random() * 1000),*/}
			{/*				general_redirect_path: "https://deadsimplechat.com/blog/how-to-use-go-channels/",*/}
			{/*				ios_redirect_path: "https://time.ir",*/}
			{/*				type: "static",*/}
			{/*			},*/}
			{/*			{*/}
			{/*				signal: cacelToken.signal,*/}
			{/*			}*/}
			{/*		);*/}
			{/*		setTimeout(() => {*/}
			{/*			cacelToken.abort("fuck u");*/}
			{/*		}, 100);*/}
			{/*	}}*/}
			{/*>*/}
			{/*	ass asdasd*/}
			{/*</button>*/}
			{/*<OAuthUI />*/}
		</div>
	);
};

export default LoginPage;
