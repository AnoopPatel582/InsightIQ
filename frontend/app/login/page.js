"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // If already logged in, skip to dashboard
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("access_token")) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("username", username.trim());
        router.push("/dashboard");
      } else {
        setError(data.detail || "Incorrect username or password.");
      }
    } catch {
      setError("Cannot reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-primary px-4 relative overflow-hidden">

      {/* ── Background glow orbs ─────────────────────────────── */}
      <div
        className="pointer-events-none absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }}
      />

      {/* ── Card ─────────────────────────────────────────────── */}
      <div className="animate-fade-up w-full max-w-md">

        {/* Logo + heading */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-blue shadow-glow-blue mb-5">
            {/* Chart icon */}
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 17l4-8 4 4 4-6 4 4" />
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 21h18" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            Insight<span className="text-gradient-blue">IQ</span>
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Business Analytics &amp; Decision Support
          </p>
        </div>

        {/* Form card */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-text-primary mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-text-secondary mb-8">
            Sign in to your analytics dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-4 py-3 rounded-md bg-bg-secondary border border-[rgba(99,130,201,0.2)]
                           text-text-primary placeholder-text-muted text-sm
                           focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue
                           transition-colors duration-200"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-md bg-bg-secondary border border-[rgba(99,130,201,0.2)]
                           text-text-primary placeholder-text-muted text-sm
                           focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue
                           transition-colors duration-200"
                disabled={loading}
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-md px-4 py-3">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              id="loginBtn"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-md font-semibold text-sm text-white
                         bg-gradient-blue shadow-glow-blue
                         hover:opacity-90 active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-text-muted mt-6">
          InsightIQ v1.0 &mdash; Business Analytics Platform
        </p>
      </div>
    </main>
  );
}
