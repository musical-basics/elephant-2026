"use client";

import { useState, useEffect } from "react";
import NavHeader from "@/components/NavHeader";
import { fetchCompletedList } from "@/lib/engine";
import { formatTimestamp } from "@/lib/dateUtils";
import type { CompletedItem } from "@/types";
import { CheckCircle } from "lucide-react";

export default function CompletedPage() {
  const [items, setItems] = useState<CompletedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedList().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ minHeight: "100vh" }}>
      <NavHeader title="Completed" />

      <div style={{ padding: "0 1rem" }}>
        {loading ? (
          <div className="empty-state"><p>Loading...</p></div>
        ) : items.length === 0 ? (
          <div className="empty-state" style={{ minHeight: "50vh" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📋</div>
            <p>No completed items yet. Go crush some tasks!</p>
          </div>
        ) : (
          <>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "1rem" }}>
              {items.length} item{items.length !== 1 ? "s" : ""} completed
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              {items.map((item, i) => (
                <div
                  key={item.itemId}
                  className="card animate-fade-in"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.65rem",
                    animationDelay: `${i * 0.03}s`,
                    opacity: 0,
                  }}
                >
                  <CheckCircle size={16} style={{ color: "var(--green)", marginTop: "0.15rem", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "0.85rem", fontWeight: 500 }}>{item.itemName}</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", marginTop: "0.2rem" }}>
                      {formatTimestamp(item.dateTimeCompleted)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
