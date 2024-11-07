import React, { type FC, useState } from "react";
import { BiMenu, BiUser, BiX } from "react-icons/bi";
import { cn } from "@/lib/shadcn-utils.ts";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/auth";
import { Skeleton } from "@UI/skeleton.tsx";
import { Button } from "@UI/button.tsx";

export interface MainGeneralLayoutProps {
	children: React.ReactNode | React.ReactNode[];
}

const Header: FC = () => {
	const [isExpanded, setIsExpanded] = useState(false);
	const { isLoading, isAuthenticated } = useAuthStore();

	const toggleExpanded = () => {
		setIsExpanded(!isExpanded);
	};

	return (
		<header className={"relative flex w-full flex-row items-center justify-between px-3"}>
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

			<AnimatePresence>
				{isLoading && <Skeleton />}
				{isAuthenticated && <BiUser />}
				{!isAuthenticated && <Button>Login</Button>}
			</AnimatePresence>
		</header>
	);
};

const MainGeneralLayout: FC<MainGeneralLayoutProps> = ({ children }) => {
	return (
		<div className={"flex h-full w-full flex-col items-center"}>
			<Header />
			{children}

			<footer></footer>
		</div>
	);
};

export default MainGeneralLayout;
