"use client";

import type { TabView } from "@/app/actions";
import { TAB_Y_TUONG, TRUONG_Y_TUONG } from "@/app/wiki/marketing/du-lieu/truong-mkt";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CotDanhSach } from "@/components/ui/list-view";
import { SheetTitle } from "@/components/ui/sheet";

import Link from "next/link";
import { useState } from "react";
import { BangMkt, type CotMkt } from "./BangMkt";
import Drawer from "./Drawer";
import { NameButton } from "./ads/shared";
import { Chips, Field } from "./DetailBits";
import { fmt, platformLabel } from "@/lib/marketing/format";
import type { IdeaRow } from "@/lib/marketing/supabase-mkt";
import { Icon } from "@/lib/marketing/icons";
import Highlights from "./Highlights";
import { ts } from "@/lib/marketing/transcript";
import { hienNgay } from "@/lib/dinh-dang-ngay";

const yTuong = (r: IdeaRow) => r.gwt_idea || r.original_summary || "(chưa có ý tưởng)";

export default function IdeasView({ rows, tabRieng = [], coTab = false, quyenTabChung = false }: {
  rows: IdeaRow[];
  tabRieng?: TabView[];
  coTab?: boolean;
  quyenTabChung?: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const current = rows.find((r) => r.id === openId) ?? null;

  const cot: CotMkt<IdeaRow>[] = [
    // Ý tưởng dài: NameButton tự xuống dòng, cắt 90 ký tự như cũ (đủ câu ở ngăn chi tiết).
    { id: "y_tuong", ten: "Ý tưởng GWT", kieu: "sap", khoa: true, toiThieu: 240, rongToiDa: 420, sap: yTuong, chu: yTuong,
      nghia: { tang: "Từ A đến Z", giam: "Từ Z đến A" },
      o: (r) => {
        const idea = yTuong(r);
        return <NameButton onOpen={() => setOpenId(r.id)}>{idea.length > 90 ? `${idea.slice(0, 90)}…` : idea}</NameButton>;
      } },
    { id: "so", ten: "#", kieu: "sap", phai: true, sap: (r) => r.idea_no, nghia: { tang: "Số nhỏ trước", giam: "Số lớn trước" },
      o: (r) => `#${r.idea_no ?? "—"}` },
    { id: "nguon", ten: "Nguồn", kieu: "sap", sap: (r) => platformLabel(r.source_platform), nghia: { tang: "Từ A đến Z", giam: "Từ Z đến A" },
      o: (r) => platformLabel(r.source_platform) },
    { id: "sp", ten: "SP phù hợp", kieu: "thuong", rongToiDa: 220, chu: (r) => r.gwt_product_fit?.replace(/,/g, ", "),
      o: (r) => r.gwt_product_fit?.replace(/,/g, ", ") || "—" },
    { id: "transcript", ten: "Transcript", kieu: "thuong",
      o: (r) => (r.hasTranscript ? (r.extract.counts.v ? `${r.extract.counts.v + r.extract.counts.t} dòng` : "văn bản") : "—") },
    { id: "trang_thai", ten: "Trạng thái", kieu: "sap", sap: (r) => r.status || "idea", nghia: { tang: "Từ A đến Z", giam: "Từ Z đến A" },
      o: (r) => <Badge variant="soft" color="warning">{r.status || "idea"}</Badge> },
    { id: "view", ten: "View gốc", kieu: "sap", phai: true, sap: (r) => r.view_count, nghia: { tang: "Ít trước", giam: "Nhiều trước" },
      o: (r) => fmt(r.view_count) },
  ];
  const cotDs: CotDanhSach<IdeaRow>[] = [
    { id: "y_tuong", ten: "Ý tưởng GWT", rong: "minmax(0,2fr)", dienThoai: "tren", o: yTuong },
    { id: "trang_thai", ten: "Trạng thái", rong: "minmax(0,1fr)", dienThoai: "duoi", o: (r) => r.status || "idea" },
    { id: "view", ten: "View gốc", rong: "minmax(0,1fr)", phai: true, dienThoai: "duoiPhai", o: (r) => fmt(r.view_count) },
  ];

  return (
    <>
      <BangMkt
        bang="mkt_y_tuong_tab"
        tieuDe="Ý tưởng video"
        nhan="ý tưởng"
        viDuTen="VD: Ý tưởng TikTok mới"
        rows={rows}
        khoa={(r) => r.id}
        cot={cot}
        cotDs={cotDs}
        truong={TRUONG_Y_TUONG}
        tabCoDinh={TAB_Y_TUONG}
        timTrong={(r) => [r.gwt_idea, r.original_summary, r.gwt_product_fit, r.idea_no != null ? `#${r.idea_no}` : ""].filter(Boolean).join(" ")}
        onMo={(r) => setOpenId(r.id)}
        tabRieng={tabRieng}
        coTab={coTab}
        quyenTabChung={quyenTabChung}
        timGoiY="Ý tưởng, sản phẩm, số…"
        rongThat={{ tieuDe: "Chưa có ý tưởng nào", moTa: "Ý tưởng video cho GWT sinh từ nguồn tham khảo sẽ hiện ở đây." }}
      />

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
