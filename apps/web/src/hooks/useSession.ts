import * as React from "react";
import { getJSON } from "@/lib/api";
import type { SessionUser } from "@/lib/types";

export function useSession() {
  const [user, setUser] = React.useState<SessionUser>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const me = await getJSON<SessionUser>("/api/me");
      setUser(me);
    } catch (e: any) {
      setError(e?.message ?? "Erreur session");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return { user, loading, error, refresh };
}
