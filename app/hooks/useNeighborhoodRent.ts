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
  if (raw.trimStart().startsWith("<!") || raw.trimStart().startsWith("<html")) {
    throw new Error(
      "API returned HTML instead of JSON. On Vercel, deploy serverless routes in /api/ and set DATABASE_URL; ensure vercel.json does not rewrite /api/* to index.html.",
    );
  }
  let body: unknown;
  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    throw new Error(
      "Bad response from /api/rent-series (not JSON). Use Bun locally or Vercel with api/rent-series.ts.",
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
