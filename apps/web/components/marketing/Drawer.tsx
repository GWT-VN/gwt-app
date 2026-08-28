"use client";

import { useEffect, useRef } from "react";

/** Drawer trượt từ phải — dùng chung cho chi tiết video_analyses và video_ideas. */
export default function Drawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const panel = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    panel.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <>
      <div className={`scrim${open ? " on" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside
        ref={panel}
        className={`drawer${open ? " on" : ""}`}
        aria-label="Chi tiết"
        aria-hidden={!open}
        role="dialog"
        aria-modal={open}
        tabIndex={-1}
      >
        {open && children}
      </aside>
    </>
  );
}
