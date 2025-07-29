import React, { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";
import { MdCallEnd } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";

/* ================================================================
   ✅ AI PARTICIPANTS: Baseline + Fake Captions (Step 1.1 + 1.2)
   ================================================================ */
export default function PracticeRoom() {
  /* ================================================================
     ✅ STATE MANAGEMENT
     ================================================================ */
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [controlsVisible, setControlsVisible] = useState(true);
  const [tileWidth, setTileWidth] = useState(200);
  const [tileHeight, setTileHeight] = useState(150);
  const [isSpeaking, setIsSpeaking] = useState(false); // Human speaking indicator
  const [transcript, setTranscript] = useState("");

  // ✅ STEP 1.1 + 1.2 – AI participants with captions
  const [participants, setParticipants] = useState([
    { id: 1, name: "Participant 1", image: "https://randomuser.me/api/portraits/men/32.jpg", isSpeaking: false, caption: "" },
    { id: 2, name: "Participant 2", image: "https://randomuser.me/api/portraits/women/44.jpg", isSpeaking: false, caption: "" },
    { id: 3, name: "Participant 3", image: "https://randomuser.me/api/portraits/men/65.jpg", isSpeaking: false, caption: "" },
    { id: 4, name: "Participant 4", image: "https://randomuser.me/api/portraits/women/22.jpg", isSpeaking: false, caption: "" },
    { id: 5, name: "Participant 5", image: "https://randomuser.me/api/portraits/men/77.jpg", isSpeaking: false, caption: "" },
  ]);

  const navigate = useNavigate();

  /* ================================================================
     ✅ REFS
     ================================================================ */
  const hideTimeout = useRef(null);
  const micStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const speakingTimeoutRef = useRef(null);
  const recognitionRef = useRef(null);
  const isRecognitionActiveRef = useRef(false);
  const restartTimeoutRef = useRef(null);

  /* ================================================================
     ✅ AUTO-HIDE CONTROLS
     ================================================================ */
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

  /* ================================================================
     ✅ DYNAMIC PARTICIPANT GRID SIZE
     ================================================================ */
  const tiles = [...participants, { id: "you", name: "You", isUser: true }];
  const totalParticipants = tiles.length;
  const columns = Math.ceil(Math.sqrt(totalParticipants));
  const rows = Math.ceil(totalParticipants / columns);

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

  /* ================================================================
     ✅ STEP 1.1 – AI Speaking Simulation
     ================================================================ */
  useEffect(() => {
    const intervals = participants.map((p) =>
      setInterval(() => {
        setParticipants((prev) =>
          prev.map((part) =>
            part.id === p.id
              ? { ...part, isSpeaking: Math.random() > 0.7 }
              : part
          )
        );
      }, Math.random() * 3000 + 2000)
    );
    return () => intervals.forEach(clearInterval);
  }, []);

  /* ================================================================
     ✅ STEP 1.2 – Fake Captions Simulation
     ================================================================ */
  const AI_RESPONSES = [
    "Interesting point!",
    "👍",
    "Could you explain that again?",
    "Makes sense.",
    "I agree with that.",
    "Hmm…",
    "👏 Great answer!"
  ];

  useEffect(() => {
    const captionIntervals = setInterval(() => {
      setParticipants((prev) =>
        prev.map((p) =>
          Math.random() > 0.8
            ? { ...p, caption: AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)] }
            : p
        )
      );
      setTimeout(() => {
        setParticipants((prev) => prev.map((p) => ({ ...p, caption: "" })));
      }, 5000);
    }, 4000);
    return () => clearInterval(captionIntervals);
  }, []);

  /* ================================================================
     ✅ ACTIVE SPEAKER DETECTION (HUMAN)
     ================================================================ */
  const safelyCloseAudioContext = () => {
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch {
        console.warn("Tried to close an already closed AudioContext");
      }
    }
    audioContextRef.current = null;
  };

  const startActiveSpeakerDetection = () => {
    if (!micOn || !micStreamRef.current) {
      setIsSpeaking(false);
      safelyCloseAudioContext();
      return;
    }
    safelyCloseAudioContext();
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(micStreamRef.current);
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      source.connect(analyserRef.current);

      const SPEAKING_THRESHOLD = 35;
      const SILENCE_TIMEOUT = 300;
      const detectVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const avgVolume = dataArrayRef.current.reduce((a, b) => a + b, 0) / dataArrayRef.current.length;
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
      console.error("Mic access error (highlight):", err);
    }
  };

  /* ================================================================
     ✅ SPEECH-TO-TEXT (unchanged)
     ================================================================ */
  const startSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      console.warn("Speech Recognition not supported");
      return;
    }
    if (!micOn || !micStreamRef.current) {
      if (recognitionRef.current) recognitionRef.current.stop();
      isRecognitionActiveRef.current = false;
      return;
    }
    if (isRecognitionActiveRef.current) return;
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = (event) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript((prev) => prev + " " + transcriptChunk);
          } else {
            interimTranscript += transcriptChunk;
          }
        }
        if (interimTranscript) {
          setTranscript((prev) =>
            prev.split(" [Speaking]")[0] + " [Speaking]: " + interimTranscript
          );
        }
      };
      recognition.onerror = (err) => {
        console.error("Speech recognition error:", err);
        isRecognitionActiveRef.current = false;
      };
      recognition.onend = () => {
        isRecognitionActiveRef.current = false;
        if (micOn) {
          if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = setTimeout(() => startSpeechRecognition(), 500);
        }
      };
      recognition.start();
      recognitionRef.current = recognition;
      isRecognitionActiveRef.current = true;
    } catch (err) {
      console.error("Speech recognition failed:", err);
      isRecognitionActiveRef.current = false;
    }
  };

  /* ================================================================
     ✅ INITIAL PERMISSION REQUEST
     ================================================================ */
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        micStreamRef.current = stream;
        console.log("Permissions granted for video + audio");
        if (micOn) {
          setTimeout(() => {
            startActiveSpeakerDetection();
            startSpeechRecognition();
          }, 300);
        }
      } catch (err) {
        console.error("Permission error:", err);
      }
    };
    requestPermissions();
  }, []);

  /* ================================================================
     ✅ MIC TOGGLE HANDLING
     ================================================================ */
  useEffect(() => {
    if (micStreamRef.current) {
      if (micOn) {
        startActiveSpeakerDetection();
        setTimeout(() => startSpeechRecognition(), 300);
      } else {
        safelyCloseAudioContext();
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = null;
        }
        if (recognitionRef.current) {
          try {
            recognitionRef.current.onresult = null;
            recognitionRef.current.onend = null;
            recognitionRef.current.stop();
          } catch {
            console.warn("Tried to stop recognition that wasn't running");
          }
        }
        isRecognitionActiveRef.current = false;
        setIsSpeaking(false);
      }
    }
  }, [micOn]);

  /* ================================================================
     ✅ RENDER
     ================================================================ */
  return (
    <div className="relative w-full h-screen bg-gray-900">
      <div className="absolute inset-0 p-2 overflow-hidden">
        {viewMode === "grid" ? (
          <div
            className="grid gap-2 h-full justify-center transition-all duration-300 ease-in-out"
            style={{
              gridTemplateColumns: `repeat(${columns}, ${tileWidth}px)`,
              gridTemplateRows: `repeat(${rows}, ${tileHeight}px)`,
            }}
          >
            {tiles.map(({ id, name, image, isUser }) => {
              const participantData = participants.find((p) => p.id === id);
              return (
                <div
                  key={id}
                  className="relative transition-all duration-300 ease-in-out"
                  style={{ width: tileWidth, height: tileHeight }}
                >
                  {/* ✅ Green highlight (Human + AI) */}
                  {(isUser ? isSpeaking : participantData?.isSpeaking) && (
                    <div className="absolute inset-0 rounded-lg ring-4 ring-green-400 pointer-events-none"></div>
                  )}

                  <div className="relative bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center w-full h-full">
                    {isUser ? (
                      cameraOn ? (
                        <Webcam
                          audio={false}
                          videoConstraints={{ facingMode: "user" }}
                          className="w-full h-full object-cover scale-x-[-1]"
                        />
                      ) : (
                        <div className="w-full h-full bg-black flex items-center justify-center text-white">
                          Camera Off
                        </div>
                      )
                    ) : (
                      <img src={image} alt={name} className="w-full h-full object-cover" />
                    )}

                    {/* ✅ AI Captions (Step 1.2) */}
                    {!isUser && participantData?.caption && (
                      <div className="absolute bottom-8 w-full text-center text-xs text-yellow-300 px-2">
                        {participantData.caption}
                      </div>
                    )}

                    {/* ✅ Name Bar */}
                    <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-sm text-center py-1">
                      {name}
                    </div>

                    {/* ✅ Human Transcript */}
                    {isUser && transcript && (
                      <div className="absolute bottom-8 w-full text-center text-xs text-green-300 px-2">
                        {transcript.slice(-100)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
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
              {transcript && (
                <div className="absolute bottom-8 w-full text-center text-xs text-green-300 px-2">
                  {transcript.slice(-120)}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 w-40 overflow-y-auto">
              {participants.map(({ id, name, image, isSpeaking, caption }) => (
                <div key={id} className="relative h-24 bg-gray-800 rounded-lg overflow-hidden">
                  {isSpeaking && (
                    <div className="absolute inset-0 rounded-lg ring-2 ring-green-400 pointer-events-none"></div>
                  )}
                  {caption && (
                    <div className="absolute top-0 w-full text-center text-[10px] text-yellow-300 bg-black/50">
                      {caption}
                    </div>
                  )}
                  <img src={image} alt={name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-xs text-center">
                    {name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ✅ Control Bar (Unchanged) */}
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
              {micOn ? <FaMicrophone size={16} /> : <FaMicrophoneSlash size={16} />}
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

