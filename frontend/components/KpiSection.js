"use client";

import { useEffect, useState } from "react";
import KpiCard from "./KpiCard";
import { apiFetch, buildQuery } from "@/lib/api";

// ── Format helpers ───────────────────────────────────────────

function fmtCurrency(n) {
  if (n == null || isNaN(n)) return "—";
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${Number(n).toFixed(2)}`;
}

function fmtInt(n) {
  if (n == null) return "—";
  return Number(n).toLocaleString();
}

function fmtPct(n) {
  if (n == null) return "—";
  return `${Number(n).toFixed(1)}%`;
}

// ── Icons ────────────────────────────────────────────────────

const Icons = {
  revenue: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  profit: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  orders: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  quantity: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  aov: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  margin: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
  ),
};

// ── KPI card definitions ─────────────────────────────────────

function buildCards(kpis) {
  return [
    {
      title:       "Total Revenue",
      value:       fmtCurrency(kpis?.total_revenue),
      icon:        Icons.revenue,
      accentClass: "card-accent-blue",
      glowClass:   "shadow-glow-blue",
      bgClass:     "bg-gradient-blue",
    },
    {
      title:       "Total Profit",
      value:       fmtCurrency(kpis?.total_profit),
      icon:        Icons.profit,
      accentClass: "card-accent-green",
      glowClass:   "",
      bgClass:     "bg-gradient-green",
    },
    {
      title:       "Total Orders",
      value:       fmtInt(kpis?.total_orders),
      icon:        Icons.orders,
      accentClass: "card-accent-purple",
      glowClass:   "shadow-glow-purple",
      bgClass:     "bg-gradient-purple",
    },
    {
      title:       "Units Sold",
      value:       fmtInt(kpis?.total_quantity),
      icon:        Icons.quantity,
      accentClass: "card-accent-cyan",
      glowClass:   "",
      bgClass:     "bg-gradient-blue",
    },
    {
      title:       "Avg Order Value",
      value:       fmtCurrency(kpis?.avg_order_value),
      icon:        Icons.aov,
      accentClass: "card-accent-amber",
      glowClass:   "",
      bgClass:     "bg-gradient-amber",
    },
    {
      title:       "Profit Margin",
      value:       fmtPct(kpis?.profit_margin),
      icon:        Icons.margin,
      accentClass: "card-accent-green",
      glowClass:   "",
      bgClass:     "bg-gradient-green",
    },
  ];
}

// ── Component ────────────────────────────────────────────────

/**
 * KpiSection
 * ----------
 * Fetches /api/dashboard/kpis and renders 6 KPI cards in a responsive grid.
 *
 * Props:
 *  - filters {Object} — active filter params (date_from, date_to, region, category)
 */
export default function KpiSection({ filters = {} }) {
  const [kpis, setKpis]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    apiFetch(`/api/dashboard/kpis${buildQuery(filters)}`)
      .then((data) => { if (!cancelled) { setKpis(data); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });

    return () => { cancelled = true; };
  }, [JSON.stringify(filters)]);

  const cards = buildCards(kpis);

  return (
    <section id="kpis" className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">
          Key Performance Indicators
        </h3>
        {error && (
          <span className="text-xs text-red-400 bg-red-400/10 px-3 py-1 rounded-full border border-red-400/20">
            ⚠ {error}
          </span>
        )}
      </div>

      {/* 6-column responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card) => (
          <KpiCard key={card.title} {...card} loading={loading} />
        ))}
      </div>
    </section>
  );
}
