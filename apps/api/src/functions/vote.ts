import { app } from "@azure/functions";
import { getClientPrincipal, getAuthId } from "../lib/auth.js";
import { upsertVote } from "../data/votesRepo.js";

app.http("vote", {
  route: "vote",
  methods: ["POST"],
  authLevel: "anonymous", // protégé par SWA (allowedRoles)
  handler: async (req: any, ctx) => {
    const principal = getClientPrincipal(req);
    if (!principal || !principal.userRoles?.includes("authenticated")) {
      return { status: 401, jsonBody: { error: "not authenticated" } };
    }

    const userId = getAuthId(principal);
    const body = (await req.json().catch(() => null)) as {
      choice?: string;
    } | null;
    const choice = body?.choice;

    if (choice !== "yes" && choice !== "no") {
      return {
        status: 400,
        jsonBody: { error: "choice must be 'yes' or 'no'" },
      };
    }

    try {
      const vote = await upsertVote(userId, choice as "yes" | "no");
      ctx.log(`vote OK user=${userId} choice=${choice}`);
      // 200 (remplacement) ou 201 (création) — on reste simple: 200
      return { status: 200, jsonBody: vote };
    } catch (e: any) {
      ctx.error?.(`vote ERROR: ${e?.message || e}`);
      return { status: 500, jsonBody: { error: "internal_error" } };
    }
  },
});
