import React, { type FC, type HTMLProps, type ReactNode } from "react";
import { cn } from "@/lib/shadcn-utils.ts";

interface Props extends HTMLProps<HTMLDivElement> {
	visible: boolean;
	children: ReactNode | ReactNode[];
}

export const lightBoxZIndex = 999;
const LightBox: FC<Props> = ({ children, visible, className, ...containerProps }) => {
	return (
		<div
			className={cn({ "absolute inset-0 bg-neutral-900 opacity-90 backdrop-blur-3xl": visible }, { "opacity-0": !visible }, className)}
			{...containerProps}
		>
			{children}
		</div>
	);
};

export default LightBox;
