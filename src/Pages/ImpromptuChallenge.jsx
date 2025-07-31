import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ClockIcon } from "@heroicons/react/24/outline";

// Grab your key from .env
const ASSEMBLYAI_KEY = import.meta.env.VITE_ASSEMBLYAI_KEY;


// --- Topic pools ---
const topicsPool = {
  fun: [
    "Your favorite game as a kid",
    "A time you laughed uncontrollably",
    "The best prank you’ve pulled",
    "The weirdest food you’ve tried",
    "A silly mistake you once made",
    "Favorite holiday tradition",
    "A funny misunderstanding you’ve had",
  ],
  serious: [
    "The importance of listening",
    "Overcoming a challenge",
    "A time you learned from failure",
    "Why teamwork is important",
    "What makes a good leader",
    "Why gratitude matters",
    "The value of patience",
  ],
  random: [
    "A place you want to visit",
    "Your favorite outdoor activity",
    "Something you’ve always wanted to invent",
    "The last movie you watched",
    "A time you were surprised",
    "A memory from school",
    "Your favorite book",
  ],
  mainFun: [
    "The power of play",
    "Why laughter matters",
    "What makes a moment fun",
    "The joy of being silly",
    "Why we need vacations",
  ],
  mainSerious: [
    "What makes something meaningful",
    "The purpose of struggle",
    "Why growth takes discomfort",
    "What defines good character",
    "How people change over time",
  ],
  mainRandom: [
    "The little things that matter",
    "A turning point in your life",
    "Why curiosity is powerful",
    "What shapes who we are",
    "A lesson the world has taught you",
  ],
};

export default function ImpromptuChallenge() {

  // ----- STATE -----
  const [gameStarted, setGameStarted] = useState(false);
  const [time, setTime] = useState(1);
  const [topicsCount, setTopicsCount] = useState(5);
  const [rawTime, setRawTime] = useState(time);
  const [rawTopicsCount, setRawTopicsCount] = useState(topicsCount);
  const [category, setCategory] = useState("random");
  const [remainingTime, setRemainingTime] = useState(0);
  const [mainTopic, setMainTopic] = useState("");
  const [revealedTopics, setRevealedTopics] = useState([]);

  // ----- REFS & CALCS -----
  const timerRef = useRef(null);
  const timeoutsRef = useRef([]);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const totalSeconds = Math.round(time * 60);

  useEffect(() => setRawTime(time), [time]);
  useEffect(() => setRawTopicsCount(topicsCount), [topicsCount]);

  // Synchronous cleanup on unmount/navigation
  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    };
  }, []);

  // ----- HELPERS -----
  const getRandom = (arr, count = 1) => {
    const items = Array.isArray(arr) ? arr : [];
    return [...items].sort(() => Math.random() - 0.5).slice(0, count);
  };

  const getMainTopicPool = () => {
    if (category === "fun") return topicsPool.mainFun;
    if (category === "serious") return topicsPool.mainSerious;
    return topicsPool.mainRandom;
  };

  const getSubtopicPool = () => {
    if (category === "random") {
      const funArr = Array.isArray(topicsPool.fun) ? topicsPool.fun : [];
      const seriousArr = Array.isArray(topicsPool.serious)
        ? topicsPool.serious
        : [];
      const randArr = Array.isArray(topicsPool.random)
        ? topicsPool.random
        : [];
      return [...funArr, ...seriousArr, ...randArr];
    }
    const pool = topicsPool[category];
    return Array.isArray(pool) ? pool : [];
  };

  const getSliderBackground = (v, min, max) => {
    const pct = ((v - min) / (max - min)) * 100;
    return `linear-gradient(to right, #3b82f6 ${pct}%, #e5e7eb ${pct}%)`;
  };

  const progressPercent = 100 - (remainingTime / totalSeconds) * 100;

  // ----- ASSEMBLYAI FLOW -----
  async function uploadToAssembly(blob) {
    const resp = await fetch("https://api.assemblyai.com/v2/upload", {
      method: "POST",
      headers: { authorization: ASSEMBLYAI_KEY },
      body: blob,
    });
    const { upload_url } = await resp.json();
    return upload_url;
  }

  async function requestTranscription(uploadUrl) {
    const resp = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        authorization: ASSEMBLYAI_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        audio_url: uploadUrl,
        disfluencies: true,
        punctuate: true,
      }),
    });
    const { id } = await resp.json();
    return id;
  }

  async function pollTranscript(id) {
    while (true) {
      const resp = await fetch(
        `https://api.assemblyai.com/v2/transcript/${id}`,
        { headers: { authorization: ASSEMBLYAI_KEY } }
      );
      const data = await resp.json();
      if (data.status === "completed") return data;
      if (data.status === "error") throw new Error(data.error);
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  // ----- RECORDING -----
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.start();
    } catch (err) {
      console.error("Recording start failed:", err);
    }
  }

  function stopRecording() {
    return new Promise((resolve) => {
      const rec = mediaRecorderRef.current;
      if (rec && rec.state !== "inactive") {
        rec.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, {
            type: "audio/webm",
          });
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((t) => t.stop());
            mediaStreamRef.current = null;
          }
          resolve(blob);
        };
        rec.stop();
      } else {
        resolve(null);
      }
    });
  }

  async function handleGameEnd() {
  const blob = await stopRecording();
  if (!blob) return;

  // 1) upload + request + poll
  const url    = await uploadToAssembly(blob);
  const tid    = await requestTranscription(url);
  const result = await pollTranscript(tid);

  // 2) safe filler count
  const utterances = Array.isArray(result.utterances) ? result.utterances : [];
  const fillers    = utterances.filter((u) => u.type === "disfluency").length;

  // 3) compute WPM from text + duration
  const text       = result.text || "";
  const totalWords = text.trim().split(/\s+/).filter(Boolean).length;
  const durationSec= result.audio_duration || totalSeconds; 
  const wpm        = Math.round((totalWords / durationSec) * 60);

  // 4) show results
  alert(`WPM: ${wpm}\nFillers: ${fillers}`);
}



  // ----- GAME LIFECYCLE -----
  async function startGame() {
    setGameStarted(true);
    setRemainingTime(totalSeconds);

    const main = getRandom(getMainTopicPool())[0];
    setMainTopic(main);

    const subCount = Math.max(0, topicsCount - 1);
    const chosen = getRandom(getSubtopicPool(), subCount);
    setRevealedTopics([]);

    const interval = totalSeconds / (subCount + 1);
    timeoutsRef.current.forEach(clearTimeout);
    chosen.forEach((tpc, i) => {
      const id = setTimeout(
        () => setRevealedTopics((p) => [...p, tpc]),
        (i + 1) * interval * 1000
      );
      timeoutsRef.current.push(id);
    });

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleGameEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    await startRecording();
  }

  function resetGame() {
    clearInterval(timerRef.current);
    timeoutsRef.current.forEach(clearTimeout);

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    setGameStarted(false);
    setRemainingTime(0);
    setMainTopic("");
    setRevealedTopics([]);
  }

  // ----- RENDER -----
  if (!gameStarted) {
    return (
      <div className="h-screen bg-white text-blue-900 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-gray-200"
        >
          <h1 className="text-3xl font-bold text-center mb-2">
            🎤 Impromptu Challenge
          </h1>
          <p className="text-gray-600 text-center mb-4 text-sm">
            Pick your settings, then speak your heart out as new topics appear!
          </p>

          {/* SETTINGS PANEL */}
          <div className="space-y-4">
            {/* Time Slider */}
            <div className="space-y-2">
              <label className="block text-sm text-gray-700">
                ⏳ Time (minutes):{" "}
                <span className="font-semibold text-blue-800">
                  {Math.round(rawTime)}
                </span>
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

            {/* Topics Slider */}
            <div className="space-y-2">
              <label className="block text-sm text-gray-700">
                📝 Number of Topics:{" "}
                <span className="font-semibold text-blue-800">
                  {Math.round(rawTopicsCount)}
                </span>
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
                style={{
                  background: getSliderBackground(rawTopicsCount, 1, 10),
                }}
              />
            </div>

            {/* Category Buttons */}
            <div className="space-y-2">
              <label className="block text-sm text-gray-700">
                🎯 Topic Category:
              </label>
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

            {/* Start Button */}
            <button
              onClick={startGame}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-md transition text-lg"
            >
              🚀 Start Game
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // In-Game UI
  return (
    <div className="min-h-screen bg-white text-blue-900 px-6 py-14 flex flex-col items-center space-y-6 overflow-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-12 w-full max-w-4xl bg-white/80 backdrop-blur-md border border-blue-100 rounded-2xl px-8 py-6 text-center shadow-lg"
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-900">
          {mainTopic}
        </h1>
      </motion.div>

      {/* Progress Bar */}
      <div className="w-full max-w-2xl h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          style={{ width: `${progressPercent}%` }}
          className="bg-blue-600 h-full transition-all duration-500"
        />
      </div>

      {/* Revealed Topics */}
      <ul className="space-y-2 text-sm text-blue-900 w-full max-w-lg">
        {revealedTopics.map((t, i) => (
          <li
            key={i}
            className="bg-blue-50 border border-blue-100 px-4 py-2 rounded text-center"
          >
            {t}
          </li>
        ))}
      </ul>

      {/* Restart */}
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

