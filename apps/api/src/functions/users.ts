import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { listUsers, createUser } from "../data/usersRepo.js";

export async function getUsers(
  req: HttpRequest,
  ctx: InvocationContext
): Promise<HttpResponseInit> {
  const users = await listUsers();
  return { status: 200, jsonBody: users };
}

export async function postUser(
  req: HttpRequest,
  ctx: InvocationContext
): Promise<HttpResponseInit> {
  const body = (await req.json().catch(() => null)) as { name?: string } | null;
  if (!body?.name)
    return { status: 400, jsonBody: { error: "name is required" } };
  const user = await createUser(body.name);
  return { status: 201, jsonBody: user };
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
  handler: postUser,
});
