import { app } from "@azure/functions";
import { getUserIdFromRequest } from "../lib/authz.js";
import { upsertVote } from "../data/votesRepo.js";
import { trackError, trackVote } from "../lib/telemetry.js";

app.http("vote", {
  route: "vote",
  methods: ["POST"],
  authLevel: "anonymous", // on gère l'auth nous-mêmes
  handler: async (req, ctx) => {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return { status: 401, jsonBody: { error: "not_authenticated" } };
    }

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
    trackVote(userId, choice as "yes" | "no");
    try {
      const vote = await upsertVote(userId, choice);
      ctx.log(`vote OK user=${userId} choice=${choice}`);
      return { status: 200, jsonBody: vote };
    } catch (e: any) {
      trackError(e, { where: "vote" });
      ctx.error?.(`vote ERROR: ${e?.message || e}`);
      return { status: 500, jsonBody: { error: "internal_error" } };
    }
  },
});
