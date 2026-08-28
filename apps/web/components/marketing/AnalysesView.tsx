"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Drawer from "./Drawer";
import { CatBadge, Chips, Field, MetricGrid } from "./DetailBits";
import { cat5a, fmt, headlineMetric, platformLabel } from "@/lib/marketing/format";
import type { AnalysisRow } from "@/lib/marketing/supabase-mkt";
import { Icon } from "@/lib/marketing/icons";
import Highlights from "./Highlights";
import { ts } from "@/lib/marketing/transcript";

const FILTERS = ["all", "A1", "A2", "A3", "A4", "A5"] as const;

export default function AnalysesView({ rows }: { rows: AnalysisRow[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [openId, setOpenId] = useState<number | null>(null);

  const shown = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => cat5a(r.content_category) === filter)),
    [rows, filter],
  );
  const current = rows.find((r) => r.id === openId) ?? null;

  return (
    <>
      <div className="toolbar">
        {FILTERS.map((f) => {
          const n = f === "all" ? rows.length : rows.filter((r) => cat5a(r.content_category) === f).length;
          return (
            <button
              key={f}
              className={`filter-chip${filter === f ? " on" : ""}`}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
            >
              {f === "all" ? "Tất cả" : f} <span style={{ opacity: 0.65 }}>{n}</span>
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <div className="empty">Không có video nào ở tuyến {filter}.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Video</th><th>Nền tảng</th><th>Tuyến</th><th>Hook</th><th>Kêu gọi</th><th>Viral</th>
                <th style={{ textAlign: "right" }}>Chỉ số</th><th />
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} onClick={() => setOpenId(r.id)} tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") setOpenId(r.id); }}>
                  <td className="td-title">
                    {r.video_title || "(chưa đặt tiêu đề)"}
                    <small>{r.channel_name || "—"}</small>
                  </td>
                  <td><span className="tag">{platformLabel(r.platform)}</span></td>
                  <td><CatBadge cat={cat5a(r.content_category)} /></td>
                  <td style={{ fontSize: ".78rem", color: "var(--ink-3)" }}>{r.hook_type || "—"}</td>
                  <td>
                    {r.extract.ctas.length ? (
                      <span className="chip mono" style={{ fontSize: ".68rem" }}>{r.extract.ctas.length} câu</span>
                    ) : (
                      <span style={{ color: "var(--ink-3)", fontSize: ".78rem" }}>—</span>
                    )}
                  </td>
                  <td>
                    {r.is_viral
                      ? <span className="pill-viral">● Viral</span>
                      : <span className="pill-not">Chưa</span>}
                  </td>
                  <td className="num-cell" style={{ textAlign: "right" }}>{fmt(headlineMetric(r.metrics))}</td>
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
                  <CatBadge cat={cat5a(current.content_category)} />
                  <span className="tag">{platformLabel(current.platform)}</span>
                  {current.is_viral
                    ? <span className="pill-viral">● Viral</span>
                    : <span className="pill-not">Chưa viral</span>}
                  {current.is_new_channel && <span className="chip">kênh mới</span>}
                  {current.extract.duration > 0 && (
                    <span className="chip mono">{ts(current.extract.duration)}</span>
                  )}
                </div>
                <h2>{current.video_title || "(chưa đặt tiêu đề)"}</h2>
                <div style={{ fontSize: ".82rem", color: "var(--ink-3)" }}>
                  {current.channel_name || "—"}
                  {current.industry ? ` · ${current.industry}` : ""}
                </div>
              </div>
              <button className="icon-btn drawer-close" onClick={() => setOpenId(null)} aria-label="Đóng">✕</button>
            </div>

            <div className="drawer-body">
              <div className="field-block">
                <div className="fl">Chỉ số</div>
                <MetricGrid metrics={current.metrics} />
              </div>

              <div className="field-block">
                <div className="fl">▸ Bóc riêng từ transcript</div>
                <Highlights extract={current.extract} />
              </div>

              <Link
                className="btn btn-primary"
                href={`/marketing/du-lieu/phan-tich-video/${current.id}`}
                style={{ display: "block", textAlign: "center", textDecoration: "none", marginTop: 14 }}
              >
                Mở transcript đầy đủ ({current.extract.counts.v + current.extract.counts.t} dòng) →
              </Link>

              {current.hook_type && <Field label="Hook (loại)">{current.hook_type}</Field>}

              <div className="field-block">
                <div className="fl">S-FACES (Action)</div>
                <Chips items={current.s_faces} />
              </div>
              <div className="field-block">
                <div className="fl">CRAVES (Prefer)</div>
                <Chips items={current.craves_triggers} />
              </div>
              <div className="field-block">
                <div className="fl">Tầng Maslow · KPI</div>
                <Chips items={[current.maslow_layer, ...(current.kpi_primary ?? [])]} />
              </div>

              {current.viral_elements?.length ? (
                <div className="field-block">
                  <div className="fl">Yếu tố viral</div>
                  <Chips items={current.viral_elements} />
                </div>
              ) : null}

              {current.conclusion && (
                <Field label="▸ Công thức rút ra (áp cho GWT)" formula>{current.conclusion}</Field>
              )}
              {current.evaluation && <Field label="Đánh giá">{current.evaluation}</Field>}
              {current.platform_fit && <Field label="Độ hợp nền tảng">{current.platform_fit}</Field>}

              <div className="field-block">
                <div className="fl">Tags</div>
                <Chips items={current.tags} hash />
              </div>

              <div className="field-block">
                <div className="fl">Nguồn</div>
                <div className="fv">
                  {current.url ? (
                    <a href={current.url} target="_blank" rel="noopener noreferrer"
                       style={{ display: "inline-flex", alignItems: "center", gap: 6, wordBreak: "break-all" }}>
                      <span style={{ width: 15, height: 15, flex: "none" }}><Icon.link /></span>
                      Mở video gốc
                    </a>
                  ) : "—"}
                  <div style={{ marginTop: 6, fontSize: ".78rem", color: "var(--ink-3)" }}>
                    {current.analyzed_by ? `Phân tích bởi ${current.analyzed_by}` : ""}
                    {current.analyzed_at
                      ? ` · ${new Date(current.analyzed_at).toLocaleDateString("vi-VN")}`
                      : ""}
                    {` · id ${current.id}`}
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
