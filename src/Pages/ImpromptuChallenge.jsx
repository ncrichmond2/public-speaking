import { useState, useEffect, useRef } from "react";

// Topic pools
const topicsPool = {
  fun: [
    "Your favorite game as a kid",
    "A time you laughed uncontrollably",
    "The best prank you’ve pulled",
    "The weirdest food you’ve tried",
    "A silly mistake you once made",
    "Favorite holiday tradition",
    "A funny misunderstanding you’ve had"
  ],
  serious: [
    "The importance of listening",
    "Overcoming a challenge",
    "A time you learned from failure",
    "Why teamwork is important",
    "What makes a good leader",
    "Why gratitude matters",
    "The value of patience"
  ],
  random: [
    "A place you want to visit",
    "Your favorite outdoor activity",
    "Something you’ve always wanted to invent",
    "The last movie you watched",
    "A time you were surprised",
    "A memory from school",
    "Your favorite book"
  ],
  mainFun: [
    "The power of play",
    "Why laughter matters",
    "What makes a moment fun",
    "The joy of being silly",
    "Why we need vacations"
  ],
  mainSerious: [
    "What makes something meaningful",
    "The purpose of struggle",
    "Why growth takes discomfort",
    "What defines good character",
    "How people change over time"
  ],
  mainRandom: [
    "The little things that matter",
    "A turning point in your life",
    "Why curiosity is powerful",
    "What shapes who we are",
    "A lesson the world has taught you"
  ]
};

export default function ImpromptuChallenge() {
  const [time, setTime] = useState(1);
  const [topicsCount, setTopicsCount] = useState(5);
  const [category, setCategory] = useState("random");

  const [gameStarted, setGameStarted] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [mainTopic, setMainTopic] = useState("");
  const [subtopics, setSubtopics] = useState([]);
  const [revealedTopics, setRevealedTopics] = useState([]);
  const [wordCount, setWordCount] = useState(0);
  const [startTimestamp, setStartTimestamp] = useState(null);
  const [showPanels, setShowPanels] = useState(true);

  const timerRef = useRef(null);
  const timeoutsRef = useRef([]);
  const recognitionRef = useRef(null);

  const totalSeconds = Math.round(time * 60);

  const getRandom = (arr, count = 1) => [...arr].sort(() => Math.random() - 0.5).slice(0, count);

  const getMainTopicPool = () => {
    if (category === "fun") return topicsPool.mainFun;
    if (category === "serious") return topicsPool.mainSerious;
    return topicsPool.mainRandom;
  };

  const getSubtopicPool = () => {
    if (category === "random") return [...topicsPool.fun, ...topicsPool.serious, ...topicsPool.random];
    return topicsPool[category];
  };

  const handleSpeech = (e) => {
    const transcript = e.results?.[0]?.[0]?.transcript;
    if (transcript) {
      const words = transcript.trim().split(/\s+/).length;
      setWordCount((prev) => prev + words);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setStartTimestamp(Date.now());
    setRemainingTime(totalSeconds);
    setWordCount(0);

    const main = getRandom(getMainTopicPool())[0];
    setMainTopic(main);

    const subtopicCount = Math.max(0, topicsCount - 1);
    const subtopicsChosen = getRandom(getSubtopicPool(), subtopicCount);
    setSubtopics(subtopicsChosen);
    setRevealedTopics([]);

    const interval = totalSeconds / (subtopicCount + 1);
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    subtopicsChosen.forEach((topic, i) => {
      const timeout = setTimeout(() => {
        setRevealedTopics((prev) => [...prev, topic]);
      }, (i + 1) * interval * 1000);
      timeoutsRef.current.push(timeout);
    });

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.onresult = handleSpeech;
      recognition.start();
      recognitionRef.current = recognition;
    }
  };

  const resetGame = () => {
    clearInterval(timerRef.current);
    timeoutsRef.current.forEach(clearTimeout);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setGameStarted(false);
    setMainTopic("");
    setSubtopics([]);
    setRevealedTopics([]);
    setRemainingTime(0);
    setWordCount(0);
    setStartTimestamp(null);
  };

  const getSliderBackground = (value, min, max) => {
    const percentage = ((value - min) / (max - min)) * 100;
    return `linear-gradient(to right, #3b82f6 ${percentage}%, #374151 ${percentage}%)`;
  };

  const wpm = startTimestamp
    ? Math.floor((wordCount / ((Date.now() - startTimestamp) / 60000)))
    : 0;

  const progressPercent = 100 - (remainingTime / totalSeconds) * 100;

  if (!gameStarted) {
    return (
      <div className="h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6">
          <h1 className="text-3xl font-bold text-center mb-4">🎤 Impromptu Challenge</h1>
          <p className="text-gray-400 text-center mb-6 text-sm">
            Pick your settings, then speak your heart out as new topics appear!
          </p>

          <div className="space-y-2">
            <label className="block text-sm text-gray-300">
              ⏳ Time (minutes): <span className="font-semibold">{time}</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              step="0.01"
              value={time}
              onChange={(e) => setTime(parseFloat(e.target.value))}
              className="w-full rounded-lg appearance-none h-2 focus:outline-none"
              style={{ WebkitAppearance: "none", background: getSliderBackground(time, 1, 5) }}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-300">
              📝 Number of Topics: <span className="font-semibold">{topicsCount}</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="0.01"
              value={topicsCount}
              onChange={(e) => setTopicsCount(parseFloat(e.target.value))}
              className="w-full rounded-lg appearance-none h-2 focus:outline-none"
              style={{ WebkitAppearance: "none", background: getSliderBackground(topicsCount, 1, 10) }}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-300">🎯 Topic Category:</label>
            <div className="flex space-x-2">
              {["fun", "serious", "random"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex-1 py-2 rounded-full font-semibold transition ${
                    category === cat
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-blue-500 hover:bg-blue-600 py-3 rounded-lg font-semibold shadow-md transition"
          >
            🚀 Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white px-6 py-6 flex flex-col items-center justify-start space-y-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-center">{mainTopic}</h1>

      <button
        onClick={() => setShowPanels((prev) => !prev)}
        className="text-sm text-blue-400 underline mb-2 hover:text-blue-300"
      >
        {showPanels ? "Hide Side Panels" : "Show Side Panels"}
      </button>

      <div className="w-full max-w-2xl h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="bg-blue-500 h-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className={`flex flex-col md:flex-row w-full max-w-7xl mt-4 gap-4 items-start`}>
        {showPanels && (
          <div className="w-full md:w-[200px] bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center min-h-[140px]">
            <h2 className="text-sm font-semibold mb-1">Stats</h2>
            <p className="text-lg">🕐 {remainingTime}s</p>
            <p className="text-lg">🗣️ {wpm} WPM</p>
            <p className="text-lg">📊 {wordCount} Words</p>
          </div>
        )}

        <div
          className={`flex-1 bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center ${
            showPanels ? "mx-2" : "mx-auto"
          } transition-all`}
        >
          <h2 className="text-sm font-semibold mb-2 text-center">Supporting Topics</h2>
          <ul className="w-full max-w-md">
            {revealedTopics.map((topic, i) => (
              <li
                key={i}
                className="bg-gray-700 p-2 rounded mb-2 text-sm text-center"
              >
                {topic}
              </li>
            ))}
          </ul>
        </div>

        {showPanels && (
          <div className="w-full md:w-[200px] bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center min-h-[140px]">
            <h2 className="text-sm font-semibold mb-1">Future Insights</h2>
            <p className="text-gray-400 text-xs">Coming soon...</p>
          </div>
        )}
      </div>

      {remainingTime === 0 && (
        <button
          onClick={resetGame}
          className="mt-6 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-full font-semibold transition"
        >
          🔁 Start Over
        </button>
      )}
    </div>
  );
}
