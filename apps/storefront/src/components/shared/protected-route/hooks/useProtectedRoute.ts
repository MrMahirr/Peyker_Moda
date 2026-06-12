import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { storeApi } from "@/lib/api";

import { AuthStatus } from "../types";

export const useProtectedRoute = (redirectTo: string) => {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    const authCheckTimeout = window.setTimeout(() => {
      const isLoggedIn = storeApi.isLoggedIn();

      if (!isLoggedIn) {
        const currentPath = window.location.pathname + window.location.search;
        sessionStorage.setItem("redirectAfterLogin", currentPath);
        router.push(redirectTo);
        setAuthStatus("unauthenticated");
        return;
      }

      setAuthStatus("authenticated");
    }, 0);

    return () => window.clearTimeout(authCheckTimeout);
  }, [redirectTo, router]);

  return { authStatus };
};
