"use client";

import { useMemo, useState } from "react";
import { parseTranscript, ts } from "@/lib/marketing/transcript";

/** Transcript đầy đủ, lọc được theo lời thoại / chữ trên hình. */
export default function TranscriptView({ raw }: { raw: string | null }) {
  const cues = useMemo(() => parseTranscript(raw), [raw]);
  const [show, setShow] = useState<"all" | "V" | "T">("all");
  const bilingual = cues.some((c) => c.vi);
  const [showOrig, setShowOrig] = useState(true);

  const plain = raw && raw !== "None" ? raw.trim() : "";

  if (!cues.length) {
    // Nhiều bản ghi cũ chỉ có văn bản liền mạch, không mốc thời gian — vẫn hiện đầy đủ, đọc được.
    if (!plain) return <div className="empty">Bản ghi này chưa có transcript trong Supabase.</div>;
    return (
      <>
        <div className="notice" style={{ marginTop: 0 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          </svg>
          <div>
            Transcript này <b>không có mốc thời gian</b> (bản ghi cũ, lưu dạng văn bản liền) nên không bóc riêng
            hook/câu kết/câu kêu gọi được. Nội dung đầy đủ ở dưới.
          </div>
        </div>
        <div className="doc-card">
          <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.8, color: "var(--ink-2)", fontSize: ".9rem" }}>
            {plain}
          </p>
        </div>
      </>
    );
  }

  const shown = cues.filter((c) => show === "all" || c.kind === show);
  const nV = cues.filter((c) => c.kind === "V").length;
  const nT = cues.length - nV;

  return (
    <>
      <div className="toolbar">
        <button className={`filter-chip${show === "all" ? " on" : ""}`} onClick={() => setShow("all")}>
          Tất cả <span style={{ opacity: 0.65 }}>{cues.length}</span>
        </button>
        <button className={`filter-chip${show === "V" ? " on" : ""}`} onClick={() => setShow("V")}>
          Lời thoại <span style={{ opacity: 0.65 }}>{nV}</span>
        </button>
        <button className={`filter-chip${show === "T" ? " on" : ""}`} onClick={() => setShow("T")} disabled={!nT}>
          Chữ trên hình <span style={{ opacity: 0.65 }}>{nT}</span>
        </button>
        {bilingual && (
          <button className={`filter-chip${showOrig ? " on" : ""}`} onClick={() => setShowOrig((v) => !v)}>
            {showOrig ? "Đang hiện nguyên văn" : "Chỉ bản dịch"}
          </button>
        )}
      </div>

      <div className="table-wrap" style={{ padding: "6px 0" }}>
        {shown.map((c, i) => (
          <div
            key={i}
            style={{
              display: "flex", gap: 12, padding: "8px 16px", alignItems: "baseline",
              borderBottom: i < shown.length - 1 ? "1px solid var(--line)" : "none",
              background: c.kind === "T" ? "var(--surface-2)" : "transparent",
            }}
          >
            <span
              className="chip mono"
              title={c.kind === "V" ? "Lời thoại (STT)" : "Chữ on-screen (đọc frame)"}
              style={{ flex: "none", fontSize: ".64rem", padding: "1px 6px" }}
            >
              {c.kind} {ts(c.start)}
            </span>
            <span style={{ minWidth: 0, fontSize: ".88rem", lineHeight: 1.6 }}>
              <span style={{ color: "var(--ink-2)" }}>{c.vi || c.text}</span>
              {c.vi && showOrig && (
                <span style={{ display: "block", color: "var(--ink-3)", fontSize: ".82rem", marginTop: 2 }}>
                  {c.text}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
