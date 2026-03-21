import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getNeonSql } from "./lib/neon.js";

/** @deprecated Prefer `/api/rent-series` */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const raw = req.query.neighborhood;
  const neighborhood = typeof raw === "string" ? raw.trim() : "";
  if (!neighborhood) {
    res.status(400).json({ error: "Missing neighborhood query parameter" });
    return;
  }
  if (!process.env.DATABASE_URL?.trim()) {
    res.status(503).json({ error: "DATABASE_URL is not set on the server" });
    return;
  }
  try {
    const sql = getNeonSql();
    const rows = await sql`
      SELECT * FROM rent_forecasts
      WHERE lower(trim(neighborhood)) = lower(trim(${neighborhood}))
    `;
    res.status(200).json(rows);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
}
