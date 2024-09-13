import React, { type FC, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@UI/dialog.tsx";
import { setUserHasCreatedURlBefore, userHasCreatedURlBefore } from "@/lib/utils.ts";
import confetti from "canvas-confetti";
import { Button } from "@UI/button.tsx";
import { toast } from "@/hooks/useToast.ts";

export interface CreatedUrlInfoModalProps {
	slug: string;
	expiration: string;
	onClose: () => void;
}

const CreatedUrlInfoModal: FC<CreatedUrlInfoModalProps> = ({ slug, expiration, onClose }) => {
	const createdUrl = new URL(import.meta.env.PUBLIC_URLS_DOMAIN);
	createdUrl.pathname = slug;

	const expirationTime = new Date(expiration).toLocaleString();
	// TODO: do more shits with this...
	const isFirstUrl = !userHasCreatedURlBefore();

	useEffect(() => {
		if (isFirstUrl || true) {
			confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.6 },
				colors: ["#e31515", "#ffffff", "#3cff97", "#eff53d", "#1d69f5"],
			});
			setUserHasCreatedURlBefore();
		}
	}, []);

	const copyUrlToClipboard = () => {
		navigator.clipboard
			.writeText(createdUrl.toString())
			.then((r) =>
				toast({
					title: "Copied to clipboard",
					description: "You can now share this link with your friends!",
					variant: "default",
					className: "bg-green-500",
				})
			)
			.catch((e) => {
				console.error(e);
				toast({
					title: "Failed to copy the link to clipboard",
					description: "This may be due browser security settings, try again later.",
					variant: "destructive",
				});
			});
	};

	return (
		<Dialog open defaultOpen onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-3xl">Your URL has been created! 🎉</DialogTitle>
				</DialogHeader>
				<DialogDescription className={"flex flex-col items-center justify-center"}>
					<div className={"flex w-full flex-row items-center justify-between"}>
						<div className={"flex w-9/12 flex-row items-center gap-2 rounded-md bg-gray-100 p-2"}>
							<p className={"text-gray-700"}>Your URL is :</p>
							<a href={createdUrl.toString()} className={"text-lg text-black hover:text-gray-500"} target={"_blank"}>
								{createdUrl.toString()}
							</a>
						</div>
						<Button variant={"default"} className={"h-full bg-blue-600 text-white hover:bg-blue-700"} onClick={copyUrlToClipboard}>
							Copy Link.
						</Button>
					</div>
					<hr className={"mb-2 mt-6 w-full"} />
					<p className={"rounded-lg bg-gray-500 p-2 text-lg text-white"}>Your URL will expire in {expirationTime}</p>
				</DialogDescription>
			</DialogContent>
		</Dialog>
	);
};

export default CreatedUrlInfoModal;
