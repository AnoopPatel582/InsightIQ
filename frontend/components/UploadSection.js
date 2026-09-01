"use client";

import { useRef, useState } from "react";

const ACCEPTED = ".csv,text/csv";

/**
 * UploadSection
 * -------------
 * Drag-and-drop CSV uploader.
 * On successful upload, calls onSuccess() so the parent can
 * refresh all data sections.
 *
 * Props:
 *  - onSuccess {Function} — called after a successful upload
 */
export default function UploadSection({ onSuccess }) {
  const inputRef          = useRef(null);
  const [file, setFile]   = useState(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus]     = useState(null); // null | {type, msg}
  const [uploading, setUploading] = useState(false);

  // ── Drag handlers ──────────────────────────────────────────
  function handleDragOver(e) {
    e.preventDefault();
    setDragging(true);
  }
  function handleDragLeave() { setDragging(false); }
  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) pickFile(dropped);
  }

  // ── File selection ─────────────────────────────────────────
  function pickFile(f) {
    if (!f.name.endsWith(".csv")) {
      setStatus({ type: "error", msg: "Only .csv files are accepted." });
      return;
    }
    setFile(f);
    setStatus(null);
  }

  // ── Upload ─────────────────────────────────────────────────
  async function handleUpload() {
    if (!file) {
      setStatus({ type: "error", msg: "Please select a CSV file first." });
      return;
    }

    setUploading(true);
    setStatus(null);

    const token = localStorage.getItem("access_token");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/data/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({
          type: "success",
          msg: `✅ ${data.rows_loaded?.toLocaleString() ?? 0} rows loaded, ${data.rows_skipped?.toLocaleString() ?? 0} skipped.`,
        });
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
        onSuccess?.();
      } else {
        setStatus({ type: "error", msg: data.detail || "Upload failed." });
      }
    } catch {
      setStatus({ type: "error", msg: "Network error — is the backend running?" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <section id="upload" className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">
        Upload Sales Data
      </h3>

      <div className="glass-card p-6 space-y-5">
        {/* Description */}
        <p className="text-sm text-text-secondary">
          Upload a <span className="text-text-primary font-medium">.csv</span> file with columns:{" "}
          <span className="text-accent-blue text-xs font-mono">
            Order_ID, Order_Date, Customer_ID, Customer_Name, Product_ID,
            Product_Name, Category, Region, Quantity, Sales, Profit
          </span>
        </p>

        {/* Drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 
                      border-2 border-dashed rounded-lg p-8 cursor-pointer
                      transition-all duration-200
                      ${dragging
                        ? "border-accent-blue bg-accent-blue/5 scale-[1.01]"
                        : "border-[rgba(99,130,201,0.25)] hover:border-accent-blue/50 hover:bg-bg-card"
                      }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={(e) => { if (e.target.files[0]) pickFile(e.target.files[0]); }}
          />

          {/* Upload icon */}
          <div className={`flex items-center justify-center w-12 h-12 rounded-xl transition-colors duration-200
                           ${dragging ? "bg-accent-blue/20" : "bg-bg-secondary"}`}>
            <svg className={`w-6 h-6 transition-colors duration-200 ${dragging ? "text-accent-blue" : "text-text-muted"}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>

          {file ? (
            <div className="text-center">
              <p className="text-sm font-medium text-text-primary">{file.name}</p>
              <p className="text-xs text-text-muted mt-0.5">
                {(file.size / 1024).toFixed(1)} KB — click to change
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-text-secondary">
                <span className="text-accent-blue font-medium">Click to browse</span> or drag &amp; drop
              </p>
              <p className="text-xs text-text-muted mt-0.5">CSV files only</p>
            </div>
          )}
        </div>

        {/* Status message */}
        {status && (
          <div className={`flex items-start gap-2 text-sm rounded-md px-4 py-3 border
            ${status.type === "success"
              ? "text-green-400 bg-green-400/10 border-green-400/20"
              : "text-red-400 bg-red-400/10 border-red-400/20"
            }`}>
            <span>{status.msg}</span>
          </div>
        )}

        {/* Upload button */}
        <button
          id="uploadBtn"
          onClick={handleUpload}
          disabled={uploading || !file}
          className="w-full sm:w-auto px-6 py-2.5 rounded-md font-semibold text-sm text-white
                     bg-gradient-blue shadow-glow-blue
                     hover:opacity-90 active:scale-[0.98]
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-all duration-200"
        >
          {uploading ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Uploading…
            </span>
          ) : (
            "Upload CSV"
          )}
        </button>
      </div>
    </section>
  );
}
