import React, { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";
import { MdCallEnd } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";

// ✅ Dummy participants
const participants = [
  { id: 1, name: "Participant 1", image: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: 2, name: "Participant 2", image: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: 3, name: "Participant 3", image: "https://randomuser.me/api/portraits/men/65.jpg" },
  { id: 4, name: "Participant 4", image: "https://randomuser.me/api/portraits/women/22.jpg" },
  { id: 5, name: "Participant 5", image: "https://randomuser.me/api/portraits/men/77.jpg" },
];

export default function PracticeRoom() {
  /* ==============================
     ✅ STATE MANAGEMENT
     ============================== */
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [controlsVisible, setControlsVisible] = useState(true);
  const [tileWidth, setTileWidth] = useState(200);
  const [tileHeight, setTileHeight] = useState(150);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const navigate = useNavigate();
  const hideTimeout = useRef(null);

  // ✅ Audio analysis
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const speakingTimeoutRef = useRef(null);

  /* ==============================
     ✅ AUTO-HIDE CONTROL BAR
     ============================== */
  useEffect(() => {
    const handleMouseMove = () => {
      setControlsVisible(true);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      hideTimeout.current = setTimeout(() => setControlsVisible(false), 3000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  /* ==============================
     ✅ PARTICIPANT GRID CALCULATION
     ============================== */
  const tiles = [...participants, { id: "you", name: "You", isUser: true }];
  const totalParticipants = tiles.length;
  const columns = Math.ceil(Math.sqrt(totalParticipants));
  const rows = Math.ceil(totalParticipants / columns);

  /* ==============================
     ✅ DYNAMIC TILE SIZE
     ============================== */
  useEffect(() => {
    const calculateTileSize = () => {
      const controlBarHeight = 80;
      const availableWidth = window.innerWidth - 40;
      const availableHeight = window.innerHeight - controlBarHeight;

      const maxTileWidth = availableWidth / columns;
      const maxTileHeight = availableHeight / rows;

      setTileWidth(Math.floor(maxTileWidth));
      setTileHeight(Math.floor(maxTileHeight));
    };

    calculateTileSize();
    window.addEventListener("resize", calculateTileSize);
    return () => window.removeEventListener("resize", calculateTileSize);
  }, [columns, rows]);

  /* ==============================
     ✅ ACTIVE SPEAKER DETECTION
     ============================== */
  useEffect(() => {
    if (!micOn) {
      setIsSpeaking(false);
      if (audioContextRef.current) audioContextRef.current.close();
      return;
    }

    const setupAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(stream);

        analyserRef.current.fftSize = 256;
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);

        source.connect(analyserRef.current);

        const SPEAKING_THRESHOLD = 35;
        const SILENCE_TIMEOUT = 300;

        const detectVolume = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);

          const avgVolume =
            dataArrayRef.current.reduce((a, b) => a + b, 0) / dataArrayRef.current.length;

          if (avgVolume > SPEAKING_THRESHOLD) {
            if (!isSpeaking) setIsSpeaking(true);
            if (speakingTimeoutRef.current) {
              clearTimeout(speakingTimeoutRef.current);
              speakingTimeoutRef.current = null;
            }
          } else {
            if (!speakingTimeoutRef.current) {
              speakingTimeoutRef.current = setTimeout(() => {
                setIsSpeaking(false);
                speakingTimeoutRef.current = null;
              }, SILENCE_TIMEOUT);
            }
          }

          requestAnimationFrame(detectVolume);
        };

        detectVolume();
      } catch (err) {
        console.error("Mic access error:", err);
      }
    };

    setupAudio();

    return () => {
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [micOn]); // ✅ Correct: only re-run when micOn changes

  return (
    <div className="relative w-full h-screen bg-gray-900">
      {/* ✅ PARTICIPANT GRID */}
      <div className="absolute inset-0 p-2 overflow-hidden">
        {viewMode === "grid" ? (
          <div
            className="grid gap-2 h-full justify-center transition-all duration-300 ease-in-out"
            style={{
              gridTemplateColumns: `repeat(${columns}, ${tileWidth}px)`,
              gridTemplateRows: `repeat(${rows}, ${tileHeight}px)`,
            }}
          >
            {tiles.map(({ id, name, image, isUser }) => (
              <div
                key={id}
                className="relative transition-all duration-300 ease-in-out"
                style={{ width: tileWidth, height: tileHeight }}
              >
                {/* ✅ Highlight */}
                {isUser && isSpeaking && (
                  <div className="absolute inset-0 rounded-lg ring-4 ring-green-400 pointer-events-none"></div>
                )}

                <div className="relative bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center w-full h-full">
                  {isUser ? (
                    cameraOn ? (
                      <Webcam
                        audio={false} // ✅ Mic handled separately
                        videoConstraints={{ facingMode: "user" }}
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                    ) : (
                      <div className="w-full h-full bg-black flex items-center justify-center text-white">
                        Camera Off
                      </div>
                    )
                  ) : (
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-sm text-center py-1">
                    {name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ✅ SPEAKER VIEW */
          <div className="flex h-full gap-2">
            <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden relative">
              <Webcam
                audio={false}
                videoConstraints={{ facingMode: "user" }}
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-sm text-center py-1">
                You (Speaker)
              </div>
            </div>

            <div className="flex flex-col gap-2 w-40 overflow-y-auto">
              {participants.map(({ id, name, image }) => (
                <div
                  key={id}
                  className="relative h-24 bg-gray-800 rounded-lg overflow-hidden"
                >
                  <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-xs text-center">
                    {name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ✅ CONTROL BAR */}
      <div
        className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center justify-between px-6 py-2 rounded-xl shadow-lg backdrop-blur-md bg-white/5 border border-white/10 transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "opacity-0"
        } z-50`}
        style={{ pointerEvents: controlsVisible ? "auto" : "none" }}
      >
        <div className="flex space-x-4">
          <button
            onClick={() => setMicOn(!micOn)}
            className="flex flex-col items-center text-white text-[10px] hover:opacity-80"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                micOn ? "bg-gray-700/50" : "bg-red-600/60"
              } backdrop-blur-sm`}
            >
              {micOn ? (
                <FaMicrophone size={16} />
              ) : (
                <FaMicrophoneSlash size={16} />
              )}
            </div>
            {micOn ? "Mute" : "Unmute"}
          </button>

          <button
            onClick={() => setCameraOn(!cameraOn)}
            className="flex flex-col items-center text-white text-[10px] hover:opacity-80"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                cameraOn ? "bg-gray-700/50" : "bg-red-600/60"
              } backdrop-blur-sm`}
            >
              {cameraOn ? <FaVideo size={16} /> : <FaVideoSlash size={16} />}
            </div>
            {cameraOn ? "Stop Video" : "Start Video"}
          </button>

          <button
            onClick={() => setViewMode(viewMode === "grid" ? "speaker" : "grid")}
            className="flex flex-col items-center text-white text-[10px] hover:opacity-80"
          >
            <div className="w-8 h-8 bg-gray-700/50 rounded-full flex items-center justify-center backdrop-blur-sm">
              {viewMode === "grid" ? "🎥" : "🟦"}
            </div>
            {viewMode === "grid" ? "Speaker" : "Grid"}
          </button>
        </div>

        <button
          onClick={() => navigate("/")}
          className="flex items-center bg-red-600/70 hover:bg-red-700 text-white font-bold px-3 py-2 rounded-lg space-x-1 backdrop-blur-sm text-[11px]"
        >
          <MdCallEnd size={18} />
          <span>Leave</span>
        </button>
      </div>
    </div>
  );
}
