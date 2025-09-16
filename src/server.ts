const port = Number(Bun.env.PORT ?? 3000);

const server = Bun.serve({
  port,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/") {
      return new Response("Hello from Bun + TS 🍞\n", {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    if (url.pathname === "/json") {
      return Response.json({ ok: true, bun: Bun.version });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`✓ Server running at http://localhost:${server.port}`);
