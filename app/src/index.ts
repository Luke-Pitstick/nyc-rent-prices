import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    // Specific routes first — if `/*` is first, Bun matches it for every path and `/api/*` never runs.
    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },

    /** Same handler as Vercel `api/rent-series.ts` — local Bun dev. */
    "/api/rent-series": {
      async GET(req: Request) {
        const url = new URL(req.url);
        const neighborhood = url.searchParams.get("neighborhood")?.trim();
        if (!neighborhood) {
          return Response.json(
            { error: "Missing neighborhood query parameter" },
            { status: 400 },
          );
        }
        if (!process.env.DATABASE_URL?.trim()) {
          return Response.json(
            { error: "DATABASE_URL is not set on the server" },
            { status: 503 },
          );
        }
        try {
          const { fetchRentSeriesForNeighborhood } = await import(
            "../../api/lib/rentSeriesServer.ts"
          );
          const payload = await fetchRentSeriesForNeighborhood(neighborhood);
          return Response.json(payload);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },

    /** @deprecated Use `/api/rent-series` — kept for older clients. */
    "/api/rent": {
      async GET(req: Request) {
        const url = new URL(req.url);
        const neighborhood = url.searchParams.get("neighborhood")?.trim();
        if (!neighborhood) {
          return Response.json(
            { error: "Missing neighborhood query parameter" },
            { status: 400 },
          );
        }
        if (!process.env.DATABASE_URL?.trim()) {
          return Response.json(
            { error: "DATABASE_URL is not set on the server" },
            { status: 503 },
          );
        }
        try {
          const { getNeonSql } = await import("../../api/lib/neon.ts");
          const sql = getNeonSql();
          const rows = await sql`
            SELECT * FROM rent_forecasts
            WHERE lower(trim(neighborhood)) = lower(trim(${neighborhood}))
          `;
          return Response.json(rows);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },

    /** Neon connectivity check (requires DATABASE_URL in env). */
    "/api/db-health": {
      async GET() {
        if (!process.env.DATABASE_URL?.trim()) {
          return Response.json(
            { ok: false, reason: "DATABASE_URL not set — copy from Neon console" },
            { status: 503 }
          );
        }
        try {
          const { getNeonSql } = await import("../../api/lib/neon.ts");
          const sql = getNeonSql();
          const rows = await sql`SELECT 1 AS ok`;
          return Response.json({ ok: true, neon: true, rows });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return Response.json({ ok: false, error: message }, { status: 500 });
        }
      },
    },

    // SPA fallback — must be last.
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
