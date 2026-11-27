"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Icon } from "@/lib/marketing/icons";
import { Input } from "@/components/ui/input";
import { commandEmpty, phu } from "@/components/ui/command-styles";
import { menuContent, menuItem } from "@/components/ui/menu-styles";
import { VungDoc } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type SearchItem = { href: string; title: string; kind: string };

/** Bỏ dấu để gõ "luat sua" cũng ra "Luật sửa". */
const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase();

export default function Search({ index }: { index: SearchItem[] }) {
  const router = useRouter();
  const listId = useId();
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

  const showResults = open && q.trim().length >= 2;

  function goTo(item: SearchItem) {
    setOpen(false);
    setQ("");
    router.push(item.href);
  }

  return (
    <div ref={box} className="wiki-search relative min-w-0">
      <div className="searchbox">
        <span aria-hidden="true"><Icon.search /></span>
        <Input
          className="wiki-search-input"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showResults && hits.length > 0}
          aria-controls={showResults && hits.length ? listId : undefined}
          aria-activedescendant={showResults && hits.length ? `${listId}-${active}` : undefined}
          ref={input}
          value={q}
          placeholder="Tìm khung, luật, trang…  ( / )"
          aria-label="Tìm trong wiki"
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") { setOpen(false); }
            if (!showResults || !hits.length) return;
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % hits.length); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + hits.length) % hits.length); }
            if (e.key === "Enter") { e.preventDefault(); goTo(hits[active]); }
          }}
        />
      </div>

      {/* Vùng thông báo RIÊNG, luôn có sẵn trong DOM (role không đổi qua lại trên cùng một phần tử). */}
      <VungDoc chu={showResults ? (hits.length ? `${hits.length} kết quả` : `Không thấy gì khớp “${q}”.`) : ""} />

      {showResults && (
        <div className={cn(menuContent, "absolute top-[calc(100%+6px)] right-0 z-30 w-[min(380px,80vw)]")}>
          {hits.length === 0 ? (
            <div className={commandEmpty}>Không thấy gì khớp “{q}”.</div>
          ) : (
            <div id={listId} role="listbox" aria-label="Kết quả tìm kiếm Wiki">
              {hits.map((h, i) => (
                <button
                  key={h.href}
                  id={`${listId}-${i}`}
                  role="option"
                  tabIndex={-1}
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => goTo(h)}
                  className={cn(menuItem, "flex-col items-start gap-0 aria-selected:bg-(--menu-item-bg)")}
                >
                  {h.title}
                  <span className={phu}>{h.kind}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
