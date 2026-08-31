"use client";

/**
 * ChartCard
 * ---------
 * A reusable wrapper card for any Chart.js chart.
 *
 * Props:
 *  - title    {string}  — card heading
 *  - subtitle {string}  — optional subtitle
 *  - children {JSX}     — the chart component
 *  - loading  {boolean} — show skeleton overlay
 *  - height   {string}  — Tailwind height class for the chart area (default "h-72")
 */
export default function ChartCard({
  title,
  subtitle,
  children,
  loading = false,
  height = "h-72",
}) {
  return (
    <div className="glass-card p-5 flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
        {subtitle && (
          <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Chart area */}
      <div className={`relative flex-1 ${height}`}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
