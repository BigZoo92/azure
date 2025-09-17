import { getCosmos } from "../lib/cosmos.js";

export type Vote = {
  id: string; // = userId (idempotent)
  userId: string; // aussi PK & unique
  choice: "yes" | "no";
  createdAt: string; // ISO
};

export async function upsertVote(
  userId: string,
  choice: "yes" | "no"
): Promise<Vote> {
  const cos = getCosmos();
  if (!cos) throw new Error("Cosmos not configured");

  const doc: Vote = {
    id: userId,
    userId,
    choice,
    createdAt: new Date().toISOString(),
  };

  const { resource } = await cos.votes.items.upsert<Vote>(doc, {
    disableAutomaticIdGeneration: true,
  });
  return resource!;
}

export async function listVotes(): Promise<Vote[]> {
  const cos = getCosmos();
  if (!cos) return [];
  const { resources } = await cos.votes.items.readAll().fetchAll();
  return resources as Vote[];
}
