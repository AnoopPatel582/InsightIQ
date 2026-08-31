"use client";

import { useState } from "react";
import KpiSection from "@/components/KpiSection";

/**
 * Dashboard overview page — /dashboard
 *
 * Manages shared filter state that will be passed down to all sections.
 * Charts, insights, and filters are added in subsequent steps (F5–F10).
 */
export default function DashboardPage() {
  // Shared filter state — passed to every data-fetching section
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

      {/* ── Charts placeholder (F5–F8) ────────────────────── */}
      <section id="charts">
        <div className="h-64 glass-card flex items-center justify-center text-text-muted text-sm">
          Charts — coming in Steps F5–F8
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
