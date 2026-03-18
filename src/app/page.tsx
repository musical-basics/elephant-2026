"use client";

import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { Rocket, FolderOpen, CheckCircle, Settings, Eye, Plus } from "lucide-react";
import { useState } from "react";
import AddItemModal from "@/components/AddItemModal";

export default function HomePage() {
  const { showMasterList, userName } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div
      className="animate-fade-in"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem 1.5rem",
        minHeight: "100vh",
      }}
    >
      {/* Add Item Button - top right */}
      <button
        onClick={() => setShowAddModal(true)}
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "0.5rem",
          color: "var(--gold)",
          cursor: "pointer",
          padding: "0.4rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Plus size={18} />
      </button>

      {/* Profile */}
      <div
        style={{
          width: "5.5rem",
          height: "5.5rem",
          borderRadius: "9999px",
          background: "linear-gradient(135deg, var(--gold), var(--gold-light))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2.25rem",
          marginTop: "2rem",
          marginBottom: "1rem",
          boxShadow: "0 8px 30px var(--gold-glow)",
        }}
      >
        🐘
      </div>

      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>
        Welcome, {userName}!
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "2.5rem" }}>
        One bite at a time.
      </p>

      {/* Primary Buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", width: "100%" }}>
        <Link href="/do-now" className="btn-primary" style={{ flexDirection: "column", padding: "1.25rem", gap: "0.6rem" }}>
          <Rocket size={22} style={{ color: "var(--gold)" }} />
          <span>Start Working</span>
        </Link>
        <Link href="/projects" className="btn-primary" style={{ flexDirection: "column", padding: "1.25rem", gap: "0.6rem" }}>
          <FolderOpen size={22} style={{ color: "var(--gold)" }} />
          <span>Manage Projects</span>
        </Link>
        <Link href="/completed" className="btn-primary" style={{ flexDirection: "column", padding: "1.25rem", gap: "0.6rem" }}>
          <CheckCircle size={22} style={{ color: "var(--green)" }} />
          <span>Completed</span>
        </Link>
        <Link href="/settings" className="btn-primary" style={{ flexDirection: "column", padding: "1.25rem", gap: "0.6rem" }}>
          <Settings size={22} style={{ color: "var(--text-secondary)" }} />
          <span>Settings</span>
        </Link>
      </div>

      {/* Conditional Master List Button */}
      {showMasterList && (
        <Link
          href="/master-list"
          className="btn-secondary"
          style={{ marginTop: "1.5rem", width: "100%", justifyContent: "center" }}
        >
          <Eye size={16} />
          View Master List
        </Link>
      )}

      {showAddModal && <AddItemModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
