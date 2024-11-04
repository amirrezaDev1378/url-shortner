import * as React from "react";
import { type FC } from "react";
import {
	AnalyticsUrlsByDevice,
	AnalyticUrlsByLocation,
	AnalyticUrlsTotalClick,
	TopUrlsAnalytics,
} from "./components/AnalyticUrlsComponents.tsx";
import { cn } from "@/lib/shadcn-utils.ts";

const TODO = true;

const AnalyticUrlsPage: FC = () => {
	return (
		<div className={cn("flex w-full flex-col p-6", TODO && "pointer-events-none")}>
			{TODO && (
				<div
					className={
						"absolute inset-0 z-[50000] ml-auto flex w-[calc(100%-12rem)] items-center justify-center bg-black/30 backdrop-blur-lg"
					}
				>
					<h1 className={"text-3xl"}>
						Sorry but this page is still under development🥲,
						<br />
						Please come back later, We're working on it!
					</h1>
				</div>
			)}
			<h3 className={"mt-5 w-full text-left text-3xl"}>Analytics.</h3>
			<hr className={"my-4 w-full"} />
			<div className={"flex flex-row flex-wrap justify-between"}>
				<div className="m-[12px]] rounded-2xl p-8 shadow-sm-center shadow-main md:w-[46%]">
					<AnalyticUrlsTotalClick />
				</div>
				<div className="m-[12px]] rounded-2xl p-8 shadow-sm-center shadow-main md:w-[46%]">
					<AnalyticUrlsByLocation />
				</div>
				<div className="m-[12px]] mt-12 rounded-2xl p-8 shadow-sm-center shadow-main md:w-[46%]">
					<AnalyticsUrlsByDevice />
				</div>
				<div className="m-[12px]] mt-12 rounded-2xl p-8 shadow-sm-center shadow-main md:w-[46%]">
					<TopUrlsAnalytics />
				</div>
			</div>
		</div>
	);
};

export default AnalyticUrlsPage;
