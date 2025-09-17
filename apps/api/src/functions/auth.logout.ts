import { app } from "@azure/functions";
import { clearCookie } from "../lib/session.js";

app.http("authLogout", {
  route: "auth/logout",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async () =>
    clearCookie({ status: 200, jsonBody: { ok: true } }, "session"),
});
