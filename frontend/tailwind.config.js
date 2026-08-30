/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // InsightIQ dark-mode color palette
      colors: {
        // Backgrounds
        "bg-primary":   "#0a0e1a",
        "bg-secondary": "#111827",
        "bg-card":      "#1a2234",
        "bg-card-hover":"#1e2a3e",

        // Accent colors
        "accent-blue":   "#3b82f6",
        "accent-purple": "#8b5cf6",
        "accent-cyan":   "#06b6d4",
        "accent-green":  "#10b981",
        "accent-amber":  "#f59e0b",
        "accent-red":    "#ef4444",

        // Text
        "text-primary":   "#f0f4ff",
        "text-secondary": "#94a3b8",
        "text-muted":     "#4b5563",
      },
      // Inter font (loaded via next/font in layout.js)
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      // Consistent border radius tokens
      borderRadius: {
        sm:  "8px",
        md:  "12px",
        lg:  "16px",
        xl:  "24px",
      },
      // Box shadows
      boxShadow: {
        card:         "0 4px 24px rgba(0,0,0,0.4)",
        "glow-blue":  "0 0 24px rgba(59,130,246,0.25)",
        "glow-purple":"0 0 24px rgba(139,92,246,0.25)",
      },
    },
  },
  plugins: [],
};
