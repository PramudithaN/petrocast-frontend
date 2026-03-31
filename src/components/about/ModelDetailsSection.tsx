import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  BrainCircuit,
  Database,
  TrendingUp,
  Gauge,
  Layers,
  BarChart3,
  Sparkles,
  Workflow,
  CheckCircle2,
  Target,
  GitMerge,
} from "lucide-react";

/* ─── Radial ring for percentage-type metrics ─── */
const CIRC = 2 * Math.PI * 30; // r=30
const MetricRing = ({
  pct,
  label,
  sublabel,
  color,
  inView,
}: {
  pct: number;
  label: string;
  sublabel: string;
  color: string;
  inView: boolean;
}) => (
  <div className="flex flex-col items-center gap-2">
    <div className="relative w-[76px] h-[76px]">
      <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
        <circle
          cx="36" cy="36" r="30"
          stroke="rgba(255,255,255,0.06)" strokeWidth="5" fill="none"
        />
        <motion.circle
          cx="36" cy="36" r="30"
          stroke={color} strokeWidth="5" fill="none" strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${CIRC}` }}
          animate={
            inView
              ? { strokeDasharray: `${(pct / 100) * CIRC} ${CIRC}` }
              : { strokeDasharray: `0 ${CIRC}` }
          }
          transition={{ duration: 1.6, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold text-white font-mono leading-tight text-center">{label}</span>
      </div>
    </div>
    <span className="text-[11px] text-gray-400 text-center leading-tight max-w-[80px]">{sublabel}</span>
  </div>
);

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const childFade = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const modelFamilies = [
  {
    title: "Statistical Core",
    model: "ARIMA",
    desc: "Trend component model with grid-searched order over p={0,1,2}, d={0,1}, q={0,1,2}.",
    color: "text-oil-gold",
  },
  {
    title: "Sequence Learner",
    model: "Mid-GRU",
    desc: "1-layer GRU (hidden_size=64, dropout=0.3) on 14 price and technical features.",
    color: "text-oil-cyan",
  },
  {
    title: "Sentiment Learner",
    model: "Sentiment-GRU",
    desc: "Dual-stream GRU with attention: 14 price features + 16 sentiment/news features.",
    color: "text-violet-300",
  },
  {
    title: "High-Frequency Booster",
    model: "XGBoost-HF",
    desc: "Per-horizon XGBRegressor with n_estimators=500, max_depth=3, lr=0.05, subsample=0.8.",
    color: "text-emerald-300",
  },
];

const layerFlow = [
  {
    step: "L1",
    model: "ARIMA",
    input: "VMD trend component",
    output: "Trend log-return forecast",
    color: "text-oil-gold",
  },
  {
    step: "L2",
    model: "Mid-GRU",
    input: "Price and technical features",
    output: "Mid-frequency forecast",
    color: "text-oil-cyan",
  },
  {
    step: "L3",
    model: "Sentiment-GRU",
    input: "Dual stream (price + sentiment)",
    output: "Sentiment-aware forecast",
    color: "text-violet-300",
  },
  {
    step: "L4",
    model: "XGBoost-HF",
    input: "8 high-frequency features",
    output: "High-frequency forecast",
    color: "text-emerald-300",
  },
  {
    step: "L5",
    model: "Ridge Stacking",
    input: "4 sub-model outputs",
    output: "Final ensemble forecast",
    color: "text-amber-200",
  },
];

const servingSteps = [
  {
    step: "01",
    title: "VMD Decomposition",
    details: "Log-return series is decomposed into K=3 modes (alpha=2000, tau=0, DC=0, init=1, tol=1e-7).",
  },
  {
    step: "02",
    title: "Feature Engineering",
    details: "Builds 30 total features (14 price and technical + 16 sentiment/news), with sentiment lagged by 1 day.",
  },
  {
    step: "03",
    title: "Sub-model Inference",
    details: "ARIMA, Mid-GRU, Sentiment-GRU, and XGBoost each run direct multi-step forecasting.",
  },
  {
    step: "04",
    title: "Ensemble Aggregation",
    details: "Per-step Ridge stacker (alpha=1.0, 5-fold walk-forward CV) combines 4 model outputs.",
  },
  {
    step: "05",
    title: "Evaluation & Delivery",
    details: "Evaluated with RMSE/MAE/MAPE/USD and directional metrics (Accuracy, Precision, Recall, F1, AUC).",
  },
];

/* ─── Chart data ─── */

// Executive headline metrics at H5 t+1
const execRings = [
  { pct: 77.3, label: "77.3%", sublabel: "Dir. Acc (t+1)", color: "#f59e0b" },
  { pct: 76.2, label: "76.2%", sublabel: "F1 Score (t+1)", color: "#22d3ee" },
  { pct: 82,   label: "0.82",  sublabel: "AUC-ROC (t+1)", color: "#a78bfa" },
];

// H5 model comparison (RMSE × 1000 for readable axis labels)
const modelCompData = [
  { name: "Ensemble+Sent", rmse: 14.7, dirAcc: 77.3, color: "#f59e0b" },
  { name: "Ensemble",      rmse: 14.8, dirAcc: 70.5, color: "#22d3ee" },
  { name: "Mid-GRU",       rmse: 15.0, dirAcc: 58.0, color: "#06b6d4" },
  { name: "Sent-GRU",      rmse: 15.2, dirAcc: 52.3, color: "#a78bfa" },
  { name: "XGBoost-HF",    rmse: 15.3, dirAcc: 51.4, color: "#10b981" },
  { name: "ARIMA",         rmse: 15.6, dirAcc: 47.9, color: "#6b7280" },
];

// Cross-horizon performance
const horizonResults = [
  { horizon: "H5",  rmse: 14.67, mae: 11.53, dirAcc: 57.5, usd: 0.65 },
  { horizon: "H7",  rmse: 14.77, mae: 11.62, dirAcc: 58.1, usd: 0.68 },
  { horizon: "H14", rmse: 15.15, mae: 11.94, dirAcc: 52.3, usd: 0.72 },
];

// Sentiment ablation: positive delta = RMSE got worse, negative = got better
const sentimentData = [
  { horizon: "H5",  gruDelta: 1.04,  ensembleDelta: -0.32 },
  { horizon: "H7",  gruDelta: 0.24,  ensembleDelta: -0.40 },
  { horizon: "H14", gruDelta: 1.81,  ensembleDelta: -0.29 },
];

const ModelDetailsSection = () => {
  const [sectionRef, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={sectionRef} className="mb-20">
      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={stagger}
        className="mb-10"
      >
        <motion.h2
          variants={childFade}
          className="text-2xl md:text-3xl font-bold text-white font-display flex items-center gap-3"
        >
          <div className="w-1 h-8 rounded-full bg-linear-to-b from-oil-gold to-oil-amber" />
          Model Details
        </motion.h2>
        <motion.p variants={childFade} className="text-gray-400 text-sm mt-3 max-w-3xl leading-relaxed">
          PDF-driven summary of the full VMD-based ensemble documented in version 10 (March 2026),
          including architecture, features, training setup, and performance outcomes.
        </motion.p>
      </motion.div>

      {/* ── Executive Performance Rings ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl p-6 border border-white/10 mb-8"
      >
        <div className="flex items-center gap-2 mb-5">
          <CheckCircle2 size={16} className="text-oil-gold" />
          <h3 className="text-sm uppercase tracking-[0.18em] text-gray-400 font-semibold">
            Best Ensemble Performance (H5, t+1)
          </h3>
        </div>
        <div className="flex flex-wrap items-center justify-around gap-6">
          {execRings.map((r) => (
            <MetricRing key={r.sublabel} pct={r.pct} label={r.label} sublabel={r.sublabel} color={r.color} inView={inView} />
          ))}
          {/* Stat chips for raw values */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-[76px] h-[76px] rounded-full border border-violet-400/30 bg-violet-500/5 flex items-center justify-center">
              <span className="text-sm font-bold text-violet-300 font-mono">0.01467</span>
            </div>
            <span className="text-[11px] text-gray-400 text-center leading-tight max-w-[80px]">RMSE (Best)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-[76px] h-[76px] rounded-full border border-emerald-400/30 bg-emerald-500/5 flex items-center justify-center">
              <span className="text-sm font-bold text-emerald-300 font-mono">$0.65</span>
            </div>
            <span className="text-[11px] text-gray-400 text-center leading-tight max-w-[80px]">USD Error/barrel</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl p-5 border border-white/10 mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <GitMerge size={16} className="text-oil-gold" />
          <h3 className="text-sm uppercase tracking-[0.18em] text-gray-400 font-semibold">
            Architecture Layers
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {layerFlow.map((layer) => (
            <div key={layer.step} className="rounded-xl bg-white/3 border border-white/8 p-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-1">{layer.step}</div>
              <div className={`text-sm font-bold ${layer.color}`}>{layer.model}</div>
              <div className="text-xs text-gray-400 mt-2">Input: {layer.input}</div>
              <div className="text-xs text-gray-500 mt-1">Output: {layer.output}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={stagger}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
      >
        {modelFamilies.map((family) => (
          <motion.article
            key={family.model}
            variants={childFade}
            whileHover={{ scale: 1.01 }}
            className="glass rounded-2xl p-5 border border-white/10 hover:border-oil-gold/20 transition-all duration-300"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-white/5">
                <BrainCircuit size={18} className={family.color} />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-1">
                  {family.title}
                </div>
                <h3 className={`text-base font-bold font-display ${family.color}`}>
                  {family.model}
                </h3>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">{family.desc}</p>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>

      {/* ── Inputs: animated feature-count bars ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl p-5 border border-white/10 mb-4"
      >
        <div className="flex items-center gap-2 mb-5">
          <Database size={16} className="text-oil-cyan" />
          <h3 className="text-sm uppercase tracking-[0.18em] text-gray-400 font-semibold">Inputs</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Price & Technical", count: 14, total: 30, color: "#22d3ee", icon: <Database size={16} className="text-oil-cyan" />, sub: "log_return · 7 lags · vol · RSI · momentum" },
            { label: "Sentiment & News", count: 10, total: 30, color: "#f59e0b", icon: <Sparkles size={16} className="text-oil-gold" />, sub: "decay · volume · log_volume · high_regime" },
            { label: "EMA-Derived", count: 12, total: 30, color: "#10b981", icon: <Layers size={16} className="text-emerald-300" />, sub: "3, 7, 14-day EMAs across 4 signal streams" },
          ].map((feat, i) => (
            <motion.div
              key={feat.label}
              initial={{ opacity: 0, x: -16 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-xl bg-white/3 border border-white/8 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {feat.icon}
                  <span className="text-xs font-semibold text-white">{feat.label}</span>
                </div>
                <span className="text-lg font-bold font-mono" style={{ color: feat.color }}>{feat.count}</span>
              </div>
              {/* fill bar */}
              <div className="h-1.5 rounded-full bg-white/8 overflow-hidden mb-3">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: feat.color }}
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${(feat.count / feat.total) * 100}%` } : { width: 0 }}
                  transition={{ duration: 1.2, delay: 0.4 + i * 0.1, ease: "easeOut" }}
                />
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">{feat.sub}</p>
            </motion.div>
          ))}
        </div>
        <p className="text-[11px] text-gray-600 mt-3">All sentiment features lagged by 1 day · Features standardised with StandardScaler (train set only) · 30 total unique features</p>
      </motion.div>

      {/* ── Outputs: glowing highlight cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="glass rounded-2xl p-5 border border-white/10 mb-8"
      >
        <div className="flex items-center gap-2 mb-5">
          <Gauge size={16} className="text-oil-gold" />
          <h3 className="text-sm uppercase tracking-[0.18em] text-gray-400 font-semibold">Outputs</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: <TrendingUp size={22} />,
              color: "#f59e0b",
              glow: "rgba(245,158,11,0.15)",
              border: "border-oil-gold/20",
              title: "Point Forecasts",
              value: "H5 / H7 / H14",
              sub: "Daily closing price forecasts for 5, 7 and 14 trading day horizons, direct multi-step.",
            },
            {
              icon: <Gauge size={22} />,
              color: "#22d3ee",
              glow: "rgba(34,211,238,0.12)",
              border: "border-oil-cyan/20",
              title: "Uncertainty Bands",
              value: "P10 – P90",
              sub: "Fan-chart quantiles with confidence interval and cross-model agreement score.",
            },
            {
              icon: <BarChart3 size={22} />,
              color: "#a78bfa",
              glow: "rgba(167,139,250,0.12)",
              border: "border-violet-400/20",
              title: "Explainability",
              value: "4 sub-models",
              sub: "Per-model contribution bars and top SHAP feature drivers for every prediction run.",
            },
          ].map((out, i) => (
            <motion.div
              key={out.title}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`rounded-xl border ${out.border} p-4 transition-all duration-300`}
              style={{ background: out.glow }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${out.color}18` }}>
                  <span style={{ color: out.color }}>{out.icon}</span>
                </div>
                <span className="text-xs font-bold font-mono" style={{ color: out.color }}>{out.value}</span>
              </div>
              <div className="text-sm font-bold text-white mb-1">{out.title}</div>
              <p className="text-[11px] text-gray-400 leading-relaxed">{out.sub}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Serving Flow: connected vertical timeline ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass rounded-2xl p-5 border border-white/10 mb-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <Workflow size={16} className="text-emerald-300" />
          <h3 className="text-sm uppercase tracking-[0.18em] text-gray-400 font-semibold">Serving Flow</h3>
        </div>
        <div className="relative pl-8">
          {/* vertical line */}
          <motion.div
            className="absolute left-[15px] top-0 w-px bg-linear-to-b from-emerald-400/50 via-emerald-400/20 to-transparent"
            initial={{ height: 0 }}
            animate={inView ? { height: "100%" } : { height: 0 }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.4 }}
          />
          <ol className="space-y-0">
            {servingSteps.map((step, i) => (
              <motion.li
                key={step.step}
                initial={{ opacity: 0, x: -12 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.3 + i * 0.12 }}
                className="relative flex gap-4 pb-6 last:pb-0"
              >
                {/* dot */}
                <motion.div
                  className="absolute -left-8 w-[30px] h-[30px] rounded-full border-2 border-emerald-400/50 bg-[#191713] flex items-center justify-center shrink-0 z-10"
                  initial={{ scale: 0 }}
                  animate={inView ? { scale: 1 } : { scale: 0 }}
                  transition={{ type: "spring", stiffness: 240, delay: 0.4 + i * 0.12 }}
                >
                  <span className="text-[10px] font-bold text-emerald-300">{step.step}</span>
                </motion.div>
                <div className="rounded-xl bg-white/3 border border-white/8 p-3 w-full">
                  <div className="text-sm font-semibold text-white mb-1">{step.title}</div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{step.details}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </motion.div>

      {/* ── Cross-Horizon Results: bar charts ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl p-5 border border-white/10 mb-8"
      >
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 size={16} className="text-oil-cyan" />
          <h3 className="text-sm uppercase tracking-[0.18em] text-gray-400 font-semibold">
            Cross-Horizon Results
          </h3>
          <span className="text-[11px] text-gray-600 ml-1">(RMSE ×10³ · Dir. Acc % · USD Error)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* RMSE per horizon */}
          <div>
            <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-3 text-center">RMSE ×10³</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={horizonResults} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="horizon" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[14, 16]} tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toFixed(0)} />
                  <Tooltip
                    contentStyle={{ background: "#191713", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                    formatter={(v: number | undefined) => [`${(v ?? 0).toFixed(2)} ×10⁻³`, "RMSE"]}
                    labelStyle={{ color: "#9ca3af" }}
                  />
                  <Bar dataKey="rmse" radius={[6, 6, 0, 0]}>
                    {horizonResults.map((r) => (
                      <Cell key={r.horizon} fill={r.horizon === "H5" ? "#f59e0b" : r.horizon === "H7" ? "#22d3ee" : "#a78bfa"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Directional Accuracy per horizon */}
          <div>
            <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-3 text-center">Dir. Accuracy %</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={horizonResults} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="horizon" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[40, 70]} tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ background: "#191713", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                    formatter={(v: number | undefined) => [`${v ?? 0}%`, "Dir. Acc"]}
                    labelStyle={{ color: "#9ca3af" }}
                  />
                  <Bar dataKey="dirAcc" radius={[6, 6, 0, 0]}>
                    {horizonResults.map((r) => (
                      <Cell key={r.horizon} fill={r.horizon === "H5" ? "#f59e0b" : r.horizon === "H7" ? "#22d3ee" : "#a78bfa"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* USD Error per horizon */}
          <div>
            <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-3 text-center">USD Error / barrel</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={horizonResults} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="horizon" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0.5, 0.85]} tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={{ background: "#191713", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                    formatter={(v: number | undefined) => [`$${(v ?? 0).toFixed(2)}`, "USD Error"]}
                    labelStyle={{ color: "#9ca3af" }}
                  />
                  <Bar dataKey="usd" radius={[6, 6, 0, 0]}>
                    {horizonResults.map((r) => (
                      <Cell key={r.horizon} fill={r.horizon === "H5" ? "#10b981" : r.horizon === "H7" ? "#34d399" : "#6ee7b7"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Model Comparison at H5 ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl p-5 border border-white/10 mb-8"
      >
        <div className="flex items-center gap-2 mb-5">
          <Target size={16} className="text-violet-300" />
          <h3 className="text-sm uppercase tracking-[0.18em] text-gray-400 font-semibold">
            Model Comparison at H5
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* RMSE ×10³ (lower = better) */}
          <div>
            <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-3">RMSE ×10³ — lower is better</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelCompData} layout="vertical" barSize={14} margin={{ left: 8, right: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" domain={[14, 16]} tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toFixed(1)} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip
                    contentStyle={{ background: "#191713", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                    formatter={(v: number | undefined) => [`${(v ?? 0).toFixed(2)} ×10⁻³`, "RMSE"]}
                    labelStyle={{ color: "#9ca3af" }}
                  />
                  <Bar dataKey="rmse" radius={[0, 6, 6, 0]}>
                    {modelCompData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Directional Accuracy (higher = better) */}
          <div>
            <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-3">Dir. Accuracy % — higher is better</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelCompData} layout="vertical" barSize={14} margin={{ left: 8, right: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" domain={[40, 85]} tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip
                    contentStyle={{ background: "#191713", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                    formatter={(v: number | undefined) => [`${v ?? 0}%`, "Dir. Accuracy"]}
                    labelStyle={{ color: "#9ca3af" }}
                  />
                  <Bar dataKey="dirAcc" radius={[0, 6, 6, 0]}>
                    {modelCompData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Sentiment Ablation ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl p-5 border border-white/10"
      >
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={16} className="text-oil-gold" />
          <h3 className="text-sm uppercase tracking-[0.18em] text-gray-400 font-semibold">
            Sentiment Impact on RMSE (Ablation)
          </h3>
        </div>
        <p className="text-xs text-gray-500 mb-5 leading-relaxed">
          Positive delta = RMSE got <span className="text-red-300">worse</span> with sentiment. &nbsp;
          Negative delta = RMSE got <span className="text-emerald-300">better</span> with sentiment.
        </p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sentimentData} barGap={4} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="horizon" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`}
                domain={[-1, 2.2]}
              />
              <Tooltip
                contentStyle={{ background: "#191713", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                formatter={(v: number | undefined, name: string | undefined) => [
                  `${(v ?? 0) > 0 ? "+" : ""}${v ?? 0}% RMSE`,
                  name === "gruDelta" ? "GRU-only" : "Full Ensemble",
                ]}
                labelStyle={{ color: "#9ca3af" }}
              />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 3" />
              <Bar dataKey="gruDelta" name="gruDelta" radius={[6, 6, 0, 0]} fill="#ef4444" opacity={0.85} />
              <Bar dataKey="ensembleDelta" name="ensembleDelta" radius={[6, 6, 0, 0]} fill="#10b981" opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-5 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" /> GRU-only with sentiment</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Full ensemble with sentiment</span>
        </div>
      </motion.div>
    </section>
  );
};

export default ModelDetailsSection;
