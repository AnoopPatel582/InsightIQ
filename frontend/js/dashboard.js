/**
 * dashboard.js
 * ------------
 * Fetches all API data and renders the InsightIQ analytics dashboard.
 *
 * Flow:
 *  1. Check JWT → redirect to login if missing.
 *  2. Load filter dropdown options (regions, categories).
 *  3. Fetch KPIs, charts, and insights in parallel.
 *  4. Render all Chart.js charts.
 *  5. Wire up filter apply/reset, CSV upload, and logout.
 */

const API_BASE = "http://127.0.0.1:8000";

// ---------- Auth guard ----------
const token = localStorage.getItem("access_token");
if (!token) window.location.href = "index.html";

const headers = { Authorization: `Bearer ${token}` };

// Show logged-in username in navbar
const storedUsername = localStorage.getItem("username") || "User";
document.getElementById("navUsername").textContent = storedUsername;

// ---------- Logout ----------
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("username");
  window.location.href = "index.html";
});

// ---------- Chart instances (kept so we can destroy/recreate on filter change) ----------
let charts = {};

// ---------- Chart.js global defaults ----------
Chart.defaults.color = "#94a3b8";
Chart.defaults.borderColor = "rgba(99,130,201,0.12)";
Chart.defaults.font.family = "Inter, system-ui, sans-serif";

// =============================================================================
// Utility helpers
// =============================================================================

function fmt(n) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function fmtNum(n) {
  if (n === null || n === undefined) return "—";
  return Number(n).toLocaleString();
}

function fmtPct(n) {
  if (n === null || n === undefined) return "—";
  return `${Number(n).toFixed(1)}%`;
}

async function apiFetch(path) {
  const params = buildFilterParams();
  const url = `${API_BASE}${path}${params ? "?" + params : ""}`;
  const resp = await fetch(url, { headers });
  if (resp.status === 401) {
    localStorage.removeItem("access_token");
    window.location.href = "index.html";
  }
  if (!resp.ok) throw new Error(`API error ${resp.status}: ${path}`);
  return resp.json();
}

function buildFilterParams() {
  const parts = [];
  const from = document.getElementById("filterDateFrom").value;
  const to   = document.getElementById("filterDateTo").value;
  const region   = document.getElementById("filterRegion").value;
  const category = document.getElementById("filterCategory").value;
  if (from)     parts.push(`date_from=${from}`);
  if (to)       parts.push(`date_to=${to}`);
  if (region)   parts.push(`region=${encodeURIComponent(region)}`);
  if (category) parts.push(`category=${encodeURIComponent(category)}`);
  return parts.join("&");
}

function destroyChart(id) {
  if (charts[id]) {
    charts[id].destroy();
    delete charts[id];
  }
}

function showLoading(show) {
  document.getElementById("loadingOverlay").classList.toggle("visible", show);
}

// =============================================================================
// Filter dropdowns — populate from API data
// =============================================================================

async function populateFilters() {
  try {
    const [regions, categories] = await Promise.all([
      fetch(`${API_BASE}/api/analytics/regions`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/analytics/categories`, { headers }).then(r => r.json()),
    ]);

    const rSel = document.getElementById("filterRegion");
    regions.forEach(r => {
      const opt = document.createElement("option");
      opt.value = r.region;
      opt.textContent = r.region;
      rSel.appendChild(opt);
    });

    const cSel = document.getElementById("filterCategory");
    categories.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.category;
      opt.textContent = c.category;
      cSel.appendChild(opt);
    });
  } catch (_) {
    // Filters still work as free-text; silently continue
  }
}

// =============================================================================
// KPI Cards
// =============================================================================

async function loadKPIs() {
  const kpis = await apiFetch("/api/dashboard/kpis");
  document.getElementById("kpiRevenue").textContent  = fmt(kpis.total_revenue);
  document.getElementById("kpiProfit").textContent   = fmt(kpis.total_profit);
  document.getElementById("kpiOrders").textContent   = fmtNum(kpis.total_orders);
  document.getElementById("kpiQuantity").textContent = fmtNum(kpis.total_quantity);
  document.getElementById("kpiAOV").textContent      = fmt(kpis.avg_order_value);
  document.getElementById("kpiMargin").textContent   = fmtPct(kpis.profit_margin);
}

// =============================================================================
// Sales Trend Chart (Line)
// =============================================================================

async function loadSalesTrend() {
  const data = await apiFetch("/api/analytics/sales-trend");
  destroyChart("salesTrend");

  const labels   = data.map(d => d.month);
  const revenue  = data.map(d => d.revenue);
  const profit   = data.map(d => d.profit);

  charts.salesTrend = new Chart(
    document.getElementById("chartSalesTrend"),
    {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Revenue",
            data: revenue,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59,130,246,0.1)",
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: "Profit",
            data: profit,
            borderColor: "#10b981",
            backgroundColor: "rgba(16,185,129,0.08)",
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "top" } },
        scales: {
          x: { grid: { color: "rgba(99,130,201,0.08)" } },
          y: {
            grid: { color: "rgba(99,130,201,0.08)" },
            ticks: { callback: v => `$${(v / 1000).toFixed(0)}K` },
          },
        },
      },
    }
  );
}

// =============================================================================
// Regions Chart (Doughnut)
// =============================================================================

async function loadRegions() {
  const data = await apiFetch("/api/analytics/regions");
  destroyChart("regions");

  const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

  charts.regions = new Chart(
    document.getElementById("chartRegions"),
    {
      type: "doughnut",
      data: {
        labels: data.map(r => r.region),
        datasets: [{
          data: data.map(r => r.revenue),
          backgroundColor: COLORS.slice(0, data.length),
          borderWidth: 2,
          borderColor: "#1a2234",
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.label}: ${fmt(ctx.parsed)}`,
            },
          },
        },
      },
    }
  );
}

// =============================================================================
// Categories Chart (Grouped Bar)
// =============================================================================

async function loadCategories() {
  const data = await apiFetch("/api/analytics/categories");
  destroyChart("categories");

  charts.categories = new Chart(
    document.getElementById("chartCategories"),
    {
      type: "bar",
      data: {
        labels: data.map(c => c.category),
        datasets: [
          {
            label: "Revenue",
            data: data.map(c => c.revenue),
            backgroundColor: "rgba(59,130,246,0.7)",
            borderRadius: 6,
          },
          {
            label: "Profit",
            data: data.map(c => c.profit),
            backgroundColor: "rgba(16,185,129,0.7)",
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "top" } },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: "rgba(99,130,201,0.08)" },
            ticks: { callback: v => `$${(v / 1000).toFixed(0)}K` },
          },
        },
      },
    }
  );
}

// =============================================================================
// Top Products Chart (Horizontal Bar)
// =============================================================================

async function loadProducts() {
  const data = await apiFetch("/api/analytics/products?limit=10");
  destroyChart("products");

  const labels = data.map(p =>
    p.product_name.length > 20 ? p.product_name.slice(0, 18) + "…" : p.product_name
  );

  charts.products = new Chart(
    document.getElementById("chartProducts"),
    {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Revenue",
          data: data.map(p => p.revenue),
          backgroundColor: data.map((_, i) =>
            `hsl(${200 + i * 15}, 70%, 55%)`
          ),
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: "rgba(99,130,201,0.08)" },
            ticks: { callback: v => `$${(v / 1000).toFixed(0)}K` },
          },
          y: { grid: { display: false } },
        },
      },
    }
  );
}

// =============================================================================
// Top Customers Chart (Horizontal Bar)
// =============================================================================

async function loadCustomers() {
  const data = await apiFetch("/api/analytics/customers/top?limit=10");
  destroyChart("customers");

  charts.customers = new Chart(
    document.getElementById("chartCustomers"),
    {
      type: "bar",
      data: {
        labels: data.map(c => c.customer_name),
        datasets: [{
          label: "Revenue",
          data: data.map(c => c.revenue),
          backgroundColor: "rgba(139,92,246,0.7)",
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: "rgba(99,130,201,0.08)" },
            ticks: { callback: v => `$${(v / 1000).toFixed(0)}K` },
          },
          y: { grid: { display: false } },
        },
      },
    }
  );
}

// =============================================================================
// Business Insights
// =============================================================================

async function loadInsights() {
  const insights = await apiFetch("/api/analytics/insights");
  const grid = document.getElementById("insightsGrid");
  grid.innerHTML = "";

  if (!insights || insights.length === 0) {
    grid.innerHTML = `<p style="color: var(--text-muted); font-size: 0.875rem;">
      No insights available. Upload data to generate insights.</p>`;
    return;
  }

  insights.forEach(insight => {
    const card = document.createElement("div");
    card.className = "insight-card";
    card.innerHTML = `
      ${insight.value ? `<div class="insight-value">${insight.value}</div>` : ""}
      <div class="insight-title">${insight.title}</div>
      <div class="insight-desc">${insight.description}</div>
    `;
    grid.appendChild(card);
  });
}

// =============================================================================
// CSV Upload
// =============================================================================

document.getElementById("uploadBtn").addEventListener("click", async () => {
  const fileInput = document.getElementById("csvFile");
  const statusDiv = document.getElementById("uploadStatus");
  statusDiv.className = "upload-status";
  statusDiv.style.display = "none";

  if (!fileInput.files[0]) {
    statusDiv.textContent = "Please select a CSV file first.";
    statusDiv.className = "upload-status error";
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  document.getElementById("uploadBtn").disabled = true;
  document.getElementById("uploadBtn").textContent = "Uploading…";

  try {
    const resp = await fetch(`${API_BASE}/api/data/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const result = await resp.json();
    if (resp.ok) {
      statusDiv.textContent =
        `✅ ${result.rows_loaded} rows loaded, ${result.rows_skipped} skipped.`;
      statusDiv.className = "upload-status success";
      // Refresh all dashboard data
      await loadAll();
    } else {
      statusDiv.textContent = `❌ ${result.detail || "Upload failed."}`;
      statusDiv.className = "upload-status error";
    }
  } catch (err) {
    statusDiv.textContent = "❌ Network error — is the backend running?";
    statusDiv.className = "upload-status error";
  } finally {
    document.getElementById("uploadBtn").disabled = false;
    document.getElementById("uploadBtn").textContent = "Upload CSV";
  }
});

// =============================================================================
// Filter buttons
// =============================================================================

document.getElementById("applyFiltersBtn").addEventListener("click", loadAll);

document.getElementById("resetFiltersBtn").addEventListener("click", () => {
  document.getElementById("filterDateFrom").value = "";
  document.getElementById("filterDateTo").value = "";
  document.getElementById("filterRegion").value = "";
  document.getElementById("filterCategory").value = "";
  loadAll();
});

// =============================================================================
// Load everything
// =============================================================================

async function loadAll() {
  showLoading(true);
  try {
    await Promise.all([
      loadKPIs(),
      loadSalesTrend(),
      loadRegions(),
      loadCategories(),
      loadProducts(),
      loadCustomers(),
      loadInsights(),
    ]);
    const now = new Date().toLocaleString();
    document.getElementById("lastUpdated").textContent = `Last updated: ${now}`;
  } catch (err) {
    console.error("Dashboard load error:", err);
    document.getElementById("lastUpdated").textContent =
      "⚠️ Some data could not be loaded. Check the backend.";
  } finally {
    showLoading(false);
  }
}

// =============================================================================
// Initialise
// =============================================================================

(async () => {
  await populateFilters();
  await loadAll();
})();
