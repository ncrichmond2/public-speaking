import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const games = [
  {
    title: "Impromptu Challenge",
    description: "Practice thinking on your feet with random topics.",
    path: "/games/impromptu",
  },
  {
    title: "Story Builder",
    description: "Build a story sentence by sentence to improve narrative flow.",
    path: "/games/story-builder",
  },
  {
    title: "Filler Word Eliminator",
    description: "Reduce 'ums' and 'uhs' with timed speaking drills.",
    path: "/games/filler-eliminator",
  },
  {
    title: "Emotion Shift",
    description: "Practice delivering the same line with different emotions.",
    path: "/games/emotion-shift",
  },
];

export default function PublicSpeakingGames() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8">
      <div className="max-w-5xl mx-auto text-center">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-extrabold mb-4"
        >
          Public Speaking Games
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-gray-300 text-lg mb-10"
        >
          Select a game to improve your speaking, storytelling, and confidence.
        </motion.p>

        {/* Game Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game, i) => (
            <motion.div
              key={game.title}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * i, duration: 0.6 }}
              className="bg-gray-700 rounded-lg p-6 shadow-md hover:shadow-lg hover:bg-gray-600 cursor-pointer transition transform hover:scale-105"
            >
              <h2 className="text-xl font-semibold mb-2">{game.title}</h2>
              <p className="text-gray-300 text-sm mb-4">{game.description}</p>
              <Link
                to={game.path}
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium transition"
              >
                Play Now
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Back to Home */}
        <div className="mt-12">
          <Link
            to="/"
            className="text-gray-400 hover:text-white underline text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
