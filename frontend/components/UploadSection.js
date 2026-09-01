"use client";

import { useRef, useState } from "react";

const ACCEPTED = ".csv,text/csv";

export default function UploadSection({ onSuccess }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState(null);
  const [uploading, setUploading] = useState(false);

  function handleDragOver(e) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) pickFile(dropped);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  }

  function pickFile(f) {
    if (!f.name.endsWith(".csv")) {
      setStatus({ type: "error", msg: "Only .csv files are supported." });
      return;
    }
    setFile(f);
    setStatus(null);
  }

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
          msg: `Successfully processed: ${data.rows_loaded?.toLocaleString() ?? 0} rows loaded, ${data.rows_skipped?.toLocaleString() ?? 0} skipped.`,
        });
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
        onSuccess?.();
      } else {
        setStatus({ type: "error", msg: data.detail || "Upload failed." });
      }
    } catch {
      setStatus({ type: "error", msg: "Network error — backend may be offline." });
    } finally {
      setUploading(false);
    }
  }

  return (
    <section id="upload" className="space-y-3">
      <h3 className="mono-eyebrow text-xs">Dataset Ingestion</h3>

      <div className="card-geist p-6 space-y-4">
        {/* Schema Requirement */}
        <div className="space-y-1">
          <p className="text-xs text-body">
            Upload a structured transaction dataset. Required schema:
          </p>
          <div
            tabIndex={0}
            className="font-mono text-[10.5px] text-mute bg-canvas-inset px-3 py-2 rounded-sm border border-hairline overflow-x-auto whitespace-nowrap focus-visible:ring-1 focus-visible:ring-accent-blue focus-visible:outline-none"
            aria-label="Required CSV columns"
          >
            Order_ID, Order_Date, Customer_ID, Customer_Name, Product_ID, Product_Name, Category, Region, Quantity, Sales, Profit
          </div>
        </div>

        {/* Drop zone with keyboard accessibility */}
        <div
          role="button"
          tabIndex={0}
          aria-label={file ? `Selected file: ${file.name}. Press to change.` : "Upload file zone. Press enter or space to browse files."}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onKeyDown={handleKeyDown}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2.5 
                      border border-dashed rounded-md p-7 cursor-pointer transition-all duration-150
                      focus-visible:ring-1 focus-visible:ring-accent-blue focus-visible:outline-none
                      ${
                        dragging
                          ? "border-accent-blue bg-accent-blue/5"
                          : "border-hairline hover:border-white/20 bg-canvas/40"
                      }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
            onChange={(e) => {
              if (e.target.files[0]) pickFile(e.target.files[0]);
            }}
          />

          <div
            className="flex items-center justify-center w-9 h-9 rounded-sm bg-white/5 border border-hairline text-mute select-none"
            aria-hidden="true"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>

          {file ? (
            <div className="text-center">
              <p className="text-xs font-medium text-ink truncate max-w-sm">{file.name}</p>
              <p className="mono-eyebrow text-[10px] mt-0.5 tabular-nums">
                {(file.size / 1024).toFixed(1)} KB • Click or press Enter to swap
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs text-ink font-medium">
                Choose a file <span className="text-mute font-normal">or drag and drop</span>
              </p>
              <p className="mono-eyebrow text-[9.5px] mt-0.5">CSV up to 50&nbsp;MB</p>
            </div>
          )}
        </div>

        {/* Status notice */}
        {status && (
          <div
            role="status"
            aria-live="polite"
            className={`flex items-start gap-2 text-xs rounded-sm px-3.5 py-2.5 border ${
              status.type === "success"
                ? "text-accent-green bg-accent-green/10 border-accent-green/20"
                : "text-accent-red bg-accent-red/10 border-accent-red/20"
            }`}
          >
            <span>{status.msg}</span>
          </div>
        )}

        {/* Upload Action */}
        <div className="flex items-center justify-between pt-1">
          <button
            id="uploadBtn"
            type="button"
            onClick={handleUpload}
            disabled={uploading || !file}
            className="button-pill-primary cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-xs focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full border-2 border-canvas border-t-transparent animate-spin inline-block"
                  aria-hidden="true"
                />
                <span>Ingesting Dataset…</span>
              </span>
            ) : (
              "Ingest Dataset"
            )}
          </button>
          {file && (
            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="mono-eyebrow text-[10px] text-mute hover:text-ink cursor-pointer focus-visible:ring-1 focus-visible:ring-white focus-visible:outline-none px-2 py-1 rounded"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
