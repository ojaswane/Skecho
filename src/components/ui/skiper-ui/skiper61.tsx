"use client";

import { motion, useSpring } from "framer-motion";
import { useEffect } from "react";

const SPRING = {
  mass: 0.1,
  damping: 10,
  stiffness: 131,
};

const SpringMouseFollow = () => {
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);
  const opacity = useSpring(1, SPRING);
  const scale = useSpring(1, SPRING);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[9999]"
      style={{
        x,
        y,
        opacity,
        scale,
      }}
    >
      <div className="w-8 h-8 rounded-full bg-orange-500" />
    </motion.div>
  );
};

export { SpringMouseFollow };
