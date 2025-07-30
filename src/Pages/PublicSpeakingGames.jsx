import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";

const games = [
  {
    name: "Impromptu Challenge",
    path: "/games/impromptu",
    description: "Think fast, speak faster!",
    ready: true
  },
  {
    name: "Persuasion Duel",
    path: "#",
    description: "Coming soon...",
    ready: false
  },
  {
    name: "Story Spin",
    path: "#",
    description: "Coming soon...",
    ready: false
  },
  {
    name: "Elevator Pitch",
    path: "#",
    description: "Coming soon...",
    ready: false
  },
  {
    name: "Word Limit Gauntlet",
    path: "#",
    description: "Coming soon...",
    ready: false
  },
  {
    name: "Distraction Mastery",
    path: "#",
    description: "Coming soon...",
    ready: false
  }
];

export default function PublicSpeakingGames() {
  return (
    <div className="pt-24 pb-16 px-6 bg-white min-h-screen">
      <Motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl sm:text-5xl font-bold text-blue-900 text-center mb-6"
      >
        Practice Through Play
      </Motion.h1>

      <Motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto"
      >
        Explore interactive games designed to make you a more confident, quick-thinking speaker.
      </Motion.p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {games.map((game, index) => (
          <Motion.div
            key={game.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
          >
            {game.ready ? (
              <Link to={game.path}>
                <div className="group bg-white border border-gray-200 hover:border-blue-600 shadow-sm hover:shadow-md rounded-xl p-6 transition cursor-pointer h-full flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-blue-800 group-hover:text-blue-700 mb-2">
                      {game.name}
                    </h2>
                    <p className="text-gray-600">{game.description}</p>
                  </div>
                  <div className="mt-4 text-blue-600 font-medium group-hover:underline">
                    Play →
                  </div>
                </div>
              </Link>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 h-full flex flex-col justify-between opacity-80 cursor-not-allowed shadow-sm">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-400 mb-2">{game.name}</h2>
                  <p className="text-gray-400">{game.description}</p>
                </div>
                <div className="mt-4 text-gray-300 font-medium">Coming Soon</div>
              </div>
            )}
          </Motion.div>
        ))}
      </div>
    </div>
  );
}
