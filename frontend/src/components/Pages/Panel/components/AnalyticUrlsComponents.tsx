import React, {type FC, useState} from "react";
import {AnimatedTabs, type Tab} from "@UI/AnimatedTabs.tsx";

import {
    useAnalyticsByDevice,
    useAnalyticsByLocation,
    useTopLinkAnalytics,
    useTotalClicksAnalytics
} from "@/services/analytics.ts";
import {Line, LineChart, ResponsiveContainer, XAxis, YAxis} from "recharts";
import {Skeleton} from "@UI/skeleton.tsx";
import {AnimatePresence} from "framer-motion";


const analyticsByDeviceTabs: Tab[] = [
    {title: "Device", value: "device"},
    {title: "Browser", value: "browser"},
    {title: "OS", value: "OS"},
];
const analyticsByLocationTabs: Tab[] = [
    {title: "Country", value: "country"},
    {title: "City", value: "city"},
];
const AnalyticUrlsTotalClick: FC = () => {
    const [device, setDevice] = useState<"device" | "OS" | "browser">("device");
    const {data, loading, error} = useTotalClicksAnalytics();
    return (<div>
        <header className={"flex flex-row items-center gap-12 w-full justify-between mb-4"}>
            <p>
                Total Clicks
            </p>
        </header>
        <AnimatePresence>
            {loading && <Skeleton className={"w-full rounded-2xl min-h-[300px]"} />}
            {(!loading && data) && <ResponsiveContainer
                width={"100%"}
                height={"100%"}
                className={"min-h-[300px]"}
            >
                <LineChart
                    data={data}
                    width={500}
                    height={300}
                >
                    <Line type="monotone" dataKey="value" stroke="#8884d8"/>
                    <XAxis
                        tick={({x, y, stroke, payload}) => <g transform={`translate(${x},${y})`}>
                            <text strokeWidth={1} x={40} y={0} dy={20} textAnchor="end" fill="#fff">
                                {payload.value}
                            </text>
                        </g>}
                        stroke={"#fff"} dataKey={"date"}
                    />
                    <YAxis fill={"#fff"} stroke={"#fff"}/>
                </LineChart>
            </ResponsiveContainer>}
        </AnimatePresence>

    </div>);
};
const AnalyticUrlsByLocation: FC = () => {
    const [type, setType] = useState<"country" | "city">("country");

    const {data, loading, error} = useAnalyticsByLocation(type);
    return (<div className={"flex-col flex"}>
        <header className={"flex flex-row items-center gap-12 justify-between w-full mb-4"}>
            <p>
                Location
            </p>
            <AnimatedTabs containerClassName={"w-fit"} onTabChange={setType} tabs={analyticsByLocationTabs}/>
        </header>
        <div className={"flex-col flex items-center"}>
            {loading && <div className={"w-[300px] flex flex-col gap-4 items-center"}>
                <Skeleton className={"w-full h-[30px]"}/>
                <Skeleton className={"w-full h-[30px]"}/>
                <Skeleton className={"w-full h-[30px]"}/>
                <Skeleton className={"w-full h-[30px]"}/>
            </div>}
            <div className={"w-[300px] max-h-[300px] overflow-y-auto"}>
                {
                    (!loading && data?.length) && data.map(i => <div
                        className={"flex flex-row justify-between w-full rounded mb-2 items-center p-4 border  border-gray-500 "}
                        key={i}
                    >
                        <p>
                            {i.label}
                        </p>
                        <span>
                        {i.value}
                    </span>
                    </div>)
                }
            </div>
        </div>
    </div>);
};

const AnalyticsUrlsByDevice: FC = () => {
    const [device, setDevice] = useState<"device" | "OS" | "browser">("device");

    const {data, loading, error} = useAnalyticsByDevice(device);
    return <div>
        <header className={"flex flex-row items-center gap-12 w-full justify-between mb-4"}>

            <p>
                Device
            </p>
            <AnimatedTabs containerClassName={"w-fit"} onTabChange={setDevice} tabs={analyticsByDeviceTabs}/>
        </header>
        <div className={"flex-col flex items-center"}>
            {loading && <div className={"w-[300px] flex flex-col gap-4 items-center"}>
                <Skeleton className={"w-full h-[30px]"}/>
                <Skeleton className={"w-full h-[30px]"}/>
                <Skeleton className={"w-full h-[30px]"}/>
                <Skeleton className={"w-full h-[30px]"}/>
            </div>}
            <div className={"w-[300px] max-h-[300px] overflow-y-auto"}>
                {
                    (!loading && data?.length) && data.map(i => <div
                        className={"flex flex-row justify-between w-full rounded mb-2 items-center p-4 border  border-gray-500 "}
                        key={i}
                    >
                        <p>
                            {i.label}
                        </p>
                        <span>
                        {i.value}
                    </span>
                    </div>)
                }
            </div>
        </div>
    </div>;
};

const TopUrlsAnalytics: FC = () => {
    const {loading, error, data} = useTopLinkAnalytics();
    return <div>
        <header className={"flex flex-row items-center gap-12 w-full justify-between mb-4"}>

            <p>
                Top Links
            </p>
        </header>
        <div className={"flex-col flex items-center"}>
            {loading && <div className={"w-[300px] flex flex-col gap-4 items-center"}>
                <Skeleton className={"w-full h-[30px]"}/>
                <Skeleton className={"w-full h-[30px]"}/>
                <Skeleton className={"w-full h-[30px]"}/>
                <Skeleton className={"w-full h-[30px]"}/>
            </div>}
            <div className={"w-[300px] max-h-[300px] overflow-y-auto"}>
                {
                    (!loading && data?.length) && data.map(i => <div
                        className={"flex flex-row justify-between w-full rounded mb-2 items-center p-4 border  border-gray-500 "}
                        key={i}
                    >
                        <p>
                            {i.label}
                        </p>
                        <span>
                        {i.value}
                    </span>
                    </div>)
                }
            </div>
        </div>
    </div>;
};

export {
    AnalyticUrlsTotalClick, AnalyticUrlsByLocation, AnalyticsUrlsByDevice, TopUrlsAnalytics
};
