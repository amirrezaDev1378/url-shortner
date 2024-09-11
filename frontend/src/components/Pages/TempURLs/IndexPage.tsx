import React, { type FC } from "react";
import CreateTempUrl from "@/components/Pages/TempURLs/components/CreateTempUrl.tsx";

const TempUrlsPage: FC = (props) => {
	return (
		<div className="flex h-full w-full items-center justify-center">
			<CreateTempUrl />
		</div>
	);
};

export default TempUrlsPage;
