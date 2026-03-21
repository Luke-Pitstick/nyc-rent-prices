import type { TooltipContentProps } from "recharts";
import type { TooltipPayloadEntry } from "recharts";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { HistoricMedianRow, RentForecastRow } from "../../hooks/useNeighborhoodRent";

type RentSeriesChartProps = {
  historic: HistoricMedianRow[];
  forecasts: RentForecastRow[];
};

type ChartDatum = {
  t: number;
  historic: number | null;
  forecastMean: number | null;
  loBase: number | null;
  ciSpread: number | null;
};

function mergeSeries(historic: HistoricMedianRow[], forecasts: RentForecastRow[]): ChartDatum[] {
  const keys = new Set<string>();
  for (const h of historic) keys.add(h.date);
  for (const f of forecasts) keys.add(f.forecast_date);
  const sorted = [...keys].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const histBy = Object.fromEntries(historic.map((h) => [h.date, h.median_price]));
  const fcBy = Object.fromEntries(forecasts.map((f) => [f.forecast_date, f]));

  return sorted.map((date) => {
    const t = new Date(date).getTime();
    const historicVal = histBy[date] ?? null;
    const fc = fcBy[date];
    const forecastMean = fc?.predicted_mean ?? null;
    const lo = fc?.lower_ci ?? null;
    const hi = fc?.upper_ci ?? null;
    const loBase = lo != null && hi != null ? lo : null;
    const ciSpread = lo != null && hi != null ? hi - lo : null;
    return {
      t,
      historic: historicVal,
      forecastMean,
      loBase,
      ciSpread,
    };
  });
}

const fmtUsd = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);

const fmtX = (t: number) =>
  new Date(t).toLocaleDateString("en-US", { month: "short", year: "2-digit" });

function RentTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const dateLabel =
    typeof label === "number"
      ? new Date(label).toLocaleDateString("en-US", { dateStyle: "medium" })
      : String(label);
  const rows = payload.filter(
    (p: TooltipPayloadEntry) => p.dataKey === "historic" || p.dataKey === "forecastMean",
  );
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1.5 font-medium text-slate-700">{dateLabel}</p>
      <ul className="space-y-1">
        {rows.map((p: TooltipPayloadEntry) => {
          const v = p.value;
          if (typeof v !== "number") return null;
          const labelText =
            p.dataKey === "historic" ? "Median (actual)" : p.dataKey === "forecastMean" ? "Forecast" : String(p.name);
          return (
            <li key={String(p.dataKey)} className="flex justify-between gap-6 tabular-nums">
              <span style={{ color: p.color }}>{labelText}</span>
              <span className="font-medium text-slate-900">{fmtUsd(v)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function RentSeriesChart({ historic, forecasts }: RentSeriesChartProps) {
  const data = mergeSeries(historic, forecasts);
  const last = Math.max(0, data.length - 1);

  const [startIdx, setStartIdx] = useState(0);
  const [endIdx, setEndIdx] = useState(last);

  useEffect(() => {
    setStartIdx(0);
    setEndIdx(Math.max(0, data.length - 1));
  }, [historic, forecasts, data.length]);

  const visible = useMemo(
    () => (data.length === 0 ? [] : data.slice(startIdx, endIdx + 1)),
    [data, startIdx, endIdx],
  );

  const setFullRange = useCallback(() => {
    setStartIdx(0);
    setEndIdx(last);
  }, [last]);

  const setRecentHalf = useCallback(() => {
    if (data.length <= 2) {
      setFullRange();
      return;
    }
    const cut = Math.floor(data.length / 2);
    setStartIdx(cut);
    setEndIdx(last);
  }, [data.length, last, setFullRange]);

  const onStartChange = useCallback(
    (v: number) => {
      const next = Math.min(v, endIdx - 1);
      setStartIdx(Math.max(0, next));
    },
    [endIdx],
  );

  const onEndChange = useCallback(
    (v: number) => {
      const next = Math.max(v, startIdx + 1);
      setEndIdx(Math.min(last, next));
    },
    [last, startIdx],
  );

  if (data.length === 0) {
    return <p className="text-xs text-gray-500">No data to plot for this area.</p>;
  }

  const startLabel = fmtX(data[startIdx]!.t);
  const endLabel = fmtX(data[endIdx]!.t);
  const isFullRange = startIdx === 0 && endIdx === last;

  return (
    <div className="w-full" style={{ minHeight: 280 }}>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={visible} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(226 232 240)" vertical={false} />
          <XAxis
            type="number"
            dataKey="t"
            domain={["dataMin", "dataMax"]}
            tickFormatter={fmtX}
            tick={{ fontSize: 10, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
            tick={{ fontSize: 10, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            width={44}
            domain={["auto", "auto"]}
          />
          <Tooltip content={(props) => <RentTooltip {...props} />} />
          <Legend
            wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
            formatter={(value) => {
              if (value === "historic") return "Median (actual)";
              if (value === "forecastMean") return "Forecast";
              if (value === "ciSpread") return "95% CI (band)";
              return value;
            }}
          />
          <Area
            type="monotone"
            dataKey="loBase"
            stackId="ci"
            stroke="none"
            fill="transparent"
            fillOpacity={0}
            legendType="none"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="ciSpread"
            stackId="ci"
            stroke="none"
            fill="rgb(139 92 246)"
            fillOpacity={0.22}
            name="ciSpread"
            connectNulls
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="historic"
            stroke="rgb(37 99 235)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
            connectNulls
            name="historic"
          />
          <Line
            type="monotone"
            dataKey="forecastMean"
            stroke="rgb(109 40 217)"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            activeDot={{ r: 5 }}
            connectNulls
            name="forecastMean"
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-3 space-y-3 rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Time window
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={setFullRange}
              disabled={isFullRange}
              className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/80 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Full range
            </button>
            <button
              type="button"
              onClick={setRecentHalf}
              disabled={data.length <= 2}
              className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/80 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Last half
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500">
            <span className="tabular-nums">From {startLabel}</span>
            <span className="tabular-nums">To {endLabel}</span>
          </div>
          <label className="block text-[10px] font-medium text-slate-500">
            Start
            <input
              type="range"
              min={0}
              max={Math.max(0, endIdx - 1)}
              value={startIdx}
              onChange={(e) => onStartChange(Number(e.target.value))}
              className="mt-1 h-2 w-full cursor-pointer accent-blue-600"
            />
          </label>
          <label className="block text-[10px] font-medium text-slate-500">
            End
            <input
              type="range"
              min={Math.min(last, startIdx + 1)}
              max={last}
              value={endIdx}
              onChange={(e) => onEndChange(Number(e.target.value))}
              className="mt-1 h-2 w-full cursor-pointer accent-violet-600"
            />
          </label>
        </div>
      </div>

      <p className="mt-2 text-center text-[10px] text-gray-400">
        Adjust sliders to zoom the chart · Hover points for values
      </p>
    </div>
  );
}
