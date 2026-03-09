import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { AreaChart, TrendingUp, ShieldCheck } from "lucide-react";
import BackgroundGrid from "../ui/BackgroundGrid";

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

const FeaturesSection = () => {
  const [featRef, featInView] = useInView({
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

  return (
    <section
      ref={featRef}
      className="py-24 px-4 sm:px-6 md:px-8 lg:px-10 relative"
    >
      <BackgroundGrid opacity={20} />
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
            Why PetroCast
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
            Powered by state-of-the-art deep learning models and real-time data
            pipelines.
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
  );
};

export default FeaturesSection;
