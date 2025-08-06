// src/Components/Navbar/Navbar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/prax-full-logo.png";

/**
 * Navbar
 * Renders nothing if visible=false.
 */
export default function Navbar({ visible }) {
  // Don’t render the nav at all until visible === true
  if (!visible) return null;

  const { pathname } = useLocation();

  const links = [
    { to: "/",         label: "Home"      },
    { to: "/games",    label: "Games"     },
    { to: "/progress", label: "Progress"  },
    { to: "/simulated",label: "Simulated" },
  ];

  return (
    <nav className="backdrop-blur-md bg-white/80 shadow-md transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand logo */}
        <Link to="/">
          <img src={logo} alt="Prax logo" className="h-8" />
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex space-x-8 text-gray-700 font-medium">
          {links.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={`hover:text-blue-600 transition-colors ${
                  pathname === to ? "text-blue-600" : ""
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Call-to-Action button */}
        <Link
          to="/"
          className="hidden md:inline-block bg-blue-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-500 transition"
        >
          Get Started
        </Link>

        {/* Mobile “hamburger” placeholder */}
        <button className="md:hidden text-gray-700">
          ☰
        </button>
      </div>
    </nav>
  );
}
