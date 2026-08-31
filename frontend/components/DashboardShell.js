"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

/**
 * DashboardShell
 * --------------
 * Client-side auth guard + layout wrapper for all /dashboard/* pages.
 *
 * On mount:
 *  - Checks localStorage for access_token.
 *  - If missing → redirects to /login immediately.
 *  - If present → renders Sidebar + Navbar + children.
 *
 * Props:
 *  - children: page content
 */
export default function DashboardShell({ children }) {
  const router = useRouter();
  const [ready, setReady]           = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
    } else {
      setReady(true);
      setLastUpdated(new Date().toLocaleString());
    }
  }, [router]);

  // While checking auth, show a full-screen loading state
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" />
          <p className="text-sm text-text-secondary">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Sidebar — fixed left column on desktop */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar lastUpdated={lastUpdated} />

        {/* Page content */}
        <main className="flex-1 px-6 py-8 space-y-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
