"use client";

import { useState, useEffect } from "react";
import NavHeader from "@/components/NavHeader";
import { fetchMasterList } from "@/lib/engine";
import type { MasterListItem } from "@/types";

export default function MasterListPage() {
  const [items, setItems] = useState<MasterListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMasterList().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ minHeight: "100vh" }}>
      <NavHeader title="Master List" />

      <div style={{ padding: "0 1rem" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "1rem" }}>
          This is the hidden queue that powers your workflow. Items are shown in order.
        </p>

        {loading ? (
          <div className="empty-state"><p>Loading...</p></div>
        ) : items.length === 0 ? (
          <div className="empty-state" style={{ minHeight: "40vh" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🐘</div>
            <p>The Master List is empty.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            {items.map((item, i) => (
              <div
                key={item.itemId}
                className="card animate-fade-in"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  animationDelay: `${i * 0.03}s`,
                  opacity: 0,
                }}
              >
                <span
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    width: "1.75rem",
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  #{item.mlpIndex}
                </span>

                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                    {item.isPlaceholder ? (
                      <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                        ⌛ {item.itemName} (placeholder)
                      </span>
                    ) : (
                      item.itemName
                    )}
                  </p>
                </div>

                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    padding: "0.2rem 0.5rem",
                    borderRadius: "0.35rem",
                    background: item.isErrand
                      ? "rgba(212, 168, 83, 0.15)"
                      : "rgba(99, 102, 241, 0.15)",
                    color: item.isErrand ? "var(--gold)" : "#818cf8",
                  }}
                >
                  {item.isErrand ? "Errand" : "Project"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
