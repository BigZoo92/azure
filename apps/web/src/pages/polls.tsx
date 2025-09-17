import * as React from "react";
import { useSession } from "@/hooks/useSession";
import { useVotes } from "@/hooks/useVotes";
import { VoteCard } from "@/components/votes-card";
import { VotesTable } from "@/components/votes-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

export default function PollPage() {
  const navigate = useNavigate();
  const {
    user,
    loading: sessionLoading,
    refresh: refreshSession,
  } = useSession();
  const { data, error, vote, refresh } = useVotes();
  const [posting, setPosting] = React.useState(false);

  async function handleVote(choice: "yes" | "no") {
    try {
      setPosting(true);
      await vote(choice);
    } catch (e: any) {
      alert(e?.message ?? "Erreur");
    } finally {
      setPosting(false);
    }
  }

  async function logout() {
    if (user?.provider === "github") {
      window.location.href = "/.auth/logout?post_logout_redirect_uri=/auth";
    } else {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/auth";
    }

    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    await refreshSession();
    await refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-8">
      {/* Header identité */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="text-sm">
            <div className="font-semibold">Identité</div>
            {sessionLoading ? (
              <div className="text-muted-foreground">Chargement…</div>
            ) : user ? (
              <div className="text-muted-foreground">
                Connecté via <b>{user.provider}</b> — {user.name}
                {user.email ? ` (${user.email})` : ""}
              </div>
            ) : (
              <div className="text-muted-foreground">Non connecté</div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={logout} variant="secondary">
              Se déconnecter
            </Button>
          </div>
        </CardContent>
      </Card>

      <VoteCard
        total={data?.total ?? 0}
        yes={data?.yes ?? 0}
        no={data?.no ?? 0}
        ratioYes={data?.ratioYes ?? 0}
        onVote={handleVote}
        disabled={posting || !user}
      />

      <Separator />

      {error && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-700">
          {String(error)}
        </div>
      )}

      <VotesTable votes={data?.votes ?? []} />
    </div>
  );
}
