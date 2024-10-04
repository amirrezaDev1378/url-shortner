"use client";

import React, { type FC, type ReactNode, useState } from "react";
import { RxHamburgerMenu as HamburgerMenuIcon } from "react-icons/rx";
import { cn } from "@/lib/shadcn-utils.ts";
import AuthProvider from "@/auth/Provider.tsx";
import AuthGuard from "@/auth/Guard.tsx";
import { Skeleton } from "@UI/skeleton.tsx";

interface Props {
	children: ReactNode | ReactNode[];
	currentRoute: string;
}

interface LinkItemProps {
	href: string;
	title: string;
	currentRoute: string;
}

const LinkItem: FC<LinkItemProps> = ({ href, title, currentRoute }) => {
	const isActive = currentRoute === href;
	// TODO: - I think prefetch is not working correctly, should be investigated
	return (
		<a
			data-astro-prefetch="hover"
			className={cn("w-full rounded-lg px-3 py-2 text-neutral-300 hover:text-neutral-100", {
				"bg-muted text-neutral-200 hover:text-white": isActive,
			})}
			href={href}
		>
			{title}
		</a>
	);
};

const PanelLoadingComponent: FC = () => (
	<div className={"flex h-[100svh] flex-row items-center gap-4 p-4"}>
		<Skeleton className={"h-full md:w-44"} />
		<Skeleton className={"h-full w-full"} />
	</div>
);

const PanelLayout: FC<Props> = ({ children, currentRoute }) => {
	const [menuVisible, setMenuVisible] = useState(false);
	const toggleMenu = () => setMenuVisible(!menuVisible);

	return (
		<AuthProvider>
			<AuthGuard loadingComponent={<PanelLoadingComponent />}>
				<div className="flex h-full w-full flex-col md:flex-row">
					<div id="mobile-header" className="h-[50px] w-full justify-between md:hidden">
						<HamburgerMenuIcon onClick={toggleMenu} id="hamburger-menu" className="cursor-pointer" />
					</div>

					<div onClick={toggleMenu} className={cn({ lightbox: menuVisible }, "md:hidden")} />
					<div id="menu" className={"relative md:ml-4 md:mr-4 md:mt-6 md:w-44"}>
						<div
							className={cn(
								`absolute top-0 flex h-full flex-col items-start gap-2 transition-all md:fixed md:left-0 md:w-44 md:border-r md:border-solid md:border-neutral-700 md:px-4 md:pt-6 md:transition-none`,
								{
									"left-0": menuVisible,
									"left-[-100%]": !menuVisible,
								}
							)}
						>
							<LinkItem currentRoute={currentRoute} href={"/panel/manage"} title={"manage"} />
							<LinkItem currentRoute={currentRoute} href={"/panel/create"} title={"create"} />
							<LinkItem currentRoute={currentRoute} href={"/panel/analytics"} title={"analytics"} />
						</div>
					</div>

					{children}
				</div>
			</AuthGuard>
		</AuthProvider>
	);
};

export default PanelLayout;
