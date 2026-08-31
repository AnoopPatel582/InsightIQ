"use client";

/**
 * KpiCard
 * -------
 * A single animated metric card.
 *
 * Props:
 *  - title       {string}  — metric label
 *  - value       {string}  — formatted value to display
 *  - icon        {JSX}     — SVG icon element
 *  - accentClass {string}  — Tailwind card-accent-* class (e.g. "card-accent-blue")
 *  - glowClass   {string}  — Tailwind shadow-glow-* class
 *  - bgClass     {string}  — icon background gradient class
 *  - loading     {boolean} — show skeleton if true
 */
export default function KpiCard({
  title,
  value,
  icon,
  accentClass = "card-accent-blue",
  glowClass   = "shadow-glow-blue",
  bgClass     = "bg-gradient-blue",
  loading     = false,
}) {
  if (loading) {
    return (
      <div className="glass-card card-accent-blue p-5 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-3 w-24 bg-bg-secondary rounded" />
          <div className="w-10 h-10 rounded-lg bg-bg-secondary" />
        </div>
        <div className="h-7 w-32 bg-bg-secondary rounded mt-2" />
      </div>
    );
  }

  return (
    <div className={`glass-card ${accentClass} p-5 animate-fade-up`}>
      {/* Header row — label + icon */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
          {title}
        </p>
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${bgClass} ${glowClass}`}>
          <span className="text-white w-5 h-5">{icon}</span>
        </div>
      </div>

      {/* Value */}
      <p className="text-2xl font-bold text-text-primary tracking-tight">
        {value ?? "—"}
      </p>
    </div>
  );
}
