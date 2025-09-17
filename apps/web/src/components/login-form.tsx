import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Props = React.ComponentProps<"form"> & { redirectTo?: string };

export function LoginForm({ className, redirectTo = "/", ...props }: Props) {
  const [mode, setMode] = React.useState<"login" | "signup">("login");
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const body: any = { email, password };
      if (mode === "signup") body.name = name;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Erreur");
        return;
      }
      window.location.href = redirectTo;
    } catch (err: any) {
      setError(err?.message ?? "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  function handleGithub() {
    window.location.href =
      "/.auth/login/github?post_login_redirect_uri=" +
      encodeURIComponent(redirectTo);
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={onSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">
          {mode === "login"
            ? "Connectez-vous à votre compte"
            : "Créez votre compte"}
        </h1>
        <p className="text-muted-foreground text-sm text-balance">
          {mode === "login"
            ? "Entrez votre email pour vous connecter"
            : "Renseignez votre email, pseudo et un mot de passe"}
        </p>
      </div>

      <div className="grid gap-6">
        {mode === "signup" && (
          <div className="grid gap-3">
            <Label htmlFor="name">Pseudo</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="BigZoo92"
              autoComplete="nickname"
              required
            />
          </div>
        )}

        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            required
            minLength={6}
          />
        </div>

        {error && (
          <div className="text-sm text-amber-600 border border-amber-300 rounded-md p-2 bg-amber-50">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? "Veuillez patienter..."
            : mode === "login"
            ? "Se connecter"
            : "Créer mon compte"}
        </Button>

        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Ou continuer avec
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGithub}
        >
          {/* icône github… */}
          Se connecter avec GitHub
        </Button>
      </div>

      <div className="text-center text-sm">
        {mode === "login" ? (
          <>
            Vous n'avez pas encore de compte ?{" "}
            <button
              type="button"
              className="underline underline-offset-4"
              onClick={() => setMode("signup")}
            >
              Inscription
            </button>
          </>
        ) : (
          <>
            Vous avez déjà un compte ?{" "}
            <button
              type="button"
              className="underline underline-offset-4"
              onClick={() => setMode("login")}
            >
              Se connecter
            </button>
          </>
        )}
      </div>
    </form>
  );
}
