import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";

// Pages
import LandingPage from "./pages/LandingPage";
import PublicSpeakingGames from "./pages/PublicSpeakingGames";
import ImpromptuChallenge from "./pages/ImpromptuChallenge";
// Future game routes (optional)
// import PersuasionDuel from "./pages/PersuasionDuel";
// import StorySpin from "./pages/StorySpin";
// import ElevatorPitch from "./pages/ElevatorPitch";

export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/games" element={<PublicSpeakingGames />} />
          <Route path="/games/impromptu" element={<ImpromptuChallenge />} />
          {/* Future routes can go here */}
          {/* <Route path="/games/persuasion" element={<PersuasionDuel />} /> */}
        </Routes>
      </div>
    </div>
  );
}

