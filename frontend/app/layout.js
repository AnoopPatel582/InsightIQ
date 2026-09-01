import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Load Geist Sans & Geist Mono from next/font/google for Vercel/Geist design system
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-bg-primary text-text-primary">
        {children}
      </body>
    </html>
  );
}
