"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/lib/marketing/icons";

export type SearchItem = { href: string; title: string; kind: string };

/** Bỏ dấu để gõ "luat sua" cũng ra "Luật sửa". */
const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase();

export default function Search({ index }: { index: SearchItem[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const hits = useMemo(() => {
    const needle = norm(q.trim());
    if (needle.length < 2) return [];
    return index.filter((i) => norm(`${i.title} ${i.kind}`).includes(needle)).slice(0, 8);
  }, [q, index]);

  // Gõ chữ mới thì con trỏ chọn về dòng đầu — chỉnh ngay khi render, không qua effect
  // (effect làm mũi tên lên/xuống nhấp nháy một nhịp, và eslint chặn setState-trong-effect).
  const [qCu, setQCu] = useState(q);
  if (qCu !== q) {
    setQCu(q);
    setActive(0);
  }

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        input.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function goTo(item: SearchItem) {
    setOpen(false);
    setQ("");
    router.push(item.href);
  }

  return (
    <div ref={box} style={{ position: "relative" }}>
      <div className="searchbox">
        <Icon.search />
        <input
          ref={input}
          value={q}
          placeholder="Tìm khung, luật, trang…  ( / )"
          aria-label="Tìm trong wiki"
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") { setOpen(false); input.current?.blur(); }
            if (!hits.length) return;
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % hits.length); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + hits.length) % hits.length); }
            if (e.key === "Enter") { e.preventDefault(); goTo(hits[active]); }
          }}
        />
      </div>

      {open && q.trim().length >= 2 && (
        <div
          role="listbox"
          style={{
            position: "absolute", top: "calc(100% + 6px)", right: 0, width: "min(380px,80vw)",
            background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)",
            boxShadow: "var(--shadow-lg)", overflow: "hidden", zIndex: 30,
          }}
        >
          {hits.length === 0 ? (
            <div style={{ padding: "12px 14px", fontSize: ".84rem", color: "var(--ink-3)" }}>
              Không thấy gì khớp “{q}”.
            </div>
          ) : (
            hits.map((h, i) => (
              <button
                key={h.href}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => goTo(h)}
                style={{
                  display: "block", width: "100%", textAlign: "left", border: "none", cursor: "pointer",
                  padding: "9px 14px", fontSize: ".85rem", color: "var(--ink)",
                  background: i === active ? "var(--surface-2)" : "transparent",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                {h.title}
                <span style={{ display: "block", fontSize: ".72rem", color: "var(--ink-3)" }}>{h.kind}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
