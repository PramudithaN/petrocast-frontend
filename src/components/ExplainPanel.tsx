import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { X, Brain, Clock, MessageSquare } from "lucide-react";
import { ExplainResponse } from "../types/api";

/* ─── Model display metadata ─── */
const MODEL_META: Record<string, { label: string; color: string }> = {
  arima: { label: "ARIMA", color: "#f59e0b" },
  gru_mid: { label: "Mid-GRU", color: "#06b6d4" },
  gru_sent: { label: "Sentiment-GRU", color: "#a78bfa" },
  xgb_hf: { label: "XGBoost-HF", color: "#10b981" },
};

/* ─── Confidence level styling ─── */
const CONFIDENCE_STYLE: Record<
  string,
  { text: string; badge: string; dot: string }
> = {
  high: {
    text: "text-emerald-400",
    badge: "bg-emerald-500/10 border border-emerald-500/30",
    dot: "#10b981",
  },
  medium: {
    text: "text-amber-400",
    badge: "bg-amber-500/10 border border-amber-500/30",
    dot: "#f59e0b",
  },
  low: {
    text: "text-red-400",
    badge: "bg-red-500/10 border border-red-500/30",
    dot: "#ef4444",
  },
};

/* ─── Section header ─── */
const SectionHeader = ({
  dot,
  children,
}: {
  dot: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dot }} />
    <h3 className="text-xs font-bold text-white font-display uppercase tracking-[0.18em]">
      {children}
    </h3>
  </div>
);

/* ─── Tooltip for model contributions chart ─── */
const ModelTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const v = payload[0].value as number;
  const name = payload[0].payload?.name ?? "";
  return (
    <div className="glass-strong px-3 py-2 rounded-xl shadow-xl text-xs">
      <p className="text-gray-400 mb-0.5">{name}</p>
      <p className="font-bold font-mono text-white">${v.toFixed(2)}</p>
    </div>
  );
};

/* ─── Main Component ─── */
interface ExplainPanelProps {
  data: ExplainResponse;
  onClose: () => void;
}

const ExplainPanelBone = ({ className = "" }: Readonly<{ className?: string }>) => (
  <div className={`skeleton-loader animate-pulse rounded-xl ${className}`} />
);

export default function ExplainPanel({ data, onClose }: Readonly<ExplainPanelProps>) {
  const confLevel = data.confidence_level.toLowerCase();
  const confStyle = CONFIDENCE_STYLE[confLevel] ?? CONFIDENCE_STYLE.medium;

  /* Model contributions chart data */
  const modelChartData = Object.entries(data.model_contributions).map(
    ([key, value]) => {
      const meta = MODEL_META[key] ?? { label: key, color: "#9ca3af" };
      return { name: meta.label, value, color: meta.color };
    },
  );
  const maxContribution = Math.max(
    ...modelChartData.map((d) => d.value),
    0.001,
  );

  /* Top features derived */
  const maxShapAbs = Math.max(
    ...data.top_features.map((f) => Math.abs(f.shap_value)),
    0.0001,
  );

  /* CI range — where does the prediction land in the CI? */
  const ciRange =
    data.confidence_interval_upper - data.confidence_interval_lower || 1;
  const predPct =
    ((data.prediction - data.confidence_interval_lower) / ciRange) * 100;

  /* Generated-at: try to format nicely */
  let generatedAt = data.explanation_date;
  try {
    generatedAt = new Date(data.generated_at).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    /* fallback stays as explanation_date */
  }

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="explain-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-up panel */}
      <motion.div
        key="explain-panel"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 320 }}
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl overflow-hidden"
        style={{
          maxHeight: "92vh",
          background: "#191713",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
        onClick={stopPropagation}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Panel header */}
        <div className="flex items-center justify-between px-5 sm:px-8 pt-2 pb-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <Brain size={20} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">
                Model Explainability
              </h2>
              <p className="text-[11px] text-gray-500">
                Ensemble forecast decomposition &amp; feature attribution
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-xl glass hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close explainability panel"
          >
            <X size={18} className="text-gray-400" />
          </motion.button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-4 sm:px-8 py-6 space-y-6 max-w-350 mx-auto">

            {/* ── KPI Row ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Forecast Price */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="glass p-4 rounded-2xl"
              >
                <div className="text-[10px] text-oil-cyan/80 font-semibold uppercase tracking-widest mb-2">
                  Forecast Price (T+1)
                </div>
                <div className="text-2xl font-bold text-oil-cyan font-display">
                  ${data.prediction.toFixed(2)}
                </div>
                <div className="mt-1.5 text-[11px] text-gray-500">
                  Brent Crude / barrel
                </div>
              </motion.div>

              {/* Confidence Interval */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass p-4 rounded-2xl"
              >
                <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-2">
                  Confidence Interval
                </div>
                <div className="text-lg font-bold text-white font-display leading-tight">
                  ${data.confidence_interval_lower.toFixed(2)}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  to ${data.confidence_interval_upper.toFixed(2)}
                </div>
                {/* Range bar showing where prediction lands */}
                <div className="mt-2.5 relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.1, delay: 0.35, ease: "easeOut" }}
                    className="h-full rounded-full bg-linear-to-r from-oil-amber to-oil-light-gold"
                  />
                </div>
                <motion.div
                  className="relative h-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  <div
                    className="absolute -top-3 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white border-2 shadow"
                    style={{
                      left: `${Math.max(4, Math.min(96, predPct))}%`,
                      borderColor: "#191713",
                    }}
                  />
                </motion.div>
              </motion.div>

              {/* Confidence Level */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass p-4 rounded-2xl"
              >
                <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-3">
                  Confidence Level
                </div>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold uppercase tracking-wider ${confStyle.badge} ${confStyle.text}`}
                >
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: confStyle.dot }}
                  />
                  {data.confidence_level}
                </div>
                <div className="mt-2.5 text-[11px] text-gray-500">
                  Forecast reliability
                </div>
              </motion.div>

              {/* Agreement Score */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass p-4 rounded-2xl"
              >
                <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-2">
                  Model Agreement
                </div>
                <div className="text-2xl font-bold text-oil-gold font-display">
                  {data.agreement_score.toFixed(4)}
                </div>
                <div className="mt-1.5 text-[11px] text-gray-500">
                  Lower = higher consensus
                </div>
              </motion.div>
            </div>

            {/* ── Sub-model Contributions + Top Feature Drivers ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Sub-model Contributions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="glass p-5 rounded-2xl"
              >
                <SectionHeader dot="#f59e0b">
                  Sub-model Contributions
                </SectionHeader>

                {/* Animated horizontal bars */}
                <div className="space-y-3 mb-5">
                  {modelChartData.map((model, i) => (
                    <div key={model.name} className="flex items-center gap-3">
                      <span
                        className="text-xs font-medium w-32 shrink-0"
                        style={{ color: model.color }}
                      >
                        {model.name}
                      </span>
                      <div className="flex-1 relative h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(model.value / maxContribution) * 100}%`,
                          }}
                          transition={{
                            duration: 0.9,
                            delay: 0.3 + i * 0.07,
                            ease: "easeOut",
                          }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: model.color }}
                        />
                      </div>
                      <span className="text-xs font-mono font-semibold text-white w-14 text-right shrink-0">
                        ${model.value.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Recharts horizontal bar chart */}
                <div className="h-45">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={modelChartData}
                      layout="vertical"
                      margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.04)"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        tick={{ fill: "#6b7280", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v: number) => `$${v.toFixed(0)}`}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fill: "#6b7280", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        width={88}
                      />
                      <Tooltip
                        content={<ModelTooltip />}
                        cursor={{ fill: "rgba(255,255,255,0.03)" }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Top Feature Drivers (SHAP) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass p-5 rounded-2xl"
              >
                <SectionHeader dot="#06b6d4">
                  Top Feature Drivers (SHAP)
                </SectionHeader>

                <div className="space-y-4">
                  {data.top_features.map((feature, i) => {
                    const isPos = feature.shap_value >= 0;
                    const barColor = isPos ? "#10b981" : "#ef4444";
                    const pct =
                      (Math.abs(feature.shap_value) / maxShapAbs) * 100;

                    return (
                      <motion.div
                        key={feature.feature_name}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + i * 0.06 }}
                        className="space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono text-gray-200 truncate">
                            {feature.feature_name}
                          </span>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[10px] text-gray-600 font-mono hidden sm:inline">
                              val: {feature.feature_value.toFixed(4)}
                            </span>
                            <span
                              className={`text-xs font-mono font-semibold ${isPos ? "text-emerald-400" : "text-red-400"}`}
                            >
                              {isPos ? "+" : ""}
                              {feature.shap_value.toFixed(6)}
                            </span>
                          </div>
                        </div>
                        <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{
                              duration: 0.8,
                              delay: 0.4 + i * 0.06,
                              ease: "easeOut",
                            }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: barColor }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* ── Sentiment Headlines ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass p-5 rounded-2xl"
            >
              <SectionHeader dot="#a78bfa">Sentiment Headlines</SectionHeader>

              {data.sentiment_headlines.length === 0 ? (
                <div className="flex items-center gap-3 py-3 text-sm text-gray-500">
                  <div className="w-8 h-8 rounded-xl bg-white/3 border border-white/10 flex items-center justify-center shrink-0">
                    <MessageSquare size={14} className="text-gray-600" />
                  </div>
                  <span>No sentiment headlines available for this period.</span>
                </div>
              ) : (
                <ul className="space-y-2">
                  {data.sentiment_headlines.map((headline, i) => (
                    <motion.li
                      key={headline}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.45 + i * 0.05 }}
                      className="flex items-start gap-2 text-sm text-gray-300 leading-relaxed"
                    >
                      <div className="w-1 h-1 rounded-full bg-violet-400 mt-2 shrink-0" />
                      {headline}
                    </motion.li>
                  ))}
                </ul>
              )}
            </motion.div>

            {/* ── Forecast Analysis ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="glass p-5 rounded-2xl"
            >
              <SectionHeader dot="#f59e0b">Forecast Analysis</SectionHeader>
              <p className="text-sm text-gray-300 leading-relaxed">
                {data.explanation_text}
              </p>
            </motion.div>

            {/* ── Meta footer ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-gray-600 pb-1"
            >
              <span className="flex items-center gap-1.5">
                <Clock size={11} />
                {data.explanation_date}
              </span>
              <span>Generated: {generatedAt}</span>
              <span>
                Computed in {data.computation_time_seconds.toFixed(2)}s
              </span>
            </motion.div>

            {/* Bottom spacer */}
            <div className="h-4" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Loading skeleton for ExplainPanel ─── */
export function ExplainPanelSkeleton({ onClose }: Readonly<{ onClose: () => void }>) {
  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <AnimatePresence>
      <motion.div
        key="explain-backdrop-sk"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        key="explain-panel-sk"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 320 }}
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl overflow-hidden"
        style={{ maxHeight: "92vh", background: "#191713", borderTop: "1px solid rgba(255,255,255,0.08)" }}
        onClick={stopPropagation}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-8 pt-2 pb-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <Brain size={20} className="text-violet-400" />
            </div>
            <div>
              <p className="text-base font-bold text-white font-display">
                Model Explainability
              </p>
              <p className="text-[11px] text-gray-500">Fetching explanation data…</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl glass hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Skeleton body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((n) => (
              <ExplainPanelBone key={n} className="h-24" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ExplainPanelBone className="h-64" />
            <ExplainPanelBone className="h-64" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ExplainPanelBone className="h-72" />
            <ExplainPanelBone className="h-72" />
          </div>
          <ExplainPanelBone className="h-48" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
