import * as React from "react";
import { getJSON, postJSON } from "@/lib/api";
import type { VotesSummary, Vote } from "@/lib/types";

export function useVotes() {
  const [data, setData] = React.useState<VotesSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const d = await getJSON<VotesSummary>("/api/votes");
      setData(d);
    } catch (e: any) {
      setError(e?.message ?? "Erreur votes");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const vote = React.useCallback(
    async (choice: "yes" | "no") => {
      // optimiste
      setData((prev) => {
        if (!prev) return prev;
        const yes = prev.yes + (choice === "yes" ? 1 : 0);
        const no = prev.no + (choice === "no" ? 1 : 0);
        return {
          ...prev,
          total: prev.total + 1,
          yes,
          no,
          ratioYes: yes / (yes + no),
        };
      });
      try {
        const v = await postJSON<Vote>("/api/vote", { choice });
        // on resynchronise réellement
        await refresh();
        return v;
      } catch (e) {
        // rollback si besoin
        await refresh();
        throw e;
      }
    },
    [refresh]
  );

  return { data, loading, error, refresh, vote };
}
