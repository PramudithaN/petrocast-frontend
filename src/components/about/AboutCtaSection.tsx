import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedButton from "../ui/AnimatedButton";

const AboutCtaSection = () => {
  return (
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
          Explore live multi-day forecasts powered by this prediction pipeline.
        </p>
        <Link to="/dashboard">
          <AnimatedButton variant="primary" className="px-8 py-3.5 rounded-xl text-sm mx-auto">
            Open Dashboard
            <ArrowRight size={18} />
          </AnimatedButton>
        </Link>
      </div>
    </motion.div>
  );
};

export default AboutCtaSection;
