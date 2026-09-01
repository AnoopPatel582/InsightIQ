"use client";

import { useEffect, useState } from "react";
import { apiFetch, buildQuery } from "@/lib/api";

function InsightIcon() {
  return (
    <svg className="w-4 h-4 text-mute" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  );
}

function InsightCard({ title, description, value }) {
  return (
    <div className="card-geist p-4.5 flex flex-col justify-between gap-3 animate-fade-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center justify-center w-7 h-7 rounded-sm bg-white/5 border border-hairline shrink-0">
          <InsightIcon />
        </div>
        {value && (
          <span className="mono-eyebrow text-xs text-ink bg-white/5 border border-hairline px-2 py-0.5 rounded-sm shrink-0">
            {value}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold text-ink tracking-tight mb-1">{title}</p>
        <p className="text-xs text-body leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function InsightSkeleton() {
  return (
    <div className="card-geist p-4.5 animate-pulse space-y-3">
      <div className="flex items-start justify-between">
        <div className="w-7 h-7 rounded-sm bg-white/5" />
        <div className="w-12 h-4 rounded bg-white/5" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-3/4 rounded bg-white/5" />
        <div className="h-2.5 w-full rounded bg-white/5" />
        <div className="h-2.5 w-2/3 rounded bg-white/5" />
      </div>
    </div>
  );
}

export default function InsightsSection({ filters = {} }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    apiFetch(`/api/analytics/insights${buildQuery(filters)}`)
      .then((d) => {
        if (!cancelled) {
          setInsights(d);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(filters)]);

  return (
    <section id="insights" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="mono-eyebrow text-xs">Automated Insights</h3>
        {error && (
          <span className="mono-eyebrow text-[10px] text-accent-red bg-accent-red/10 border border-accent-red/20 px-2.5 py-0.5 rounded-sm">
            ⚠ {error}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <InsightSkeleton key={i} />
          ))}
        </div>
      ) : insights.length === 0 ? (
        <div className="card-geist p-8 flex flex-col items-center justify-center text-center gap-2.5">
          <InsightIcon />
          <p className="text-xs text-mute">
            No insights generated yet. Ingest sales data below to evaluate rule-based signals.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {insights.map((ins, i) => (
            <InsightCard key={i} {...ins} />
          ))}
        </div>
      )}
    </section>
  );
}
