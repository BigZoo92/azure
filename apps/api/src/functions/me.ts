// apps/api/src/functions/me.ts
import { app, HttpRequest, InvocationContext } from "@azure/functions";
import { readCookie, readJwt } from "../lib/session.js";
import { findUserById, upsertGithubUser } from "../data/usersRepo.js";
import { trackLogin } from "../lib/telemetry.js";

function getSwaPrincipal(
  req: HttpRequest
): { provider?: string; sub?: string; name?: string; email?: string } | null {
  const b64 = req.headers.get("x-ms-client-principal");
  if (!b64) return null;
  try {
    const json = Buffer.from(b64, "base64").toString("utf8");
    const p = JSON.parse(json);
    const claims: Array<{ typ: string; val: string }> = p?.claims ?? [];
    const claim = (t: string) => claims.find((c) => c.typ === t)?.val;
    return {
      provider: p?.identityProvider?.toLowerCase(),
      sub: p?.userId || claim("sub"),
      name: p?.userDetails || claim("name") || claim("preferred_username"),
      email: claim("email") || claim("emails"),
    };
  } catch {
    return null;
  }
}

app.http("me", {
  route: "me",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async (req: HttpRequest, _ctx: InvocationContext) => {
    // 1) Utilisateur local via cookie "session" (JWT signé par NOUS)
    const token = readCookie(req as any, "session");
    if (token) {
      try {
        const claims = await readJwt(token); // { uid, name, provider }
        const user = await findUserById(claims.uid);
        if (user) {
          return {
            status: 200,
            headers: { "Cache-Control": "no-store" },
            jsonBody: {
              id: user.id,
              name: user.name,
              email: user.email,
              provider: user.provider, // "local"
            },
          };
        }
      } catch {
        // token invalide → on essaiera SWA ci-dessous
      }
    }

    // 2) Utilisateur GitHub via SWA (ne PAS créer de cookie ici)
    const p = getSwaPrincipal(req);
    if (p?.provider === "github" && p.sub) {
      const user = await upsertGithubUser(
        p.sub,
        p.name ?? "github_user",
        p.email
      );
      trackLogin(user.id, "github");
      // IMPORTANT : pas de cookieResponse ici → évite la "reconnexion" après logout SWA
      return {
        status: 200,
        headers: { "Cache-Control": "no-store" },
        jsonBody: {
          id: user.id,
          name: user.name,
          email: user.email,
          provider: user.provider, // "github"
        },
      };
    }

    // 3) Pas connecté
    return {
      status: 200,
      headers: { "Cache-Control": "no-store" },
      jsonBody: null,
    };
  },
});
