"use client";

export default function KpiCard({
  title,
  value,
  icon,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="card-geist p-4.5 animate-pulse">
        <div className="flex items-center justify-between mb-3.5">
          <div className="h-2.5 w-20 bg-white/5 rounded" />
          <div className="w-7 h-7 rounded-sm bg-white/5" />
        </div>
        <div className="h-6 w-28 bg-white/5 rounded" />
      </div>
    );
  }

  return (
    <div className="card-geist p-4.5 flex flex-col justify-between animate-fade-up">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="mono-eyebrow text-[10.5px] truncate">{title}</span>
        <div className="flex items-center justify-center w-6 h-6 rounded-sm bg-white/5 border border-hairline text-mute shrink-0">
          {icon}
        </div>
      </div>

      {/* Metric Value */}
      <p className="text-xl font-semibold text-ink tracking-tight font-sans">
        {value ?? "—"}
      </p>
    </div>
  );
}
