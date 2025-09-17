// ESM
export type ClientPrincipal = {
  identityProvider: string; // ex: "github", "aad"
  userId: string; // id du provider
  userDetails?: string; // souvent l’email
  userRoles: string[]; // contient "authenticated" si connecté
  claims?: { typ: string; val: string }[];
};

export function getClientPrincipal(req: Request): ClientPrincipal | null {
  const encoded = req.headers.get("x-ms-client-principal");
  if (!encoded) return null;
  try {
    const json = Buffer.from(encoded, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getAuthId(p: ClientPrincipal) {
  return `${p.identityProvider}|${p.userId}`; // identifiant stable
}
