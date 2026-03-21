import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";
import { TrendingUp, Database, LineChart, BrainCircuit } from "lucide-react";
import type { ReactNode } from "react";

const MetricCard = ({
  label,
  value,
  suffix,
  icon,
}: {
  label: string;
  value: number;
  suffix: string;
  icon: ReactNode;
}) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.5 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="glass p-6 rounded-2xl text-center group hover:border-oil-gold/20 transition-all duration-500"
    >
      <div className="p-3 rounded-xl bg-oil-gold/5 w-fit mx-auto mb-4 text-oil-gold group-hover:bg-oil-gold/10 transition-colors">
        {icon}
      </div>
      <div className="text-3xl font-bold font-display text-gradient-gold mb-1">
        {inView ? (
          <CountUp end={value} duration={2} suffix={suffix} />
        ) : (
          `0${suffix}`
        )}
      </div>
      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
};

const MetricsSection = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
      <MetricCard
        label="Forecast Days"
        value={5}
        suffix=""
        icon={<TrendingUp size={20} />}
      />
      <MetricCard
        label="Data Features"
        value={20}
        suffix="+"
        icon={<Database size={20} />}
      />
      <MetricCard
        label="Historical Years"
        value={10}
        suffix="+"
        icon={<LineChart size={20} />}
      />
      <MetricCard
        label="Models Ensemble"
        value={3}
        suffix=""
        icon={<BrainCircuit size={20} />}
      />
    </div>
  );
};

export default MetricsSection;
