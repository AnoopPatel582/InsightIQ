"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

const EMPTY = { date_from: "", date_to: "", region: "", category: "" };

/**
 * FilterBar
 * ---------
 * Renders date-range inputs + region + category dropdowns.
 * Calls onChange(filters) on every field change (auto-apply — no submit button needed).
 * Dynamically loads region and category options from the API.
 *
 * Props:
 *  - onChange {Function} — receives the current filters object
 *  - refreshKey {number} — increment to reload dropdown options after an upload
 */
export default function FilterBar({ onChange, refreshKey = 0 }) {
  const [filters, setFilters]     = useState(EMPTY);
  const [regions, setRegions]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingOpts, setLoadingOpts] = useState(false);
  const [activeCount, setActiveCount] = useState(0);

  // ── Load dropdown options ──────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoadingOpts(true);

    Promise.all([
      apiFetch("/api/analytics/regions").catch(() => []),
      apiFetch("/api/analytics/categories").catch(() => []),
    ]).then(([r, c]) => {
      if (!cancelled) {
        setRegions(r.map((x) => x.region).filter(Boolean).sort());
        setCategories(c.map((x) => x.category).filter(Boolean).sort());
        setLoadingOpts(false);
      }
    });

    return () => { cancelled = true; };
  }, [refreshKey]);

  // ── Notify parent on every change ─────────────────────────
  const updateFilter = useCallback(
    (key, value) => {
      const next = { ...filters, [key]: value };
      setFilters(next);
      // Count active (non-empty) filters for the badge
      setActiveCount(Object.values(next).filter((v) => v !== "").length);
      onChange(next);
    },
    [filters, onChange]
  );

  // ── Reset all filters ──────────────────────────────────────
  function handleReset() {
    setFilters(EMPTY);
    setActiveCount(0);
    onChange(EMPTY);
  }

  return (
    <div className="glass-card px-5 py-4">
      <div className="flex flex-wrap items-end gap-4">

        {/* Label + badge */}
        <div className="flex items-center gap-2 mr-2">
          <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          <span className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Filters
          </span>
          {activeCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full
                             bg-accent-blue text-white text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </div>

        {/* Date From */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
            From
          </label>
          <input
            id="filterDateFrom"
            type="date"
            value={filters.date_from}
            onChange={(e) => updateFilter("date_from", e.target.value)}
            className="px-3 py-2 rounded-md bg-bg-secondary border border-[rgba(99,130,201,0.2)]
                       text-text-primary text-sm focus:outline-none focus:border-accent-blue
                       focus:ring-1 focus:ring-accent-blue transition-colors duration-200
                       [color-scheme:dark]"
          />
        </div>

        {/* Date To */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
            To
          </label>
          <input
            id="filterDateTo"
            type="date"
            value={filters.date_to}
            onChange={(e) => updateFilter("date_to", e.target.value)}
            className="px-3 py-2 rounded-md bg-bg-secondary border border-[rgba(99,130,201,0.2)]
                       text-text-primary text-sm focus:outline-none focus:border-accent-blue
                       focus:ring-1 focus:ring-accent-blue transition-colors duration-200
                       [color-scheme:dark]"
          />
        </div>

        {/* Region */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
            Region
          </label>
          <select
            id="filterRegion"
            value={filters.region}
            onChange={(e) => updateFilter("region", e.target.value)}
            disabled={loadingOpts}
            className="px-3 py-2 rounded-md bg-bg-secondary border border-[rgba(99,130,201,0.2)]
                       text-text-primary text-sm focus:outline-none focus:border-accent-blue
                       focus:ring-1 focus:ring-accent-blue transition-colors duration-200
                       disabled:opacity-50 cursor-pointer min-w-[140px]"
          >
            <option value="">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
            Category
          </label>
          <select
            id="filterCategory"
            value={filters.category}
            onChange={(e) => updateFilter("category", e.target.value)}
            disabled={loadingOpts}
            className="px-3 py-2 rounded-md bg-bg-secondary border border-[rgba(99,130,201,0.2)]
                       text-text-primary text-sm focus:outline-none focus:border-accent-blue
                       focus:ring-1 focus:ring-accent-blue transition-colors duration-200
                       disabled:opacity-50 cursor-pointer min-w-[160px]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Reset button — only visible when a filter is active */}
        {activeCount > 0 && (
          <button
            id="filterResetBtn"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium
                       text-text-secondary border border-[rgba(99,130,201,0.2)]
                       hover:text-accent-red hover:border-accent-red/40 hover:bg-accent-red/5
                       transition-all duration-200 self-end"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
