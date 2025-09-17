import { app, HttpRequest, InvocationContext } from "@azure/functions";
import {
  readCookie,
  readJwt,
  createJwt,
  cookieResponse,
} from "../lib/session.js";
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
    const token = readCookie(req as any, "session");
    if (token) {
      try {
        const claims = await readJwt(token);
        const user = await findUserById(claims.uid);
        if (user)
          return {
            status: 200,
            jsonBody: {
              id: user.id,
              name: user.name,
              email: user.email,
              provider: user.provider,
            },
          };
      } catch {
        /* cookie invalide => on tente SWA */
      }
    }
    const p = getSwaPrincipal(req);
    if (p?.provider === "github" && p.sub) {
      const user = await upsertGithubUser(
        p.sub,
        p.name ?? "github_user",
        p.email
      );
      trackLogin(user.id, "github");
      const jwt = await createJwt({
        uid: user.id,
        name: user.name,
        provider: "github",
      });
      return cookieResponse(
        {
          status: 200,
          jsonBody: {
            id: user.id,
            name: user.name,
            email: user.email,
            provider: user.provider,
          },
        },
        "session",
        jwt,
        7 * 24 * 3600
      );
    }
    return { status: 200, jsonBody: null };
  },
});
