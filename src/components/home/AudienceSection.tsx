import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import { Users, Landmark, BarChart3, ChevronRight } from "lucide-react";
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

const AudienceSection = () => {
  const [audienceRef, audienceInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const audiences = [
    {
      icon: <Users size={28} />,
      title: "Researchers",
      desc: "Access detailed methodology, model architecture, and performance metrics for academic analysis.",
      link: "/about",
      linkText: "View Methodology",
    },
    {
      icon: <Landmark size={28} />,
      title: "Policymakers",
      desc: "Data-driven insights for energy policy decisions with multi-day forecast horizons.",
      link: "/dashboard",
      linkText: "View Dashboard",
    },
    {
      icon: <BarChart3 size={28} />,
      title: "Investors",
      desc: "Actionable price forecasts with trend analysis to support strategic investment decisions.",
      link: "/dashboard",
      linkText: "See Forecasts",
    },
  ];

  return (
    <section ref={audienceRef} className="py-24 px-4 sm:px-6 md:px-8 lg:px-10 relative">
      <BackgroundGrid opacity={20} />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          animate={audienceInView ? "visible" : "hidden"}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.p
            variants={childFade}
            className="text-oil-gold text-sm font-semibold uppercase tracking-widest mb-3"
          >
            Built For
          </motion.p>
          <motion.h2
            variants={childFade}
            className="text-3xl md:text-4xl font-bold font-display text-white mb-4"
          >
            Who Is This For?
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={audienceInView ? "visible" : "hidden"}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {audiences.map((item) => (
            <motion.div
              key={item.title}
              variants={childFade}
              whileHover={{ y: -6 }}
              className="group glass p-8 rounded-3xl hover:border-oil-gold/20 transition-all duration-500"
            >
              <div className="mb-6 p-4 rounded-2xl bg-oil-gold/5 w-fit text-oil-gold group-hover:bg-oil-gold/10 transition-colors">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 font-display">
                {item.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {item.desc}
              </p>
              <Link
                to={item.link}
                className="inline-flex items-center gap-1.5 text-oil-gold text-sm font-semibold group-hover:gap-2.5 transition-all"
              >
                {item.linkText}
                <ChevronRight size={16} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AudienceSection;
