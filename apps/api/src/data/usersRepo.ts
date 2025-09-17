import { getCosmos } from "../lib/cosmos.js";

export type User = {
  id: string; // = authId (on choisit id == authId pour l’idempotence)
  authId: string; // PK + unique key
  email?: string;
  pseudo: string;
  createdAt: string; // ISO
};

export async function getUserByAuthId(authId: string): Promise<User | null> {
  const cos = getCosmos();
  if (!cos) return null;

  // id == authId et PK == authId → lookup direct
  const { resource } = await cos.users.item(authId, authId).read<User>();
  return resource ?? null;
}

export async function createOrUpdateUser(input: {
  authId: string;
  pseudo: string;
  email?: string;
}): Promise<User> {
  const cos = getCosmos();
  if (!cos) {
    // Fallback mémoire possible, mais ici on assume Cosmos présent en prod
    throw new Error("Cosmos not configured");
  }

  const existing = await getUserByAuthId(input.authId);
  if (existing) {
    // On peut autoriser la mise à jour du pseudo si fourni
    if (input.pseudo && input.pseudo !== existing.pseudo) {
      const updated = { ...existing, pseudo: input.pseudo };
      const { resource } = await cos.users
        .item(existing.id, existing.authId)
        .replace<User>(updated);
      return resource!;
    }
    return existing;
  }

  const doc: User = {
    id: input.authId, // important: id == authId (idempotent + unique key ok)
    authId: input.authId,
    email: input.email,
    pseudo: input.pseudo,
    createdAt: new Date().toISOString(),
  };

  // disableAutomaticIdGeneration: true (on fournit nous-même id)
  const { resource } = await cos.users.items.create<User>(doc, {
    disableAutomaticIdGeneration: true,
  });
  return resource!;
}
