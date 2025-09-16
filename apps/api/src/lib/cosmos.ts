import { CosmosClient } from "@azure/cosmos";

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DB ?? "usersdb";
const containerId = process.env.COSMOS_CONTAINER ?? "users";

if (!endpoint || !key) {
  throw new Error(
    "COSMOS_ENDPOINT/COSMOS_KEY manquants (vérifie local.settings.json)"
  );
}

export const client = new CosmosClient({ endpoint, key });
export const database = client.database(databaseId);
export const container = database.container(containerId);
