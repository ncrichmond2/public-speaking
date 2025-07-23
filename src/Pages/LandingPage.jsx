import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="w-screen h-screen bg-gray-900 flex flex-col items-center justify-center text-center text-white p-4">
      <h1 className="text-4xl font-bold mb-4">Public Speaking Practice</h1>
      <p className="text-lg mb-6 max-w-md">
        Practice your public speaking in a simulated Zoom-like room. Build confidence, improve delivery, and track your progress!
      </p>
      <Link
        to="/practice"
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
      >
        Start Practicing
      </Link>
    </div>
  );
}
