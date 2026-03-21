import { motion } from "framer-motion";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay },
  },
});

const StatCard = ({
  value,
  suffix,
  label,
  delay,
}: {
  value: number;
  suffix: string;
  label: string;
  delay: number;
}) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp(delay * 0.15)}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-bold font-display text-gradient-gold mb-2">
        {inView ? (
          <CountUp end={value} duration={2.5} suffix={suffix} />
        ) : (
          `0${suffix}`
        )}
      </div>
      <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
};

const StatsSection = () => {
  return (
    <section className="py-20 px-4 sm:px-6 md:px-8 lg:px-10 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-oil-black via-oil-dark/50 to-oil-black" />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <StatCard value={5} suffix="-Day" label="Forecast Horizon" delay={0} />
          <StatCard value={3} suffix="+" label="AI Models" delay={1} />
          <StatCard value={10} suffix="+" label="Years of Data" delay={2} />
          <StatCard value={99} suffix="%" label="Uptime" delay={3} />
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
