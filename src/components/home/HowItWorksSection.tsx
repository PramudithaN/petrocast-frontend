import { motion } from "framer-motion";
import { useState } from "react";
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
  const [imageError, setImageError] = useState(false);

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
          variants={childFade}
          className="glass rounded-2xl p-4 md:p-6"
        >
          {imageError ? (
            <div className="w-full min-h-28 rounded-xl border border-oil-gold/20 bg-oil-black/50 flex items-center justify-center px-4 text-center text-sm text-gray-300">
              Add your GIF to public/petrocast_animation.gif to display the workflow animation.
            </div>
          ) : (
            <img
              src="/petrocast_animation.gif"
              alt="Ensemble Forecast Pipeline"
              className="w-full rounded-xl"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
