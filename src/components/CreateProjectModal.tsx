"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createProject } from "@/lib/engine";

interface CreateProjectModalProps {
  onClose: () => void;
  onCreated?: (projectId: string, projectName: string) => void;
}

export default function CreateProjectModal({ onClose, onCreated }: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [priority, setPriority] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const projectId = await createProject(name.trim(), priority, dueDate || null);
      if (projectId && onCreated) {
        onCreated(projectId, name.trim());
      }
      onClose();
    } catch (err) {
      console.error("Create project error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>📂 New Project</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {/* Project Name */}
        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem", display: "block" }}>
          Project Name
        </label>
        <input
          className="input"
          placeholder="e.g. Learn Piano"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && name.trim() && handleCreate()}
          autoFocus
          style={{ marginBottom: "0.75rem" }}
        />

        {/* Priority */}
        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem", display: "block" }}>
          Priority
        </label>
        <div style={{ display: "flex", gap: "0.35rem", marginBottom: "0.75rem" }}>
          {([1, 2, 3, 4, 5] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={`priority-badge priority-${p}`}
              style={{
                cursor: "pointer",
                border: priority === p ? "2px solid var(--gold)" : "2px solid transparent",
                width: "2.25rem",
                height: "2.25rem",
                fontSize: "0.85rem",
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Due Date */}
        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem", display: "block" }}>
          Due Date (optional)
        </label>
        <input
          className="input"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{ marginBottom: "1.25rem" }}
        />

        <button
          className="btn-green"
          onClick={handleCreate}
          disabled={loading || !name.trim()}
          style={{ width: "100%", opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Creating..." : "Create Project"}
        </button>
      </div>
    </div>
  );
}
