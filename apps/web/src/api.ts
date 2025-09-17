export type ClientPrincipal = {
  identityProvider: string;
  userId: string;
  userDetails?: string; // souvent l’email
  userRoles: string[];
};

export type MeResponse = { clientPrincipal?: ClientPrincipal | null };

export type VotesStats = {
  total: number;
  yes: number;
  no: number;
  ratioYes: number;
  votes: Array<{ userId: string; choice: "yes" | "no" }>;
};

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error || `HTTP ${res.status}`);
    }
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

export async function getMe(): Promise<ClientPrincipal | null> {
  const res = await fetch("/.auth/me", { credentials: "include" });
  const data: MeResponse = await res
    .json()
    .catch(() => ({ clientPrincipal: null }));
  return data?.clientPrincipal ?? null;
}

export async function createOrUpdateUser(pseudo: string) {
  const res = await fetch("/api/user", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pseudo }),
  });
  return json(res);
}

export async function sendVote(choice: "yes" | "no") {
  const res = await fetch("/api/vote", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ choice }),
  });
  return json(res);
}

export async function getVotes(): Promise<VotesStats> {
  const res = await fetch("/api/votes", { credentials: "include" });
  return json<VotesStats>(res);
}

export function login() {
  // Ajuste le provider si besoin (github/msft/google/twitter/auth0)
  window.location.href = "/.auth/login/github?post_login_redirect_uri=/";
}
export function logout() {
  window.location.href = "/.auth/logout";
}
