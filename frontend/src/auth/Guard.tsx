import React, { type FC } from "react";
import { useAuthStore } from "@/auth/index.ts";
import { redirect } from "@/lib/utils.ts";
import { Skeleton } from "@UI/skeleton.tsx";

export interface GuardProps {
	children: React.ReactNode;
	loadingComponent?: React.ReactNode;
	errorComponent?: React.ReactNode;
	redirectUrl?: string;
}

const DefaultLoadingComponent: React.ReactNode = (() => <Skeleton className={"h-100svh w-full"} />)();
const DefaultErrorComponent: React.ReactNode = (() => <div>You are not authenticated, please login again.</div>)();

const AuthGuard: FC<GuardProps> = ({
	redirectUrl = "/auth/login",
	children,
	loadingComponent = DefaultLoadingComponent,
	errorComponent = DefaultErrorComponent,
}) => {
	const { user, authError, isAuthenticated, isLoading } = useAuthStore();

	if (isLoading) return loadingComponent;
	if (authError) {
		redirect(redirectUrl);
		return errorComponent;
	}
	if (!isAuthenticated || !user?.id) return errorComponent;
	return children;
};

export default AuthGuard;
