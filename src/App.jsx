import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import LandingPage from "./pages/LandingPage";
import PracticeRoom from "./pages/PracticeRoom";
import PublicSpeakingGames from "./pages/PublicSpeakingGames";
import ImpromptuChallenge from "./pages/ImpromptuChallenge"; // ✅ Move import to top

export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/practice" element={<PracticeRoom />} />
          <Route path="/games" element={<PublicSpeakingGames />} />
          <Route path="/games/impromptu" element={<ImpromptuChallenge />} /> {/* ✅ Works now */}
        </Routes>
      </div>
    </div>
  );
}


