"use client";

import { useEffect, useState } from "react";
import { apiFetch, buildQuery } from "@/lib/api";

// ── Icon per insight type ────────────────────────────────────
function InsightIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

// ── Single insight card ──────────────────────────────────────
function InsightCard({ title, description, value }) {
  return (
    <div className="glass-card card-accent-purple p-5 flex flex-col gap-3 animate-fade-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-purple shrink-0">
          <span className="text-white"><InsightIcon /></span>
        </div>
        {value && (
          <span className="text-lg font-bold text-gradient-blue shrink-0">
            {value}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="mt-1 text-xs text-text-secondary leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ── Loading skeleton ─────────────────────────────────────────
function InsightSkeleton() {
  return (
    <div className="glass-card p-5 animate-pulse space-y-3">
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-lg bg-bg-secondary" />
        <div className="w-16 h-5 rounded bg-bg-secondary" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-3/4 rounded bg-bg-secondary" />
        <div className="h-3 w-full rounded bg-bg-secondary" />
        <div className="h-3 w-2/3 rounded bg-bg-secondary" />
      </div>
    </div>
  );
}

// ── Main section ─────────────────────────────────────────────
export default function InsightsSection({ filters = {} }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    apiFetch(`/api/analytics/insights${buildQuery(filters)}`)
      .then((d) => { if (!cancelled) { setInsights(d); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [JSON.stringify(filters)]);

  return (
    <section id="insights" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">
          Business Insights
        </h3>
        {error && (
          <span className="text-xs text-red-400 bg-red-400/10 px-3 py-1 rounded-full border border-red-400/20">
            ⚠ {error}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <InsightSkeleton key={i} />)}
        </div>
      ) : insights.length === 0 ? (
        <div className="glass-card p-8 flex flex-col items-center justify-center text-center gap-3">
          <InsightIcon />
          <p className="text-sm text-text-secondary">
            No insights yet — upload sales data to generate business observations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((ins, i) => (
            <InsightCard key={i} {...ins} />
          ))}
        </div>
      )}
    </section>
  );
}
