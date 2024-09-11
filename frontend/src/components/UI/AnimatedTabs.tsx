"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/shadcn-utils.ts";

export type Tab = {
	title: string;
	value: any;
};

export const AnimatedTabs = ({
	tabs: propTabs,
	containerClassName,
	activeTabClassName,
	tabClassName,
	activeTab,
	setActiveTab,
}: {
	tabs: Tab[];
	activeTab: Tab;
	setActiveTab: (tab: Tab) => void;
	containerClassName?: string;
	activeTabClassName?: string;
	tabClassName?: string;
}) => {
	const moveSelectedTabToTop = (idx: number) => {
		const newTabs = [...propTabs];
		const selectedTab = newTabs.splice(idx, 1);
		newTabs.unshift(selectedTab[0]);
		setActiveTab(newTabs[0]);
	};

	return (
		<div
			className={cn(
				"no-visible-scrollbar relative flex w-full max-w-full flex-row items-center justify-start overflow-auto [perspective:1000px] sm:overflow-visible",
				containerClassName
			)}
		>
			{propTabs.map((tab, idx) => (
				<button
					key={tab.value}
					onClick={() => {
						moveSelectedTabToTop(idx);
					}}
					className={cn("relative rounded-full px-4 py-2", tabClassName)}
					style={{
						transformStyle: "preserve-3d",
					}}
				>
					<AnimatePresence>
						{activeTab?.value === tab.value && (
							<motion.div
								style={{ zIndex: -1 }}
								layoutId="clickedbutton"
								transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
								className={cn("absolute inset-0 rounded-full bg-gray-200 dark:bg-zinc-800", activeTabClassName)}
							/>
						)}
					</AnimatePresence>
					<span className="relative block text-black dark:text-white">{tab.title}</span>
				</button>
			))}
		</div>
	);
};
