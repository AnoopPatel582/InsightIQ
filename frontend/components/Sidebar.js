"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/dashboard#kpis",
    label: "KPI Metrics",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    href: "/dashboard#charts",
    label: "Sales & Trends",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6m4 0h4m0 0v-4a2 2 0 012-2h2a2 2 0 012 2v4m-4 0h4" />
      </svg>
    ),
  },
  {
    href: "/dashboard#insights",
    label: "Business Insights",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    href: "/dashboard#upload",
    label: "Data Ingestion",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-canvas border-r border-hairline min-h-screen">
      {/* Logo Wordmark */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-hairline">
        <div className="flex items-center justify-center w-6 h-6 rounded bg-ink text-canvas">
          {/* Minimalist Vercel-style geometric triangle / chart symbol */}
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2L2 22h20L12 2z" />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-tight text-ink">
          Insight<span className="text-body font-normal">IQ</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="mono-eyebrow px-2.5 mb-2.5 text-[10px]">Platform</p>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-xs font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-white/10 text-ink shadow-whisper"
                  : "text-body hover:text-ink hover:bg-white/5"
              }`}
            >
              <span className={isActive ? "text-ink" : "text-mute"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer Version Tag */}
      <div className="px-5 py-3.5 border-t border-hairline">
        <p className="mono-eyebrow text-[9px] text-faint">InsightIQ v1.0 • Geist System</p>
      </div>
    </aside>
  );
}
