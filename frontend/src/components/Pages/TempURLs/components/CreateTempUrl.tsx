import React, { type FC, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AppFormProvider from "@/components/Form/hook-form/app-form-provider.tsx";
import RHFTextInput from "@/components/Form/hook-form/rhf-text-input.tsx";
import { Button } from "@UI/button.tsx";
import type { CreateUrlRequest } from "@/models/generated.ts";
import { ZodUrl } from "@/lib/validation.ts";
import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "lucide-react";
import { CreateTempUrlService } from "@/services/tempUrls.ts";
import { Label } from "@UI/label.tsx";
import { AnimatedTabs, type Tab } from "@UI/AnimatedTabs.tsx";

export interface CreateTempUrlProps {}

const ExpirationOptions = {
	"1 Hour": 60 * 60 * 1000,
	"1 Day": 24 * 60 * 60 * 1000,
	"1 Week": 7 * 24 * 60 * 60 * 1000,
	"1 Month": 30 * 24 * 60 * 60 * 1000,
	"3 Month": 3 * 30 * 24 * 60 * 60 * 1000,
	Never: -1,
} as const;

const ExpirationOptionsTab: Tab[] = Object.entries(ExpirationOptions).map((e) => ({
	title: e[0],
	value: e[1],
}));

const CreateTempUrl: FC<CreateTempUrlProps> = (props) => {
	const [customIosLink, setCustomIosLink] = useState<boolean>(false);
	const [activeExpiration, setActiveExpiration] = useState<Tab>(ExpirationOptionsTab[0]);

	const temporaryUrlSchema = z.strictObject({
		// expiration: zodEnumFromObjectValues(ExpirationOptions),
		expiration: z.nativeEnum(ExpirationOptions),
		ios_redirect_path: ZodUrl.optional().or(z.literal("")),
		general_redirect_path: ZodUrl,
	} satisfies { [key in keyof Omit<CreateUrlRequest, "type" | "slug">]: any });

	const methods = useForm<z.infer<typeof temporaryUrlSchema>>({
		resolver: zodResolver(temporaryUrlSchema),
		mode: "all",
		defaultValues: {
			expiration: ExpirationOptionsTab[0].value,
			general_redirect_path: "",
			ios_redirect_path: "",
		},
	});

	const {
		handleSubmit,
		trigger,
		setValue,
		formState: { errors },
	} = methods;

	console.log(errors);
	const onExpirationChange = (newExpiration: Tab) => {
		if (newExpiration.value === -1) {
			return;
		}
		console.log(newExpiration);
		setActiveExpiration(newExpiration);
		// setValue("expiration", newExpiration.value);
	};

	const onFormSubmit = handleSubmit((data) => {
		CreateTempUrlService({
			general_redirect_path: data.general_redirect_path,
			expiration: new Date(Date.now() + data.expiration).toISOString(),
			ios_redirect_path: data.ios_redirect_path || "",
			type: "direct",
		});
	});

	return (
		<AppFormProvider preventDefault className={"flex w-full flex-col items-center"} methods={methods}>
			<div className={"flex w-[50%] flex-col flex-wrap gap-6 rounded-xl border-2 border-solid border-neutral-700 p-6"}>
				<h4 className={"mb-2 text-center text-4xl"}>Standard URL</h4>

				<RHFTextInput animatedInput animateError name={"general_redirect_path"} label={"Destination URL"} />

				<AnimatePresence mode={"popLayout"}>
					{!customIosLink && (
						<motion.div
							key={"add-custom-ios-url"}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="flex"
						>
							<Button onClick={() => setCustomIosLink(true)}>Add Custom Destination for IOS</Button>
						</motion.div>
					)}

					{customIosLink && (
						<motion.div
							key={"ios-custom-url"}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className={"flex w-full flex-row items-center justify-between gap-6"}
						>
							<RHFTextInput
								wrapperProps={{ className: "flex-1" }}
								disabled={!customIosLink}
								animatedInput
								animateError
								name={"ios-destination"}
								label={"IOS Destination"}
								description={"If you like to redirect IOS users to another url, use this option."}
							/>
							<Button onClick={() => setCustomIosLink(false)}>
								<XIcon />
							</Button>
						</motion.div>
					)}
				</AnimatePresence>
				<div>
					<Label>Expiration</Label>
					<AnimatedTabs activeTab={activeExpiration} setActiveTab={onExpirationChange} tabs={ExpirationOptionsTab} />
				</div>

				<Button onClick={onFormSubmit} type={"submit"}>
					create
				</Button>
			</div>
		</AppFormProvider>
	);
};

export default CreateTempUrl;
