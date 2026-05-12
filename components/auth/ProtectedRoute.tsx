"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
};

export default function ProtectedRoute({
  children,
  redirectTo = "/login",
  fallback = null,
}: ProtectedRouteProps) {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace(redirectTo);
    }
  }, [isLoading, token, redirectTo, router]);

  if (isLoading || !token) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
