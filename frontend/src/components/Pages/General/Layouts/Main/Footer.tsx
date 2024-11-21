import React, { type FC } from "react";

export interface MainLayoutFooterProps {}

const MainLayoutFooter: FC<MainLayoutFooterProps> = (props) => {
	return (
		<div>
			<img className={"relative h-20 snap-center"} src="/logo/logo-light.png" alt="UOS" />
		</div>
	);
};

export default MainLayoutFooter;
