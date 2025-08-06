// src/components/Intro/Intro.jsx
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

const wordStyles = [
  { word: "Power", color: "#2d9cfc", bg: "#2d9cfc33" },
  { word: "Precision", color: "#a855f7", bg: "#a855f733" },
  { word: "Presence", color: "#34d399", bg: "#34d39933" },
  { word: "Prax", color: "#1e3a8a", bg: "#ffffff" },
];

export default function Intro({ onFinish }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const prefersReduced = window.matchMedia("(prefers-reduced-motion)").matches;

  // Cycle words unless user opts out or reduced-motion is on
  useEffect(() => {
    if (prefersReduced || index >= wordStyles.length - 1) {
      onFinish();
      return;
    }
    const fadeOut = setTimeout(() => setVisible(false), 2000);
    const nextWord = setTimeout(() => {
      setIndex((i) => i + 1);
      setVisible(true);
    }, 2700);
    return () => {
      clearTimeout(fadeOut);
      clearTimeout(nextWord);
    };
  }, [index, prefersReduced, onFinish]);

  const handleSkip = useCallback(() => {
    onFinish();
  }, [onFinish]);

  const { word, color, bg } = wordStyles[index];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50 overflow-hidden">
      {/* Background glow panes */}
      {wordStyles.map((w) => (
        <motion.div
          key={w.word}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{
            opacity: w.word === word ? 1 : 0,
            scale: w.word === word ? 1 : 1.1,
            transition: { duration: 1.2 },
          }}
          style={{
            background:
              w.word === "Prax"
                ? "#ffffff"
                : `radial-gradient(circle at center, ${w.bg} 40%, transparent 100%)`,
            filter: w.word === "Prax" ? "none" : "blur(60px)",
          }}
        />
      ))}

      <h1
        aria-live="polite"
        className="relative z-10 text-4xl sm:text-6xl font-extrabold text-[#1e3a8a] leading-tight text-center"
      >
        Find Your Voice.
        <br />
        Speak With{" "}
        <motion.span
          className="inline-block"
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: visible ? 1 : 0,
            y: visible ? 0 : 10,
            transition: { duration: 0.7 },
          }}
          style={{ color }}
        >
          {word}
        </motion.span>
      </h1>

      <button
        onClick={handleSkip}
        className="absolute bottom-12 z-20 text-sm text-blue-800 bg-white/70 backdrop-blur-md px-5 py-2 rounded-full shadow-md hover:bg-white transition"
        aria-label="Skip Intro"
      >
        Skip Intro →
      </button>
    </div>
  );
}
