interface BackgroundGridProps {
  opacity?: number;
  className?: string;
}

const BackgroundGrid = ({ opacity = 40, className = "" }: BackgroundGridProps) => {
  return (
    <div
      className={`absolute inset-0 bg-grid-pattern ${className}`}
      style={{ opacity: opacity / 100 }}
    />
  );
};

export default BackgroundGrid;
