import React, { type FC } from "react";
import { useInitAuth } from "@/auth/index.ts";

export interface AuthGuardProps {
	children: React.ReactNode;
}

const AuthProvider: FC<AuthGuardProps> = ({ children }) => {
	useInitAuth();
	return children;
};

export default AuthProvider;
