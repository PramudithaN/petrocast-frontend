import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Zap, Network, Code, Layers, BrainCircuit } from "lucide-react";

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

const CapabilitiesSection = () => {
  const [capRef, capInView] = useInView({ triggerOnce: true, threshold: 0.1 });

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
  );
};

export default CapabilitiesSection;
