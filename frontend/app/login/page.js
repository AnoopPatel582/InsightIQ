"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("access_token")) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please provide both username and password.");
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
        setError(data.detail || "Authentication failed. Invalid credentials.");
      }
    } catch {
      setError("Unable to connect to analytics service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-canvas px-4 relative overflow-hidden vercel-mesh-hero">
      <div className="animate-fade-up w-full max-w-sm z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-sm bg-ink text-canvas mb-4 shadow-whisper">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L2 22h20L12 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">
            Insight<span className="text-body font-normal">IQ</span>
          </h1>
          <p className="mono-eyebrow text-[10.5px] mt-1">
            Enterprise Analytics &amp; Decision System
          </p>
        </div>

        {/* Card */}
        <div className="card-geist p-7 shadow-floating border border-hairline">
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-ink tracking-tight">Authenticate</h2>
            <p className="text-xs text-mute mt-0.5">Enter your operator credentials to enter</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Username Input */}
            <div>
              <label htmlFor="username" className="mono-eyebrow text-[10px] mb-1.5 block">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-3 py-2 rounded-sm bg-canvas border border-hairline text-ink placeholder-faint text-xs focus:outline-none focus:border-accent-blue transition-colors duration-150"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="mono-eyebrow text-[10px] mb-1.5 block">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-sm bg-canvas border border-hairline text-ink placeholder-faint text-xs focus:outline-none focus:border-accent-blue transition-colors duration-150"
                disabled={loading}
              />
            </div>

            {/* Error Notification */}
            {error && (
              <div className="flex items-start gap-2 text-xs text-accent-red bg-accent-red/10 border border-accent-red/20 rounded-sm px-3 py-2 animate-fade-up">
                <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Pill CTA */}
            <div className="pt-2">
              <button
                id="loginBtn"
                type="submit"
                disabled={loading}
                className="w-full button-pill-primary cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-canvas border-t-transparent animate-spin inline-block" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  "Continue to Dashboard"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Technical Footer */}
        <p className="text-center mono-eyebrow text-[9.5px] text-faint mt-6">
          Geist Design Language • InsightIQ v1.0
        </p>
      </div>
    </main>
  );
}
