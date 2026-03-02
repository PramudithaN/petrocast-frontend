import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import {
  AreaChart,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Zap,
  Users,
  Landmark,
  BarChart3,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";
import { useRef } from "react";

/* ─── animation helpers ─── */
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay },
  },
});

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const childFade = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

/* ─── floating particle ─── */
const Particle = ({
  size,
  x,
  y,
  delay,
}: {
  size: number;
  x: string;
  y: string;
  delay: number;
}) => (
  <motion.div
    className="absolute rounded-full bg-oil-gold/20"
    style={{ width: size, height: size, left: x, top: y }}
    animate={{
      y: [0, -30, 0],
      opacity: [0.2, 0.6, 0.2],
      scale: [1, 1.2, 1],
    }}
    transition={{
      duration: 4 + delay,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  />
);

/* ─── stat counter ─── */
const StatCard = ({
  value,
  suffix,
  label,
  delay,
}: {
  value: number;
  suffix: string;
  label: string;
  delay: number;
}) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp(delay * 0.15)}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-bold font-display text-gradient-gold mb-2">
        {inView ? (
          <CountUp end={value} duration={2.5} suffix={suffix} />
        ) : (
          `0${suffix}`
        )}
      </div>
      <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
};

const Home = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

  const [featRef, featInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const [howRef, howInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [audienceRef, audienceInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      icon: <TrendingUp size={24} />,
      title: "Precision Forecasting",
      desc: "LSTM and Transformer models trained on decades of Brent crude historical data, delivering multi-day price projections.",
      color: "from-amber-500/20 to-amber-600/5",
    },
    {
      icon: <AreaChart size={24} />,
      title: "Real-time Analytics",
      desc: "Live market data integration with Yahoo Finance API, providing instant model inference updates.",
      color: "from-blue-500/20 to-blue-600/5",
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Institutional Grade",
      desc: "Robust infrastructure with sentiment analysis, VMD decomposition, and ensemble predictions.",
      color: "from-emerald-500/20 to-emerald-600/5",
    },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Data Collection",
      desc: "Historical prices, macroeconomic indicators, and news sentiment gathered from multiple sources.",
    },
    {
      step: "02",
      title: "Feature Engineering",
      desc: "VMD decomposition, technical indicators, and NLP-based sentiment scoring applied.",
    },
    {
      step: "03",
      title: "Model Inference",
      desc: "Ensemble of LSTM and Transformer models generate multi-horizon forecasts.",
    },
    {
      step: "04",
      title: "Forecast Delivery",
      desc: "Predictions served via API with confidence metrics and visual analytics.",
    },
  ];

  const audiences = [
    {
      icon: <Users size={28} />,
      title: "Researchers",
      desc: "Access detailed methodology, model architecture, and performance metrics for academic analysis.",
      link: "/about",
      linkText: "View Methodology",
    },
    {
      icon: <Landmark size={28} />,
      title: "Policymakers",
      desc: "Data-driven insights for energy policy decisions with multi-day forecast horizons.",
      link: "/dashboard",
      linkText: "View Dashboard",
    },
    {
      icon: <BarChart3 size={28} />,
      title: "Investors",
      desc: "Actionable price forecasts with trend analysis to support strategic investment decisions.",
      link: "/dashboard",
      linkText: "See Forecasts",
    },
  ];

  return (
    <div className="relative bg-oil-black overflow-hidden">
      {/* ── Hero Section ── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 lg:px-10"
      >
        {/* Background Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />

        {/* Radial Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-oil-gold/8 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-oil-blue/5 blur-[120px] rounded-full pointer-events-none" />

        {/* Floating Particles */}
        <Particle size={6} x="15%" y="25%" delay={0} />
        <Particle size={4} x="80%" y="20%" delay={1.5} />
        <Particle size={8} x="70%" y="60%" delay={0.8} />
        <Particle size={5} x="25%" y="70%" delay={2} />
        <Particle size={3} x="90%" y="45%" delay={1} />
        <Particle size={7} x="10%" y="50%" delay={0.5} />
        <Particle size={4} x="55%" y="15%" delay={1.8} />

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 text-center max-w-5xl mx-auto w-full pt-24"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex justify-center"
          >
            <span className="group px-5 py-2 rounded-full border border-oil-gold/20 bg-oil-gold/5 text-oil-gold text-xs font-semibold tracking-widest uppercase flex items-center gap-2 hover:bg-oil-gold/10 transition-colors cursor-default">
              <Sparkles size={14} className="animate-pulse" />
              AI-Powered Financial Intelligence
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight leading-[1.05] font-display"
          >
            <span className="text-gradient-white">Predict the Future of</span>
            <br />
            <span className="text-gradient-gold">Crude Oil Markets</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Leverage advanced deep learning and NLP-driven sentiment analysis to
            forecast Brent Crude Oil prices. Built for researchers,
            policymakers, and strategic investors.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/dashboard">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-8 py-4 bg-gradient-to-r from-oil-gold to-oil-amber text-oil-black font-bold text-base rounded-2xl transition-all glow-amber hover:glow-amber-strong flex items-center gap-2.5"
              >
                Launch Dashboard
                <TrendingUp size={20} />
              </motion.button>
            </Link>
            <Link to="/about">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-8 py-4 glass hover:bg-white/10 text-white font-medium text-base rounded-2xl transition-all flex items-center gap-2.5"
              >
                Learn Methodology
                <ArrowRight size={20} />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-gray-600 uppercase tracking-widest">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border border-gray-700 flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 rounded-full bg-oil-gold/60" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats Section ── */}
      <section className="py-20 px-4 sm:px-6 md:px-8 lg:px-10 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-oil-black via-oil-dark/50 to-oil-black" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <StatCard
              value={5}
              suffix="-Day"
              label="Forecast Horizon"
              delay={0}
            />
            <StatCard value={3} suffix="+" label="AI Models" delay={1} />
            <StatCard value={10} suffix="+" label="Years of Data" delay={2} />
            <StatCard value={99} suffix="%" label="Uptime" delay={3} />
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section
        ref={featRef}
        className="py-24 px-4 sm:px-6 md:px-8 lg:px-10 relative"
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            animate={featInView ? "visible" : "hidden"}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p
              variants={childFade}
              className="text-oil-gold text-sm font-semibold uppercase tracking-widest mb-3"
            >
              Why OilCheck
            </motion.p>
            <motion.h2
              variants={childFade}
              className="text-3xl md:text-4xl font-bold font-display text-white mb-4"
            >
              Institutional-Grade Forecasting
            </motion.h2>
            <motion.p
              variants={childFade}
              className="text-gray-400 max-w-xl mx-auto"
            >
              Powered by state-of-the-art deep learning models and real-time
              data pipelines.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={featInView ? "visible" : "hidden"}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={childFade}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative p-8 rounded-3xl glass hover:border-oil-gold/30 transition-all duration-500 cursor-default"
              >
                <div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <div className="relative z-10">
                  <div className="mb-6 p-3.5 rounded-2xl bg-white/5 w-fit text-oil-gold group-hover:bg-oil-gold/10 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-white font-display">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        ref={howRef}
        className="py-24 px-4 sm:px-6 md:px-8 lg:px-10 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-oil-black via-oil-dark/30 to-oil-black" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            animate={howInView ? "visible" : "hidden"}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p
              variants={childFade}
              className="text-oil-gold text-sm font-semibold uppercase tracking-widest mb-3"
            >
              Process
            </motion.p>
            <motion.h2
              variants={childFade}
              className="text-3xl md:text-4xl font-bold font-display text-white mb-4"
            >
              How It Works
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={howInView ? "visible" : "hidden"}
            variants={stagger}
            className="relative"
          >
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-oil-gold/30 via-oil-gold/10 to-transparent" />

            <div className="space-y-8 md:space-y-0">
              {howItWorks.map((item, idx) => (
                <motion.div
                  key={item.step}
                  variants={childFade}
                  className={`relative md:flex items-center gap-8 md:mb-12 ${
                    idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Content */}
                  <div
                    className={`flex-1 ${idx % 2 === 0 ? "md:text-right" : "md:text-left"}`}
                  >
                    <div
                      className={`glass p-6 rounded-2xl inline-block ${idx % 2 === 0 ? "md:ml-auto" : "md:mr-auto"}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-oil-gold font-display font-bold text-lg">
                          {item.step}
                        </span>
                        <h3 className="text-white font-bold">{item.title}</h3>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {/* Timeline dot */}
                  <div className="hidden md:flex items-center justify-center shrink-0">
                    <div className="w-4 h-4 rounded-full bg-oil-gold shadow-[0_0_15px_rgba(245,158,11,0.4)] border-2 border-oil-black" />
                  </div>

                  {/* Spacer */}
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Audience Section ── */}
      <section
        ref={audienceRef}
        className="py-24 px-4 sm:px-6 md:px-8 lg:px-10 relative"
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            animate={audienceInView ? "visible" : "hidden"}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p
              variants={childFade}
              className="text-oil-gold text-sm font-semibold uppercase tracking-widest mb-3"
            >
              Built For
            </motion.p>
            <motion.h2
              variants={childFade}
              className="text-3xl md:text-4xl font-bold font-display text-white mb-4"
            >
              Who Is This For?
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={audienceInView ? "visible" : "hidden"}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {audiences.map((item) => (
              <motion.div
                key={item.title}
                variants={childFade}
                whileHover={{ y: -6 }}
                className="group glass p-8 rounded-3xl hover:border-oil-gold/20 transition-all duration-500"
              >
                <div className="mb-6 p-4 rounded-2xl bg-oil-gold/5 w-fit text-oil-gold group-hover:bg-oil-gold/10 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-display">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  {item.desc}
                </p>
                <Link
                  to={item.link}
                  className="inline-flex items-center gap-1.5 text-oil-gold text-sm font-semibold group-hover:gap-2.5 transition-all"
                >
                  {item.linkText}
                  <ChevronRight size={16} />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-24 px-4 sm:px-6 md:px-8 lg:px-10 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-oil-dark/50 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <div className="glass p-12 md:p-16 rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-oil-gold/5 to-transparent" />
            <div className="relative z-10">
              <Zap size={32} className="text-oil-gold mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">
                Ready to Explore the Forecasts?
              </h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Access live predictions powered by our ensemble of deep learning
                models.
              </p>
              <Link to="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-10 py-4 bg-gradient-to-r from-oil-gold to-oil-amber text-oil-black font-bold text-base rounded-2xl glow-amber hover:glow-amber-strong transition-all flex items-center gap-2.5 mx-auto"
                >
                  Open Dashboard
                  <ArrowRight size={20} />
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
