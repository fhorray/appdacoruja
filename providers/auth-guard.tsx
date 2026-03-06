"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { ROUTES, MAIN_URL } from "@/routes";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

    // Helper to check if a path is in a list of routes
    const matchesAny = (path: string, list: string[]) => {
      return list.some(route => 
        path === route || (route !== '/' && path.startsWith(route + '/'))
      );
    };

    const isPublicRoute = matchesAny(pathname, ROUTES.public);
    const isAuthRoute = matchesAny(pathname, ROUTES.auth);

    if (isPublicRoute) {
      // If authenticated and on an auth-specific page (like /auth), redirect to main
      if (session && isAuthRoute) {
        router.push(MAIN_URL);
      }
    } else {
      // If not authenticated and on a private/protected route, redirect to auth
      if (!session) {
        router.push("/auth");
      }
    }
  }, [session, isPending, pathname, router]);

  return <>{children}</>;
}
