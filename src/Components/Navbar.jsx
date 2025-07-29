import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center shadow-md">
      {/* Logo / App Name */}
      <Link to="/" className="text-xl font-bold hover:text-blue-400">
        Public Speaking App
      </Link>

      {/* Navigation Links */}
      <div className="flex space-x-4">
        <Link
          to="/"
          className={`hover:text-blue-400 ${
            location.pathname === "/" ? "text-blue-400" : ""
          }`}
        >
          Home
        </Link>

        <Link
          to="/practice"
          className={`hover:text-blue-400 ${
            location.pathname === "/practice" ? "text-blue-400" : ""
          }`}
        >
          Practice Room
        </Link>

        {/* ✅ New Games Link */}
        <Link
          to="/games"
          className={`hover:text-blue-400 ${
            location.pathname === "/games" ? "text-blue-400" : ""
          }`}
        >
          Games
        </Link>
      </div>
    </nav>
  );
}
