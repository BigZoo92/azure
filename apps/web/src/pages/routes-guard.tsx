import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";

function FullPageSpinner() {
  return (
    <div className="grid h-dvh place-items-center">
      <div className="animate-pulse text-sm text-muted-foreground">
        Chargement…
      </div>
    </div>
  );
}

/** Protège une page : si pas connecté -> /auth?redirect=... */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) return <FullPageSpinner />;
  if (!user) {
    const to = `/auth?redirect=${encodeURIComponent(
      loc.pathname + loc.search
    )}`;
    return <Navigate to={to} replace />;
  }
  return <>{children}</>;
}

/** Si déjà connecté, redirige (ex: empêcher d’aller sur /auth) */
export function RedirectIfAuth({
  children,
  to = "/",
}: {
  children: React.ReactNode;
  to?: string;
}) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (user) return <Navigate to={to} replace />;
  return <>{children}</>;
}
