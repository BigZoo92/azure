import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Vote } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

function mask(userId: string) {
  if (userId.startsWith("gh:")) return `gh:${userId.slice(3, 9)}…`;
  if (userId.startsWith("github|")) return `gh|${userId.slice(7, 13)}…`;
  if (userId.startsWith("local:")) {
    const e = userId.slice(6);
    const at = e.indexOf("@");
    return at > 2
      ? `local:${e.slice(0, 2)}***@${e.slice(at + 1)}`
      : `local:${e}`;
  }
  return userId.length > 8 ? `${userId.slice(0, 6)}…` : userId;
}

export function VotesTable({ votes }: { votes: Vote[] }) {
  const list = votes.slice().reverse().slice(0, 12);

  return (
    <Card className="border border-white/5 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Derniers votes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {list.map((v, i) => {
          const yes = v.choice === "yes";
          return (
            <div
              key={v.id + v.createdAt + i}
              className="group relative flex items-center justify-between rounded-xl border border-white/5 bg-muted/20 px-3 py-2"
            >
              {/* bande de couleur à gauche */}
              <div
                className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${
                  yes ? "bg-emerald-500/80" : "bg-rose-500/80"
                }`}
              />
              <div className="pl-3">
                <div className="font-medium leading-none">{mask(v.userId)}</div>
                <div className="text-muted-foreground text-xs">
                  {new Date(v.createdAt).toLocaleString()}
                </div>
              </div>
              <Badge
                variant="outline"
                className={
                  yes
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : "border-rose-500/40 bg-rose-500/10 text-rose-300"
                }
              >
                {yes ? "Oui" : "Non"}
              </Badge>
            </div>
          );
        })}

        {list.length === 0 && (
          <div className="rounded-xl border border-white/5 bg-muted/10 p-4 text-center text-sm text-muted-foreground">
            Aucun vote pour l’instant.
          </div>
        )}

        <Separator className="mt-2 opacity-40" />
        <div className="text-muted-foreground pt-1 text-center text-xs">
          Historique limité aux 12 derniers votes.
        </div>
      </CardContent>
    </Card>
  );
}
