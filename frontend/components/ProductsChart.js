"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import ChartCard from "./ChartCard";
import { apiFetch, buildQuery } from "@/lib/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

// Generate a spectrum of blues/purples for each bar
function barColors(count) {
  return Array.from({ length: count }, (_, i) =>
    `hsl(${210 + i * 12}, 70%, 58%)`
  );
}

function fmtCurrency(v) {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (Math.abs(v) >= 1_000)     return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(2)}`;
}

const OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: "y",           // horizontal bars
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#1a2234",
      borderColor: "rgba(99,130,201,0.2)",
      borderWidth: 1,
      titleColor: "#f0f4ff",
      bodyColor: "#94a3b8",
      padding: 12,
      callbacks: {
        label: (ctx) => ` Revenue: ${fmtCurrency(ctx.parsed.x)}`,
      },
    },
  },
  scales: {
    x: {
      grid: { color: "rgba(99,130,201,0.08)" },
      ticks: {
        color: "#94a3b8",
        font: { size: 10 },
        callback: (v) =>
          Math.abs(v) >= 1_000 ? `$${(v / 1_000).toFixed(0)}K` : `$${v}`,
      },
    },
    y: {
      grid: { display: false },
      ticks: {
        color: "#94a3b8",
        font: { size: 10 },
        // Truncate long product names
        callback: function (val) {
          const label = this.getLabelForValue(val);
          return label.length > 22 ? label.slice(0, 20) + "…" : label;
        },
      },
    },
  },
};

export default function ProductsChart({ filters = {} }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch(`/api/analytics/products${buildQuery({ ...filters, limit: 10 })}`)
      .then((d) => { if (!cancelled) { setProducts(d); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [JSON.stringify(filters)]);

  const labels = products.map((p) => p.product_name);
  const colors = barColors(products.length);

  const chartData = {
    labels,
    datasets: [{
      data: products.map((p) => p.revenue),
      backgroundColor: colors,
      borderRadius: 5,
      borderSkipped: false,
    }],
  };

  return (
    <ChartCard
      title="Top 10 Products"
      subtitle="Ranked by total revenue"
      loading={loading}
      height="h-80"
    >
      {error ? (
        <div className="flex items-center justify-center h-full text-xs text-red-400">⚠ {error}</div>
      ) : products.length === 0 ? (
        <div className="flex items-center justify-center h-full text-xs text-text-muted">
          No data — upload a CSV to get started.
        </div>
      ) : (
        <Bar data={chartData} options={OPTIONS} />
      )}
    </ChartCard>
  );
}
