import { CosmosClient } from "@azure/cosmos";

const endpoint = process.env.COSMOS_ENDPOINT!;
const key = process.env.COSMOS_KEY!;
const databaseId = process.env.COSMOS_DB!;
const usersContainerId = process.env.COSMOS_USERS_CONTAINER || "users";

if (!endpoint || !key || !databaseId || !usersContainerId) {
  console.error("[cosmos/env] Missing", {
    endpoint: !!endpoint,
    key: !!key,
    databaseId,
    usersContainerId,
  });
  throw new Error("Cosmos env vars missing");
}

const client = new CosmosClient({ endpoint, key });
const db = client.database(databaseId);
const users = db.container(usersContainerId);

// (debug utile au démarrage)
(async () => {
  const { resource } = await users.read();
  console.log("[cosmos/using]", {
    databaseId,
    usersContainerId,
    partitionKeyPaths: resource?.partitionKey?.paths,
  });
})().catch(() => {});

export type User = {
  id: string; // PK = /id
  provider: "local" | "github";
  name: string;
  email?: string;
  passwordHash?: string;
  createdAt: string;
};

export async function findUserById(id: string): Promise<User | null> {
  try {
    const { resource } = await users.item(id, id).read<User>();
    return resource ?? null;
  } catch (e: any) {
    if (e?.code === 404) return null;
    throw e;
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const q = {
    query: "SELECT * FROM c WHERE c.email = @e",
    parameters: [{ name: "@e", value: email.toLowerCase() }],
  };
  const { resources } = await users.items
    .query<User>(q, { maxItemCount: 1 })
    .fetchAll();
  return resources[0] ?? null;
}

export async function createLocalUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<User> {
  const id = `local:${input.email.toLowerCase()}`;
  const doc: User = {
    id,
    provider: "local",
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash: input.passwordHash,
    createdAt: new Date().toISOString(),
  };
  const { resource } = await users.items.create(doc);
  return resource!;
}

export async function upsertGithubUser(
  sub: string,
  name?: string,
  email?: string
): Promise<User> {
  const id = `gh:${sub}`;
  const existing = await findUserById(id);
  if (existing) return existing;
  const doc: User = {
    id,
    provider: "github",
    name: name || "github_user",
    email,
    createdAt: new Date().toISOString(),
  };
  const { resource } = await users.items.create(doc);
  return resource!;
}
