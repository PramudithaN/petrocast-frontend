import { motion } from "framer-motion";

interface ScrollIndicatorProps {
  text?: string;
  delay?: number;
}

const ScrollIndicator = ({ text = "Scroll", delay = 1.5 }: ScrollIndicatorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <span className="text-xs text-gray-600 uppercase tracking-widest">
        {text}
      </span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-5 h-8 rounded-full border border-gray-700 flex items-start justify-center p-1"
      >
        <div className="w-1 h-2 rounded-full bg-oil-gold/60" />
      </motion.div>
    </motion.div>
  );
};

export default ScrollIndicator;
