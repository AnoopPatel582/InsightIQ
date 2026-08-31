"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar({ lastUpdated }) {
  const router   = useRouter();
  const [username, setUsername] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setUsername(localStorage.getItem("username") || "User");
  }, []);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    router.push("/login");
  }

  // Initials avatar (first letter of username)
  const initials = username.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between
                       px-6 py-3 bg-bg-secondary/80 backdrop-blur-md
                       border-b border-[rgba(99,130,201,0.12)]">

      {/* Left — Page title */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary leading-tight">
          Analytics Dashboard
        </h1>
        {lastUpdated && (
          <p className="text-xs text-text-muted mt-0.5">
            Last updated: {lastUpdated}
          </p>
        )}
      </div>

      {/* Right — User menu */}
      <div className="relative">
        <button
          id="userMenuBtn"
          onClick={() => setShowMenu((v) => !v)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-md
                     bg-bg-card border border-[rgba(99,130,201,0.15)]
                     hover:border-accent-blue/50 transition-all duration-200 group"
        >
          {/* Avatar circle */}
          <div className="w-7 h-7 rounded-full bg-gradient-blue flex items-center justify-center
                          text-xs font-bold text-white shadow-glow-blue">
            {initials}
          </div>
          <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary
                           transition-colors duration-200">
            {username}
          </span>
          {/* Chevron */}
          <svg
            className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${showMenu ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {showMenu && (
          <div className="absolute right-0 mt-2 w-44 glass-card py-1 shadow-card z-50">
            <div className="px-4 py-2 border-b border-[rgba(99,130,201,0.12)]">
              <p className="text-xs text-text-muted">Signed in as</p>
              <p className="text-sm font-semibold text-text-primary truncate">{username}</p>
            </div>
            <button
              id="logoutBtn"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary
                         hover:text-accent-red hover:bg-accent-red/5 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
