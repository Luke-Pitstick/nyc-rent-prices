import { RentSeriesChart } from "./RentSeriesChart";
import type { RentForecastRow, RentSeriesResponse } from "../../hooks/useNeighborhoodRent";

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-US", { month: "short", year: "numeric", day: "numeric" });
}

type SidebarProps = {
  show: boolean;
  selectedNeighborhood: string | null;
  rentSeries: RentSeriesResponse | null;
  rentLoading: boolean;
  rentError: string | null;
  onClose?: () => void;
};

function latestForecast(rows: RentForecastRow[]): RentForecastRow | undefined {
  if (rows.length === 0) return undefined;
  const sorted = [...rows].sort(
    (a, b) => new Date(b.forecast_date).getTime() - new Date(a.forecast_date).getTime(),
  );
  return sorted.at(0);
}

export function Sidebar({
  show,
  selectedNeighborhood,
  rentSeries,
  rentLoading,
  rentError,
  onClose,
}: SidebarProps) {
  if (!show) return null;

  const forecasts = rentSeries?.forecasts ?? [];
  const historic = rentSeries?.historic ?? [];
  const sortedForecasts = [...forecasts].sort(
    (a, b) => new Date(b.forecast_date).getTime() - new Date(a.forecast_date).getTime(),
  );
  const top = latestForecast(forecasts);

  return (
    <aside
      className="absolute inset-y-0 right-0 z-[1000] flex w-full max-w-sm flex-col border-l border-gray-200/80 bg-white/95 shadow-[-12px_0_40px_-12px_rgba(15,23,42,0.15)] backdrop-blur-sm"
      aria-label="Neighborhood details"
    >
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Selected area
          </p>
          <h2 className="mt-1 text-lg font-semibold leading-snug text-gray-900">
            {selectedNeighborhood ?? "—"}
          </h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close panel"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </header>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
        <section>
          <h3 className="text-sm font-medium text-gray-500">History &amp; forecast</h3>
          {rentLoading && (
            <p className="mt-3 text-sm text-gray-500">Loading series…</p>
          )}
          {rentError && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {rentError}
            </div>
          )}
          {!rentLoading && !rentError && rentSeries && historic.length === 0 && forecasts.length === 0 && (
            <p className="mt-3 text-sm text-gray-500">
              No historic or forecast rows for this name. Check Neon table/column names match the API.
            </p>
          )}
          {!rentLoading && !rentError && rentSeries && (historic.length > 0 || forecasts.length > 0) && (
            <div className="mt-3 rounded-xl border border-gray-100 bg-white px-2 py-3">
              <RentSeriesChart historic={historic} forecasts={forecasts} />
            </div>
          )}
        </section>

        <section>
          <h3 className="text-sm font-medium text-gray-500">Latest forecast</h3>
          {!rentLoading && !rentError && top && (
            <div className="mt-3 rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white px-4 py-4">
              <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-gray-900">
                {formatUsd(top.predicted_mean)}
                <span className="ml-1 text-base font-medium text-gray-400">/ mo</span>
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {formatDate(top.forecast_date)} · 95% CI {formatUsd(top.lower_ci)}–{formatUsd(top.upper_ci)}
              </p>
            </div>
          )}
          {!rentLoading && !rentError && forecasts.length > 1 && (
            <div className="mt-3 rounded-xl border border-gray-100 bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                All forecast horizons ({forecasts.length})
              </p>
              <ul className="mt-2 max-h-32 space-y-1.5 overflow-y-auto text-xs text-gray-700">
                {sortedForecasts.map((row) => (
                  <li
                    key={row.forecast_date}
                    className="flex justify-between gap-2 tabular-nums"
                  >
                    <span className="text-gray-500">{formatDate(row.forecast_date)}</span>
                    <span>{formatUsd(row.predicted_mean)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="rounded-xl bg-violet-50/80 px-4 py-3 text-xs leading-relaxed text-violet-900/90">
          <span className="font-semibold text-violet-950">Data:</span> medians from{" "}
          <code className="rounded bg-violet-100/80 px-1">neighborhood_medians</code>, forecasts from{" "}
          <code className="rounded bg-violet-100/80 px-1">rent_forecasts</code> via{" "}
          <code className="rounded bg-violet-100/80 px-1">/api/rent-series</code>.
        </section>
      </div>
    </aside>
  );
}
