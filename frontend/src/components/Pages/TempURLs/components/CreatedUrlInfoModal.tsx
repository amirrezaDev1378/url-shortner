import React, { type FC } from "react";
import { Dialog, DialogContent } from "@UI/dialog.tsx";

export interface CreatedUrlInfoModalProps {
	slug: string;
	expiration: string;
	onClose: () => void;
}

const CreatedUrlInfoModal: FC<CreatedUrlInfoModalProps> = ({ slug, expiration, onClose }) => {
	const createdUrl = new URL(import.meta.env.PUBLIC_URLS_DOMAIN);
	createdUrl.pathname = slug;

	return (
		<Dialog open defaultOpen onOpenChange={onClose}>
			<DialogContent>
				<a href={createdUrl.toString()} target={"_blank"}>
					View ur awesome url
				</a>
			</DialogContent>
		</Dialog>
	);
};

export default CreatedUrlInfoModal;
