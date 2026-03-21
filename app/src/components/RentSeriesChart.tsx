import type { HistoricMedianRow, RentForecastRow } from "../../hooks/useNeighborhoodRent";

type RentSeriesChartProps = {
  historic: HistoricMedianRow[];
  forecasts: RentForecastRow[];
};

function parseTime(s: string): number {
  const t = new Date(s).getTime();
  return Number.isNaN(t) ? NaN : t;
}

export function RentSeriesChart({ historic, forecasts }: RentSeriesChartProps) {
  const hPoints = historic
    .map((r) => ({ t: parseTime(r.date), y: r.median_price }))
    .filter((p) => !Number.isNaN(p.t));
  const fMean = forecasts
    .map((r) => ({
      t: parseTime(r.forecast_date),
      mean: r.predicted_mean,
      lo: r.lower_ci,
      hi: r.upper_ci,
    }))
    .filter((p) => !Number.isNaN(p.t));

  if (hPoints.length === 0 && fMean.length === 0) {
    return (
      <p className="text-xs text-gray-500">No data to plot for this area.</p>
    );
  }

  const allT = [...hPoints.map((p) => p.t), ...fMean.map((p) => p.t)];
  const allY = [
    ...hPoints.map((p) => p.y),
    ...fMean.flatMap((p) => [p.mean, p.lo, p.hi]),
  ];

  const tMin = Math.min(...allT);
  const tMax = Math.max(...allT);
  const yMin = Math.min(...allY);
  const yMax = Math.max(...allY);
  const yPad = (yMax - yMin) * 0.08 || 100;
  const y0 = yMin - yPad;
  const y1 = yMax + yPad;

  const w = 280;
  const chartH = 160;
  const padL = 42;
  const padR = 8;
  const padT = 10;
  const padB = 28;

  const innerW = w - padL - padR;
  const innerH = chartH - padT - padB;

  const sx = (t: number) => padL + ((t - tMin) / (tMax - tMin || 1)) * innerW;
  const sy = (y: number) => padT + (1 - (y - y0) / (y1 - y0 || 1)) * innerH;

  const histSorted = [...hPoints].sort((a, b) => a.t - b.t);
  const histPath =
    histSorted.length > 0
      ? histSorted
          .map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.t).toFixed(1)} ${sy(p.y).toFixed(1)}`)
          .join(" ")
      : "";

  const meanSorted = [...fMean].sort((a, b) => a.t - b.t);
  const meanPath =
    meanSorted.length > 0
      ? meanSorted
          .map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.t).toFixed(1)} ${sy(p.mean).toFixed(1)}`)
          .join(" ")
      : "";

  let ciPolygon = "";
  if (meanSorted.length >= 2) {
    const forward = meanSorted.map((p) => `${sx(p.t).toFixed(1)} ${sy(p.hi).toFixed(1)}`);
    const back = [...meanSorted].reverse().map((p) => `${sx(p.t).toFixed(1)} ${sy(p.lo).toFixed(1)}`);
    ciPolygon = `M ${forward[0]} ${forward.slice(1).map((t) => `L ${t}`).join(" ")} ${back.map((t) => `L ${t}`).join(" ")} Z`;
  }

  const fmtY = (v: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(v);

  const fmtX = (t: number) =>
    new Date(t).toLocaleDateString("en-US", { month: "short", year: "2-digit" });

  const xTicks = 4;
  const tickTs = Array.from({ length: xTicks }, (_, i) =>
    tMin + ((tMax - tMin) * i) / (xTicks - 1 || 1),
  );

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${w} ${chartH}`}
        className="h-auto w-full max-w-full"
        role="img"
        aria-label="Median rent history and forecast"
      >
        <rect x={0} y={0} width={w} height={chartH} fill="transparent" />
        {ciPolygon && (
          <path d={ciPolygon} fill="rgb(139 92 246 / 0.15)" stroke="none" />
        )}
        {histPath && (
          <path
            d={histPath}
            fill="none"
            stroke="rgb(59 130 246)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {meanPath && (
          <path
            d={meanPath}
            fill="none"
            stroke="rgb(109 40 217)"
            strokeWidth={2}
            strokeDasharray="5 4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        <text x={padL - 4} y={sy(y1)} textAnchor="end" className="fill-gray-400" fontSize={9}>
          {fmtY(y1)}
        </text>
        <text x={padL - 4} y={sy(y0)} textAnchor="end" className="fill-gray-400" fontSize={9}>
          {fmtY(y0)}
        </text>
        {tickTs.map((t, i) => (
          <text
            key={i}
            x={sx(t)}
            y={chartH - 6}
            textAnchor="middle"
            className="fill-gray-400"
            fontSize={8}
          >
            {fmtX(t)}
          </text>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-gray-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-blue-500" />
          Actual median
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-4 border-t-2 border-dotted border-violet-700"
            style={{ borderColor: "rgb(109 40 217)" }}
          />
          Forecast
        </span>
        <span className="text-gray-400">Shaded: 95% CI</span>
      </div>
    </div>
  );
}
