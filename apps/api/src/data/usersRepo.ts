import { container } from "../lib/cosmos.js";

export type User = { id: string; name: string };

export async function listUsers(): Promise<User[]> {
  const { resources } = await container.items
    .query<User>({ query: "SELECT * FROM c ORDER BY c._ts DESC" })
    .fetchAll();
  return resources;
}

export async function createUser(name: string): Promise<User> {
  const user: User = { id: crypto.randomUUID(), name };
  const { resource } = await container.items.create(user);
  if (!resource) throw new Error("Création Cosmos retournée vide");
  return resource;
}
