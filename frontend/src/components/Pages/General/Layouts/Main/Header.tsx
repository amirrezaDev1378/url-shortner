import React, { type FC, useState } from "react";
import { useAuthStore } from "@/auth";
import { Skeleton } from "@UI/skeleton.tsx";
import { Button } from "@UI/button.tsx";
import { AnimatePresence, motion } from "framer-motion";
import { BiMenu, BiX } from "react-icons/bi";
import { cn } from "@/lib/shadcn-utils.ts";
import { UserMenu } from "@/components/Pages/General/Layouts/Main/UserMenu.tsx";

const MainLayoutHeader: FC = () => {
	const [isExpanded, setIsExpanded] = useState(false);
	const { isLoading, isAuthenticated } = useAuthStore();

	const toggleExpanded = () => {
		setIsExpanded(!isExpanded);
	};

	const MenuStates = {
		loading: <Skeleton className={"h-8 w-20"} />,
		notAuthenticated: (
			<Button variant={"default"} asChild>
				<a href={"/auth/login"}>Login</a>
			</Button>
		),
		authenticated: <UserMenu />,
	};

	const menuState: keyof typeof MenuStates = isLoading ? "loading" : isAuthenticated ? "authenticated" : "notAuthenticated";

	return (
		<header className={"relative flex w-full snap-center flex-row items-center justify-between px-3"}>
			<div className={"flex w-fit flex-row items-center gap-3"}>
				<motion.div
					initial={false}
					animate={isExpanded ? "expanded" : "collapsed"}
					variants={{
						expanded: { rotate: 180, scale: 1.1 },
						collapsed: { rotate: 0, scale: 1 },
					}}
					transition={{ duration: 0.5, type: "spring" }}
				>
					{isExpanded ? (
						<BiX className={"cursor-pointer text-3xl"} onClick={toggleExpanded} />
					) : (
						<BiMenu className={"cursor-pointer text-3xl"} onClick={toggleExpanded} />
					)}
				</motion.div>
				<a href="/">
					<img className={"h-[60px]"} src={"/logo/logo-light.png"} alt={"UOS"} />
				</a>
			</div>

			<ul
				className={cn(
					"absolute inset-0 top-full h-svh w-full flex-col items-center justify-center bg-gray-100",
					"z-50 -translate-x-full transform transition-transform",
					isExpanded && "translate-x-0"
				)}
			>
				<li className={"bg-red-500"}>
					<a href={"/about-us"}>About Us</a>
				</li>
				<li className={"bg-red-500"}>
					<a href={"terms-of-service"}>Terms Of Service</a>
				</li>
				<li className={"bg-red-500"}>
					<a href={"/contact-us"}>Contact Us</a>
				</li>
				<li className={"bg-red-500"}>
					<a href={"/auth/login"}>Log In</a>
				</li>
				<li className={"bg-red-500"}>
					<a href={"/auth/register"}>Sing Up</a>
				</li>
			</ul>

			<AnimatePresence>{MenuStates[menuState]}</AnimatePresence>
		</header>
	);
};

export default MainLayoutHeader;
