import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";

const participants = [
  { id: 1, name: "Participant 1", image: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: 2, name: "Participant 2", image: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: 3, name: "Participant 3", image: "https://randomuser.me/api/portraits/men/65.jpg" },
  { id: 4, name: "Participant 4", image: "https://randomuser.me/api/portraits/women/22.jpg" },
  { id: 5, name: "Participant 5", image: "https://randomuser.me/api/portraits/men/77.jpg" },
];

export default function PracticeRoom() {
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const navigate = useNavigate();

  const tiles = [...participants, { id: "you", name: "You", isUser: true }];

  return (
    <div className="relative w-full h-full bg-gray-900 grid grid-cols-3 grid-rows-2 gap-2 p-2 pt-16 overflow-hidden">
      {tiles.map(({ id, name, image, isUser }) => (
        <div
          key={id}
          className="relative bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center"
        >
          {isUser ? (
            cameraOn ? (
              <Webcam
                audio={micOn}
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
              onError={(e) =>
                (e.currentTarget.src =
                  "https://via.placeholder.com/300?text=No+Image")
              }
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-sm text-center py-1">
            {name}
          </div>
        </div>
      ))}

      {/* ✅ Control Buttons */}
      {/* ✅ Zoom-Style Control Bar */}
<div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 flex items-center justify-between px-8 py-3">
  {/* Left Controls (Mic + Camera) */}
  <div className="flex space-x-4">
    <button
      onClick={() => setMicOn(!micOn)}
      className={`flex flex-col items-center text-white text-sm ${
        micOn ? "hover:text-green-400" : "hover:text-red-400"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${
          micOn ? "bg-gray-700" : "bg-red-600"
        }`}
      >
        {micOn ? "🎤" : "🔇"}
      </div>
      {micOn ? "Mute" : "Unmute"}
    </button>

    <button
      onClick={() => setCameraOn(!cameraOn)}
      className={`flex flex-col items-center text-white text-sm ${
        cameraOn ? "hover:text-green-400" : "hover:text-red-400"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${
          cameraOn ? "bg-gray-700" : "bg-red-600"
        }`}
      >
        {cameraOn ? "📷" : "🚫"}
      </div>
      {cameraOn ? "Stop Video" : "Start Video"}
    </button>
  </div>

  {/* Right Control (Leave Meeting) */}
  <button
    onClick={() => navigate("/")}
    className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg"
  >
    Leave
  </button>
</div>

    </div>
  );
}

