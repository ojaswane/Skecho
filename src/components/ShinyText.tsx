import React from "react";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 2,
  className = "",
}) => {
  const animationDuration = `${speed}s`;

  return (
    <div
      className={`inline-block text-transparent bg-clip-text font-semibold ${
        disabled ? "" : "animate-shine"
      } ${className}`}
      style={{
        backgroundImage: "linear-gradient(to right, #000 40%, #fff 50%, #000 60%)",
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        animationDuration,
      }}
    >
      {text}
    </div>
  );
};

export default ShinyText;
