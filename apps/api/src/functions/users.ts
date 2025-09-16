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
  handler: async (req, ctx) => {
    const t0 = Date.now();
    const users = await listUsers();
    ctx.log("users.list", { count: users.length });
    return {
      status: 200,
      jsonBody: users,
      headers: { "x-duration-ms": String(Date.now() - t0) },
    };
  },
});

app.http("createUser", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "users",
  handler: async (req, ctx) => {
    const body = (await req.json().catch(() => null)) as {
      name?: string;
    } | null;
    if (!body?.name) {
      ctx.log;
      ctx.log("users.create.missing_name");
      return { status: 400, jsonBody: { error: "name is required" } };
    }
    const user = await createUser(body.name);
    ctx.log("users.create.ok", { id: user.id });
    return { status: 201, jsonBody: user };
  },
});
