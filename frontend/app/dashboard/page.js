"use client";

import { useState } from "react";
import KpiSection      from "@/components/KpiSection";
import SalesTrendChart from "@/components/SalesTrendChart";
import RegionsChart    from "@/components/RegionsChart";
import CategoriesChart from "@/components/CategoriesChart";
import ProductsChart   from "@/components/ProductsChart";
import CustomersChart  from "@/components/CustomersChart";

export default function DashboardPage() {
  const [filters, setFilters] = useState({
    date_from: "",
    date_to:   "",
    region:    "",
    category:  "",
  });

  return (
    <div className="space-y-10 animate-fade-up">

      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Overview</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Your business analytics at a glance — KPIs, trends, and insights.
        </p>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────── */}
      <KpiSection filters={filters} />

      {/* ── Row 1: Sales Trend + Regions ──────────────────── */}
      <section id="charts" className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">
          Charts &amp; Trends
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SalesTrendChart filters={filters} />
          </div>
          <div className="lg:col-span-1">
            <RegionsChart filters={filters} />
          </div>
        </div>
      </section>

      {/* ── Row 2: Categories + Top Products ──────────────── */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">
          Categories &amp; Products
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoriesChart filters={filters} />
          <ProductsChart   filters={filters} />
        </div>
      </section>

      {/* ── Row 3: Top Customers ──────────────────────────── */}
      <section id="customers" className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">
          Top Customers
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CustomersChart filters={filters} />
          {/* Summary stats card alongside the chart */}
          <div className="glass-card p-5 flex flex-col justify-center space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-1">
                About this chart
              </p>
              <p className="text-sm text-text-secondary leading-relaxed">
                Showing your top 10 customers ranked by total revenue contribution.
                Hover over any bar to see the customer&apos;s region.
              </p>
            </div>
            <div className="border-t border-[rgba(99,130,201,0.12)] pt-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-accent-purple" />
                <span className="text-xs text-text-muted">Revenue (purple bars)</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3 h-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-text-muted">Tooltip shows region on hover</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Insights + Upload placeholder (F9) ────────────── */}
      <section id="insights">
        <div className="h-32 glass-card flex items-center justify-center text-text-muted text-sm">
          Insights &amp; Upload — coming in Step F9
        </div>
      </section>

    </div>
  );
}
