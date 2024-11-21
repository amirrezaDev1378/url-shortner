import React, { type FC, useState } from "react";
import { LuLogOut, LuUser } from "react-icons/lu";
import { useAuthStore } from "@/auth";
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

export interface UserMenuProps {
	contentProps?: React.ComponentPropsWithoutRef<typeof DropdownMenuContent>;
}

export const UserMenu: FC<UserMenuProps> = ({ contentProps }) => {
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
			<DropdownMenuContent className="w-56" align="end" forceMount {...contentProps}>
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
