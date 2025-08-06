import { Link, useLocation } from "react-router-dom";
import logo from "../assets/prax-full-logo.png";

export default function Navbar({ visible }) {
  // ⛔ Prevent rendering completely if not visible
  if (!visible) return null;

  const { pathname } = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/practice", label: "Practice Room" },
    { to: "/games", label: "Games" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 bg-white bg-opacity-80 backdrop-blur-md shadow-sm transition-opacity duration-700 opacity-100"
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img
            src={logo}
            alt="Prax Logo"
            className="h-12 sm:h-14 w-auto object-contain"
          />
        </Link>

        <div className="flex space-x-6 sm:space-x-10">
          {links.map(({ to, label }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`relative font-medium text-base transition-colors duration-300 ${
                  isActive
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-500"
                }`}
              >
                {label}
                <span
                  className={`absolute left-0 bottom-[-2px] h-[2px] w-full bg-blue-600 transform transition-transform duration-300 ${
                    isActive ? "scale-x-100" : "scale-x-0"
                  } origin-left`}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
