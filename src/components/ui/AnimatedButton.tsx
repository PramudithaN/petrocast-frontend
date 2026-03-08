import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  hoverScale?: number;
  tapScale?: number;
}

const AnimatedButton = ({
  children,
  variant = "primary",
  onClick,
  type = "button",
  className = "",
  disabled = false,
  hoverScale = 1.04,
  tapScale = 0.96,
}: AnimatedButtonProps) => {
  const variantClasses = {
    primary:
      "px-8 py-4 bg-gradient-to-r from-oil-gold to-oil-amber text-oil-black font-bold text-base rounded-2xl glow-amber hover:glow-amber-strong",
    secondary:
      "px-8 py-4 glass hover:bg-white/10 text-white font-medium text-base rounded-2xl",
    ghost:
      "px-6 py-3 glass hover:border-oil-gold/30 text-white font-medium text-sm rounded-xl",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : hoverScale }}
      whileTap={{ scale: disabled ? 1 : tapScale }}
      className={`transition-all flex items-center gap-2.5 ${variantClasses[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;
