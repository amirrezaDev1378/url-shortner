import { AnimatePresence, motion } from "framer-motion";

import { type MouseEvent, type ReactNode, useState } from "react";
import { cn } from "@/lib/shadcn-utils.ts";

export interface HoverCardItemType {
	id: any;
	title: string;
	description: string;
	link?: string;
	disabled?: boolean;
}

interface HoverCardProps {
	items: HoverCardItemType[];
	onCardClick: (item: HoverCardItemType, e: MouseEvent<HTMLAnchorElement>) => void;
	className?: string;
}

export const CardHoverEffect = ({ items, className, onCardClick }: HoverCardProps) => {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	return (
		<div className={cn("grid grid-cols-1 py-10 md:grid-cols-2 lg:grid-cols-3", className)}>
			{items.map((item, idx) => (
				<a
					aria-disabled={item.disabled}
					href={item?.link}
					key={item?.id}
					className={cn("group relative block h-full w-full p-2", { "cursor-not-allowed opacity-[50%]": item.disabled })}
					onMouseEnter={() => setHoveredIndex(idx)}
					onMouseLeave={() => setHoveredIndex(null)}
					onClick={(event) => onCardClick(item, event)}
				>
					<AnimatePresence>
						{hoveredIndex === idx && (
							<motion.span
								className="absolute inset-0 block h-full w-full rounded-3xl bg-neutral-200 dark:bg-slate-800/[0.8]"
								layoutId="hoverBackground"
								initial={{ opacity: 0 }}
								animate={{
									opacity: 1,
									transition: { duration: 0.15 },
								}}
								exit={{
									opacity: 0,
									transition: { duration: 0.15, delay: 0.2 },
								}}
							/>
						)}
					</AnimatePresence>
					<Card>
						<CardTitle>{item.title}</CardTitle>
						<CardDescription>{item.description}</CardDescription>
					</Card>
				</a>
			))}
		</div>
	);
};

export const Card = ({ className, children }: { className?: string; children: ReactNode }) => {
	return (
		<div
			className={cn(
				"relative z-20 h-full w-full overflow-hidden rounded-2xl border border-transparent bg-black p-4 group-hover:border-slate-700 dark:border-white/[0.2]",
				className
			)}
		>
			<div className="relative z-50">
				<div className="p-4">{children}</div>
			</div>
		</div>
	);
};
export const CardTitle = ({ className, children }: { className?: string; children: ReactNode }) => {
	return <h4 className={cn("mt-4 font-bold tracking-wide text-zinc-100", className)}>{children}</h4>;
};
export const CardDescription = ({ className, children }: { className?: string; children: ReactNode }) => {
	return <p className={cn("mt-8 text-sm leading-relaxed tracking-wide text-zinc-400", className)}>{children}</p>;
};
