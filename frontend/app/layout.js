import { Inter } from "next/font/google";
import "./globals.css";

// Load Inter from Google Fonts — subset to latin for performance
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: {
    default: "InsightIQ — Business Analytics Platform",
    template: "%s | InsightIQ",
  },
  description:
    "InsightIQ converts raw sales data into actionable KPIs, interactive charts, and business insights.",
  keywords: ["analytics", "dashboard", "sales", "KPI", "business intelligence"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-bg-primary text-text-primary">
        {children}
      </body>
    </html>
  );
}
