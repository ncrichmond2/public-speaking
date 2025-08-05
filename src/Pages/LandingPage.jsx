import { useEffect, useState, useRef } from "react";
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
  const [cardsVisible, setCardsVisible] = useState(false);
  const cardsRef = useRef(null);

  // Scroll lock until final word
  useEffect(() => {
    document.body.style.overflow = currentWord.word === "Prax" ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [currentWord]);

  // Word cycling effect
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

  // Cards scroll detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setCardsVisible(entry.isIntersecting),
      { rootMargin: "0px 0px -30%", threshold: 0.3 }
    );
    if (cardsRef.current) observer.observe(cardsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="scroll-smooth bg-white relative">
      {/* 🌈 Ambient background glow */}
      <div className="faint-rainbow" />

      {/* 🧭 Navbar (appears only after animation) */}
      {index === wordStyles.length - 1 && <Navbar visible />}


      {/* 🚀 Hero Section */}
      <main className="h-screen overflow-hidden flex flex-col items-center justify-center text-center relative px-6">
        {/* 🔁 Background Layers */}
        {wordStyles.map((w) => (
          <div
            key={w.word}
            className={`absolute inset-0 z-0 transition-opacity duration-[1200ms] ${
              currentWord.word === w.word ? "opacity-100 scale-100" : "opacity-0 scale-110"
            }`}
            style={{
              background:
                w.word === "Prax"
                  ? "#ffffff"
                  : `radial-gradient(circle at center, ${w.bg} 40%, transparent 100%)`,
              filter: w.word === "Prax" ? "none" : "blur(60px)",
              transitionProperty: "opacity, transform, filter",
            }}
          />
        ))}

        {/* 🔤 Title */}
        <h1
          aria-live="polite"
          className="relative z-20 text-4xl sm:text-6xl font-extrabold leading-tight mb-8"
          style={{ color: "#1e3a8a" }}
        >
          Find Your Voice.
          <br />
          Speak With{" "}
          <span
            className="inline-block transition-opacity duration-[700ms]"
            style={{
              color: currentWord.color,
              opacity: isVisible ? 1 : 0,
            }}
          >
            {currentWord.word}
          </span>
        </h1>

        {/* 🚀 CTA Button */}
        <button className="relative z-20 mt-4 px-6 py-3 rounded-full bg-blue-600 text-white text-lg font-semibold shadow-md hover:bg-blue-500 transition">
          Get Started →
        </button>
      </main>

      {/* 📦 Cards Section */}
      <section
        ref={cardsRef}
        className={`py-20 px-6 transition-colors duration-1000 ${
          currentWord.word === "Prax" || cardsVisible ? "bg-soft-navy" : "bg-white"
        }`}
      >
        <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3">
          {features.map((card, idx) => (
            <div
              key={card.title}
              className={`transition-all duration-700 transform ${
                cardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${idx * 200}ms` }}
            >
              <BrandedCard {...card} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
