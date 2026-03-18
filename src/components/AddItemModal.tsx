"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { addErrand, addProjectItem, fetchProjects } from "@/lib/engine";
import type { Project } from "@/types";

interface AddItemModalProps {
  onClose: () => void;
}

export default function AddItemModal({ onClose }: AddItemModalProps) {
  const [itemType, setItemType] = useState<"errand" | "project">("errand");
  const [itemName, setItemName] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects("active").then(setProjects);
  }, []);

  const handleSubmit = async () => {
    if (!itemName.trim()) return;
    setLoading(true);
    try {
      if (itemType === "errand") {
        await addErrand(itemName.trim());
      } else {
        if (!selectedProject) return;
        await addProjectItem(selectedProject, itemName.trim());
      }
      onClose();
    } catch (err) {
      console.error("Error adding item:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Add New Item</h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Type Toggle */}
        <div className="tab-bar" style={{ marginBottom: "1rem" }}>
          <button
            className={`tab ${itemType === "errand" ? "active" : ""}`}
            onClick={() => setItemType("errand")}
          >
            🍿 Errand
          </button>
          <button
            className={`tab ${itemType === "project" ? "active" : ""}`}
            onClick={() => setItemType("project")}
          >
            📂 Project Item
          </button>
        </div>

        {/* Item Name */}
        <input
          className="input"
          placeholder="What needs to be done?"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          autoFocus
          style={{ marginBottom: "0.75rem" }}
        />

        {/* Project Selector (only for project items) */}
        {itemType === "project" && (
          <select
            className="input"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            style={{ marginBottom: "0.75rem" }}
          >
            <option value="">Select a project...</option>
            {projects.map((p) => (
              <option key={p.projectId} value={p.projectId}>
                {p.projectName} (Priority {p.priority})
              </option>
            ))}
          </select>
        )}

        {/* Submit */}
        <button
          className="btn-green"
          onClick={handleSubmit}
          disabled={loading || !itemName.trim() || (itemType === "project" && !selectedProject)}
          style={{ width: "100%", opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Adding..." : "Add Item"}
        </button>
      </div>
    </div>
  );
}
