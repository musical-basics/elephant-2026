"use client";

import { useState, useEffect, useCallback } from "react";
import NavHeader from "@/components/NavHeader";
import TakeABiteModal from "@/components/TakeABiteModal";
import { fetchTopItem, fetchProjectName, completeItem } from "@/lib/engine";
import type { MasterListItem } from "@/types";

export default function DoNowPage() {
  const [currentItem, setCurrentItem] = useState<MasterListItem | null>(null);
  const [projectName, setProjectName] = useState("");
  const [showBiteModal, setShowBiteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const loadItem = useCallback(async () => {
    setLoading(true);
    const item = await fetchTopItem();
    setCurrentItem(item);

    if (item && item.projectId && !item.isErrand) {
      const name = await fetchProjectName(item.projectId);
      setProjectName(name);
    } else {
      setProjectName("");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  const handleComplete = async () => {
    if (!currentItem || completing) return;
    setCompleting(true);
    try {
      await completeItem(currentItem);
      await loadItem();
    } catch (err) {
      console.error("Complete error:", err);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <NavHeader title="Do Now" />
        <div className="empty-state" style={{ minHeight: "60vh" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>⏳</div>
          <p>Loading your next item...</p>
        </div>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div>
        <NavHeader title="Do Now" />
        <div className="empty-state" style={{ minHeight: "60vh" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
            All done!
          </h2>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>
            Your Master List is empty. Add some items or projects to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <NavHeader title="Do Now" />

      {/* Centered Gold Frame */}
      <div
        className="animate-fade-in"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1.5rem",
          paddingBottom: "8rem",
        }}
      >
        <div className="gold-frame" style={{ width: "100%", maxWidth: "20rem", textAlign: "center" }}>
          <p style={{ fontSize: "1.35rem", fontWeight: 700, lineHeight: 1.5 }}>
            {currentItem.itemName}
          </p>
        </div>

        {/* Project Name underneath */}
        {projectName && (
          <p
            className="animate-fade-in"
            style={{
              color: "var(--text-muted)",
              fontSize: "0.8rem",
              marginTop: "1rem",
              fontWeight: 500,
            }}
          >
            📂 {projectName}
          </p>
        )}
      </div>

      {/* Fixed Bottom Buttons */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          padding: "1.25rem",
          paddingBottom: "2rem",
          background: "linear-gradient(to top, var(--bg-primary), transparent)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: "28rem",
            gap: "1rem",
          }}
        >
          <button
            className="btn-red"
            onClick={() => setShowBiteModal(true)}
            style={{ flex: 1 }}
          >
            🔴 Take a Bite
          </button>
          <button
            className="btn-green"
            onClick={handleComplete}
            disabled={completing}
            style={{ flex: 1, opacity: completing ? 0.6 : 1 }}
          >
            {completing ? "Saving..." : "✅ Completed!"}
          </button>
        </div>
      </div>

      {showBiteModal && (
        <TakeABiteModal
          item={currentItem}
          onClose={() => setShowBiteModal(false)}
          onComplete={() => {
            setShowBiteModal(false);
            loadItem();
          }}
        />
      )}
    </div>
  );
}
