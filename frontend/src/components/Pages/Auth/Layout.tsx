import React, { type FC } from "react";
import { AnimatedBackgroundBoxes } from "@/components/AnimatedSections/BackgroundBoxes.tsx";

export interface LayoutProps {
	children: React.ReactNode;
}

const AuthLayout: FC<LayoutProps> = ({ children }) => {
	return (
		<div className={"relative flex h-full max-h-[100svh] items-center justify-center overflow-hidden"}>
			<AnimatedBackgroundBoxes boxBorderColors={"--slate-800"} />
			<div className="relative z-20 h-fit w-fit">{children}</div>
		</div>
	);
};

export default AuthLayout;
