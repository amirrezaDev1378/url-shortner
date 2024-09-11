import React, { type FC, useState } from "react";
import { AnimatedTabs, type Tab } from "@UI/AnimatedTabs.tsx";

import { useAnalyticsByDevice, useAnalyticsByLocation, useTopLinkAnalytics, useTotalClicksAnalytics } from "@/services/analytics.ts";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Skeleton } from "@UI/skeleton.tsx";
import { AnimatePresence } from "framer-motion";

const analyticsByDeviceTabs: Tab[] = [
	{ title: "Device", value: "device" },
	{ title: "Browser", value: "browser" },
	{ title: "OS", value: "OS" },
];
const analyticsByLocationTabs: Tab[] = [
	{ title: "Country", value: "country" },
	{ title: "City", value: "city" },
];
const AnalyticUrlsTotalClick: FC = () => {
	const [device, setDevice] = useState<"device" | "OS" | "browser">("device");
	const { data, loading, error } = useTotalClicksAnalytics();
	return (
		<div>
			<header className={"mb-4 flex w-full flex-row items-center justify-between gap-12"}>
				<p>Total Clicks</p>
			</header>
			<AnimatePresence>
				{loading && <Skeleton className={"min-h-[300px] w-full rounded-2xl"} />}
				{!loading && data && (
					<ResponsiveContainer width={"100%"} height={"100%"} className={"min-h-[300px]"}>
						<LineChart data={data} width={500} height={300}>
							<Line type="monotone" dataKey="value" stroke="#8884d8" />
							<XAxis
								tick={({ x, y, stroke, payload }) => (
									<g transform={`translate(${x},${y})`}>
										<text strokeWidth={1} x={40} y={0} dy={20} textAnchor="end" fill="#fff">
											{payload.value}
										</text>
									</g>
								)}
								stroke={"#fff"}
								dataKey={"date"}
							/>
							<YAxis fill={"#fff"} stroke={"#fff"} />
						</LineChart>
					</ResponsiveContainer>
				)}
			</AnimatePresence>
		</div>
	);
};
const AnalyticUrlsByLocation: FC = () => {
	const [type, setType] = useState<"country" | "city">("country");

	const { data, loading, error } = useAnalyticsByLocation(type);
	return (
		<div className={"flex flex-col"}>
			<header className={"mb-4 flex w-full flex-row items-center justify-between gap-12"}>
				<p>Location</p>
				<AnimatedTabs
					containerClassName={"w-fit"}
					setActiveTab={(tab) => setType(tab.value)}
					activeTab={analyticsByLocationTabs.find((i) => i.value === type) as Tab}
					tabs={analyticsByLocationTabs}
				/>
			</header>
			<div className={"flex flex-col items-center"}>
				{loading && (
					<div className={"flex w-[300px] flex-col items-center gap-4"}>
						<Skeleton className={"h-[30px] w-full"} />
						<Skeleton className={"h-[30px] w-full"} />
						<Skeleton className={"h-[30px] w-full"} />
						<Skeleton className={"h-[30px] w-full"} />
					</div>
				)}
				<div className={"max-h-[300px] w-[300px] overflow-y-auto"}>
					{!loading &&
						data?.length &&
						data.map((i: any) => (
							<div className={"mb-2 flex w-full flex-row items-center justify-between rounded border border-gray-500 p-4"} key={i}>
								<p>{i.label}</p>
								<span>{i.value}</span>
							</div>
						))}
				</div>
			</div>
		</div>
	);
};

const AnalyticsUrlsByDevice: FC = () => {
	const [device, setDevice] = useState<"device" | "OS" | "browser">("device");

	const { data, loading, error } = useAnalyticsByDevice(device);
	return (
		<div>
			<header className={"mb-4 flex w-full flex-row items-center justify-between gap-12"}>
				<p>Device</p>
				<AnimatedTabs
					containerClassName={"w-fit"}
					activeTab={analyticsByDeviceTabs.find((i) => i.value === device) as Tab}
					setActiveTab={(tab) => setDevice(tab.value)}
					tabs={analyticsByDeviceTabs}
				/>
			</header>
			<div className={"flex flex-col items-center"}>
				{loading && (
					<div className={"flex w-[300px] flex-col items-center gap-4"}>
						<Skeleton className={"h-[30px] w-full"} />
						<Skeleton className={"h-[30px] w-full"} />
						<Skeleton className={"h-[30px] w-full"} />
						<Skeleton className={"h-[30px] w-full"} />
					</div>
				)}
				<div className={"max-h-[300px] w-[300px] overflow-y-auto"}>
					{!loading &&
						data?.length &&
						data.map((i: any) => (
							<div className={"mb-2 flex w-full flex-row items-center justify-between rounded border border-gray-500 p-4"} key={i}>
								<p>{i.label}</p>
								<span>{i.value}</span>
							</div>
						))}
				</div>
			</div>
		</div>
	);
};

const TopUrlsAnalytics: FC = () => {
	const { loading, error, data } = useTopLinkAnalytics();
	return (
		<div>
			<header className={"mb-4 flex w-full flex-row items-center justify-between gap-12"}>
				<p>Top Links</p>
			</header>
			<div className={"flex flex-col items-center"}>
				{loading && (
					<div className={"flex w-[300px] flex-col items-center gap-4"}>
						<Skeleton className={"h-[30px] w-full"} />
						<Skeleton className={"h-[30px] w-full"} />
						<Skeleton className={"h-[30px] w-full"} />
						<Skeleton className={"h-[30px] w-full"} />
					</div>
				)}
				<div className={"max-h-[300px] w-[300px] overflow-y-auto"}>
					{!loading &&
						data?.length &&
						data.map((i: any) => (
							<div className={"mb-2 flex w-full flex-row items-center justify-between rounded border border-gray-500 p-4"} key={i}>
								<p>{i.label}</p>
								<span>{i.value}</span>
							</div>
						))}
				</div>
			</div>
		</div>
	);
};

export { AnalyticUrlsTotalClick, AnalyticUrlsByLocation, AnalyticsUrlsByDevice, TopUrlsAnalytics };
