import DashboardShell from "@/components/DashboardShell";

export const metadata = {
  title: "Dashboard",
  description: "InsightIQ analytics dashboard — KPIs, charts, and business insights.",
};

/**
 * Dashboard route layout.
 * Wraps every /dashboard/* page with the DashboardShell (auth guard + sidebar + navbar).
 */
export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
