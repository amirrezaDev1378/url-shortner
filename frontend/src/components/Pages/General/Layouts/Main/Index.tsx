import React, { type FC } from "react";
import MainLayoutHeader from "@/components/Pages/General/Layouts/Main/Header.tsx";
import MainLayoutFooter from "@/components/Pages/General/Layouts/Main/Footer.tsx";

export interface MainGeneralLayoutProps {
	children: React.ReactNode | React.ReactNode[];
}

const MainGeneralLayout: FC<MainGeneralLayoutProps> = ({ children }) => {
	return (
		<div className={"flex h-full w-full flex-col items-center"}>
			<MainLayoutHeader />
			{children}
			<MainLayoutFooter />
		</div>
	);
};

export default MainGeneralLayout;
