/**
 * Dashboard overview page — /dashboard
 *
 * This is a placeholder shell that will be progressively filled
 * with KPI cards, charts, insights, and filters in subsequent steps.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-up">

      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Overview</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Your business analytics at a glance — KPIs, trends, and insights.
        </p>
      </div>

      {/* ── Placeholder sections (filled in F4–F10) ───────── */}
      <section id="kpis">
        <div className="h-32 glass-card flex items-center justify-center text-text-muted text-sm">
          KPI Cards — coming in Step F4
        </div>
      </section>

      <section id="charts">
        <div className="h-64 glass-card flex items-center justify-center text-text-muted text-sm">
          Charts — coming in Steps F5–F8
        </div>
      </section>

      <section id="insights">
        <div className="h-32 glass-card flex items-center justify-center text-text-muted text-sm">
          Insights &amp; Upload — coming in Step F9
        </div>
      </section>

    </div>
  );
}
