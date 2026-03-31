import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Database,
  Layers,
  LineChart,
  BrainCircuit,
  Gauge,
} from "lucide-react";
import type { ReactNode } from "react";

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay },
  },
});

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const childFade = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const PipelineStep = ({
  icon,
  title,
  desc,
  step,
  isLast,
  delay,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  step: string;
  isLast: boolean;
  delay: number;
}) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp(delay * 0.12)}
      className="flex items-start gap-3 relative"
    >
      <div className="flex flex-col items-center shrink-0">
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : { scale: 0 }}
          transition={{
            delay: delay * 0.1 + 0.2,
            type: "spring",
            stiffness: 200,
          }}
          className="w-12 h-12 rounded-2xl bg-linear-to-br from-oil-gold/20 to-oil-amber/10 border border-oil-gold/20 flex items-center justify-center text-oil-gold z-10"
        >
          {icon}
        </motion.div>
        {!isLast && (
          <motion.div
            initial={{ height: 0 }}
            animate={inView ? { height: "100%" } : { height: 0 }}
            transition={{ delay: delay * 0.1 + 0.4, duration: 0.5 }}
            className="w-px bg-linear-to-b from-oil-gold/30 to-transparent flex-1 mt-2"
          />
        )}
      </div>

      <div className="pb-10">
        <span className="text-oil-gold/60 text-xs font-semibold uppercase tracking-widest mb-1 block">
          Step {step}
        </span>
        <h3 className="text-lg font-bold text-white mb-2 font-display">
          {title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed max-w-md">
          {desc}
        </p>
      </div>
    </motion.div>
  );
};

const PipelineSection = () => {
  const pipelineHighlights = [
    { label: "VMD Modes", value: "3 (trend / mid / high)" },
    { label: "Forecast Horizons", value: "H5, H7, H14" },
    { label: "Train / Val / Test", value: "70% / 15% / 15%" },
    { label: "Stacking", value: "Ridge · α=1.0 · 5-fold WF-CV" },
  ];

  const pipeline = [
    {
      icon: <Database size={20} />,
      step: "01",
      title: "Data Ingestion & Alignment",
      desc: "Daily Brent close prices and lagged sentiment/news signals are aligned by trading date. The working data window spans 2014 to 2026 (~3,000 trading days).",
    },
    {
      icon: <Layers size={20} />,
      step: "02",
      title: "VMD Signal Decomposition",
      desc: "Log-return series is decomposed into K=3 modes using VMD (alpha=2000, tau=0, DC=0, init=1, tol=1e-7) to isolate trend, mid-frequency, and high-frequency behavior.",
    },
    {
      icon: <LineChart size={20} />,
      step: "03",
      title: "Feature Engineering",
      desc: "Builds 30 model features: 14 price/technical (returns, lags, RSI, momentum, volatility) + 16 sentiment/news and EMA features. Sentiment features are lagged by 1 day to prevent leakage.",
    },
    {
      icon: <BrainCircuit size={20} />,
      step: "04",
      title: "Specialist Sub-Model Inference",
      desc: "ARIMA models trend mode, Mid-GRU learns price cycles, Sentiment-GRU fuses price and sentiment streams with attention, and XGBoost-HF captures high-frequency structure using direct multi-step prediction.",
    },
    {
      icon: <Gauge size={20} />,
      step: "05",
      title: "Stacking, Evaluation & Delivery",
      desc: "Per-horizon Ridge meta-models combine the four sub-model outputs, then forecasts are evaluated (RMSE, MAE, MAPE, USD error, directional metrics) and served to forecast, fan, analytics, and explainability views.",
    },
  ];

  return (
    <div className="mb-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
        className="mb-12"
      >
        <motion.h2
          variants={childFade}
          className="text-2xl md:text-3xl font-bold text-white font-display flex items-center gap-3"
        >
          <div className="w-1 h-8 rounded-full bg-linear-to-b from-oil-gold to-oil-amber" />
          Prediction Pipeline
        </motion.h2>
        <motion.p
          variants={childFade}
          className="text-sm text-gray-400 mt-3 max-w-3xl leading-relaxed"
        >
          Updated to reflect the documented VMD-based ensemble architecture (v10), including
          decomposition-first modeling, horizon-specific stacking, and leakage-safe sentiment usage.
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={childFade}
        className="glass rounded-xl border border-white/10 mb-8 flex flex-wrap divide-x divide-white/8"
      >
        {pipelineHighlights.map((item) => (
          <div key={item.label} className="flex-1 min-w-[140px] px-5 py-3">
            <div className="text-[10px] uppercase tracking-[0.18em] text-gray-500 mb-1">{item.label}</div>
            <div className="text-sm font-semibold text-white leading-tight">{item.value}</div>
          </div>
        ))}
      </motion.div>

      <div>
        {pipeline.map((item, index) => (
          <PipelineStep
            key={item.step}
            icon={item.icon}
            title={item.title}
            desc={item.desc}
            step={item.step}
            isLast={index === pipeline.length - 1}
            delay={index}
          />
        ))}
      </div>
    </div>
  );
};

export default PipelineSection;
