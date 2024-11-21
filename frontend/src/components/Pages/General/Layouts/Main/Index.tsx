import React, { type FC } from "react";
import MainLayoutHeader from "@/components/Pages/General/Layouts/Main/Header.tsx";
import MainLayoutFooter from "@/components/Pages/General/Layouts/Main/Footer.tsx";

export interface MainGeneralLayoutProps {
	children: React.ReactNode | React.ReactNode[];
}

const MainGeneralLayout: FC<MainGeneralLayoutProps> = ({ children }) => {
	return (
		<div className={"flex h-[100svh] w-full snap-y snap-mandatory flex-col items-center overflow-auto"}>
			<MainLayoutHeader />
			{children}
			<MainLayoutFooter />
		</div>
	);
};

export default MainGeneralLayout;
