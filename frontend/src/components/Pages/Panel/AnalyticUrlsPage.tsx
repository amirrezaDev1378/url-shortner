import * as React from "react";
import {type FC} from "react";
import {
    AnalyticUrlsTotalClick,
    AnalyticUrlsByLocation,
    AnalyticsUrlsByDevice, TopUrlsAnalytics
} from "./components/AnalyticUrlsComponents.tsx";


const AnalyticUrlsPage: FC = () => {

    return (
        <div className={"flex flex-col w-full p-6"}>
            <h3 className={"text-left text-3xl mt-5 w-full"}>
                Analytics.
            </h3>
            <hr className={"my-4 w-full"}/>
            <div className={"flex flex-row flex-wrap  justify-between "}>
                <div className="md:w-[46%] p-8 shadow-sm-center shadow-main rounded-2xl m-[12px]]">
                    <AnalyticUrlsTotalClick/>
                </div>
                <div className="md:w-[46%] p-8 shadow-sm-center shadow-main rounded-2xl m-[12px]]">
                    <AnalyticUrlsByLocation/>
                </div>
                <div className="md:w-[46%] p-8 shadow-sm-center shadow-main rounded-2xl m-[12px]] mt-12">
                    <AnalyticsUrlsByDevice />
                </div>
                <div className="md:w-[46%] p-8 shadow-sm-center shadow-main rounded-2xl m-[12px]] mt-12">
                    <TopUrlsAnalytics />
                </div>
            </div>
        </div>);
};


export default AnalyticUrlsPage;
