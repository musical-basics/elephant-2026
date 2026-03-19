"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import NavHeader from "@/components/NavHeader";
import Toast, { type ToastType } from "@/components/Toast";
import {
  fetchProjectItems,
  fetchProjects,
  updateProject,
  updateProjectItemName,
  deleteProjectItem,
  addProjectItem,
  deleteProject,
} from "@/lib/engine";
import type { Project, ProjectItem } from "@/types";
import { Trash2, Plus, Pencil, Check } from "lucide-react";

// ─── Item Row Component ──────────────────────────────────────────────────────

function ItemRow({
  item,
  onRename,
  onDelete,
}: {
  item: ProjectItem;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.itemName);

  const handleSave = () => {
    if (name.trim() && name.trim() !== item.itemName) {
      onRename(item.itemId, name.trim());
    }
    setEditing(false);
  };

  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      {/* Active Indicator */}
      <div
        style={{
          width: "0.5rem",
          height: "0.5rem",
          borderRadius: "9999px",
          background: item.isActive ? "var(--green)" : "var(--text-muted)",
          opacity: item.isActive ? 1 : 0.3,
          flexShrink: 0,
        }}
      />

      {/* Item Name */}
      <div style={{ flex: 1 }}>
        {editing ? (
          <div style={{ display: "flex", gap: "0.35rem" }}>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
              style={{ padding: "0.35rem 0.5rem", fontSize: "0.85rem" }}
            />
            <button
              type="button"
              onClick={handleSave}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--green)",
                padding: "0.25rem",
              }}
            >
              <Check size={14} />
            </button>
          </div>
        ) : (
          <p style={{ fontSize: "0.85rem", fontWeight: 500 }}>
            {item.itemName}
          </p>
        )}
      </div>

      {/* Edit */}
      {!editing && (
        <button
          type="button"
          onClick={() => setEditing(true)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            opacity: 0.6,
            padding: "0.25rem",
          }}
        >
          <Pencil size={14} />
        </button>
      )}

      {/* Delete */}
      <button
        type="button"
        onClick={() => onDelete(item.itemId)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--red)",
          opacity: 0.5,
          padding: "0.25rem",
        }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ─── Edit Project Page ───────────────────────────────────────────────────────

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = "success") => setToast({ message, type });

  const loadData = useCallback(async () => {
    setLoading(true);
    const [projects, projectItems] = await Promise.all([
      fetchProjects("active"),
      fetchProjectItems(projectId),
    ]);
    // also check inactive
    const inactiveProjects = await fetchProjects("inactive");
    const allProjects = [...projects, ...inactiveProjects];
    const found = allProjects.find((p) => p.projectId === projectId);
    setProject(found ?? null);
    setItems(projectItems);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateField = async (field: string, value: unknown) => {
    if (!project) return;
    await updateProject(projectId, { [field]: value } as Partial<Pick<Project, "projectName" | "priority" | "dueDate">>);
    setProject({ ...project, [field]: value } as Project);
  };

  const handleRename = async (itemId: string, newName: string) => {
    await updateProjectItemName(itemId, newName);
    setItems((prev) => prev.map((i) => (i.itemId === itemId ? { ...i, itemName: newName } : i)));
    showToast("✏️ Item renamed");
  };

  const handleDelete = async (itemId: string) => {
    await deleteProjectItem(itemId);
    setItems((prev) => prev.filter((i) => i.itemId !== itemId));
    showToast("🗑️ Item deleted");
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      showToast("Please enter an item name first.", "warning");
      return;
    }
    try {
      await addProjectItem(projectId, newItemName.trim());
      showToast("✅ Item added!");
      setNewItemName("");
      await loadData();
    } catch (err) {
      console.error("[EditProject] addProjectItem FAILED:", err);
      showToast("Failed to add item", "error");
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm("Delete this entire project? This cannot be undone.")) return;
    await deleteProject(projectId);
    router.push("/projects");
  };

  if (loading) {
    return (
      <div>
        <NavHeader title="Edit Project" />
        <div className="empty-state"><p>Loading...</p></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div>
        <NavHeader title="Edit Project" />
        <div className="empty-state"><p>Project not found.</p></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "2rem" }}>
      <NavHeader title="Edit Project" />

      <div style={{ padding: "0 1rem" }}>
        {/* Project Name */}
        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem", display: "block" }}>
          Project Name
        </label>
        <input
          className="input"
          value={project.projectName}
          onChange={(e) => setProject({ ...project, projectName: e.target.value })}
          onBlur={() => handleUpdateField("projectName", project.projectName)}
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
              type="button"
              onClick={() => handleUpdateField("priority", p)}
              className={`priority-badge priority-${p}`}
              style={{
                cursor: "pointer",
                border: project.priority === p ? "2px solid var(--gold)" : "2px solid transparent",
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
          value={project.dueDate?.slice(0, 10) ?? ""}
          onChange={(e) => handleUpdateField("dueDate", e.target.value || null)}
          style={{ marginBottom: "1.25rem" }}
        />

        {/* Items Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 700 }}>Items ({items.length})</h3>
        </div>

        {/* Add Item Inline */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <input
            className="input"
            placeholder="Add a new item..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
          />
          <button
            type="button"
            onClick={handleAddItem}
            style={{
              background: "var(--gold)",
              border: "none",
              borderRadius: "0.75rem",
              color: "var(--bg-primary)",
              cursor: "pointer",
              padding: "0 0.75rem",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Plus size={18} />
          </button>
        </div>


        {/* Item List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {items.map((item, i) => (
            <div
              key={item.itemId}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 0.03}s`, opacity: 0 }}
            >
              <ItemRow item={item} onRename={handleRename} onDelete={handleDelete} />
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="empty-state" style={{ padding: "2rem" }}>
            <p>No items yet. Add one above!</p>
          </div>
        )}

        {/* Delete Project */}
        <button
          type="button"
          className="btn-danger"
          onClick={handleDeleteProject}
          style={{ width: "100%", marginTop: "2rem" }}
        >
          <Trash2 size={16} />
          Delete Project
        </button>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
      )}
    </div>
  );
}
