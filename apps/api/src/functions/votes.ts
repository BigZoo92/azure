import { app } from "@azure/functions";
import { listVotes } from "../data/votesRepo.js";

app.http("listVotes", {
  route: "votes",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async (_req, ctx) => {
    try {
      const votes = await listVotes();
      const total = votes.length;
      const yes = votes.filter((v) => v.choice === "yes").length;
      const no = total - yes;

      return {
        status: 200,
        jsonBody: {
          total,
          yes,
          no,
          ratioYes: total ? yes / total : 0,
          votes,
        },
      };
    } catch (e: any) {
      ctx.error?.(`listVotes ERROR: ${e?.message || e}`);
      return { status: 500, jsonBody: { error: "internal_error" } };
    }
  },
});
