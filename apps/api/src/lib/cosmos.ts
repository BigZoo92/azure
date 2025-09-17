import { CosmosClient } from "@azure/cosmos";

export function getCosmos() {
  const endpoint = process.env.COSMOS_ENDPOINT;
  const key = process.env.COSMOS_KEY;
  const dbName = process.env.COSMOS_DB || "pollsdb";
  const usersContainer = process.env.USERS_CONTAINER || "users";
  const votesContainer = process.env.VOTES_CONTAINER || "votes";

  if (!endpoint || !key) return null;

  const client = new CosmosClient({ endpoint, key });
  const db = client.database(dbName);

  return {
    client,
    db,
    users: db.container(usersContainer),
    votes: db.container(votesContainer),
  };
}
