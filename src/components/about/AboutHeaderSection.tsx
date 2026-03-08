import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { TrendingUp } from "lucide-react";

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

const AboutHeaderSection = () => {
  const [headerRef, headerInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
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
        A comprehensive overview of the machine learning pipeline powering our
        Brent crude oil price forecasting system.
      </motion.p>
    </motion.div>
  );
};

export default AboutHeaderSection;
