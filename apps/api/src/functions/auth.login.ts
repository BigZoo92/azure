import { app, HttpRequest, HttpResponseInit } from "@azure/functions";
import bcrypt from "bcryptjs";
import { createJwt, cookieResponse } from "../lib/session.js";
import { findUserByEmail } from "../data/usersRepo.js";

app.http("authLogin", {
  route: "auth/login",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    const body = (await req.json().catch(() => null)) as {
      email?: string;
      password?: string;
    } | null;
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password ?? "";
    if (!email || !password)
      return { status: 400, jsonBody: { error: "champs requis" } };

    const user = await findUserByEmail(email);
    if (!user?.passwordHash)
      return { status: 401, jsonBody: { error: "identifiants invalides" } };

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
      return { status: 401, jsonBody: { error: "identifiants invalides" } };

    const jwt = await createJwt({
      uid: user.id,
      name: user.name,
      provider: "local",
    });
    return cookieResponse(
      {
        status: 200,
        jsonBody: { id: user.id, name: user.name, email: user.email },
      },
      "session",
      jwt,
      7 * 24 * 3600
    );
  },
});
