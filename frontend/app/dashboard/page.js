"use client";

import { useState, useCallback } from "react";
import FilterBar from "@/components/FilterBar";
import KpiSection from "@/components/KpiSection";
import SalesTrendChart from "@/components/SalesTrendChart";
import RegionsChart from "@/components/RegionsChart";
import CategoriesChart from "@/components/CategoriesChart";
import ProductsChart from "@/components/ProductsChart";
import CustomersChart from "@/components/CustomersChart";
import InsightsSection from "@/components/InsightsSection";
import UploadSection from "@/components/UploadSection";

export default function DashboardPage() {
  const [filters, setFilters] = useState({
    date_from: "",
    date_to: "",
    region: "",
    category: "",
  });

  const [uploadKey, setUploadKey] = useState(0);
  const handleUploadSuccess = useCallback(() => {
    setUploadKey((k) => k + 1);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const effectiveFilters = { ...filters, _refresh: uploadKey };

  return (
    <div className="space-y-6 animate-fade-up max-w-7xl mx-auto">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-1 border-b border-hairline">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            Executive Summary
          </h2>
          <p className="text-xs text-body mt-0.5">
            Operational metrics, regional distribution, and automated heuristics.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-white/5 border border-hairline mono-eyebrow text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
            Live System
          </span>
        </div>
      </div>

      {/* ── Filter Bar ──────────────────────────────────────── */}
      <FilterBar onChange={handleFilterChange} refreshKey={uploadKey} />

      {/* ── KPI Cards ─────────────────────────────────────── */}
      <KpiSection filters={effectiveFilters} />

      {/* ── Row 1: Sales Trend + Regions ──────────────────── */}
      <section id="charts" className="space-y-3">
        <h3 className="mono-eyebrow text-xs">Revenue &amp; Geographic Distribution</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <SalesTrendChart filters={effectiveFilters} />
          </div>
          <div className="lg:col-span-1">
            <RegionsChart filters={effectiveFilters} />
          </div>
        </div>
      </section>

      {/* ── Row 2: Categories + Top Products ──────────────── */}
      <section className="space-y-3">
        <h3 className="mono-eyebrow text-xs">Category Breakdown &amp; Top Products</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CategoriesChart filters={effectiveFilters} />
          <ProductsChart filters={effectiveFilters} />
        </div>
      </section>

      {/* ── Row 3: Top Customers ──────────────────────────── */}
      <section id="customers" className="space-y-3">
        <h3 className="mono-eyebrow text-xs">Customer Concentration</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <CustomersChart filters={effectiveFilters} />
          </div>
          <div className="card-geist p-5 flex flex-col justify-between space-y-4">
            <div>
              <p className="mono-eyebrow text-[10px] mb-1.5">Context</p>
              <p className="text-xs text-body leading-relaxed">
                Highlights the top 10 revenue-generating accounts across all recorded sales cycles.
                Hovering each record reveals region alignment.
              </p>
            </div>
            <div className="border-t border-hairline pt-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-accent-purple" />
                <span className="mono-eyebrow text-[10px]">Net Sales</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3 h-3 text-mute" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[11px] text-mute">Dynamic tooltip inspection enabled</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Business Insights ──────────────────────────────── */}
      <InsightsSection filters={effectiveFilters} />

      {/* ── CSV Upload ─────────────────────────────────────── */}
      <UploadSection onSuccess={handleUploadSuccess} />
    </div>
  );
}
