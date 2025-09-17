import { app } from "@azure/functions";
import { getClientPrincipal, getAuthId } from "../lib/auth.js";
import { createLocalUser } from "../data/usersRepo.js";

app.http("createUser", {
  route: "user",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (req: any, ctx) => {
    const principal = getClientPrincipal(req);
    if (!principal || !principal.userRoles?.includes("authenticated")) {
      return { status: 401, jsonBody: { error: "not authenticated" } };
    }

    const authId = getAuthId(principal);

    const body = (await req.json().catch(() => null)) as {
      pseudo?: string;
      email?: string;
      passwordHash?: string;
    } | null;
    const pseudo = body?.pseudo?.trim();
    const email = body?.email?.trim() || principal.userDetails;
    const passwordHash = body?.passwordHash?.trim();

    if (!pseudo) {
      return { status: 400, jsonBody: { error: "pseudo is required" } };
    }

    try {
      const user = await createLocalUser({
        name: pseudo,
        email: email ?? "",
        passwordHash: passwordHash ?? "",
      });
      ctx.log(`createUser OK authId=${authId} pseudo="${pseudo}"`);
      return { status: 201, jsonBody: user };
    } catch (e: any) {
      ctx.error?.(`createUser ERROR: ${e?.message || e}`);
      return { status: 500, jsonBody: { error: "internal_error" } };
    }
  },
});
