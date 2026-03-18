"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import AddItemModal from "./AddItemModal";

interface NavHeaderProps {
  showBack?: boolean;
  title?: string;
}

export default function NavHeader({ showBack = true, title }: NavHeaderProps) {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem",
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(10, 10, 15, 0.85)",
          backdropFilter: "blur(12px)",
        }}
      >
        {showBack ? (
          <button
            onClick={() => router.push("/")}
            style={{
              background: "none",
              border: "none",
              color: "var(--gold)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.85rem",
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={18} />
            <span>Home</span>
          </button>
        ) : (
          <div style={{ width: 60 }} />
        )}

        {title && (
          <h2
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {title}
          </h2>
        )}

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "0.5rem",
            color: "var(--gold)",
            cursor: "pointer",
            padding: "0.4rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
        >
          <Plus size={18} />
        </button>
      </header>

      {showAddModal && <AddItemModal onClose={() => setShowAddModal(false)} />}
    </>
  );
}
