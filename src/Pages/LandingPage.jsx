// 📦 React core hooks
import { useEffect, useState, useRef } from "react";

// 🌀 Framer Motion for smooth transitions
import { motion } from "framer-motion";

// 🌐 Reusable Components
import Navbar from "../Components/Navbar";
import BrandedCard from "../Components/BrandedCard";

// Image Assets
import gamesImg from "../assets/games-preview.jpg";
import progressImg from "../assets/progress-preview.jpg";
import simulatedImg from "../assets/simulated-preview.jpg";

// 🎨 Styled words and their glow backgrounds
const wordStyles = [
  { word: "Power", color: "#2d9cfc", bg: "#2d9cfc33" },
  { word: "Precision", color: "#a855f7", bg: "#a855f733" },
  { word: "Presence", color: "#34d399", bg: "#34d39933" },
  { word: "Prax", color: "#1e3a8a", bg: "#ffffff" },
];

// 🧠 Key features to display as BrandedCards
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

// 🚀 Main Component Export
export default function LandingPage() {
  const [index, setIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState(wordStyles[0]);
  const [isVisible, setIsVisible] = useState(true);
  const [skipIntro, setSkipIntro] = useState(false);
  const cardsRef = useRef(null);
  const isIntroDone = skipIntro || currentWord.word === "Prax";
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isIntroDone ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isIntroDone]);

  useEffect(() => {
    if (skipIntro || index >= wordStyles.length - 1) return;

    const fadeOut = setTimeout(() => setIsVisible(false), 2000);
    const switchWord = setTimeout(() => {
      setIndex((i) => i + 1);
      setCurrentWord(wordStyles[index + 1]);
      setIsVisible(true);
    }, 2700);

    return () => {
      clearTimeout(fadeOut);
      clearTimeout(switchWord);
    };
  }, [index, skipIntro]);

  useEffect(() => {
    if (isIntroDone) {
      const timer = setTimeout(() => setShowPrompt(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowPrompt(false);
    }
  }, [isIntroDone]);

  useEffect(() => {
    if (!isIntroDone) return;
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setHasScrolled(true);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isIntroDone]);

  const handleSkip = () => {
    setSkipIntro(true);
    setCurrentWord(wordStyles[wordStyles.length - 1]);
  };

  return (
    <div className="scroll-smooth bg-white relative">
      <div className="faint-rainbow" />
      {isIntroDone && (
        <div className="fixed top-0 left-0 right-0 z-40">
          <Navbar visible />
        </div>
      )}
      <main className="h-screen overflow-hidden flex flex-col items-center justify-center text-center relative px-6">
        {!isIntroDone && (
          <button
            onClick={handleSkip}
            className="absolute bottom-10 z-30 text-sm text-blue-800 bg-white/70 backdrop-blur-md px-5 py-2 rounded-full shadow-md hover:bg-white transition"
          >
            Skip Intro →
          </button>
        )}

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
          Speak With {" "}
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

        {showPrompt && !hasScrolled && (
          <motion.div
            className="absolute bottom-6 text-blue-900 text-sm font-medium bg-white/70 backdrop-blur-md px-4 py-2 rounded-full shadow animate-bounce z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            ↓ Scroll to Explore
          </motion.div>
        )}
      </main>

      <section ref={cardsRef} className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid gap-14 md:grid-cols-3">
          {features.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: idx * 0.2 }}
              viewport={{ once: false }}
            >
              <BrandedCard {...card} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🔎 DEEP DIVE: Public Speaking Games */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: false }}
          >
            <img
              src={gamesImg}
              alt="Public Speaking Game"
              className="rounded-xl shadow-lg w-full h-auto max-w-md mx-auto md:mx-0"
            />
          </motion.div>

          <motion.div
            className="flex-1 text-center md:text-left"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: false }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-blue-700 mb-4">
              Public Speaking Games
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Practice speaking under pressure through gamified challenges designed to sharpen your skills while having fun. Compete against yourself or friends to improve clarity, pacing, and presence.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-md shadow-sm text-sm">
              🎓 <strong>Did you know?</strong> Studies show gamification can increase learning engagement by over 60%.
            </div>
          </motion.div>
        </div>
      </section>

      {/* 📈 DEEP DIVE: Progress Tracking */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-screen-xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
          <motion.div
            className="flex-1 text-center md:text-left"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: false }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-purple-700 mb-4">
              Progress Tracking
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Prax tracks your speaking performance over time — analyzing your filler word usage, pacing, confidence levels, and clarity. Visual stats and trends help you stay motivated and refine your skills.
            </p>
            <div className="bg-purple-50 border-l-4 border-purple-400 text-purple-800 p-4 rounded-md shadow-sm text-sm">
              📊 <strong>Fact:</strong> Feedback with visible metrics increases user progress by 68% in practice-based apps.
            </div>
          </motion.div>

          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: false }}
          >
            <img
              src={progressImg}
              alt="Progress Tracker Interface"
              className="rounded-xl shadow-lg w-full h-auto max-w-md mx-auto md:mx-0"
            />
          </motion.div>
        </div>
      </section>

      {/* 😤 DEEP DIVE: Simulated Pressure Practice */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: false }}
          >
            <img
              src={simulatedImg}
              alt="Simulated Speaking Environment"
              className="rounded-xl shadow-lg w-full h-auto max-w-md mx-auto md:mx-0"
            />
          </motion.div>

          <motion.div
            className="flex-1 text-center md:text-left"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: false }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-4">
              Simulated Pressure Practice
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Step into a high-pressure speaking environment from anywhere. With AI-generated audiences, countdown timers, and real-time challenges, Prax replicates the nerves of live speaking so you're ready for anything.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-md shadow-sm text-sm">
              🧠 <strong>Fact:</strong> Simulated stress training boosts public speaking confidence by up to 50%.
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
