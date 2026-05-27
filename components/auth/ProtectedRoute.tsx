"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import PermissionDenied from "./PermissionDenied";

type ProtectedRouteProps = {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
  requiredRole?: "admin";
};

export default function ProtectedRoute({
  children,
  redirectTo = "/login",
  fallback = null,
  requiredRole,
}: ProtectedRouteProps) {
  const { token, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace(redirectTo);
    }
  }, [isLoading, token, redirectTo, router]);

  if (isLoading || !token) {
    return <>{fallback}</>;
  }

  if (requiredRole === "admin" && role !== "admin") {
    return <PermissionDenied />;
  }

  return <>{children}</>;
}
