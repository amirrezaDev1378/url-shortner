import React, { type FC, useState } from "react";
import { BiMenu, BiX } from "react-icons/bi";
import { LuLogOut, LuUser } from "react-icons/lu";
import { cn } from "@/lib/shadcn-utils.ts";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/auth";
import { Skeleton } from "@UI/skeleton.tsx";
import { Button } from "@UI/button.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@UI/avatar.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@UI/dropdown-menu.tsx";
import { $AuthStoreActions } from "@/stores/auth.ts";
import { useToast } from "@/hooks/useToast.ts";

export interface MainGeneralLayoutProps {
	children: React.ReactNode | React.ReactNode[];
}

const UserMenu = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { toast } = useToast();
	const { isLoading, isAuthenticated, user } = useAuthStore();
	if (isLoading || !isAuthenticated || !user) return <></>;
	const logoutHandler = async () => {
		const isSuccess = await $AuthStoreActions.logout();
		if (!isSuccess) {
			toast({
				variant: "destructive",
				title: "Logout Failed!",
				description: "Something went wrong while logging out, Please try again.",
			});
		}
	};
	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="relative h-8 w-8 rounded-full">
					<Avatar className="h-8 w-8">
						{user.avatar && <AvatarImage src={user.avatar} />}
						<AvatarFallback className={"uppercase"}>{user.name ? user.name.slice(0, 2) : user.email.slice(0, 2)}</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="end" forceMount>
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						{user.name && <p className="text-sm font-medium leading-none">{user.name}</p>}
						<p className="text-xs leading-none text-muted-foreground">{user.email}</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild>
						<a href="/auth/profile">
							<LuUser className="mr-2 h-4 w-4" />
							<span>Profile</span>
						</a>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<a href="/panel">
							<LuUser className="mr-2 h-4 w-4" />
							<span>App</span>
						</a>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={logoutHandler}>
					<LuLogOut className="mr-2 h-4 w-4" />
					<span>Log out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

const Header: FC = () => {
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

			<AnimatePresence>{MenuStates[menuState]}</AnimatePresence>
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
