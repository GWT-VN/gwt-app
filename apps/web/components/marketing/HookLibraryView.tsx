"use client";

import { useMemo, useState } from "react";
import Drawer from "./Drawer";
import { Chips, Field } from "./DetailBits";
import type { HookItem } from "@/lib/marketing/supabase-mkt";
import { Icon } from "@/lib/marketing/icons";

const KIND_LABEL: Record<string, string> = {
  hook: "Hook",
  cta: "Kêu gọi (CTA)",
  question: "Câu hỏi",
  closing: "Câu kết",
};
const kindLabel = (k: string | null) => (k && KIND_LABEL[k]) || k || "khác";

export default function HookLibraryView({ rows }: { rows: HookItem[] }) {
  const kinds = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => r.kind && set.add(r.kind));
    return ["all", ...Array.from(set)];
  }, [rows]);

  const [kind, setKind] = useState<string>("all");
  const [style, setStyle] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const byKind = useMemo(() => (kind === "all" ? rows : rows.filter((r) => r.kind === kind)), [rows, kind]);
  const styles = useMemo(() => {
    const set = new Set<string>();
    byKind.forEach((r) => r.hook_style && set.add(r.hook_style));
    return ["all", ...Array.from(set)];
  }, [byKind]);
  const shown = useMemo(
    () => (style === "all" ? byKind : byKind.filter((r) => r.hook_style === style)),
    [byKind, style],
  );
  const current = rows.find((r) => r.id === openId) ?? null;

  return (
    <>
      <div className="toolbar">
        {kinds.map((k) => {
          const n = k === "all" ? rows.length : rows.filter((r) => r.kind === k).length;
          return (
            <button
              key={k}
              className={`filter-chip${kind === k ? " on" : ""}`}
              onClick={() => { setKind(k); setStyle("all"); }}
              aria-pressed={kind === k}
            >
              {k === "all" ? "Tất cả" : kindLabel(k)} <span style={{ opacity: 0.65 }}>{n}</span>
            </button>
          );
        })}
      </div>

      {styles.length > 2 && (
        <div className="toolbar" style={{ marginTop: 6 }}>
          {styles.map((s) => (
            <button
              key={s}
              className={`filter-chip${style === s ? " on" : ""}`}
              onClick={() => setStyle(s)}
              aria-pressed={style === s}
            >
              {s === "all" ? "Mọi phong cách" : s}
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <div className="empty">Không có câu nào khớp bộ lọc.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Câu</th>
                <th>Loại</th>
                <th>Phong cách</th>
                <th>Nguồn</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} onClick={() => setOpenId(r.id)} tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") setOpenId(r.id); }}>
                  <td className="td-title" style={{ maxWidth: 440 }}>
                    {r.text}
                  </td>
                  <td><span className="chip">{kindLabel(r.kind)}</span></td>
                  <td style={{ fontSize: ".76rem", color: "var(--ink-3)" }}>{r.hook_style || "—"}</td>
                  <td style={{ fontSize: ".78rem", color: "var(--ink-3)" }}>{r.source_channel || "—"}</td>
                  <td className="row-arrow">›</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Drawer open={Boolean(current)} onClose={() => setOpenId(null)}>
        {current && (
          <>
            <div className="drawer-head">
              <div className="dh-main">
                <div className="meta-row">
                  <span className="chip">{kindLabel(current.kind)}</span>
                  {current.hook_style && <span className="tag">{current.hook_style}</span>}
                </div>
                <h2 style={{ fontSize: "1.05rem", lineHeight: 1.45 }}>{current.text}</h2>
              </div>
              <button className="icon-btn drawer-close" onClick={() => setOpenId(null)} aria-label="Đóng">✕</button>
            </div>

            <div className="drawer-body">
              {current.reuse_note && <Field label="▸ Dùng lại thế nào">{current.reuse_note}</Field>}
              {current.gwt_adapted && <Field label="▸ Bản GWT (nước)" formula>{current.gwt_adapted}</Field>}
              <div className="field-block">
                <div className="fl">Tags</div>
                <Chips items={current.tags} hash />
              </div>
              <div className="field-block">
                <div className="fl">Nguồn</div>
                <div className="fv">
                  {current.source_url ? (
                    <a href={current.source_url} target="_blank" rel="noopener noreferrer"
                       style={{ display: "inline-flex", alignItems: "center", gap: 6, wordBreak: "break-all" }}>
                      <span style={{ width: 15, height: 15, flex: "none" }}><Icon.link /></span>
                      {current.source_channel || "Mở video gốc"}
                    </a>
                  ) : (current.source_channel || "—")}
                  {current.added_by && (
                    <div style={{ marginTop: 6, fontSize: ".78rem", color: "var(--ink-3)" }}>
                      Thêm bởi {current.added_by}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </Drawer>
    </>
  );
}
