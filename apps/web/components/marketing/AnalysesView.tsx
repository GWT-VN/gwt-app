"use client";

import type { TabView } from "@/app/actions";
import { TAB_VIDEO, TRUONG_VIDEO } from "@/app/wiki/marketing/du-lieu/truong-mkt";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SheetTitle } from "@/components/ui/sheet";

import Link from "next/link";
import { useState } from "react";
import { BangMkt, type CotMkt } from "./BangMkt";
import Drawer from "./Drawer";
import { NameButton } from "./ads/shared";
import { CatBadge, Chips, Field, MetricGrid } from "./DetailBits";
import { cat5a, fmt, headlineMetric, platformLabel } from "@/lib/marketing/format";
import type { AnalysisRow } from "@/lib/marketing/supabase-mkt";
import { Icon } from "@/lib/marketing/icons";
import Highlights from "./Highlights";
import { ts } from "@/lib/marketing/transcript";
import { hienNgay } from "@/lib/dinh-dang-ngay";
import type { CotDanhSach } from "@/components/ui/list-view";

const ten = (r: AnalysisRow) => r.video_title || "(chưa đặt tiêu đề)";

export default function AnalysesView({ rows, tabRieng = [], coTab = false, quyenTabChung = false }: {
  rows: AnalysisRow[];
  tabRieng?: TabView[];
  coTab?: boolean;
  quyenTabChung?: boolean;
}) {
  const [openId, setOpenId] = useState<number | null>(null);
  const current = rows.find((r) => r.id === openId) ?? null;

  const cot: CotMkt<AnalysisRow>[] = [
    { id: "video", ten: "Video", kieu: "sap", khoa: true, toiThieu: 200, rongToiDa: 360, sap: ten, chu: ten,
      nghia: { tang: "Tên từ A đến Z", giam: "Tên từ Z đến A" },
      o: (r) => <NameButton onOpen={() => setOpenId(r.id)}>{ten(r)}</NameButton> },
    { id: "kenh", ten: "Kênh", kieu: "sap", rongToiDa: 200, sap: (r) => r.channel_name, chu: (r) => r.channel_name,
      nghia: { tang: "Kênh từ A đến Z", giam: "Kênh từ Z đến A" }, o: (r) => r.channel_name || "—" },
    { id: "nen_tang", ten: "Nền tảng", kieu: "sap", sap: (r) => platformLabel(r.platform),
      nghia: { tang: "Từ A đến Z", giam: "Từ Z đến A" }, o: (r) => platformLabel(r.platform) },
    { id: "tuyen", ten: "Tuyến", kieu: "sap", sap: (r) => cat5a(r.content_category),
      nghia: { tang: "A1 trước", giam: "A5 trước" }, o: (r) => <CatBadge cat={cat5a(r.content_category)} /> },
    { id: "hook", ten: "Hook", kieu: "thuong", rongToiDa: 220, chu: (r) => r.hook_type, o: (r) => r.hook_type || "—" },
    { id: "keu_goi", ten: "Kêu gọi", kieu: "thuong", phai: true,
      o: (r) => (r.extract.ctas.length ? `${r.extract.ctas.length} câu` : "—") },
    { id: "viral", ten: "Viral", kieu: "thuong",
      o: (r) => (r.is_viral
        ? <Badge variant="soft" color="success">Viral</Badge>
        : <Badge variant="soft" color="secondary">Chưa</Badge>) },
    { id: "chi_so", ten: "Chỉ số", kieu: "sap", phai: true, sap: (r) => headlineMetric(r.metrics),
      nghia: { tang: "Nhỏ trước", giam: "Lớn trước" }, o: (r) => fmt(headlineMetric(r.metrics)) },
  ];
  const cotDs: CotDanhSach<AnalysisRow>[] = [
    { id: "video", ten: "Video", rong: "minmax(0,2fr)", dienThoai: "tren", o: ten },
    { id: "kenh", ten: "Kênh", rong: "minmax(0,1fr)", dienThoai: "duoi", o: (r) => r.channel_name || "—" },
    { id: "chi_so", ten: "Chỉ số", rong: "minmax(0,1fr)", phai: true, dienThoai: "duoiPhai", o: (r) => fmt(headlineMetric(r.metrics)) },
  ];

  return (
    <>
      <BangMkt
        bang="mkt_video_tab"
        tieuDe="Video đã phân tích"
        nhan="video"
        viDuTen="VD: A2 TikTok viral"
        rows={rows}
        khoa={(r) => String(r.id)}
        cot={cot}
        cotDs={cotDs}
        truong={TRUONG_VIDEO}
        tabCoDinh={TAB_VIDEO}
        timTrong={(r) => [r.video_title, r.channel_name, r.hook_type].filter(Boolean).join(" ")}
        onMo={(r) => setOpenId(r.id)}
        tabRieng={tabRieng}
        coTab={coTab}
        quyenTabChung={quyenTabChung}
        timGoiY="Tiêu đề, kênh, hook…"
        rongThat={{ tieuDe: "Chưa có video nào được phân tích", moTa: "Video mẫu mổ theo khung 5A/PAAST sẽ hiện ở đây." }}
      />

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
                <SheetTitle asChild><h2>{current.video_title || "(chưa đặt tiêu đề)"}</h2></SheetTitle>
                <div style={{ fontSize: ".82rem", color: "var(--ink-3)" }}>
                  {current.channel_name || "—"}
                  {current.industry ? ` · ${current.industry}` : ""}
                </div>
              </div>
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

              <Button asChild className="mt-3 w-full whitespace-normal text-center">
                <Link href={`/wiki/marketing/du-lieu/phan-tich-video/${current.id}`}
              >
                Mở transcript đầy đủ ({current.extract.counts.v + current.extract.counts.t} dòng) →
              </Link>
                </Button>

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
                      ? ` · ${hienNgay(current.analyzed_at)}`
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
