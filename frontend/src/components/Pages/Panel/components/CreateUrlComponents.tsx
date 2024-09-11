import React, { type FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import AppFormProvider from "@/components/Form/hook-form/app-form-provider.tsx";
import RHFTextInput from "@/components/Form/hook-form/rhf-text-input.tsx";
import { Button } from "@UI/button.tsx";
import { Label } from "@UI/label.tsx";
import { Checkbox } from "@UI/checkbox.tsx";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateUrlRequest } from "@/models/generated.ts";

const CreateUrlWithPage: FC = () => {
	return <div></div>;
};
const CreateUrlWithProxy: FC = () => {
	return <div></div>;
};

type CreateStandardUrlProps = {
	onSubmit: (data: CreateUrlRequest) => void;
};

const CreateStandardUrl: FC<CreateStandardUrlProps> = ({ onSubmit }) => {
	const standardUrlSchema = z.strictObject({
		slug: z.string().trim().min(1),
		ios_redirect_path: z
			.string()
			.trim()
			.min(1)
			.url()
			.optional()
			.or(z.literal(""))
			.refine((r) => (customDevicesState.ios ? !!r : true), { message: "Provide ios link" }),
		general_redirect_path: z
			.string()
			.trim()
			.min(1)
			.url()
			.optional()
			.or(z.literal(""))
			.refine((r) => (customDevicesState.android ? !!r : true), { message: "Provide android link" }),
	});
	const methods = useForm<z.infer<typeof standardUrlSchema>>({
		resolver: zodResolver(standardUrlSchema),
		mode: "all",
		defaultValues: {
			slug: "",
			general_redirect_path: "",
			ios_redirect_path: "",
		},
	});
	const {
		handleSubmit,
		trigger,
		formState: { errors },
	} = methods;

	const [customDevicesState, setCustomDevicesState] = useState({
		ios: false,
		android: false,
	});
	const toggleCustomDevice = (type: "ios" | "android") => () =>
		setCustomDevicesState((p) => ({
			...p,
			[type]: !p[type],
		}));

	useEffect(() => {
		trigger("ios_redirect_path");
		trigger("general_redirect_path");
	}, [customDevicesState]);
	const onFormSubmit = handleSubmit((data) =>
		onSubmit({
			general_redirect_path: data.general_redirect_path as string,
			ios_redirect_path: data.ios_redirect_path as string,
			type: "direct",
			expiration: "never",
		})
	);

	return (
		<AppFormProvider onSubmit={onFormSubmit} className={"flex w-full flex-col items-center"} methods={methods}>
			<div className={"flex w-[50%] flex-col flex-wrap gap-6 rounded-xl border-2 border-solid border-neutral-700 p-6"}>
				<h4 className={"mb-2 text-center text-4xl"}>Standard URL</h4>

				<RHFTextInput
					helperText={"Enter a name for your link, this will not be shown to anyone, it's just for your self"}
					animatedInput
					animateError
					name={"name"}
					label={"name"}
				/>
				<RHFTextInput animatedInput animateError name={"destination"} label={"Destination URL"} />
				<div className={"flex w-full flex-col items-start"}>
					<Label className={"pb-1"}>Slug</Label>
					<div className={"flex w-full flex-row items-end gap-6"}>
						<p className={"pb-1 text-3xl"}>{import.meta.env.PUBLIC_URLS_DOMAIN} /</p>
						<RHFTextInput
							hideFormMessages
							animatedInput
							animateError
							name={"slug"}
							placeholder={"slug"}
							wrapperProps={{ className: "flex-1" }}
						/>
						<Button className={"m-[2px] h-[40px]"}>Generate Link</Button>
					</div>
				</div>
				<div className={"flex w-full flex-row items-center justify-between gap-6"}>
					<RHFTextInput
						wrapperProps={{ className: "flex-1" }}
						disabled={!customDevicesState.ios}
						animatedInput
						animateError
						name={"ios-destination"}
						label={"IOS Destination"}
						description={"If you like to redirect IOS users to another url, use this option."}
					/>
					<Checkbox className={"mb-2"} checked={customDevicesState.ios} onClick={toggleCustomDevice("ios")} />
				</div>
				<div className={"flex w-full flex-row items-center justify-between gap-6"}>
					<RHFTextInput
						wrapperProps={{ className: "flex-1" }}
						disabled={!customDevicesState.android}
						animatedInput
						animateError
						name={"android-destination"}
						label={"Android Destination"}
						description={"If you like to redirect Android users to another url, use this option."}
					/>
					<Checkbox className={"mb-2"} checked={customDevicesState.android} onClick={toggleCustomDevice("android")} />
				</div>
				<Button type={"submit"}>create</Button>
			</div>
		</AppFormProvider>
	);
};

export { CreateUrlWithPage, CreateUrlWithProxy, CreateStandardUrl };
