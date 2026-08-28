"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Drawer from "./Drawer";
import { Chips, Field } from "./DetailBits";
import { fmt, platformLabel } from "@/lib/marketing/format";
import type { IdeaRow } from "@/lib/marketing/supabase-mkt";
import { Icon } from "@/lib/marketing/icons";
import Highlights from "./Highlights";
import { ts } from "@/lib/marketing/transcript";

export default function IdeasView({ rows }: { rows: IdeaRow[] }) {
  const [status, setStatus] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const statuses = useMemo(() => {
    const set = new Set(rows.map((r) => r.status || "idea"));
    return ["all", ...Array.from(set).sort()];
  }, [rows]);

  const shown = useMemo(
    () => (status === "all" ? rows : rows.filter((r) => (r.status || "idea") === status)),
    [rows, status],
  );
  const current = rows.find((r) => r.id === openId) ?? null;

  return (
    <>
      {statuses.length > 2 && (
        <div className="toolbar">
          {statuses.map((s) => (
            <button key={s} className={`filter-chip${status === s ? " on" : ""}`}
                    onClick={() => setStatus(s)} aria-pressed={status === s}>
              {s === "all" ? "Tất cả" : s}{" "}
              <span style={{ opacity: 0.65 }}>
                {s === "all" ? rows.length : rows.filter((r) => (r.status || "idea") === s).length}
              </span>
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <div className="empty">Chưa có ý tưởng nào ở trạng thái này.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Ý tưởng GWT</th><th>Nguồn</th><th>SP phù hợp</th>
                <th>Transcript</th><th>Trạng thái</th><th style={{ textAlign: "right" }}>View gốc</th><th />
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => {
                const idea = r.gwt_idea || r.original_summary || "(chưa có ý tưởng)";
                return (
                  <tr key={r.id} onClick={() => setOpenId(r.id)} tabIndex={0}
                      onKeyDown={(e) => { if (e.key === "Enter") setOpenId(r.id); }}>
                    <td className="num-cell">#{r.idea_no ?? "—"}</td>
                    <td className="td-title">
                      {idea.length > 90 ? `${idea.slice(0, 90)}…` : idea}
                    </td>
                    <td><span className="tag">{platformLabel(r.source_platform)}</span></td>
                    <td style={{ fontSize: ".78rem", color: "var(--ink-2)" }}>
                      {r.gwt_product_fit?.replace(/,/g, ", ") || "—"}
                    </td>
                    <td>
                      {r.hasTranscript ? (
                        <span className="chip mono" style={{ fontSize: ".66rem" }}>
                          {r.extract.counts.v ? `${r.extract.counts.v + r.extract.counts.t} dòng` : "văn bản"}
                        </span>
                      ) : (
                        <span style={{ color: "var(--ink-3)", fontSize: ".78rem" }}>—</span>
                      )}
                    </td>
                    <td><span className="pill-status">{r.status || "idea"}</span></td>
                    <td className="num-cell" style={{ textAlign: "right" }}>{fmt(r.view_count)}</td>
                    <td className="row-arrow">›</td>
                  </tr>
                );
              })}
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
                  <span className="chip mono">Idea #{current.idea_no ?? "—"}</span>
                  <span className="tag">{platformLabel(current.source_platform)}</span>
                  <span className="pill-status">{current.status || "idea"}</span>
                  {current.content_type && <span className="chip">{current.content_type}</span>}
                  {current.extract.duration > 0 && <span className="chip mono">{ts(current.extract.duration)}</span>}
                </div>
                <h2>Ý tưởng cho GWT</h2>
                <div style={{ fontSize: ".82rem", color: "var(--ink-3)" }}>
                  SP phù hợp: {current.gwt_product_fit?.replace(/,/g, ", ") || "—"}
                  {current.view_count ? ` · nguồn ${fmt(current.view_count)} view` : ""}
                </div>
              </div>
              <button className="icon-btn drawer-close" onClick={() => setOpenId(null)} aria-label="Đóng">✕</button>
            </div>

            <div className="drawer-body">
              {current.gwt_idea && <Field label="▸ Ý tưởng GWT" formula>{current.gwt_idea}</Field>}
              {current.gwt_hook && (
                <div className="field-block">
                  <div className="fl">Hook đề xuất</div>
                  <div className="fv" style={{ fontStyle: "italic", color: "var(--ink)" }}>
                    “{current.gwt_hook}”
                  </div>
                </div>
              )}
              {current.gwt_content_angle && <Field label="Góc nội dung">{current.gwt_content_angle}</Field>}

              {current.extract.counts.v > 0 && (
                <div className="field-block">
                  <div className="fl">▸ Bóc riêng từ transcript video nguồn</div>
                  <Highlights extract={current.extract} />
                </div>
              )}

              {current.hasTranscript && (
                <Link
                  className="btn btn-primary"
                  href={`/wiki/marketing/du-lieu/video-ideas/${current.id}`}
                  style={{ display: "block", textAlign: "center", textDecoration: "none", marginTop: 14 }}
                >
                  {current.extract.counts.v
                    ? `Mở transcript đầy đủ (${current.extract.counts.v + current.extract.counts.t} dòng) →`
                    : "Mở transcript đầy đủ →"}
                </Link>
              )}
              {current.gwt_platform && (
                <div className="field-block">
                  <div className="fl">Nền tảng đề xuất</div>
                  <Chips items={current.gwt_platform.split(",").map((s) => s.trim())} />
                </div>
              )}

              {(current.like_count || current.comment_count || current.share_count) && (
                <div className="field-block">
                  <div className="fl">Chỉ số video nguồn</div>
                  <div className="metricgrid">
                    {([["views", current.view_count], ["likes", current.like_count],
                       ["comments", current.comment_count], ["shares", current.share_count]] as const)
                      .filter(([, v]) => v != null)
                      .map(([k, v]) => (
                        <div className="m" key={k}>
                          <div className="mv">{fmt(v)}</div>
                          <div className="ml">{k}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {current.original_summary && (
                <div className="field-block">
                  <div className="fl">Nguồn gốc (tóm tắt video tham khảo)</div>
                  <div className="fv" style={{ color: "var(--ink-3)" }}>{current.original_summary}</div>
                </div>
              )}
              {current.engagement_note && <Field label="Ghi chú tương tác">{current.engagement_note}</Field>}

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
                      Mở video gốc
                    </a>
                  ) : "—"}
                  <div style={{ marginTop: 6, fontSize: ".78rem", color: "var(--ink-3)" }}>
                    {current.assigned_to && current.assigned_to !== "None" ? `Giao cho ${current.assigned_to} · ` : ""}
                    {current.created_at ? new Date(current.created_at).toLocaleDateString("vi-VN") : ""}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </Drawer>
    </>
  );
}
