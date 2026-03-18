"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { takeABite } from "@/lib/engine";
import type { MasterListItem } from "@/types";

interface TakeABiteModalProps {
  item: MasterListItem;
  onClose: () => void;
  onComplete: () => void;
}

export default function TakeABiteModal({ item, onClose, onComplete }: TakeABiteModalProps) {
  const [field1, setField1] = useState(item.itemName);
  const [field2, setField2] = useState("");
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!field1.trim() || !field2.trim()) return;
    setLoading(true);
    try {
      await takeABite(item, field1.trim(), field2.trim());
      onComplete();
    } catch (err) {
      console.error("Take a Bite error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>🍽️ Take a Bite</h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginBottom: "1rem", lineHeight: 1.5 }}>
          Break this item into a smaller, immediate step. Rename the current item and create a new one for the rest.
        </p>

        {/* Field 1: Rename */}
        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.35rem", display: "block" }}>
          Current item (rename to a smaller step)
        </label>
        <input
          className="input"
          value={field1}
          onChange={(e) => setField1(e.target.value)}
          style={{ marginBottom: "0.75rem" }}
        />

        {/* Field 2: New sub-item */}
        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.35rem", display: "block" }}>
          New item (the remaining work)
        </label>
        <input
          className="input"
          placeholder="What's left to do?"
          value={field2}
          onChange={(e) => setField2(e.target.value)}
          style={{ marginBottom: "1.25rem" }}
        />

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            className="btn-green"
            onClick={handleComplete}
            disabled={loading || !field1.trim() || !field2.trim()}
            style={{ flex: 1, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Saving..." : "Complete"}
          </button>
        </div>
      </div>
    </div>
  );
}
