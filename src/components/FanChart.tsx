import { useMemo } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { FanPoint } from "../types/api";
import { useDateUtils } from "../utils/dateUtils";

interface FanChartProps {
  readonly fan: FanPoint[];
  readonly lastPrice: number;
  readonly lastPriceDate: string;
}

/* ── Custom tooltip ── */
const FanTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as ChartRow;
  if (!d) return null;

  const isForecast = d.type === "forecast";

  return (
    <div className="glass-strong p-4 rounded-xl shadow-2xl min-w-[210px] text-xs">
      <p className="text-gray-400 mb-2 font-medium">{label}</p>
      <p className="text-base font-bold text-oil-gold mb-2">
        ${d.point_forecast?.toFixed(2) ?? d.price?.toFixed(2)}
      </p>
      {isForecast && (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-400">
            <span>P90</span>
            <span className="text-right font-mono">${d.p90?.toFixed(2)}</span>
            <span>P75</span>
            <span className="text-right font-mono">${d.p75?.toFixed(2)}</span>
            <span>P50</span>
            <span className="text-right font-mono">${d.p50?.toFixed(2)}</span>
            <span>P25</span>
            <span className="text-right font-mono">${d.p25?.toFixed(2)}</span>
            <span>P10</span>
            <span className="text-right font-mono">${d.p10?.toFixed(2)}</span>
          </div>
          <p className="text-gray-600 mt-2">
            Samples: {d.sample_count?.toLocaleString()}
          </p>
        </>
      )}
    </div>
  );
};

interface ChartRow {
  date: string;
  type: "anchor" | "forecast";
  price?: number;
  point_forecast?: number;
  /** Recharts Area needs [low, high] pairs */
  band_outer?: [number, number]; // P10–P90
  band_inner?: [number, number]; // P25–P75
  band_median?: [number, number]; // P50 (thin line band)
  p10?: number;
  p25?: number;
  p50?: number;
  p75?: number;
  p90?: number;
  sample_count?: number;
}

/* Dot renderer extracted to avoid defining a component inside another component */
const FanDot = (props: any) => {
  const { cx, cy, payload } = props;
  return (
    <circle
      key={payload.date}
      cx={cx}
      cy={cy}
      r={payload.type === "anchor" ? 5 : 4}
      fill="#F59E0B"
      stroke="#0e0c0a"
      strokeWidth={2}
    />
  );
};

export default function FanChart({ fan, lastPrice, lastPriceDate }: FanChartProps) {
  const dateUtils = useDateUtils();
  const chartData = useMemo<ChartRow[]>(() => {
    const anchor: ChartRow = {
      date: dateUtils.format(lastPriceDate, "short"),
      type: "anchor",
      price: lastPrice,
      point_forecast: lastPrice,
      band_outer: [lastPrice, lastPrice],
      band_inner: [lastPrice, lastPrice],
      band_median: [lastPrice, lastPrice],
      p10: lastPrice,
      p25: lastPrice,
      p50: lastPrice,
      p75: lastPrice,
      p90: lastPrice,
      sample_count: 0,
    };

    const rows: ChartRow[] = fan.map((f) => ({
      date: dateUtils.format(f.date, "short"),
      type: "forecast",
      point_forecast: f.point_forecast,
      band_outer: [f.p10, f.p90],
      band_inner: [f.p25, f.p75],
      band_median: [f.p50, f.p50],
      p10: f.p10,
      p25: f.p25,
      p50: f.p50,
      p75: f.p75,
      p90: f.p90,
      sample_count: f.sample_count,
    }));

    return [anchor, ...rows];
  }, [fan, lastPrice, lastPriceDate, dateUtils]);

  const allValues = chartData.flatMap((d) => [
    d.point_forecast ?? lastPrice,
    d.p10 ?? lastPrice,
    d.p90 ?? lastPrice,
  ]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const pad = (maxVal - minVal) * 0.25;

  // Quality indicator: average sample_count
  const avgSamples =
    fan.length > 0
      ? Math.round(fan.reduce((s, f) => s + f.sample_count, 0) / fan.length)
      : 0;
  const qualityPct = Math.min((avgSamples / 100) * 100, 100);
  let qualityColor: string;
  if (qualityPct >= 75) {
    qualityColor = "#10B981";
  } else if (qualityPct >= 40) {
    qualityColor = "#F59E0B";
  } else {
    qualityColor = "#EF4444";
  }

  return (
    <div className="space-y-4">
      {/* Quality badge */}
      <div className="flex items-center gap-3 text-xs">
        <span className="text-gray-500">Ensemble quality</span>
        <div className="flex-1 max-w-[140px] h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${qualityPct}%`, backgroundColor: qualityColor }}
          />
        </div>
        <span className="font-mono" style={{ color: qualityColor }}>
          {avgSamples} samples
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-oil-gold" />
          Point forecast
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-6 h-3 rounded-sm bg-oil-cyan/30" />
          P25–P75
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-6 h-3 rounded-sm bg-oil-cyan/15" />
          P10–P90
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-oil-cyan border-dashed" style={{ borderTop: "1px dashed #22d3ee" }} />
          Median (P50)
        </span>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              {/* Outer band P10–P90 */}
              <linearGradient id="fanOuter" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#22D3EE" stopOpacity={0.04} />
              </linearGradient>
              {/* Inner band P25–P75 */}
              <linearGradient id="fanInner" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#22D3EE" stopOpacity={0.12} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="#4b5563"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#4b5563"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              domain={[minVal - pad, maxVal + pad]}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
            />
            <Tooltip content={<FanTooltip />} />

            {/* Outer band: P10–P90 */}
            <Area
              type="monotone"
              dataKey="band_outer"
              stroke="none"
              fill="url(#fanOuter)"
              isAnimationActive={false}
            />

            {/* Inner band: P25–P75 */}
            <Area
              type="monotone"
              dataKey="band_inner"
              stroke="none"
              fill="url(#fanInner)"
              isAnimationActive={false}
            />

            {/* Median P50 dashed line */}
            <Line
              type="monotone"
              dataKey="p50"
              stroke="#22D3EE"
              strokeWidth={1}
              strokeDasharray="4 3"
              dot={false}
              isAnimationActive={false}
            />

            {/* Point forecast line */}
            <Line
              type="monotone"
              dataKey="point_forecast"
              stroke="#F59E0B"
              strokeWidth={2.5}
              dot={<FanDot />}
              activeDot={{ r: 6, fill: "#F59E0B", stroke: "#0e0c0a", strokeWidth: 2 }}
            />

            <ReferenceLine
              y={lastPrice}
              stroke="rgba(255,255,255,0.12)"
              strokeDasharray="4 4"
              label={{
                value: `Current $${lastPrice.toFixed(2)}`,
                fill: "#6b7280",
                fontSize: 11,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
