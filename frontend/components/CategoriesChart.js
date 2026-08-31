"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import ChartCard from "./ChartCard";
import { apiFetch, buildQuery } from "@/lib/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
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
      grid: { display: false },
      ticks: {
        color: "#94a3b8",
        font: { size: 10 },
        maxRotation: 30,
      },
    },
    y: {
      grid: { color: "rgba(99,130,201,0.08)" },
      ticks: {
        color: "#94a3b8",
        font: { size: 10 },
        callback: (v) =>
          Math.abs(v) >= 1_000 ? `$${(v / 1_000).toFixed(0)}K` : `$${v}`,
      },
    },
  },
};

export default function CategoriesChart({ filters = {} }) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch(`/api/analytics/categories${buildQuery(filters)}`)
      .then((d) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [JSON.stringify(filters)]);

  const chartData = {
    labels: data.map((c) => c.category),
    datasets: [
      {
        label: "Revenue",
        data: data.map((c) => c.revenue),
        backgroundColor: "rgba(59,130,246,0.75)",
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: "Profit",
        data: data.map((c) => c.profit),
        backgroundColor: "rgba(16,185,129,0.75)",
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  return (
    <ChartCard
      title="Revenue by Category"
      subtitle="Revenue vs profit per product category"
      loading={loading}
      height="h-72"
    >
      {error ? (
        <div className="flex items-center justify-center h-full text-xs text-red-400">⚠ {error}</div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-xs text-text-muted">
          No data — upload a CSV to get started.
        </div>
      ) : (
        <Bar data={chartData} options={OPTIONS} />
      )}
    </ChartCard>
  );
}
