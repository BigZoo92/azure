import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

type User = { id: string; name: string };

const db: User[] = [
  { id: "1", name: "Ada Lovelace" },
  { id: "2", name: "Alan Turing" },
];

// GET /api/users
export async function getUsers(
  req: HttpRequest,
  ctx: InvocationContext
): Promise<HttpResponseInit> {
  return { jsonBody: db, status: 200 };
}

// POST /api/users  { name: string }
export async function createUser(
  req: HttpRequest,
  ctx: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = (await req.json()) as { name?: string };
    if (!body?.name)
      return { status: 400, jsonBody: { error: "name is required" } };
    const user: User = { id: crypto.randomUUID(), name: body.name };
    db.push(user);
    return { status: 201, jsonBody: user };
  } catch {
    return { status: 400, jsonBody: { error: "invalid json" } };
  }
}

app.http("getUsers", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "users",
  handler: getUsers,
});

app.http("createUser", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "users",
  handler: createUser,
});
