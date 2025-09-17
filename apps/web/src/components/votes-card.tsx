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
import { Progress } from "@/components/ui/progress";

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
  const yesPct = Math.round(ratioYes * 100);
  const noPct = 100 - yesPct;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl">Question</CardTitle>
        <CardDescription>{question}</CardDescription>
      </CardHeader>

      <CardContent className="flex gap-3">
        <Button
          className="flex-1"
          size="lg"
          disabled={disabled}
          onClick={() => onVote("yes")}
        >
          Oui
        </Button>
        <Button
          className="flex-1"
          size="lg"
          variant="secondary"
          disabled={disabled}
          onClick={() => onVote("no")}
        >
          Non
        </Button>
      </CardContent>

      <Separator className="my-2" />

      <CardFooter className="flex w-full flex-col gap-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Oui: {yes} ({yesPct}%)
          </span>
          <span>Total: {total}</span>
          <span>
            Non: {no} ({noPct}%)
          </span>
        </div>
        <Progress value={yesPct} />
      </CardFooter>
    </Card>
  );
}
