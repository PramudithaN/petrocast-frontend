import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

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

const HowItWorksSection = () => {
  const [howRef, howInView] = useInView({ triggerOnce: true, threshold: 0.1 });

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

  return (
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
                <div
                  className={`flex-1 ${
                    idx % 2 === 0 ? "md:text-right" : "md:text-left"
                  }`}
                >
                  <div
                    className={`glass p-6 rounded-2xl inline-block ${
                      idx % 2 === 0 ? "md:ml-auto" : "md:mr-auto"
                    }`}
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

                <div className="hidden md:flex items-center justify-center shrink-0">
                  <div className="w-4 h-4 rounded-full bg-oil-gold shadow-[0_0_15px_rgba(245,158,11,0.4)] border-2 border-oil-black" />
                </div>

                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
