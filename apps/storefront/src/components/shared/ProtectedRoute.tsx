"use client";

import { ProtectedRouteLoader } from "./protected-route/ProtectedRouteLoader";
import { useProtectedRoute } from "./protected-route/hooks/useProtectedRoute";
import { ProtectedRouteProps } from "./protected-route/types";

export default function ProtectedRoute({
  children,
  redirectTo = "/giris",
}: ProtectedRouteProps) {
  const { authStatus } = useProtectedRoute(redirectTo);

  if (authStatus === "checking") {
    return <ProtectedRouteLoader />;
  }

  if (authStatus === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
