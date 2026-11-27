"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from "@/components/ui/table";

import Link from "next/link";
import { useMemo, useState } from "react";
import Drawer from "./Drawer";
import { NameButton } from "./ads/shared";
import { Chips, Field } from "./DetailBits";
import { fmt, platformLabel } from "@/lib/marketing/format";
import type { IdeaRow } from "@/lib/marketing/supabase-mkt";
import { Icon } from "@/lib/marketing/icons";
import Highlights from "./Highlights";
import { ts } from "@/lib/marketing/transcript";
import { hienNgay } from "@/lib/dinh-dang-ngay";

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
            <Button key={s} size="sm" variant={status === s ? "default" : "outline"}
                    onClick={() => setStatus(s)} aria-pressed={status === s}>
              {s === "all" ? "Tất cả" : s}{" "}
              <span style={{ opacity: 0.65 }}>
                {s === "all" ? rows.length : rows.filter((r) => (r.status || "idea") === s).length}
              </span>
            </Button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <EmptyState kieu="loc" tieuDe={<>Chưa có ý tưởng nào ở trạng thái này.</>} />
      ) : (
        <TableWrap vien role="region" tabIndex={0} aria-label="Danh sách ý tưởng video">
          <Table aria-label="Danh sách ý tưởng video" variant="thuong" className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead><TableHead>Ý tưởng GWT</TableHead><TableHead>Nguồn</TableHead><TableHead>SP phù hợp</TableHead>
                <TableHead>Transcript</TableHead><TableHead>Trạng thái</TableHead><TableHead style={{ textAlign: "right" }}>View gốc</TableHead><TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((r) => {
                const idea = r.gwt_idea || r.original_summary || "(chưa có ý tưởng)";
                return (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => setOpenId(r.id)}>
                    <TableCell className="num-cell">#{r.idea_no ?? "—"}</TableCell>
                    <TableCell className="td-title whitespace-normal align-top">
                      <NameButton onOpen={() => setOpenId(r.id)}>{idea.length > 90 ? `${idea.slice(0, 90)}…` : idea}</NameButton>
                    </TableCell>
                    <TableCell><span className="tag">{platformLabel(r.source_platform)}</span></TableCell>
                    <TableCell style={{ fontSize: ".78rem", color: "var(--ink-2)" }}>
                      {r.gwt_product_fit?.replace(/,/g, ", ") || "—"}
                    </TableCell>
                    <TableCell>
                      {r.hasTranscript ? (
                        <span className="chip mono" style={{ fontSize: ".66rem" }}>
                          {r.extract.counts.v ? `${r.extract.counts.v + r.extract.counts.t} dòng` : "văn bản"}
                        </span>
                      ) : (
                        <span style={{ color: "var(--ink-3)", fontSize: ".78rem" }}>—</span>
                      )}
                    </TableCell>
                    <TableCell><span className="pill-status">{r.status || "idea"}</span></TableCell>
                    <TableCell className="num-cell" style={{ textAlign: "right" }}>{fmt(r.view_count)}</TableCell>
                    <TableCell className="row-arrow">›</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableWrap>
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
                <SheetTitle asChild><h2>Ý tưởng #{current.idea_no ?? "—"} cho GWT</h2></SheetTitle>
                <div style={{ fontSize: ".82rem", color: "var(--ink-3)" }}>
                  SP phù hợp: {current.gwt_product_fit?.replace(/,/g, ", ") || "—"}
                  {current.view_count ? ` · nguồn ${fmt(current.view_count)} view` : ""}
                </div>
              </div>
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
                <Button asChild className="mt-3 w-full whitespace-normal text-center">
                  <Link href={`/wiki/marketing/du-lieu/video-ideas/${current.id}`}
                >
                  {current.extract.counts.v
                    ? `Mở transcript đầy đủ (${current.extract.counts.v + current.extract.counts.t} dòng) →`
                    : "Mở transcript đầy đủ →"}
                </Link>
                  </Button>
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
                    {hienNgay(current.created_at, undefined, { rong: "" })}
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
