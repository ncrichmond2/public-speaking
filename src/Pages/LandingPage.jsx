import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center text-center text-white p-6">
      {/* Logo / Name */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-5xl font-extrabold tracking-wide mb-3"
      >
        Praxeon
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
        className="text-xl text-gray-300 mb-8 max-w-xl"
      >
        Master public speaking through AI-powered practice. Build confidence, 
        refine delivery, and track your growth in a realistic Zoom-style room.
      </motion.p>

      {/* Feature Bullets */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mb-8 space-y-2 text-gray-400 text-sm max-w-sm"
      >
        <p>✅ Realistic simulated speaking environment</p>
        <p>✅ Feedback & progress tracking (coming soon)</p>
        <p>✅ Practice at your own pace</p>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.6, ease: "easeOut" }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Link
          to="/practice"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition"
        >
          Start Practicing
        </Link>
        <Link
          to="/about"
          className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white font-semibold py-3 px-8 rounded-lg transition"
        >
          Learn More
        </Link>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="mt-10 text-xs text-gray-500"
      >
        © {new Date().getFullYear()} Praxeon – Elevate your voice.
      </motion.p>
    </div>
  );
}
