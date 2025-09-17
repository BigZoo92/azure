import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import bcrypt from "bcryptjs";
import { createJwt, cookieResponse } from "../lib/session.js";
import { createLocalUser, findUserByEmail } from "../data/usersRepo.js";
import { trackError, trackLogin } from "../lib/telemetry.js";

app.http("authSignup", {
  route: "auth/signup",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (
    req: HttpRequest,
    ctx: InvocationContext
  ): Promise<HttpResponseInit> => {
    try {
      const body = (await req.json().catch(() => null)) as {
        email?: string;
        password?: string;
        name?: string;
      } | null;
      const email = body?.email?.trim().toLowerCase();
      const name = body?.name?.trim();
      const password = body?.password ?? "";

      if (!email || !name || password.length < 6) {
        return {
          status: 400,
          jsonBody: {
            error: "email/name invalides ou mot de passe trop court (>=6)",
          },
        };
      }
      if (await findUserByEmail(email)) {
        return { status: 409, jsonBody: { error: "email déjà utilisé" } };
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await createLocalUser({ name, email, passwordHash });
      trackLogin(user.id, "local");

      const jwt = await createJwt({
        uid: user.id,
        name: user.name,
        provider: "local",
      });
      return cookieResponse(
        {
          status: 201,
          jsonBody: { id: user.id, name: user.name, email: user.email },
        },
        "session",
        jwt,
        7 * 24 * 3600
      );
    } catch (e) {
      trackError(e, { where: "authSignup" }); // idem pour authLogin

      ctx.log("authSignup ERROR", e);
      return { status: 500, jsonBody: { error: "internal_error" } };
    }
  },
});
