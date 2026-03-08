import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Database,
  Newspaper,
  LineChart,
  BrainCircuit,
  BarChart3,
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
      className="flex items-start gap-4 relative"
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
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-oil-gold/20 to-oil-amber/10 border border-oil-gold/20 flex items-center justify-center text-oil-gold z-10"
        >
          {icon}
        </motion.div>
        {!isLast && (
          <motion.div
            initial={{ height: 0 }}
            animate={inView ? { height: "100%" } : { height: 0 }}
            transition={{ delay: delay * 0.1 + 0.4, duration: 0.5 }}
            className="w-px bg-gradient-to-b from-oil-gold/30 to-transparent flex-1 mt-2"
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
  const pipeline = [
    {
      icon: <Database size={20} />,
      step: "01",
      title: "Data Collection & Storage",
      desc: "Historical Brent crude prices from Yahoo Finance, macroeconomic indicators, and real-time news articles are collected and stored in a structured SQLite database.",
    },
    {
      icon: <Newspaper size={20} />,
      step: "02",
      title: "NLP Sentiment Analysis",
      desc: "News articles are processed through FinBERT, a financial domain-specific transformer, to extract sentiment scores with temporal decay weighting.",
    },
    {
      icon: <LineChart size={20} />,
      step: "03",
      title: "VMD Signal Decomposition",
      desc: "Variational Mode Decomposition separates the log-return series into trend, mid-frequency, and high-frequency components for targeted modeling.",
    },
    {
      icon: <BrainCircuit size={20} />,
      step: "04",
      title: "Deep Learning Ensemble",
      desc: "Component-specific LSTM and Transformer models generate predictions, which are combined and inverse-transformed to produce final price forecasts.",
    },
    {
      icon: <BarChart3 size={20} />,
      step: "05",
      title: "Forecast Delivery",
      desc: "Multi-horizon price predictions are served via a FastAPI backend with interactive visualizations and detailed analytics for end users.",
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
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-oil-gold to-oil-amber" />
          Prediction Pipeline
        </motion.h2>
      </motion.div>

      <div className="pl-2">
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
