import { getNeonSql } from "./neon.js";

export type RentSeriesPayload = {
  historic: { date: string; median_price: number }[];
  forecasts: Record<string, unknown>[];
};

export async function fetchRentSeriesForNeighborhood(
  neighborhood: string,
): Promise<RentSeriesPayload> {
  const sql = getNeonSql();
  type HistoricRow = { date: string; median_price: number };
  let historic: HistoricRow[];
  try {
    historic = (await sql`
      SELECT date::text AS date, median_price::float8 AS median_price
      FROM neighborhood_medians
      WHERE lower(trim(areaname)) = lower(trim(${neighborhood}))
      ORDER BY date ASC
    `) as HistoricRow[];
  } catch (e) {
    const code =
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      typeof (e as { code?: string }).code === "string"
        ? (e as { code: string }).code
        : "";
    if (code !== "42P01") throw e;
    historic = (await sql`
      SELECT date::text AS date, median_price::float8 AS median_price
      FROM neighborhood_median_rent
      WHERE lower(trim(areaname)) = lower(trim(${neighborhood}))
      ORDER BY date ASC
    `) as HistoricRow[];
  }
  const forecasts = await sql`
    SELECT * FROM rent_forecasts
    WHERE lower(trim(neighborhood)) = lower(trim(${neighborhood}))
    ORDER BY forecast_date ASC
  `;
  return {
    historic,
    forecasts: forecasts as Record<string, unknown>[],
  };
}
