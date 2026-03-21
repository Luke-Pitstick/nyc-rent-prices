import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Neon Postgres (HTTP) client. Use only from Bun server / API routes — never import in React.
 *
 * Console: org `org-withered-morning-97572370`, project `jolly-glitter-36979332`
 * https://console.neon.tech
 */
let _sql: NeonQueryFunction<false, false> | undefined;

export function getNeonSql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url?.trim()) {
      throw new Error(
        "DATABASE_URL is missing. Copy the connection string from Neon → Connection details → pooled connection."
      );
    }
    _sql = neon(url);
  }
  return _sql;
}
