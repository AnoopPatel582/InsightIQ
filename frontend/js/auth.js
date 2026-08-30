/**
 * auth.js
 * -------
 * Handles the login form on index.html.
 * On success, stores the JWT in localStorage and redirects to dashboard.html.
 */

const API_BASE = "http://127.0.0.1:8000";

// If already logged in, skip straight to the dashboard
if (localStorage.getItem("access_token")) {
  window.location.href = "dashboard.html";
}

const form = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const errorDiv = document.getElementById("loginError");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    showError("Please enter both username and password.");
    return;
  }

  // Disable button to prevent double-submit
  loginBtn.disabled = true;
  loginBtn.textContent = "Signing in…";
  hideError();

  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("username", username);
      window.location.href = "dashboard.html";
    } else {
      const err = await response.json().catch(() => ({}));
      showError(err.detail || "Incorrect username or password.");
    }
  } catch (err) {
    showError("Could not reach the server. Is the backend running?");
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Sign In";
  }
});

function showError(msg) {
  errorDiv.textContent = msg;
  errorDiv.classList.add("visible");
}

function hideError() {
  errorDiv.classList.remove("visible");
}
