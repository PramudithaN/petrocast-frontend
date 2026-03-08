interface GlowEffectProps {
  color: "gold" | "blue" | "amber" | "green";
  size?: "sm" | "md" | "lg" | "xl";
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  blur?: number;
  opacity?: number;
}

const GlowEffect = ({
  color,
  size = "lg",
  position,
  blur = 150,
  opacity = 8,
}: GlowEffectProps) => {
  const sizeClasses = {
    sm: "w-48 h-48",
    md: "w-72 h-72",
    lg: "w-96 h-96",
    xl: "w-[600px] h-[600px]",
  };

  const colorClasses = {
    gold: `bg-oil-gold/${opacity}`,
    blue: `bg-oil-blue/${opacity}`,
    amber: `bg-oil-amber/${opacity}`,
    green: `bg-oil-green/${opacity}`,
  };

  const positionStyles: React.CSSProperties = {
    top: position.top,
    bottom: position.bottom,
    left: position.left,
    right: position.right,
  };

  return (
    <div
      className={`absolute ${sizeClasses[size]} ${colorClasses[color]} blur-[${blur}px] rounded-full pointer-events-none`}
      style={positionStyles}
    />
  );
};

export default GlowEffect;
