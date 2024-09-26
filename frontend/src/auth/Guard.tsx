import React, { type FC } from "react";
import { useAuthStore } from "@/auth/index.ts";
import { redirect } from "@/lib/utils.ts";

export interface GuardProps {
	children: React.ReactNode;
	loadingComponent?: React.ReactNode;
	redirectUrl?: string;
}

const AuthGuard: FC<GuardProps> = ({ redirectUrl = "/auth/login", children, loadingComponent }) => {
	const { user, authError, isAuthenticated, isLoading } = useAuthStore();

	if (isLoading) return loadingComponent || <p>loading babe...</p>;
	if (authError) {
		redirect(redirectUrl);
		return <p>Err validating you please login again</p>;
	}
	if (!isAuthenticated || !user?.id) return <p>some thing does not add up</p>;
	return children;
};

export default AuthGuard;
