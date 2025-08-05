import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Navbar from "../Components/Navbar";
import BrandedCard from "../Components/BrandedCard";

const wordStyles = [
  { word: "Power", color: "#2d9cfc", bg: "#2d9cfc33" },
  { word: "Precision", color: "#a855f7", bg: "#a855f733" },
  { word: "Presence", color: "#34d399", bg: "#34d39933" },
  { word: "Prax", color: "#1e3a8a", bg: "#ffffff" },
];

const features = [
  {
    title: "Public Speaking Games",
    text: "Make practice fun and engaging with competitive speaking challenges.",
    color: "#2d9cfc",
  },
  {
    title: "Progress Tracking",
    text: "See detailed stats on confidence, filler words, eye contact, and more.",
    color: "#a855f7",
  },
  {
    title: "Simulated Pressure",
    text: "Practice with AI that mimics the tension of real speaking scenarios.",
    color: "#1e3a8a",
  },
];

export default function LandingPage() {
  const [index, setIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState(wordStyles[0]);
  const [isVisible, setIsVisible] = useState(true);
  const cardsRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = currentWord.word === "Prax" ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [currentWord]);

  useEffect(() => {
    if (index >= wordStyles.length - 1) return;

    const fadeOut = setTimeout(() => setIsVisible(false), 3500);
    const switchWord = setTimeout(() => {
      setIndex((i) => i + 1);
      setCurrentWord(wordStyles[index + 1]);
      setIsVisible(true);
    }, 4500);

    return () => {
      clearTimeout(fadeOut);
      clearTimeout(switchWord);
    };
  }, [index]);

  return (
    <div className="scroll-smooth bg-white relative">
      <div className="faint-rainbow" />

      {index === wordStyles.length - 1 && <Navbar visible />}

      <main className="h-screen overflow-hidden flex flex-col items-center justify-center text-center relative px-6">
        {wordStyles.map((w) => (
          <motion.div
            key={w.word}
            className="absolute inset-0 z-0"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{
              opacity: currentWord.word === w.word ? 1 : 0,
              scale: currentWord.word === w.word ? 1 : 1.1,
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
          className="relative z-20 text-4xl sm:text-6xl font-extrabold leading-tight mb-8"
          style={{ color: "#1e3a8a" }}
        >
          Find Your Voice.
          <br />
          Speak With{" "}
          <motion.span
            className="inline-block"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: isVisible ? 1 : 0,
              y: isVisible ? 0 : 10,
              transition: { duration: 0.7 },
            }}
            style={{ color: currentWord.color }}
          >
            {currentWord.word}
          </motion.span>
        </h1>

        <button className="relative z-20 mt-4 px-6 py-3 rounded-full bg-blue-600 text-white text-lg font-semibold shadow-md hover:bg-blue-500 transition">
          Get Started →
        </button>
      </main>

      {/* Feature Cards */}
      <section
        ref={cardsRef}
        className={`py-20 px-6 transition-colors duration-1000 ${
          currentWord.word === "Prax" ? "bg-soft-navy" : "bg-white"
        }`}
      >
        <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3">
          {features.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: idx * 0.2 }}
              viewport={{ once: true }}
            >
              <BrandedCard {...card} />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
