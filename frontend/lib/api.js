/**
 * lib/api.js
 * ----------
 * Authenticated fetch wrapper for all InsightIQ API calls.
 *
 * Uses the Next.js API proxy configured in next.config.mjs,
 * so all requests go to /api/* (forwarded to FastAPI backend).
 *
 * Usage:
 *   import { apiFetch } from "@/lib/api";
 *   const data = await apiFetch("/api/dashboard/kpis");
 */

const AUTH_REDIRECT = "/login";

/**
 * Build query string from a filters object, skipping empty values.
 * @param {Object} filters - e.g. { date_from, date_to, region, category }
 * @returns {string} - e.g. "?date_from=2024-01&region=East" or ""
 */
export function buildQuery(filters = {}) {
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(filters)) {
    if (val !== null && val !== undefined && val !== "") {
      params.append(key, val);
    }
  }
  const str = params.toString();
  return str ? `?${str}` : "";
}

/**
 * Authenticated fetch — adds Bearer token from localStorage.
 * Redirects to /login on 401.
 *
 * @param {string} path      - e.g. "/api/dashboard/kpis"
 * @param {Object} [options] - fetch options (method, body, etc.)
 * @returns {Promise<any>}   - parsed JSON response
 * @throws  {Error}          - on HTTP errors or network failure
 */
export async function apiFetch(path, options = {}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(path, { ...options, headers });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("username");
      window.location.href = AUTH_REDIRECT;
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }

  return res.json();
}
