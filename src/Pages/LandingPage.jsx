// src/Pages/LandingPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

// Components
import Navbar      from "../Components/Navbar/Navbar";
import BrandedCard from "../Components/BrandedCard/BrandedCard";
import Intro       from "../Components/Intro/Intro";
import ScrollSection from "../Components/ScrollSection/ScrollSection";


// Assets
import gamesImg     from "../assets/games-preview.jpg";
import progressImg  from "../assets/progress-preview.jpg";
import simulatedImg from "../assets/simulated-preview.jpg";


// Intro word styles
const wordStyles = [
  { word: "Power",     colorVar: "--color-secondary", bgVar: "--color-secondary-bg" },
  { word: "Precision", colorVar: "--color-tertiary",  bgVar: "--color-tertiary-bg"  },
  { word: "Presence",  colorVar: "--color-success",   bgVar: "--color-success-bg"   },
  { word: "Prax",      colorVar: "--color-primary",   bgVar: "--color-bg"           },
];

// Cards data
const features = [
  {
    title: "Public Speaking Games",
    text:  "Make practice fun and engaging with competitive speaking challenges.",
    color: "var(--color-secondary)",
  },
  {
    title: "Progress Tracking",
    text:  "See detailed stats on confidence, filler words, eye contact, and more.",
    color: "var(--color-tertiary)",
  },
  {
    title: "Simulated Pressure",
    text:  "Practice with AI that mimics the tension of real speaking scenarios.",
    color: "var(--color-success)",
  },
];

export default function LandingPage() {
  // Intro state
  const [index, setIndex]         = useState(0);
  const [currentWord, setCurrent] = useState(wordStyles[0]);
  const [isVisible, setVisible]   = useState(true);
  const [skipIntro, setSkip]      = useState(false);

  const isIntroDone = skipIntro || currentWord.word === "Prax";

  // Ref for cards
  const cardsRef = useRef(null);

  // Lock scrolling during intro
  useEffect(() => {
    document.body.style.overflow = isIntroDone ? "" : "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isIntroDone]);

  // Intro word cycle
  useEffect(() => {
    if (skipIntro || index >= wordStyles.length - 1) return;
    const t1 = setTimeout(() => setVisible(false), 2000);
    const t2 = setTimeout(() => {
      setIndex(i => i + 1);
      setCurrent(wordStyles[index + 1]);
      setVisible(true);
    }, 2700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [index, skipIntro]);

  const handleSkip = () => {
    setSkip(true);
    setCurrent(wordStyles[wordStyles.length - 1]);
  };

  return (
    <div className="scroll-smooth bg-[var(--color-bg)] relative">
      <div className="faint-rainbow" />

      {/* Navbar appears after intro */}
      {isIntroDone && (
        <div className="fixed inset-x-0 top-0 z-40">
          <Navbar visible />
        </div>
      )}

      {/* Intro / Hero */}
      <main className="h-screen overflow-hidden flex flex-col items-center justify-center text-center relative px-6">
        {!isIntroDone && (
          <button
            onClick={handleSkip}
            className="absolute bottom-6 right-6 z-30 text-sm text-[var(--color-primary)] bg-white/70 backdrop-blur-md px-5 py-2 rounded-full shadow-md hover:bg-white transition"
          >
            Skip Intro →
          </button>
        )}

        {wordStyles.map(w => (
          <motion.div
            key={w.word}
            className="absolute inset-0 z-0"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{
              opacity: currentWord.word === w.word ? 1 : 0,
              scale:   currentWord.word === w.word ? 1 : 1.1,
              transition: { duration: 1.2 },
            }}
            style={{
              background: `radial-gradient(circle at center, var(${w.bgVar}) 40%, transparent 100%)`,
              filter: w.word === "Prax" ? "none" : "blur(60px)",
            }}
          />
        ))}

        <h1
          aria-live="polite"
          className="relative z-20 text-4xl sm:text-6xl font-extrabold leading-tight mb-8 text-[var(--color-primary)]"
        >
          Find Your Voice.<br />
          Speak With{" "}
          <motion.span
            className="inline-block"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: isVisible ? 1 : 0,
              y:      isVisible ? 0 : 10,
              transition: { duration: 0.7 },
            }}
            style={{ color: `var(${currentWord.colorVar})` }}
          >
            {currentWord.word}
          </motion.span>
        </h1>

        <button
          onClick={() => cardsRef.current.scrollIntoView({ behavior: "smooth" })}
          className="relative z-20 mt-4 px-6 py-3 rounded-full bg-[var(--color-secondary)] text-white text-lg font-semibold shadow-md hover:bg-[var(--color-secondary-bg)] transition"
        >
          Get Started →
        </button>
      </main>

     <ScrollSection>
  <section ref={cardsRef} className="py-32 px-6 bg-[var(--color-bg)]">
    <div className="max-w-6xl mx-auto grid gap-14 md:grid-cols-3">
      {features.map(({ title, text, color }, i) => (
        <ScrollSection key={title} delay={i * 0.2}>
          <BrandedCard
            title={title}
            text={text}
            color={color}
          />
        </ScrollSection>
      ))}
    </div>
  </section>
</ScrollSection>

{/*public speaking games section */}

      <ScrollSection>
  <section className="py-32 px-6 bg-[var(--color-bg)]">
    <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center gap-12">
      <div className="flex-1">
        <img src={gamesImg} alt="Public Speaking Game" className="rounded-xl shadow-lg w-full max-w-md mx-auto md:mx-0" />
      </div>
      <div className="flex-1 text-center md:text-left">
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-secondary)] mb-4">
          Public Speaking Games
        </h2>
        <p className="text-lg text-[var(--color-text)] mb-6">
          Practice speaking under pressure through gamified challenges designed to sharpen your skills while having fun.…
        </p>
        <div className="bg-[var(--color-secondary-bg)] border-l-4 border-[var(--color-secondary)] text-[var(--color-secondary)] p-4 rounded-md shadow-sm text-sm">
          🎓 <strong>Did you know?</strong> Studies show gamification can increase learning engagement by over 60%.
        </div>
      </div>
    </div>
  </section>
</ScrollSection>

{/* Progress Tracking Section*/}

      <ScrollSection>
  <section className="py-32 px-6 bg-[var(--color-bg)]">
    <div className="max-w-screen-xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
      <div className="flex-1 text-center md:text-left">
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-tertiary)] mb-4">
          Progress Tracking
        </h2>
        <p className="text-lg text-[var(--color-text)] mb-6">
          Prax tracks your speaking performance over time—analyzing your filler word usage, pacing, confidence levels, and clarity.…
        </p>
        <div className="bg-[var(--color-tertiary-bg)] border-l-4 border-[var(--color-tertiary)] text-[var(--color-tertiary)] p-4 rounded-md shadow-sm text-sm">
          📊 <strong>Fact:</strong> Feedback with visible metrics increases user progress by 68%.
        </div>
      </div>
      <div className="flex-1">
        <img src={progressImg} alt="Progress Tracker Interface" className="rounded-xl shadow-lg w-full max-w-md mx-auto md:mx-0" />
      </div>
    </div>
  </section>
</ScrollSection>




      {/* Simulated Pressure Practice */}
      <ScrollSection>
  <section className="py-32 px-6 bg-[var(--color-bg)]">
    <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center gap-12">
      <div className="flex-1">
        <img src={simulatedImg} alt="Simulated Speaking Environment" className="rounded-xl shadow-lg w-full max-w-md mx-auto md:mx-0" />
      </div>
      <div className="flex-1 text-center md:text-left">
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-primary)] mb-4">
          Simulated Pressure Practice
        </h2>
        <p className="text-lg text-[var(--color-text)] mb-6">
          Step into a high-pressure speaking environment from anywhere. With AI-generated audiences, countdown timers, and real-time challenges, Prax replicates the nerves of live speaking so you’re ready for anything.
        </p>
        <div className="bg-[var(--color-primary-bg)] border-l-4 border-[var(--color-primary)] text-[var(--color-primary)] p-4 rounded-md shadow-sm text-sm">
          🧠 <strong>Fact:</strong> Simulated stress training boosts confidence by up to 50%.
        </div>
      </div>
    </div>
  </section>
</ScrollSection>

    </div>
  );
}
