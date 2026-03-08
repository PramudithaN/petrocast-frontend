import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import Particle from "../ui/Particle";
import BackgroundGrid from "../ui/BackgroundGrid";
import GlowEffect from "../ui/GlowEffect";
import Badge from "../ui/Badge";
import AnimatedButton from "../ui/AnimatedButton";
import ScrollIndicator from "../ui/ScrollIndicator";

const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 lg:px-10"
    >
      <BackgroundGrid opacity={40} />
      <GlowEffect
        color="gold"
        size="xl"
        position={{ top: "33.33%", left: "50%" }}
        blur={150}
        opacity={8}
      />
      <GlowEffect
        color="blue"
        size="md"
        position={{ bottom: "0", left: "0" }}
        blur={120}
        opacity={5}
      />

      <Particle size={6} x="15%" y="25%" delay={0} />
      <Particle size={4} x="80%" y="20%" delay={1.5} />
      <Particle size={8} x="70%" y="60%" delay={0.8} />
      <Particle size={5} x="25%" y="70%" delay={2} />
      <Particle size={3} x="90%" y="45%" delay={1} />
      <Particle size={7} x="10%" y="50%" delay={0.5} />
      <Particle size={4} x="55%" y="15%" delay={1.8} />

      <motion.div
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative z-10 text-center max-w-5xl mx-auto w-full pt-24"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex justify-center"
        >
          <Badge
            variant="primary"
            icon={<Sparkles size={14} className="animate-pulse" />}
          >
            AI-Powered Financial Intelligence
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight leading-[1.05] font-display"
        >
          <span className="text-gradient-white">Predict the Future of</span>
          <br />
          <span className="text-gradient-gold">Crude Oil Markets</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Leverage advanced deep learning and NLP-driven sentiment analysis to
          forecast Brent Crude Oil prices. Built for researchers, policymakers,
          and strategic investors.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link to="/dashboard">
            <AnimatedButton variant="primary">
              Launch Dashboard
              <TrendingUp size={20} />
            </AnimatedButton>
          </Link>
          <Link to="/about">
            <AnimatedButton variant="secondary">
              Learn Methodology
              <ArrowRight size={20} />
            </AnimatedButton>
          </Link>
        </motion.div>
      </motion.div>

      <ScrollIndicator text="Scroll" delay={1.5} />
    </section>
  );
};

export default HeroSection;
