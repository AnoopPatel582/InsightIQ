"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

const EMPTY = { date_from: "", date_to: "", region: "", category: "" };

export default function FilterBar({ onChange, refreshKey = 0 }) {
  const [filters, setFilters] = useState(EMPTY);
  const [regions, setRegions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingOpts, setLoadingOpts] = useState(false);
  const [activeCount, setActiveCount] = useState(0);

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

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const updateFilter = useCallback(
    (key, value) => {
      const next = { ...filters, [key]: value };
      setFilters(next);
      setActiveCount(Object.values(next).filter((v) => v !== "").length);
      onChange(next);
    },
    [filters, onChange]
  );

  function handleReset() {
    setFilters(EMPTY);
    setActiveCount(0);
    onChange(EMPTY);
  }

  return (
    <div className="card-geist px-5 py-4" role="search" aria-label="Dashboard data filters">
      <div className="flex flex-wrap items-end gap-3.5">
        {/* Label & Active Badge */}
        <div className="flex items-center gap-2 mr-1 select-none">
          <svg
            className="w-3.5 h-3.5 text-mute"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
            />
          </svg>
          <span className="mono-eyebrow text-[10.5px]">Filters</span>
          {activeCount > 0 && (
            <span
              className="px-1.5 py-0.5 rounded-full bg-accent-blue text-white text-[9.5px] font-mono font-bold leading-none tabular-nums"
              aria-label={`${activeCount} active filters`}
            >
              {activeCount}
            </span>
          )}
        </div>

        {/* Date From */}
        <div className="flex flex-col gap-1">
          <label htmlFor="filterDateFrom" className="mono-eyebrow text-[9.5px] cursor-pointer">
            From
          </label>
          <input
            id="filterDateFrom"
            name="date_from"
            type="date"
            value={filters.date_from}
            onChange={(e) => updateFilter("date_from", e.target.value)}
            className="px-2.5 py-1.5 rounded-sm bg-canvas border border-hairline text-ink text-xs focus-visible:ring-1 focus-visible:ring-accent-blue focus-visible:outline-none transition-colors duration-150 [color-scheme:dark]"
          />
        </div>

        {/* Date To */}
        <div className="flex flex-col gap-1">
          <label htmlFor="filterDateTo" className="mono-eyebrow text-[9.5px] cursor-pointer">
            To
          </label>
          <input
            id="filterDateTo"
            name="date_to"
            type="date"
            value={filters.date_to}
            onChange={(e) => updateFilter("date_to", e.target.value)}
            className="px-2.5 py-1.5 rounded-sm bg-canvas border border-hairline text-ink text-xs focus-visible:ring-1 focus-visible:ring-accent-blue focus-visible:outline-none transition-colors duration-150 [color-scheme:dark]"
          />
        </div>

        {/* Region */}
        <div className="flex flex-col gap-1">
          <label htmlFor="filterRegion" className="mono-eyebrow text-[9.5px] cursor-pointer">
            Region
          </label>
          <select
            id="filterRegion"
            name="region"
            value={filters.region}
            onChange={(e) => updateFilter("region", e.target.value)}
            disabled={loadingOpts}
            className="px-2.5 py-1.5 rounded-sm bg-canvas border border-hairline text-ink text-xs focus-visible:ring-1 focus-visible:ring-accent-blue focus-visible:outline-none transition-colors duration-150 disabled:opacity-50 cursor-pointer min-w-[130px]"
          >
            <option value="">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <label htmlFor="filterCategory" className="mono-eyebrow text-[9.5px] cursor-pointer">
            Category
          </label>
          <select
            id="filterCategory"
            name="category"
            value={filters.category}
            onChange={(e) => updateFilter("category", e.target.value)}
            disabled={loadingOpts}
            className="px-2.5 py-1.5 rounded-sm bg-canvas border border-hairline text-ink text-xs focus-visible:ring-1 focus-visible:ring-accent-blue focus-visible:outline-none transition-colors duration-150 disabled:opacity-50 cursor-pointer min-w-[140px]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        {activeCount > 0 && (
          <button
            id="filterResetBtn"
            type="button"
            aria-label="Reset all active filters"
            onClick={handleReset}
            className="button-geist-sm flex items-center gap-1 text-xs text-mute hover:text-accent-red hover:border-accent-red/40 focus-visible:ring-1 focus-visible:ring-accent-red focus-visible:outline-none transition-colors duration-150 self-end cursor-pointer"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
