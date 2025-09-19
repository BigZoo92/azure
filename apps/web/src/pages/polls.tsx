import * as React from "react";
import { useSession } from "@/hooks/useSession";
import { useVotes } from "@/hooks/useVotes";
import { VoteCard } from "@/components/votes-card";
import { VotesTable } from "@/components/votes-table";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, ShieldCheck, User2 } from "lucide-react";

export default function PollPage() {
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

  const total = data?.total ?? 0;
  const yes = data?.yes ?? 0;
  const no = data?.no ?? 0;

  // ————————————————————————————————————————————————————————
  // UI
  // ————————————————————————————————————————————————————————
  return (
    // force dark sur cette page (si tu as déjà un ThemeProvider, tu peux retirer "dark")
    <div className="dark relative min-h-dvh overflow-hidden bg-[radial-gradient(80rem_40rem_at_50%_-20%,rgba(16,185,129,0.10),transparent),radial-gradient(70rem_50rem_at_120%_10%,rgba(56,189,248,0.10),transparent)]">
      {/* blobs lumineux */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 -top-20 h-96 w-96 rounded-full bg-sky-500/20 blur-[120px]" />

      <div className="mx-auto grid w-full max-w-6xl gap-6 p-4 md:p-8">
        {/* barre de titre */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500/60 to-sky-500/60 text-white shadow-lg shadow-emerald-500/20">
              🗳️
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Sondage express
              </h1>
              <p className="text-muted-foreground text-xs">
                Faites votre choix, voyez les résultats en temps réel.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {sessionLoading ? (
              <Skeleton className="h-9 w-40" />
            ) : user ? (
              <>
                <Badge
                  variant="outline"
                  className="border-emerald-600/40 bg-emerald-500/10 text-emerald-300"
                >
                  <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                  {user.provider}
                </Badge>
                <div className="hidden text-right sm:block">
                  <div className="font-medium leading-none">{user.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {user.email ?? "—"}
                  </div>
                </div>
                <Avatar className="h-9 w-9">
                  <AvatarImage alt={user.name} />
                  <AvatarFallback className="bg-muted/50 text-foreground/80">
                    <User2 className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="secondary"
                  className="gap-2"
                  onClick={logout}
                  title="Se déconnecter"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Se déconnecter</span>
                </Button>
              </>
            ) : (
              <Badge variant="secondary">Non connecté</Badge>
            )}
          </div>
        </div>

        {/* zone principale */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Col gauche : vote + stats */}
          <div className="lg:col-span-3">
            <VoteCard
              total={total}
              yes={yes}
              no={no}
              ratioYes={data?.ratioYes ?? 0}
              onVote={handleVote}
              disabled={posting || !user}
            />

            {/* petites stats sous la carte */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <StatPill label="Total" value={total.toString()} />
              <StatPill label="Oui" value={yes.toString()} tone="yes" />
              <StatPill label="Non" value={no.toString()} tone="no" />
            </div>
          </div>

          {/* Col droite : derniers votes */}
          <div className="lg:col-span-2">
            <VotesTable votes={data?.votes ?? []} />
          </div>
        </div>

        {error && (
          <Card className="border-amber-500/30 bg-amber-500/10">
            <CardContent className="p-3 text-sm text-amber-300">
              {String(error)}
            </CardContent>
          </Card>
        )}

        <Separator className="mt-2 opacity-40" />
        <p className="text-muted-foreground mx-auto text-center text-xs">
          Made with ♥ — dark UI powered by shadcn/tailwind.
        </p>
      </div>
    </div>
  );
}

/** pastille stat compacte */
function StatPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "yes" | "no";
}) {
  const toneCls =
    tone === "yes"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : tone === "no"
      ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
      : "border-sky-500/30 bg-sky-500/10 text-sky-300";

  return (
    <Card className={`border ${toneCls}`}>
      <CardContent className="flex items-center justify-between gap-2 p-3">
        <span className="text-xs opacity-80">{label}</span>
        <span className="font-semibold">{value}</span>
      </CardContent>
    </Card>
  );
}
