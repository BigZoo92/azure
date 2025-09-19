import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThumbsUp, ThumbsDown } from "lucide-react";

type Props = {
  question?: string;
  total: number;
  yes: number;
  no: number;
  ratioYes: number; // 0..1
  onVote(choice: "yes" | "no"): Promise<void> | void;
  disabled?: boolean;
};

export function VoteCard({
  question = "Est-ce que François Bayrou nous manque ?",
  total,
  yes,
  no,
  ratioYes,
  onVote,
  disabled,
}: Props) {
  const yesPct = Math.round((ratioYes ?? 0) * 100);
  const noPct = Math.max(0, 100 - yesPct);

  return (
    <Card className="border border-white/5 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-2xl font-semibold text-transparent">
          Question
        </CardTitle>
        <CardDescription className="text-base opacity-90">
          {question}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex gap-3">
        <Button
          className="group flex-1 gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500"
          size="lg"
          disabled={disabled}
          onClick={() => onVote("yes")}
        >
          <ThumbsUp className="h-5 w-5 transition-transform group-hover:-rotate-6" />
          Oui
        </Button>

        <Button
          className="group flex-1 gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-600/20 hover:from-rose-500 hover:to-red-500"
          size="lg"
          disabled={disabled}
          onClick={() => onVote("no")}
          variant="default"
        >
          <ThumbsDown className="h-5 w-5 transition-transform group-hover:rotate-6" />
          Non
        </Button>
      </CardContent>

      <Separator className="my-3 opacity-50" />

      <CardFooter className="flex w-full flex-col gap-3">
        {/* barre bi-couleur */}
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="absolute left-0 top-0 h-full bg-emerald-500/80"
            style={{ width: `${yesPct}%` }}
          />
          <div
            className="absolute right-0 top-0 h-full bg-rose-500/80"
            style={{ width: `${noPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-emerald-300">
            Oui&nbsp;: <b>{yes}</b> ({yesPct}%)
          </span>
          <span className="text-muted-foreground">
            Total&nbsp;: <b>{total}</b>
          </span>
          <span className="text-rose-300">
            Non&nbsp;: <b>{no}</b> ({noPct}%)
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
