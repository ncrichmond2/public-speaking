import React, { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";
import { MdCallEnd } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";

/* ================================================================
   ✅ PARTICIPANTS LIST (Dummy data - replace later with live data)
   ================================================================ */
const participants = [
  { id: 1, name: "Participant 1", image: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: 2, name: "Participant 2", image: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: 3, name: "Participant 3", image: "https://randomuser.me/api/portraits/men/65.jpg" },
  { id: 4, name: "Participant 4", image: "https://randomuser.me/api/portraits/women/22.jpg" },
  { id: 5, name: "Participant 5", image: "https://randomuser.me/api/portraits/men/77.jpg" },
];

export default function PracticeRoom() {
  /* ================================================================
     ✅ STATE MANAGEMENT
     ================================================================ */
  const [cameraOn, setCameraOn] = useState(true);        // Toggles user video
  const [micOn, setMicOn] = useState(true);              // Toggles mic on/off
  const [viewMode, setViewMode] = useState("grid");      // "grid" or "speaker" view
  const [controlsVisible, setControlsVisible] = useState(true); // Auto-hide control bar
  const [tileWidth, setTileWidth] = useState(200);       // Participant tile width
  const [tileHeight, setTileHeight] = useState(150);     // Participant tile height
  const [isSpeaking, setIsSpeaking] = useState(false);   // Green highlight when speaking
  const [transcript, setTranscript] = useState("");      // Speech-to-text results

  const navigate = useNavigate();

  /* ================================================================
     ✅ REFS (used to persist objects between renders)
     ================================================================ */
  const hideTimeout = useRef(null);           // Control bar auto-hide timeout
  const micStreamRef = useRef(null);          // Mic + camera shared stream

  const audioContextRef = useRef(null);       // For active speaker detection
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const speakingTimeoutRef = useRef(null);

  const recognitionRef = useRef(null);        // Speech-to-text recognition instance
  const isRecognitionActiveRef = useRef(false);
  const restartTimeoutRef = useRef(null);     // Prevents infinite restart loops

  /* ================================================================
     ✅ AUTO-HIDE CONTROLS (appears on mouse move, hides after 3s)
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
     ✅ DYNAMIC PARTICIPANT GRID SIZE (Zoom-like layout)
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
     ✅ HELPER: SAFELY CLOSE AUDIO CONTEXT (prevents "already closed" errors)
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

  /* ================================================================
     ✅ ACTIVE SPEAKER DETECTION (green highlight when talking)
     ================================================================ */
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
      console.error("Mic access error (highlight):", err);
    }
  };

  /* ================================================================
     ✅ SPEECH-TO-TEXT (Web Speech API)
     ================================================================ */
  const startSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      console.warn("Speech Recognition not supported in this browser");
      return;
    }

    if (!micOn || !micStreamRef.current) {
      if (recognitionRef.current) recognitionRef.current.stop();
      isRecognitionActiveRef.current = false;
      return;
    }

    if (isRecognitionActiveRef.current) return; // ✅ Avoid multiple starts

    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
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
          setTranscript(
            (prev) =>
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
          restartTimeoutRef.current = setTimeout(() => {
            startSpeechRecognition();
          }, 500);
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
     ✅ INITIAL PERMISSION REQUEST (video + audio)
     ================================================================ */
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================================================================
     ✅ MIC TOGGLE HANDLING ("True Mute" logic)
     ================================================================ */
  useEffect(() => {
    if (micStreamRef.current) {
      if (micOn) {
        // ✅ UNMUTE: restart everything
        startActiveSpeakerDetection();
        setTimeout(() => startSpeechRecognition(), 300);
      } else {
        // ✅ MUTE: immediately stop everything
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
          } catch (err) {
            console.warn("Tried to stop recognition that wasn't running:", err);
          }
        }

        isRecognitionActiveRef.current = false;
        setIsSpeaking(false);
        // setTranscript(""); // ✅ Uncomment if you want to fully clear transcript when muted
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [micOn]);

  /* ================================================================
     ✅ RENDER
     ================================================================ */
  return (
    <div className="relative w-full h-screen bg-gray-900">
      {/* ==============================
          ✅ PARTICIPANT GRID
          ============================== */}
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
                {/* ✅ Active speaker green highlight */}
                {isUser && isSpeaking && (
                  <div className="absolute inset-0 rounded-lg ring-4 ring-green-400 pointer-events-none"></div>
                )}

                <div className="relative bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center w-full h-full">
                  {/* ✅ User tile (camera or "Camera Off") */}
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
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* ✅ Name bar */}
                  <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-sm text-center py-1">
                    {name}
                  </div>

                  {/* ✅ Small speech-to-text overlay */}
                  {isUser && transcript && (
                    <div className="absolute bottom-8 w-full text-center text-xs text-green-300 px-2">
                      {transcript.slice(-100)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ==============================
             ✅ SPEAKER VIEW
             ============================== */
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

            {/* ✅ Thumbnails */}
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

      {/* ==============================
          ✅ FLOATING CONTROL BAR
          ============================== */}
      <div
        className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center justify-between px-6 py-2 rounded-xl shadow-lg backdrop-blur-md bg-white/5 border border-white/10 transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "opacity-0"
        } z-50`}
        style={{ pointerEvents: controlsVisible ? "auto" : "none" }}
      >
        <div className="flex space-x-4">
          {/* ✅ Mic toggle */}
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

          {/* ✅ Camera toggle */}
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

          {/* ✅ View toggle */}
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

        {/* ✅ Leave button */}
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
