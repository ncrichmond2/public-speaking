import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const rotatingWords = ["more", "better", "faster"];
const TYPING_SPEED = 150;
const DELETING_SPEED = 100;
const PAUSE_DELAY = 1500;

export default function LandingPage() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [typing, setTyping] = useState(true);

  // Handles typewriter effect logic
  useEffect(() => {
    let timeoutId;
    const currentWord = rotatingWords[wordIndex];

    if (typing) {
      if (displayText.length < currentWord.length) {
        timeoutId = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        }, TYPING_SPEED);
      } else {
        timeoutId = setTimeout(() => setTyping(false), PAUSE_DELAY);
      }
    } else {
      if (displayText.length > 0) {
        timeoutId = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length - 1));
        }, DELETING_SPEED);
      } else {
        timeoutId = setTimeout(() => {
          setWordIndex((prev) => (prev + 1) % rotatingWords.length);
          setTyping(true);
        }, TYPING_SPEED);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [displayText, typing, wordIndex]);

  return (
    <div className="relative w-screen h-screen bg-white flex items-center justify-center p-6 overflow-hidden">
      {/* Background arrow graphic */}
      <img
        src="/arrow-bg.png"
        alt="Arrow background"
        className="absolute inset-0 m-auto w-3/4 opacity-15 pointer-events-none select-none"
      />

      <div className="relative flex flex-col items-center text-center text-blue-900 px-4">
        {/* Headline: Prax + Typewriter */}
        <div className="flex items-end justify-center mb-8 pl-6">



          {/* Static 'Prax' text */}
          <h1 className="text-4xl sm:text-6xl font-semibold text-blue-900 mr-2">
            Prax
          </h1>

          {/* Typewriter container */}
          <span
            className="text-4xl sm:text-6xl font-light text-blue-800 tabular-nums relative flex items-end"
            style={{ minWidth: "8ch", top: "0.05em" }}
          >
            {/* Invisible placeholder to reserve space */}
            <span className="invisible absolute">
              {rotatingWords[wordIndex]}
            </span>

            {/* Animated word */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute left-0"
            >
              {displayText}
              <motion.span
                className="inline-block"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              >
                |
              </motion.span>
            </motion.span>
          </span>
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          className="text-xl text-gray-600 mb-8 max-w-xl"
        >
          Master public speaking with Prax — build confidence, refine delivery, and track your growth.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            to="/practice"
            className="bg-blue-800 hover:bg-blue-700 text-white font-semibold py-3 px-10 rounded-lg shadow-md transition text-lg"
          >
            Start Practicing
          </Link>
          <Link
            to="/about"
            className="border-2 border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white font-semibold py-3 px-8 rounded-lg transition text-lg"
          >
            Learn More
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-8 text-sm text-gray-500"
        >
          Trusted by thousands of speakers worldwide.
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-10 text-xs text-gray-400"
        >
          © {new Date().getFullYear()} Prax – Elevate your voice.
        </motion.p>
      </div>
    </div>
  );
}
