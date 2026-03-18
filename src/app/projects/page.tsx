"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import NavHeader from "@/components/NavHeader";
import CreateProjectModal from "@/components/CreateProjectModal";
import { fetchProjects } from "@/lib/engine";
import { formatDate } from "@/lib/dateUtils";
import type { Project } from "@/types";
import { ChevronRight, FolderPlus } from "lucide-react";

type SortBy = "priority" | "alpha";

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");
  const [projects, setProjects] = useState<Project[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("priority");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadProjects = useCallback(() => {
    setLoading(true);
    fetchProjects(activeTab).then((data) => {
      setProjects(data);
      setLoading(false);
    });
  }, [activeTab]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const sorted = [...projects].sort((a, b) => {
    if (sortBy === "priority") return b.priority - a.priority;
    return a.projectName.localeCompare(b.projectName);
  });

  return (
    <div style={{ minHeight: "100vh" }}>
      <NavHeader title="Projects" />

      <div style={{ padding: "0 1rem" }}>
        {/* Tab Bar */}
        <div className="tab-bar" style={{ marginBottom: "1rem" }}>
          <button className={`tab ${activeTab === "active" ? "active" : ""}`} onClick={() => setActiveTab("active")}>
            Active
          </button>
          <button className={`tab ${activeTab === "inactive" ? "active" : ""}`} onClick={() => setActiveTab("inactive")}>
            Inactive
          </button>
        </div>

        {/* Sort Controls */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <button
            className={sortBy === "priority" ? "btn-secondary" : "btn-primary"}
            style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem" }}
            onClick={() => setSortBy("priority")}
          >
            By Priority
          </button>
          <button
            className={sortBy === "alpha" ? "btn-secondary" : "btn-primary"}
            style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem" }}
            onClick={() => setSortBy("alpha")}
          >
            A → Z
          </button>
        </div>

        {/* Add Project Button */}
        <button
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ width: "100%", marginBottom: "1rem", justifyContent: "center" }}
        >
          <FolderPlus size={18} style={{ color: "var(--gold)" }} />
          Create New Project
        </button>

        {/* Project List */}
        {loading ? (
          <div className="empty-state"><p>Loading projects...</p></div>
        ) : sorted.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📂</div>
            <p>No {activeTab} projects yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {sorted.map((project, i) => (
              <Link
                key={project.projectId}
                href={`/projects/${project.projectId}`}
                className="card animate-fade-in"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  textDecoration: "none",
                  color: "inherit",
                  animationDelay: `${i * 0.05}s`,
                  opacity: 0,
                }}
              >
                <span className={`priority-badge priority-${project.priority}`}>
                  {project.priority}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{project.projectName}</p>
                  {project.dueDate && (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.15rem" }}>
                      Due {formatDate(project.dueDate)}
                    </p>
                  )}
                </div>
                <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => loadProjects()}
        />
      )}
    </div>
  );
}
