import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Vote } from "@/lib/types";

function mask(userId: string) {
  // masque simple pour gh:xxxx / local:email
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
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Derniers votes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {votes
            .slice()
            .reverse()
            .slice(0, 12)
            .map((v) => (
              <div
                key={v.id + v.createdAt}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="text-sm">
                  <div className="font-medium">{mask(v.userId)}</div>
                  <div className="text-muted-foreground">
                    {new Date(v.createdAt).toLocaleString()}
                  </div>
                </div>
                <Badge variant={v.choice === "yes" ? "default" : "secondary"}>
                  {v.choice === "yes" ? "Oui" : "Non"}
                </Badge>
              </div>
            ))}
          {votes.length === 0 && (
            <div className="text-sm text-muted-foreground">
              Aucun vote pour l’instant.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
