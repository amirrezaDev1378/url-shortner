"use client";
import React from "react";
import { motion, type MotionStyle } from "framer-motion";
import { cn } from "@/lib/shadcn-utils.ts";

export const BoxesCore = ({ className, boxBorderColors = "--slate-700", ...rest }: { className?: string; boxBorderColors?: string }) => {
	const rows = new Array(150).fill(1);
	const cols = new Array(100).fill(1);

	const borderColor = boxBorderColors.startsWith("--") ? `var(${boxBorderColors})` : boxBorderColors;

	let colors = [
		"--sky-300",
		"--pink-300",
		"--green-300",
		"--yellow-300",
		"--red-300",
		"--purple-300",
		"--blue-300",
		"--indigo-300",
		"--violet-300",
	];
	const getRandomColor = () => {
		return colors[Math.floor(Math.random() * colors.length)];
	};

	return (
		<div
			style={{
				transform: `translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)`,
			}}
			className={cn("absolute -top-1/4 left-1/4 z-0 flex h-full w-full -translate-x-1/2 -translate-y-1/2 p-4", className)}
			{...rest}
		>
			{rows.map((_, i) => (
				<motion.div key={`row` + i} className="relative h-8 w-16 border-l" style={{ borderColor }}>
					{cols.map((_, j) => (
						<motion.div
							suppressHydrationWarning
							whileHover={{
								backgroundColor: `var(--random-color)`,
								transition: { duration: 0 },
							}}
							whileTap={{
								backgroundColor: `var(--random-color)`,
								transition: { duration: 0 },
							}}
							animate={{
								backgroundColor: "#000",
								transition: { duration: 0.4 },
							}}
							key={`col` + j}
							className="relative h-8 w-16 border-r border-t"
							style={{ borderColor, "--random-color": `var(${getRandomColor()})` } as MotionStyle}
						>
							{j % 2 === 0 && i % 2 === 0 ? (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth="1.5"
									stroke="currentColor"
									className="pointer-events-none absolute -left-[22px] -top-[14px] h-6 w-10 stroke-[1px]"
									style={{ color: borderColor }}
								>
									<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
								</svg>
							) : null}
						</motion.div>
					))}
				</motion.div>
			))}
		</div>
	);
};

export const AnimatedBackgroundBoxes = React.memo(BoxesCore);
