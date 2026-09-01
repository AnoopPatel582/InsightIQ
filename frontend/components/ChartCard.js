"use client";

export default function ChartCard({
  title,
  subtitle,
  children,
  loading = false,
  height = "h-72",
}) {
  return (
    <div className="card-geist p-5 flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h4 className="text-sm font-semibold text-ink tracking-tight">{title}</h4>
          {subtitle && (
            <p className="text-xs text-mute mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className={`relative flex-1 ${height}`}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-hairline border-t-ink animate-spin" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
