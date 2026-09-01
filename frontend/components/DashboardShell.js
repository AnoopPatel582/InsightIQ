"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardShell({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      router.replace("/login");
    } else {
      setReady(true);
      setLastUpdated(new Date().toLocaleTimeString());
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-hairline border-t-ink animate-spin" />
          <p className="mono-eyebrow text-xs text-mute">Validating session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar lastUpdated={lastUpdated} />

        <main className="flex-1 px-6 py-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
