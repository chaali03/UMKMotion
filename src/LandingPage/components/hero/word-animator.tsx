"use client";
import { cn } from "../../../lib/utils";
import { AnimatePresence, motion } from "motion/react";
import React from "react";

interface WordAnimatorProps {
  words: string[];
  duration?: number;
  className?: string;
}

const WordAnimator: React.FC<WordAnimatorProps> = ({
  words,
  duration = 2,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, duration * 1000);

    return () => clearInterval(interval);
  }, [words.length, duration]);

  return (
    <span
      style={{
        display: "inline-block",
        position: "relative",
        verticalAlign: "bottom",
      }}
      className={cn(" text-center overflow-visible border rounded-md leading-[1.35] pb-[4px] ", className)}
    >
      <span className="absolute top-0 left-0 w-full h-full content-[''] z-10 pointer-events-none bg-[radial-gradient(circle,rgba(0,0,0,0.2)_1px,transparent_1px)] [background-size:8px_8px] opacity-10"></span>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={currentIndex}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{
            duration: 0.5,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          style={{
            position: "absolute",
            display: "block",
            left: 0,
            right: 0,
          }}
          className="bg-gradient-to-t w-full from-[#ffa34d] to-[#ff5a00] bg-clip-text text-transparent leading-[1.35] pb-[4px]"
        >
          {words[currentIndex]}
        </motion.span>
      </AnimatePresence>
      <span style={{ visibility: "hidden" }} className="leading-[1.35] pb-[4px] block">{words[currentIndex]}</span>
    </span>
  );
};

export default WordAnimator;
