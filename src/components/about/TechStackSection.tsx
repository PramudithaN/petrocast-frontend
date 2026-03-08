import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Code, Cpu, Database } from "lucide-react";

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

const TechStackSection = () => {
  const [techRef, techInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const techStack = [
    {
      title: "Frontend",
      icon: <Code className="w-5 h-5 text-blue-400" />,
      color: "from-blue-500/10 to-blue-600/5",
      items: [
        "React 18 + TypeScript",
        "Tailwind CSS v4",
        "Framer Motion",
        "Recharts",
        "Vite",
      ],
    },
    {
      title: "Backend & ML",
      icon: <Cpu className="w-5 h-5 text-purple-400" />,
      color: "from-purple-500/10 to-purple-600/5",
      items: [
        "Python + FastAPI",
        "PyTorch / TensorFlow",
        "FinBERT NLP",
        "Scikit-learn",
        "VMD Decomposition",
      ],
    },
    {
      title: "Data Pipeline",
      icon: <Database className="w-5 h-5 text-emerald-400" />,
      color: "from-emerald-500/10 to-emerald-600/5",
      items: [
        "Yahoo Finance API",
        "NewsAPI Integration",
        "SQLite Database",
        "Pandas + NumPy",
        "Automated Scheduling",
      ],
    },
  ];

  return (
    <div ref={techRef} className="mb-16">
      <motion.div
        initial="hidden"
        animate={techInView ? "visible" : "hidden"}
        variants={stagger}
        className="mb-12"
      >
        <motion.h2
          variants={childFade}
          className="text-2xl md:text-3xl font-bold text-white font-display flex items-center gap-3"
        >
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-oil-blue to-oil-cyan" />
          Technical Stack
        </motion.h2>
      </motion.div>

      <motion.div
        initial="hidden"
        animate={techInView ? "visible" : "hidden"}
        variants={stagger}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {techStack.map((stack) => (
          <motion.div
            key={stack.title}
            variants={childFade}
            whileHover={{ y: -6 }}
            className="group glass p-8 rounded-3xl hover:border-oil-gold/20 transition-all duration-500 relative overflow-hidden"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stack.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/5">
                <div className="p-2.5 bg-white/5 rounded-xl">
                  {stack.icon}
                </div>
                <h3 className="text-base font-bold text-gray-100 font-display">
                  {stack.title}
                </h3>
              </div>
              <ul className="space-y-3">
                {stack.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-gray-400 text-sm font-medium"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-oil-gold/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default TechStackSection;
