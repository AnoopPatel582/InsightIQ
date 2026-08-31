"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import ChartCard from "./ChartCard";
import { apiFetch, buildQuery } from "@/lib/api";

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend
);

// ── Chart.js options ─────────────────────────────────────────
const OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: {
      position: "top",
      labels: {
        color: "#94a3b8",
        font: { size: 11, family: "Inter, sans-serif" },
        boxWidth: 12,
        padding: 16,
      },
    },
    tooltip: {
      backgroundColor: "#1a2234",
      borderColor: "rgba(99,130,201,0.2)",
      borderWidth: 1,
      titleColor: "#f0f4ff",
      bodyColor: "#94a3b8",
      padding: 12,
      callbacks: {
        label: (ctx) => {
          const v = ctx.parsed.y;
          if (Math.abs(v) >= 1_000_000) return ` ${ctx.dataset.label}: $${(v / 1_000_000).toFixed(2)}M`;
          if (Math.abs(v) >= 1_000)     return ` ${ctx.dataset.label}: $${(v / 1_000).toFixed(1)}K`;
          return ` ${ctx.dataset.label}: $${v.toFixed(2)}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid:   { color: "rgba(99,130,201,0.08)" },
      ticks:  { color: "#94a3b8", font: { size: 10 } },
    },
    y: {
      grid:   { color: "rgba(99,130,201,0.08)" },
      ticks: {
        color: "#94a3b8",
        font: { size: 10 },
        callback: (v) =>
          Math.abs(v) >= 1_000 ? `$${(v / 1_000).toFixed(0)}K` : `$${v}`,
      },
    },
  },
};

export default function SalesTrendChart({ filters = {} }) {
  const [trend, setTrend]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch(`/api/analytics/sales-trend${buildQuery(filters)}`)
      .then((d) => { if (!cancelled) { setTrend(d); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [JSON.stringify(filters)]);

  const chartData = {
    labels: trend.map((d) => d.month),
    datasets: [
      {
        label: "Revenue",
        data: trend.map((d) => d.revenue),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
      {
        label: "Profit",
        data: trend.map((d) => d.profit),
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.08)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  return (
    <ChartCard
      title="Sales Trend"
      subtitle="Monthly revenue and profit"
      loading={loading}
      height="h-72"
    >
      {error ? (
        <div className="flex items-center justify-center h-full text-xs text-red-400">
          ⚠ {error}
        </div>
      ) : trend.length === 0 ? (
        <div className="flex items-center justify-center h-full text-xs text-text-muted">
          No data — upload a CSV to get started.
        </div>
      ) : (
        <Line data={chartData} options={OPTIONS} />
      )}
    </ChartCard>
  );
}
