"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ── Nav items ────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/dashboard#kpis",
    label: "KPIs",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    href: "/dashboard#charts",
    label: "Charts",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6m4 0h4m0 0v-4a2 2 0 012-2h2a2 2 0 012 2v4m-4 0h4" />
      </svg>
    ),
  },
  {
    href: "/dashboard#insights",
    label: "Insights",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    href: "/dashboard#upload",
    label: "Upload",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-bg-secondary border-r border-[rgba(99,130,201,0.12)] min-h-screen">

      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[rgba(99,130,201,0.12)]">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-blue shadow-glow-blue">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l4-8 4 4 4-6 4 4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18" />
          </svg>
        </div>
        <span className="text-lg font-bold text-text-primary">
          Insight<span className="text-gradient-blue">IQ</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          Analytics
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium
                          transition-all duration-200 group
                          ${isActive
                            ? "bg-accent-blue/15 text-accent-blue"
                            : "text-text-secondary hover:bg-bg-card hover:text-text-primary"
                          }`}
            >
              <span className={`transition-colors duration-200 ${isActive ? "text-accent-blue" : "text-text-muted group-hover:text-text-primary"}`}>
                {item.icon}
              </span>
              {item.label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-blue" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom version tag */}
      <div className="px-6 py-4 border-t border-[rgba(99,130,201,0.12)]">
        <p className="text-[11px] text-text-muted">InsightIQ v1.0</p>
      </div>
    </aside>
  );
}
