import { motion } from "framer-motion";

interface ParticleProps {
  size: number;
  x: string;
  y: string;
  delay?: number;
  duration?: number;
  color?: string;
}

const Particle = ({
  size,
  x,
  y,
  delay = 0,
  duration = 4,
  color = "bg-oil-gold/20",
}: ParticleProps) => {
  return (
    <motion.div
      className={`absolute rounded-full ${color}`}
      style={{ width: size, height: size, left: x, top: y }}
      animate={{
        y: [0, -30, 0],
        opacity: [0.2, 0.6, 0.2],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: duration + delay,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
};

export default Particle;
