import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Code, Cpu, Database } from "lucide-react";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const childFade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const techStack = [
  {
    title: "Frontend",
    icon: <Code className="w-4 h-4" />,
    accent: "#3b82f6",
    accentFaint: "rgba(59,130,246,0.08)",
    hoverBorder: "hover:border-blue-500/30",
    badges: [
      { label: "React 18", sub: "TypeScript" },
      { label: "Tailwind CSS", sub: "v4" },
      { label: "Framer Motion", sub: "animation" },
      { label: "Recharts", sub: "visualisation" },
      { label: "Vite", sub: "build" },
      { label: "Ant Design", sub: "components" },
    ],
  },
  {
    title: "Backend & ML",
    icon: <Cpu className="w-4 h-4" />,
    accent: "#a78bfa",
    accentFaint: "rgba(167,139,250,0.08)",
    hoverBorder: "hover:border-violet-400/30",
    badges: [
      { label: "Python", sub: "FastAPI" },
      { label: "PyTorch", sub: "deep learning" },
      { label: "FinBERT", sub: "NLP sentiment" },
      { label: "Scikit-learn", sub: "Ridge stacking" },
      { label: "XGBoost", sub: "HF model" },
      { label: "VMD", sub: "decomposition" },
    ],
  },
  {
    title: "Data Sources",
    icon: <Database className="w-4 h-4" />,
    accent: "#10b981",
    accentFaint: "rgba(16,185,129,0.08)",
    hoverBorder: "hover:border-emerald-400/30",
    badges: [
      { label: "Yahoo Finance", sub: "price history" },
      { label: "OilPrice.com", sub: "market data" },
      { label: "Trading Economics", sub: "macro signals" },
      { label: "BOE Reports", sub: "inflation data" },
      { label: "FT.com", sub: "news articles" },
      { label: "SQLite", sub: "storage · Pandas" },
    ],
  },
];

const TechStackSection = () => {
  const [techRef, techInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div ref={techRef} className="mb-16">
      <motion.div
        initial="hidden"
        animate={techInView ? "visible" : "hidden"}
        variants={stagger}
        className="mb-10"
      >
        <motion.h2
          variants={childFade}
          className="text-2xl md:text-3xl font-bold text-white font-display flex items-center gap-3"
        >
          <div className="w-1 h-8 rounded-full bg-linear-to-b from-oil-blue to-oil-cyan" />
          Technical Stack
        </motion.h2>
      </motion.div>

      <motion.div
        initial="hidden"
        animate={techInView ? "visible" : "hidden"}
        variants={stagger}
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {techStack.map((stack) => (
          <motion.div
            key={stack.title}
            variants={childFade}
            whileHover={{ y: -4 }}
            className={`group glass rounded-2xl border border-white/10 ${stack.hoverBorder} transition-all duration-400 overflow-hidden`}
          >
            {/* coloured top accent bar */}
            <div className="h-[3px] w-full" style={{ background: stack.accent }} />

            <div className="p-6">
              {/* header */}
              <div className="flex items-center gap-2.5 mb-5">
                <div
                  className="p-2 rounded-lg"
                  style={{ background: stack.accentFaint, color: stack.accent }}
                >
                  {stack.icon}
                </div>
                <h3 className="text-sm font-bold text-white font-display tracking-wide">
                  {stack.title}
                </h3>
              </div>

              {/* badge grid */}
              <div className="flex flex-wrap gap-2">
                {stack.badges.map((b) => (
                  <motion.div
                    key={b.label}
                    whileHover={{ scale: 1.04 }}
                    className="flex flex-col px-3 py-1.5 rounded-lg border border-white/8 bg-white/3 cursor-default"
                  >
                    <span className="text-[12px] font-semibold text-gray-100 leading-tight">
                      {b.label}
                    </span>
                    <span className="text-[10px] text-gray-500 leading-tight mt-0.5">
                      {b.sub}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default TechStackSection;
