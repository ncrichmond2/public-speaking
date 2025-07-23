import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import LandingPage from "./pages/LandingPage";
import PracticeRoom from "./pages/PracticeRoom";

export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/practice" element={<PracticeRoom />} />
        </Routes>
      </div>
    </div>
  );
}


