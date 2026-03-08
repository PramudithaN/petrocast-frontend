import type { ReactNode } from "react";

interface BadgeProps {
  icon?: ReactNode;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

const Badge = ({
  icon,
  children,
  variant = "primary",
  className = "",
}: BadgeProps) => {
  const variantClasses = {
    primary:
      "border-oil-gold/20 bg-oil-gold/5 text-oil-gold hover:bg-oil-gold/10",
    secondary: "border-white/20 bg-white/5 text-white hover:bg-white/10",
  };

  return (
    <span
      className={`group inline-flex items-center gap-2 px-5 py-2 rounded-full border text-xs font-semibold tracking-widest uppercase transition-colors cursor-default ${variantClasses[variant]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
};

export default Badge;
