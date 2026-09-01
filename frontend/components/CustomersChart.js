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

function fmtCurrency(v) {
  if (v == null) return "—";
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (Math.abs(v) >= 1_000)     return `$${(v / 1_000).toFixed(1)}K`;
  return `$${Number(v).toFixed(2)}`;
}

const OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: "y",
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
        afterLabel: (ctx) => {
          const customer = ctx.chart.data.customers?.[ctx.dataIndex];
          return customer?.region ? ` Region: ${customer.region}` : "";
        },
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
        callback: function (val) {
          const label = this.getLabelForValue(val);
          return label.length > 20 ? label.slice(0, 18) + "…" : label;
        },
      },
    },
  },
};

export default function CustomersChart({ filters = {} }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch(`/api/analytics/customers/top${buildQuery({ ...filters, limit: 10 })}`)
      .then((d) => { if (!cancelled) { setCustomers(d); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [JSON.stringify(filters)]);

  const chartData = {
    labels: customers.map((c) => c.customer_name),
    // Store full customer objects for tooltip afterLabel
    customers,
    datasets: [{
      data: customers.map((c) => c.revenue),
      backgroundColor: "rgba(139,92,246,0.75)",
      hoverBackgroundColor: "rgba(139,92,246,0.95)",
      borderRadius: 5,
      borderSkipped: false,
    }],
  };

  return (
    <ChartCard
      title="Top 10 Customers"
      subtitle="Ranked by total revenue"
      loading={loading}
      height="h-80"
    >
      {error ? (
        <div className="flex items-center justify-center h-full text-xs text-red-400">
          ⚠ {error}
        </div>
      ) : customers.length === 0 ? (
        <div className="flex items-center justify-center h-full text-xs text-text-muted">
          No data — upload a CSV to get started.
        </div>
      ) : (
        <Bar data={chartData} options={OPTIONS} />
      )}
    </ChartCard>
  );
}
