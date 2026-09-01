"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar({ lastUpdated }) {
  const router = useRouter();
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

  const initials = username.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-canvas/80 backdrop-blur-md border-b border-hairline">
      {/* Left — Title */}
      <div>
        <h1 className="text-base font-semibold text-ink tracking-tight">
          Analytics Dashboard
        </h1>
        {lastUpdated && (
          <p className="mono-eyebrow text-[10px] text-mute mt-0.5">
            Updated {lastUpdated}
          </p>
        )}
      </div>

      {/* Right — User Menu */}
      <div className="relative">
        <button
          id="userMenuBtn"
          onClick={() => setShowMenu((v) => !v)}
          className="button-geist-sm flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-ink text-canvas flex items-center justify-center text-[10px] font-bold">
            {initials}
          </div>
          <span className="text-xs font-medium text-ink">{username}</span>
          <svg
            className={`w-3 h-3 text-mute transition-transform duration-150 ${showMenu ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 card-geist py-1 shadow-floating z-50 animate-fade-up">
            <div className="px-3.5 py-2 border-b border-hairline">
              <p className="mono-eyebrow text-[9px]">Account</p>
              <p className="text-xs font-medium text-ink truncate mt-0.5">{username}</p>
            </div>
            <button
              id="logoutBtn"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-mute hover:text-accent-red hover:bg-white/5 transition-colors duration-150 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
