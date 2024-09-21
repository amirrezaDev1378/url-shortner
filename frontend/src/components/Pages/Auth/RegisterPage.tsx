import React, { type FC } from "react";
import { useForm } from "react-hook-form";
import AppFormProvider from "@/components/Form/hook-form/app-form-provider.tsx";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@UI/button.tsx";
import RHFTextInput from "@/components/Form/hook-form/rhf-text-input.tsx";
import OAuthProviders from "@/components/Pages/Auth/OAuth";
import { LuMail } from "react-icons/lu";
import { toast } from "@/hooks/useToast.ts";
import { handleServiceError } from "@/lib/services.ts";
import { AuthErrorDescriptions } from "@/services/error/descriptions/auth.tsx";
import authServices from "@/services/auth.ts";

const registerFormSchema = z
	.strictObject({
		email: z
			.string({ errorMap: () => ({ message: "Please enter a valid email address." }) })
			.trim()
			.min(1)
			.email(),
		password: z.string({ message: "Invalid password." }).trim().min(6, { message: "Your password must be at least 6 characters long." }),
		passwordRepeat: z.string({ message: "Invalid password." }).trim().min(1, { message: "Invalid password." }),
	})
	.refine(({ passwordRepeat, password }) => passwordRepeat === password, {
		message: "Password repeat does not match",
		path: ["passwordRepeat"],
	});
const RegisterPage: FC = () => {
	const form = useForm<z.infer<typeof registerFormSchema>>({
		resolver: zodResolver(registerFormSchema),
		defaultValues: {
			email: "",
			password: "",
			passwordRepeat: "",
		},
		mode: "all",
	});
	const {
		handleSubmit,
		formState: {
			// TODO: add loading with this field.
			isSubmitting,
		},
	} = form;

	const onSubmit = handleSubmit(({ password, email }) => {
		authServices
			.createAccountWithEmail({ email, password })
			.then((r) => {
				if (!r.data.success) throw new Error("Something went wrong");
				toast({
					type: "foreground",
					variant: "default",
					title: "Account created.",
					description: "Your account has been created. You will be redirected to the panel.",
				});
				setTimeout(() => {
					window.history.pushState({}, "", "/panel");
				});
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
					<p className={"text-center text-[1.7rem] text-white"}>Creating an account.</p>
					<a href="/auth/login" className={"block w-full text-center text-sm text-neutral-400 hover:text-neutral-300 hover:underline"}>
						Already have an account? Login.
					</a>
				</div>

				<AppFormProvider className={"flex w-full flex-col gap-4"} methods={form} preventDefault>
					<RHFTextInput animatedInput animateError placeholder={"Your email address."} label={"Email"} name={"email"} />
					<RHFTextInput animatedInput animateError placeholder={"Password"} label={"Password"} name={"password"} type={"password"} />
					<RHFTextInput
						animatedInput
						animateError
						placeholder={"Password Repeat"}
						label={"Password Repeat"}
						name={"passwordRepeat"}
						type={"password"}
					/>

					<Button onClick={onSubmit} type={"submit"} className={"flex flex-row items-center gap-2"}>
						<LuMail />
						Continue With Email
					</Button>
				</AppFormProvider>
				<OAuthProviders />
			</div>
		</div>
	);
};

export default RegisterPage;
