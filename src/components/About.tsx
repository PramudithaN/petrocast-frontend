import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Zap,
  Code,
  Network,
  TrendingUp,
  Database,
  Cpu,
  Layers,
  ArrowRight,
  BrainCircuit,
  LineChart,
  Newspaper,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import CountUp from "react-countup";

/* ─── animation helpers ─── */
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

/* ─── Pipeline Step ─── */
const PipelineStep = ({
  icon,
  title,
  desc,
  step,
  isLast,
  delay,
}: {
  icon: React.ReactNode;
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
      {/* Timeline */}
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

      {/* Content */}
      <div className="pb-10">
        <span className="text-oil-gold/60 text-xs font-semibold uppercase tracking-widest mb-1 block">
          Step {step}
        </span>
        <h3 className="text-lg font-bold text-white mb-2 font-display">
          {title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed max-w-md">{desc}</p>
      </div>
    </motion.div>
  );
};

/* ─── Metric Card ─── */
const MetricCard = ({
  label,
  value,
  suffix,
  icon,
}: {
  label: string;
  value: number;
  suffix: string;
  icon: React.ReactNode;
}) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.5 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="glass p-6 rounded-2xl text-center group hover:border-oil-gold/20 transition-all duration-500"
    >
      <div className="p-3 rounded-xl bg-oil-gold/5 w-fit mx-auto mb-4 text-oil-gold group-hover:bg-oil-gold/10 transition-colors">
        {icon}
      </div>
      <div className="text-3xl font-bold font-display text-gradient-gold mb-1">
        {inView ? (
          <CountUp end={value} duration={2} suffix={suffix} />
        ) : (
          `0${suffix}`
        )}
      </div>
      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
};

const About = () => {
  const [headerRef, headerInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const [techRef, techInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const [capRef, capInView] = useInView({ triggerOnce: true, threshold: 0.1 });

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

  const techStack = [
    {
      title: "Frontend",
      icon: <Code className="w-5 h-5 text-blue-400" />,
      color: "from-blue-500/10 to-blue-600/5",
      items: [
        "React 18 + TypeScript",
        "Tailwind CSS v4",
        "Framer Motion",
        "Recharts",
        "Vite",
      ],
    },
    {
      title: "Backend & ML",
      icon: <Cpu className="w-5 h-5 text-purple-400" />,
      color: "from-purple-500/10 to-purple-600/5",
      items: [
        "Python + FastAPI",
        "PyTorch / TensorFlow",
        "FinBERT NLP",
        "Scikit-learn",
        "VMD Decomposition",
      ],
    },
    {
      title: "Data Pipeline",
      icon: <Database className="w-5 h-5 text-emerald-400" />,
      color: "from-emerald-500/10 to-emerald-600/5",
      items: [
        "Yahoo Finance API",
        "NewsAPI Integration",
        "SQLite Database",
        "Pandas + NumPy",
        "Automated Scheduling",
      ],
    },
  ];

  const capabilities = [
    {
      icon: <Zap className="text-amber-400" size={20} />,
      text: "React 18+ with TypeScript",
      desc: "Modern, type-safe frontend with strict typing.",
    },
    {
      icon: <Zap className="text-amber-400" size={20} />,
      text: "Vite Build System",
      desc: "Sub-second HMR and optimized production builds.",
    },
    {
      icon: <Network className="text-blue-400" size={20} />,
      text: "React Router v6",
      desc: "Seamless client-side routing and navigation.",
    },
    {
      icon: <Code className="text-emerald-400" size={20} />,
      text: "Modern Design Stack",
      desc: "Tailwind CSS, Framer Motion, glassmorphism.",
    },
    {
      icon: <Layers className="text-pink-400" size={20} />,
      text: "Recharts Visualization",
      desc: "Interactive, responsive financial charts.",
    },
    {
      icon: <BrainCircuit className="text-purple-400" size={20} />,
      text: "FinBERT Integration",
      desc: "Financial domain NLP for market sentiment.",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 md:px-8 lg:px-10 relative overflow-hidden bg-oil-black">
      {/* Background effects */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-oil-gold/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-oil-blue/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
          variants={stagger}
          className="text-center mb-20 pt-4"
        >
          <motion.div
            variants={childFade}
            className="inline-flex p-4 rounded-2xl bg-oil-gold/5 border border-oil-gold/10 mb-8"
          >
            <TrendingUp size={32} className="text-oil-gold" />
          </motion.div>
          <motion.h1
            variants={childFade}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white font-display"
          >
            Project Methodology
          </motion.h1>
          <motion.p
            variants={childFade}
            className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            A comprehensive overview of the machine learning pipeline powering
            our Brent crude oil price forecasting system.
          </motion.p>
        </motion.div>

        {/* Model Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          <MetricCard
            label="Forecast Days"
            value={5}
            suffix=""
            icon={<TrendingUp size={20} />}
          />
          <MetricCard
            label="Data Features"
            value={15}
            suffix="+"
            icon={<Database size={20} />}
          />
          <MetricCard
            label="Historical Years"
            value={10}
            suffix="+"
            icon={<LineChart size={20} />}
          />
          <MetricCard
            label="Models Ensemble"
            value={3}
            suffix=""
            icon={<BrainCircuit size={20} />}
          />
        </div>

        {/* Pipeline Section */}
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
            {pipeline.map((item) => (
              <PipelineStep
                key={item.step}
                icon={item.icon}
                title={item.title}
                desc={item.desc}
                step={item.step}
                isLast={pipeline.indexOf(item) === pipeline.length - 1}
                delay={pipeline.indexOf(item)}
              />
            ))}
          </div>
        </div>

        {/* Capabilities Grid */}
        <div ref={capRef} className="mb-20">
          <motion.div
            initial="hidden"
            animate={capInView ? "visible" : "hidden"}
            variants={stagger}
            className="mb-12"
          >
            <motion.h2
              variants={childFade}
              className="text-2xl md:text-3xl font-bold text-white font-display flex items-center gap-3"
            >
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-oil-gold to-oil-amber" />
              Core Capabilities
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={capInView ? "visible" : "hidden"}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {capabilities.map((item) => (
              <motion.div
                key={item.text}
                variants={childFade}
                whileHover={{ scale: 1.02 }}
                className="group glass p-6 rounded-2xl hover:border-oil-gold/20 transition-all duration-500"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-white/5 group-hover:bg-oil-gold/10 transition-colors shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-100 mb-1 group-hover:text-oil-gold transition-colors">
                      {item.text}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Tech Stack Cards */}
        <div ref={techRef} className="mb-16">
          <motion.div
            initial="hidden"
            animate={techInView ? "visible" : "hidden"}
            variants={stagger}
            className="mb-12"
          >
            <motion.h2
              variants={childFade}
              className="text-2xl md:text-3xl font-bold text-white font-display flex items-center gap-3"
            >
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-oil-blue to-oil-cyan" />
              Technical Stack
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={techInView ? "visible" : "hidden"}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {techStack.map((stack) => (
              <motion.div
                key={stack.title}
                variants={childFade}
                whileHover={{ y: -6 }}
                className="group glass p-8 rounded-3xl hover:border-oil-gold/20 transition-all duration-500 relative overflow-hidden"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stack.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/5">
                    <div className="p-2.5 bg-white/5 rounded-xl">
                      {stack.icon}
                    </div>
                    <h3 className="text-base font-bold text-gray-100 font-display">
                      {stack.title}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {stack.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-3 text-gray-400 text-sm font-medium"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-oil-gold/60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center glass p-10 rounded-3xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-oil-gold/5 to-transparent" />
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-4 font-display">
              See the Models in Action
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm">
              Explore live multi-day forecasts powered by this prediction
              pipeline.
            </p>
            <Link to="/dashboard">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-8 py-3.5 bg-gradient-to-r from-oil-gold to-oil-amber text-oil-black font-bold rounded-xl glow-amber hover:glow-amber-strong transition-all flex items-center gap-2 mx-auto text-sm"
              >
                Open Dashboard
                <ArrowRight size={18} />
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Footer note */}
        <div className="text-center mt-12 pt-8 border-t border-white/5">
          <p className="text-gray-600 text-xs">
            Developed for{" "}
            <span className="text-oil-gold">Final Year Research Project</span> ·
            2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
