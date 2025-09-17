import type { HttpRequest } from "@azure/functions";
import { getClientPrincipal, getAuthId } from "./auth.js";
import { readCookie, readJwt } from "./session.js";

/** Retourne l'id utilisateur (ex: "local:email@x", "gh:<sub>") ou null */
export async function getUserIdFromRequest(
  req: HttpRequest
): Promise<string | null> {
  // 1) Cookie JWT posé par nos /api/auth/*
  const tok = readCookie(req as any, "session");
  if (tok) {
    try {
      const claims = await readJwt(tok); // { uid, name, provider }
      if (claims?.uid) return String(claims.uid);
    } catch {
      /* token invalide -> on tente SWA */
    }
  }

  // 2) SWA (GitHub)
  const principal = getClientPrincipal(req as any);
  if (principal && principal.userRoles?.includes("authenticated")) {
    return getAuthId(principal); // "gh:<sub>" ou similaire
  }

  return null;
}
