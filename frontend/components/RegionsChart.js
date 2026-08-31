"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import ChartCard from "./ChartCard";
import { apiFetch, buildQuery } from "@/lib/api";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
  "#3b82f6", "#8b5cf6", "#06b6d4",
  "#10b981", "#f59e0b", "#ef4444",
];

function fmtCurrency(n) {
  if (n == null) return "—";
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${Number(n).toFixed(2)}`;
}

const OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "65%",
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        color: "#94a3b8",
        font: { size: 11, family: "Inter, sans-serif" },
        boxWidth: 10,
        padding: 14,
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
        label: (ctx) => ` ${ctx.label}: ${fmtCurrency(ctx.parsed)}`,
      },
    },
  },
};

export default function RegionsChart({ filters = {} }) {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch(`/api/analytics/regions${buildQuery(filters)}`)
      .then((d) => { if (!cancelled) { setRegions(d); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [JSON.stringify(filters)]);

  const chartData = {
    labels: regions.map((r) => r.region),
    datasets: [{
      data: regions.map((r) => r.revenue),
      backgroundColor: COLORS.slice(0, regions.length),
      borderColor: "#1a2234",
      borderWidth: 2,
      hoverOffset: 6,
    }],
  };

  return (
    <ChartCard
      title="Revenue by Region"
      subtitle="Proportional breakdown"
      loading={loading}
      height="h-72"
    >
      {error ? (
        <div className="flex items-center justify-center h-full text-xs text-red-400">
          ⚠ {error}
        </div>
      ) : regions.length === 0 ? (
        <div className="flex items-center justify-center h-full text-xs text-text-muted">
          No data — upload a CSV to get started.
        </div>
      ) : (
        <Doughnut data={chartData} options={OPTIONS} />
      )}
    </ChartCard>
  );
}
