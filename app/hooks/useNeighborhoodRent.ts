/**
 * Rent data: the browser calls `/api/rent-series` (historic medians + forecasts).
 * SQL runs on the server only — see `src/index.ts`.
 */
export type RentForecastRow = {
  neighborhood: string;
  forecast_date: string;
  predicted_mean: number;
  lower_ci: number;
  upper_ci: number;
};

export type HistoricMedianRow = {
  date: string;
  median_price: number;
};

export type RentSeriesResponse = {
  historic: HistoricMedianRow[];
  forecasts: RentForecastRow[];
};

function apiUrl(path: string): string {
  const base =
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    typeof (import.meta.env as { PUBLIC_API_BASE?: string }).PUBLIC_API_BASE === "string"
      ? (import.meta.env as { PUBLIC_API_BASE: string }).PUBLIC_API_BASE.replace(/\/$/, "")
      : "";
  return `${base}${path}`;
}

export async function fetchNeighborhoodRentSeries(
  neighborhood: string,
): Promise<RentSeriesResponse> {
  const res = await fetch(
    apiUrl(
      `/api/rent-series?neighborhood=${encodeURIComponent(neighborhood)}`,
    ),
  );
  const raw = await res.text();
  const trimmed = raw.trimStart();
  const looksLikeHtml =
    trimmed.startsWith("<!") || trimmed.toLowerCase().startsWith("<html");
  if (looksLikeHtml) {
    throw new Error(
      "API returned HTML instead of JSON. Use `bun run dev` (Bun serves /api/* from src/index.ts), or on Vercel set DATABASE_URL and keep /api/* out of SPA rewrites.",
    );
  }
  let body: unknown;
  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    const preview = raw.slice(0, 160).replace(/\s+/g, " ").trim();
    throw new Error(
      `Not JSON from /api/rent-series (status ${res.status}). ${preview ? `Start: ${preview}` : "Empty body."} — Run the app with Bun (npm run dev), not a static file server on dist/.`,
    );
  }
  if (!res.ok) {
    const msg =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof (body as { error?: unknown }).error === "string"
        ? (body as { error: string }).error
        : res.statusText;
    throw new Error(msg);
  }
  if (
    typeof body !== "object" ||
    body === null ||
    !("historic" in body) ||
    !("forecasts" in body) ||
    !Array.isArray((body as RentSeriesResponse).historic) ||
    !Array.isArray((body as RentSeriesResponse).forecasts)
  ) {
    throw new Error(
      "Unexpected shape from /api/rent-series (expected { historic, forecasts }).",
    );
  }
  return body as RentSeriesResponse;
}
