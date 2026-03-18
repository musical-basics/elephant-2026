"use client";

import { useState, useRef } from "react";
import NavHeader from "@/components/NavHeader";
import { useAppStore } from "@/store/useAppStore";
import {
  exportDatabasePayload,
  importDatabase,
  resetAllData,
  fetchListForCSV,
} from "@/lib/engine";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { Download, Upload, FileSpreadsheet, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { showMasterList, toggleShowMasterList } = useAppStore();
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [csvList, setCsvList] = useState("");
  const [showCsvPicker, setShowCsvPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Export JSON ───────────────────────────────────────────────────────────
  const handleExport = async () => {
    setExporting(true);
    try {
      const payload = await exportDatabasePayload();
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      saveAs(blob, `elephant-backup-${new Date().toISOString().slice(0, 10)}.json`);
    } catch (err) {
      console.error("Export error:", err);
      alert("Export failed. Check the console for details.");
    } finally {
      setExporting(false);
    }
  };

  // ─── Import JSON ──────────────────────────────────────────────────────────
  const handleImportClick = () => {
    if (!confirm("⚠️ This will overwrite ALL current data. Are you sure?")) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importDatabase(data);
      alert("✅ Database imported successfully!");
    } catch (err) {
      console.error("Import error:", err);
      alert("Import failed. Make sure the file is a valid Elephant backup.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ─── Export CSV ────────────────────────────────────────────────────────────
  const handleExportCSV = async () => {
    if (!csvList) return;
    try {
      const data = await fetchListForCSV(csvList);
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      saveAs(blob, `elephant-${csvList.toLowerCase().replace(/\s/g, "-")}-${new Date().toISOString().slice(0, 10)}.csv`);
      setShowCsvPicker(false);
      setCsvList("");
    } catch (err) {
      console.error("CSV export error:", err);
    }
  };

  // ─── Reset App ─────────────────────────────────────────────────────────────
  const handleReset = async () => {
    if (!confirm("🚨 This will DELETE ALL DATA. This cannot be undone. Are you sure?")) return;
    if (!confirm("Really? Everything will be gone forever.")) return;
    try {
      await resetAllData();
      alert("App has been reset.");
    } catch (err) {
      console.error("Reset error:", err);
    }
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "2rem" }}>
      <NavHeader title="Settings" />

      <div style={{ padding: "0 1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {/* Show Master List Toggle */}
        <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>Show Master List</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.15rem" }}>
              Reveal the Master List button on the Home Page
            </p>
          </div>
          <div
            className={`toggle-track ${showMasterList ? "active" : ""}`}
            onClick={toggleShowMasterList}
          >
            <div className="toggle-knob" />
          </div>
        </div>

        {/* Section Divider */}
        <div style={{ borderTop: "1px solid var(--border-subtle)", margin: "0.5rem 0" }} />
        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Database Tools
        </p>

        {/* Export Database */}
        <button className="btn-primary" onClick={handleExport} disabled={exporting} style={{ opacity: exporting ? 0.6 : 1 }}>
          <Download size={18} style={{ color: "var(--gold)" }} />
          {exporting ? "Exporting..." : "Export Database (.json)"}
        </button>

        {/* Import Database */}
        <button className="btn-primary" onClick={handleImportClick} disabled={importing} style={{ opacity: importing ? 0.6 : 1 }}>
          <Upload size={18} style={{ color: "var(--gold)" }} />
          {importing ? "Importing..." : "Import Database (.json)"}
        </button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} style={{ display: "none" }} />

        {/* Export CSV */}
        <button className="btn-primary" onClick={() => setShowCsvPicker(!showCsvPicker)}>
          <FileSpreadsheet size={18} style={{ color: "var(--gold)" }} />
          Export CSV
        </button>

        {showCsvPicker && (
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <select className="input" value={csvList} onChange={(e) => setCsvList(e.target.value)}>
              <option value="">Select a list...</option>
              <option value="Master List">Master List</option>
              <option value="Completed List">Completed List</option>
              <option value="Active Projects">Active Projects</option>
              <option value="Project Items">Project Items</option>
            </select>
            <button className="btn-green" onClick={handleExportCSV} disabled={!csvList} style={{ fontSize: "0.85rem", padding: "0.6rem" }}>
              Download CSV
            </button>
          </div>
        )}

        {/* Danger Zone */}
        <div style={{ borderTop: "1px solid var(--border-subtle)", margin: "0.5rem 0" }} />
        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--red)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Danger Zone
        </p>

        <button className="btn-danger" onClick={handleReset}>
          <Trash2 size={16} />
          Reset App (Delete All Data)
        </button>
      </div>
    </div>
  );
}
