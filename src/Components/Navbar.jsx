import { Link, useLocation } from "react-router-dom";
import logo from "../assets/prax-full-logo.png"; // Move your logo to src/assets if needed

export default function Navbar() {
  const { pathname } = useLocation();
  const links = [
    { to: "/", label: "Home" },
    { to: "/practice", label: "Practice Room" },
    { to: "/games", label: "Games" }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img
            src={logo}
            alt="Prax Logo"
            className="h-16 w-auto object-contain"
          />
        </Link>

        {/* Nav Links */}
        <div className="flex space-x-8">
          {links.map(({ to, label }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`relative font-medium hover:text-blue-500 transition ${
                  isActive ? "text-blue-600" : "text-gray-700"
                }`}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
