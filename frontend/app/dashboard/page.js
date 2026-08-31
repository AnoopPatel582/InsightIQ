"use client";

import { useState } from "react";
import KpiSection       from "@/components/KpiSection";
import SalesTrendChart  from "@/components/SalesTrendChart";
import RegionsChart     from "@/components/RegionsChart";

/**
 * Dashboard overview page — /dashboard
 * Manages shared filter state passed down to all sections.
 */
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

      {/* ── Charts row ────────────────────────────────────── */}
      <section id="charts" className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">
          Charts &amp; Trends
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Trend takes 2/3 width on large screens */}
          <div className="lg:col-span-2">
            <SalesTrendChart filters={filters} />
          </div>
          {/* Regions doughnut takes 1/3 */}
          <div className="lg:col-span-1">
            <RegionsChart filters={filters} />
          </div>
        </div>
      </section>

      {/* ── More charts placeholder (F6–F8) ───────────────── */}
      <section id="more-charts">
        <div className="h-48 glass-card flex items-center justify-center text-text-muted text-sm">
          Categories + Products + Customers — coming in Steps F6–F8
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
