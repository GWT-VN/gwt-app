"use client";

import type { TabView } from "@/app/actions";
import { TAB_HOOK, tenLoaiHook, TRUONG_HOOK } from "@/app/wiki/marketing/du-lieu/truong-mkt";
import { Badge } from "@/components/ui/badge";
import type { CotDanhSach } from "@/components/ui/list-view";
import { SheetTitle } from "@/components/ui/sheet";

import { useState } from "react";
import { BangMkt, type CotMkt } from "./BangMkt";
import Drawer from "./Drawer";
import { NameButton } from "./ads/shared";
import { Chips, Field } from "./DetailBits";
import type { HookItem } from "@/lib/marketing/supabase-mkt";
import { Icon } from "@/lib/marketing/icons";

const kindLabel = tenLoaiHook;

export default function HookLibraryView({ rows, tabRieng = [], coTab = false, quyenTabChung = false }: {
  rows: HookItem[];
  tabRieng?: TabView[];
  coTab?: boolean;
  quyenTabChung?: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const current = rows.find((r) => r.id === openId) ?? null;

  const cot: CotMkt<HookItem>[] = [
    // Câu dài: NameButton tự xuống dòng (a11y 27/11 — không cắt câu mẫu).
    { id: "cau", ten: "Câu", kieu: "sap", khoa: true, toiThieu: 240, rongToiDa: 440, sap: (r) => r.text,
      nghia: { tang: "Từ A đến Z", giam: "Từ Z đến A" },
      o: (r) => <NameButton onOpen={() => setOpenId(r.id)}>{r.text}</NameButton> },
    { id: "loai", ten: "Loại", kieu: "sap", sap: (r) => kindLabel(r.kind), nghia: { tang: "Từ A đến Z", giam: "Từ Z đến A" },
      o: (r) => <Badge variant="soft" color="secondary">{kindLabel(r.kind)}</Badge> },
    { id: "phong_cach", ten: "Phong cách", kieu: "sap", rongToiDa: 200, sap: (r) => r.hook_style, chu: (r) => r.hook_style,
      nghia: { tang: "Từ A đến Z", giam: "Từ Z đến A" }, o: (r) => r.hook_style || "—" },
    { id: "nguon", ten: "Nguồn", kieu: "sap", rongToiDa: 200, sap: (r) => r.source_channel, chu: (r) => r.source_channel,
      nghia: { tang: "Từ A đến Z", giam: "Từ Z đến A" }, o: (r) => r.source_channel || "—" },
  ];
  const cotDs: CotDanhSach<HookItem>[] = [
    { id: "cau", ten: "Câu", rong: "minmax(0,2fr)", dienThoai: "tren", o: (r) => r.text },
    { id: "loai", ten: "Loại", rong: "minmax(0,1fr)", dienThoai: "duoi", o: (r) => kindLabel(r.kind) },
    { id: "nguon", ten: "Nguồn", rong: "minmax(0,1fr)", dienThoai: "duoiPhai", o: (r) => r.source_channel || "—" },
  ];

  return (
    <>
      <BangMkt
        bang="mkt_hook_tab"
        tieuDe="Câu mẫu"
        nhan="câu"
        viDuTen="VD: Câu hỏi mở đầu"
        rows={rows}
        khoa={(r) => r.id}
        cot={cot}
        cotDs={cotDs}
        truong={TRUONG_HOOK}
        tabCoDinh={TAB_HOOK}
        timTrong={(r) => [r.text, r.hook_style, r.source_channel].filter(Boolean).join(" ")}
        onMo={(r) => setOpenId(r.id)}
        tabRieng={tabRieng}
        coTab={coTab}
        quyenTabChung={quyenTabChung}
        timGoiY="Câu, phong cách, nguồn…"
        rongThat={{ tieuDe: "Chưa có câu mẫu nào", moTa: "Câu hook, kêu gọi, câu hỏi và câu kết chắt từ video mẫu sẽ hiện ở đây." }}
      />

      <Drawer open={Boolean(current)} onClose={() => setOpenId(null)}>
        {current && (
          <>
            <div className="drawer-head">
              <div className="dh-main">
                <div className="meta-row">
                  <span className="chip">{kindLabel(current.kind)}</span>
                  {current.hook_style && <span className="tag">{current.hook_style}</span>}
                </div>
                <SheetTitle asChild><h2 style={{ fontSize: "1.05rem", lineHeight: 1.45 }}>{current.text}</h2></SheetTitle>
              </div>
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
