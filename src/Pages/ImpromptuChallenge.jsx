import { useState, useEffect, useRef } from "react";
import { motion as Motion } from "framer-motion";
import {
  ClockIcon,
  ChatBubbleLeftEllipsisIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

// --- Topic pools ---
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
  const [gameStarted, setGameStarted] = useState(false);
  const [time, setTime] = useState(1);
  const [topicsCount, setTopicsCount] = useState(5);
  const [rawTime, setRawTime] = useState(time);
  const [rawTopicsCount, setRawTopicsCount] = useState(topicsCount);
  const [category, setCategory] = useState("random");
  const [trackSpeech, setTrackSpeech] = useState(true);

  const [remainingTime, setRemainingTime] = useState(0);
  const [mainTopic, setMainTopic] = useState("");
  const [_subtopics, setSubtopics] = useState([]);
  const [revealedTopics, setRevealedTopics] = useState([]);
  const [wordCount, setWordCount] = useState(0);
  const [fillerCount, setFillerCount] = useState(0);
  const [startTimestamp, setStartTimestamp] = useState(null);
  const [showPanels, setShowPanels] = useState(true);

  const timerRef = useRef(null);
  const timeoutsRef = useRef([]);
  const recognitionRef = useRef(null);
  const totalSeconds = Math.round(time * 60);
  const fillerWords = ["um", "uh", "ah", "like", "you know"];

  useEffect(() => setRawTime(time), [time]);
  useEffect(() => setRawTopicsCount(topicsCount), [topicsCount]);

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
      const wordsArr = transcript.trim().split(/\s+/);
      setWordCount(prev => prev + wordsArr.length);
      const fillersFound = wordsArr.filter(w => fillerWords.includes(w.toLowerCase())).length;
      setFillerCount(prev => prev + fillersFound);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setStartTimestamp(Date.now());
    setRemainingTime(totalSeconds);
    setWordCount(0);
    setFillerCount(0);

    const main = getRandom(getMainTopicPool())[0];
    setMainTopic(main);
    const subCount = Math.max(0, topicsCount - 1);
    const chosen = getRandom(getSubtopicPool(), subCount);
    setSubtopics(chosen);
    setRevealedTopics([]);

    const interval = totalSeconds / (subCount + 1);
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    chosen.forEach((topic, i) => {
      const t = setTimeout(() => {
        setRevealedTopics(prev => [...prev, topic]);
      }, (i + 1) * interval * 1000);
      timeoutsRef.current.push(t);
    });

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    if (trackSpeech) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        const recog = new SR();
        recog.continuous = true;
        recog.onresult = handleSpeech;
        recog.start();
        recognitionRef.current = recog;
      }
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
    setFillerCount(0);
    setStartTimestamp(null);
  };

  const getSliderBackground = (value, min, max) => {
    const pct = ((value - min) / (max - min)) * 100;
    return `linear-gradient(to right, #3b82f6 ${pct}%, #e5e7eb ${pct}%)`;
  };

  const wpm = startTimestamp ? Math.floor(wordCount / ((Date.now() - startTimestamp) / 60000)) : 0;
  const progressPercent = 100 - (remainingTime / totalSeconds) * 100;

  if (!gameStarted) {
    return (
      <div className="h-screen bg-white text-blue-900 flex flex-col items-center justify-center p-6">
        <Motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-gray-200"
        >
          <h1 className="text-3xl font-bold text-center mb-2">🎤 Impromptu Challenge</h1>
          <p className="text-gray-600 text-center mb-4 text-sm">
            Pick your settings, then speak your heart out as new topics appear!
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm text-gray-700">
                ⏳ Time (minutes):{" "}
                <span className="font-semibold text-blue-800">{Math.round(rawTime)}</span>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                step={0.01}
                value={rawTime}
                onChange={(e) => setRawTime(+e.target.value)}
                onMouseUp={() => setTime(Math.round(rawTime))}
                onTouchEnd={() => setTime(Math.round(rawTime))}
                className="w-full rounded-lg h-2"
                style={{ background: getSliderBackground(rawTime, 1, 5) }}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-gray-700">
                📝 Number of Topics:{" "}
                <span className="font-semibold text-blue-800">{Math.round(rawTopicsCount)}</span>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                step={0.01}
                value={rawTopicsCount}
                onChange={(e) => setRawTopicsCount(+e.target.value)}
                onMouseUp={() => setTopicsCount(Math.round(rawTopicsCount))}
                onTouchEnd={() => setTopicsCount(Math.round(rawTopicsCount))}
                className="w-full rounded-lg h-2"
                style={{ background: getSliderBackground(rawTopicsCount, 1, 10) }}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-gray-700">🎯 Topic Category:</label>
              <div className="flex space-x-2">
                {["fun", "serious", "random"].map((id) => (
                  <button
                    key={id}
                    onClick={() => setCategory(id)}
                    className={`flex-1 py-2 rounded-full font-semibold transition text-sm ${
                      category === id
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {id.charAt(0).toUpperCase() + id.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-gray-700">🎙️ Speech Tracking:</label>
              <label className="inline-flex items-center space-x-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={trackSpeech}
                  onChange={(e) => setTrackSpeech(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span>Enable Tracking</span>
              </label>
            </div>
            <button
              onClick={startGame}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-md transition text-lg"
            >
              🚀 Start Game
            </button>
          </div>
        </Motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-blue-900 px-6 pt-28 pb-14 flex flex-col items-center space-y-6 overflow-visible">

      <Motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="w-full max-w-4xl bg-white/80 backdrop-blur-md border border-blue-100 rounded-2xl px-8 py-6 text-center shadow-[0_4px_20px_rgba(59,130,246,0.1)]"
>
  <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-900 tracking-tight leading-snug">
    {mainTopic}
  </h1>
</Motion.div>


      <button
        onClick={() => setShowPanels((prev) => !prev)}
        className="text-sm text-blue-600 underline mb-2 hover:text-blue-500 transition"
      >
        {showPanels ? "Hide Panels" : "Show Panels"}
      </button>

      <div className="w-full max-w-2xl h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex flex-col md:flex-row w-full max-w-7xl mt-4 gap-4 items-start">
        {/* Stats Panel */}
        {showPanels && (
          <div className="w-full md:w-64 bg-white rounded-xl shadow-md p-5 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-600 mb-3">Stats</h2>
            <div className="space-y-3 text-sm text-blue-900">
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium">Time:</span>&nbsp; {remainingTime}s
              </div>
              {trackSpeech && (
                <>
                  <div className="flex items-center">
                    <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium">WPM:</span>&nbsp; {wpm}
                  </div>
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium">Words:</span>&nbsp; {wordCount}
                  </div>
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                    <span className="font-medium">Fillers:</span>&nbsp; {fillerCount}
                  </div>
                </>
              )}
              {!trackSpeech && (
                <p className="text-xs text-gray-400 mt-2">Speech tracking is off</p>
              )}
            </div>
          </div>
        )}

        {/* Supporting Topics */}
        <div className={`flex-1 bg-white rounded-xl shadow-md p-5 border border-gray-100 ${showPanels ? 'mx-2' : 'mx-auto'}`}>
          <h2 className="text-sm font-semibold text-gray-600 mb-4 text-center">Supporting Topics</h2>
          <ul className="space-y-2 text-sm text-blue-900">
            {revealedTopics.map((topic, i) => (
              <li key={i} className="bg-blue-50 border border-blue-100 px-4 py-2 rounded text-center">
                {topic}
              </li>
            ))}
          </ul>
        </div>

        {/* Future Insights */}
        {showPanels && (
          <div className="w-full md:w-64 bg-white rounded-xl shadow-md p-5 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-600 mb-3">Future Insights</h2>
            <p className="text-xs text-gray-400 text-center">Coming soon...</p>
          </div>
        )}
      </div>

      {remainingTime === 0 && (
        <button
          onClick={resetGame}
          className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition text-lg"
        >
          🔁 Start Over
        </button>
      )}
    </div>
  );
}

