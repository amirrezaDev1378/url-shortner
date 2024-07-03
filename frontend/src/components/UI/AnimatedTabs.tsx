"use client";

import React, {useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {cn} from "@/lib/shadcn-utils.ts";


export type Tab = {
    title: string;
    value: string;
};

export const AnimatedTabs = ({
    onTabChange,
    tabs: propTabs,
    containerClassName,
    activeTabClassName,
    tabClassName,
}: {
    onTabChange: (selected: any | null) => void
    tabs: Tab[];
    containerClassName?: string;
    activeTabClassName?: string;
    tabClassName?: string;
}) => {
    const [active, setActive] = useState<Tab>(propTabs[0]);

    const moveSelectedTabToTop = (idx: number) => {
        const newTabs = [...propTabs];
        const selectedTab = newTabs.splice(idx, 1);
        newTabs.unshift(selectedTab[0]);
        setActive(newTabs[0]);
        onTabChange(newTabs[0].value)
    };


    return (<div
            className={cn(
                "flex flex-row items-center justify-start [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full w-full",
                containerClassName
            )}
        >
            {propTabs.map((tab, idx) => (
                <button
                    key={tab.value}
                    onClick={() => {
                        moveSelectedTabToTop(idx);
                    }}
                    className={cn("relative px-4 py-2 rounded-full ", tabClassName)}
                    style={{
                        transformStyle: "preserve-3d",
                    }}
                >

                    <AnimatePresence>

                        {active.value === tab.value && (
                            <motion.div
                                style={{zIndex: -1}}
                                layoutId="clickedbutton"
                                transition={{type: "spring", bounce: 0.3, duration: 0.4}}
                                className={cn(
                                    "absolute inset-0 bg-gray-200 dark:bg-zinc-800 rounded-full ",
                                    activeTabClassName
                                )}
                            />
                        )}
                    </AnimatePresence>
                    <span className="relative block text-black dark:text-white">
                      {tab.title}
                    </span>

                </button>
            ))}
        </div>
    );
};

