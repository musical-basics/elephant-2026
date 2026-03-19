"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "warning" | "error";

interface ToastProps {
  message: string;
  type?: ToastType;
  onDone: () => void;
}

export default function Toast({ message, type = "success", onDone }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300); // allow fade-out
    }, 2200);
    return () => clearTimeout(timer);
  }, [onDone]);

  const bgColors: Record<ToastType, string> = {
    success: "var(--green)",
    warning: "var(--gold)",
    error: "var(--red)",
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "2rem",
        left: "50%",
        transform: `translateX(-50%) translateY(${visible ? "0" : "1rem"})`,
        background: bgColors[type],
        color: type === "warning" ? "var(--bg-primary)" : "#fff",
        padding: "0.6rem 1.25rem",
        borderRadius: "0.75rem",
        fontSize: "0.85rem",
        fontWeight: 600,
        zIndex: 100,
        opacity: visible ? 1 : 0,
        transition: "all 0.3s ease",
        boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
        pointerEvents: "none",
      }}
    >
      {message}
    </div>
  );
}
