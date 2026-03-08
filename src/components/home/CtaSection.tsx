import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedButton from "../ui/AnimatedButton";

const CtaSection = () => {
  return (
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
              <AnimatedButton variant="primary" className="mx-auto">
                Open Dashboard
                <ArrowRight size={20} />
              </AnimatedButton>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CtaSection;
