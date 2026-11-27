import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from "@/components/ui/table";
import Link from "next/link";
import { CatBadge } from "@/components/marketing/DetailBits";
import DataError from "@/components/marketing/DataError";
import { cat5a, platformLabel } from "@/lib/marketing/format";
import { getDeepAnalyses } from "@/lib/marketing/supabase-mkt";

export const metadata = { title: "Phân tích chuyên sâu" };

export default async function Page() {
  let rows: Awaited<ReturnType<typeof getDeepAnalyses>>["rows"] | null = null;
  let total: number | null = null;
  let loi: unknown = null;
  try {
    const kq = await getDeepAnalyses();
    rows = kq.rows;
    total = kq.total;
  } catch (e) {
    loi = e;
  }

  return (
    <section className="view">
      <div className="page-head">
        <PageHeader duongDan={<div className="eyebrow">Dữ liệu Supabase · video_deep_analysis</div>} tieuDe={<>Phân tích chuyên sâu</>} />
        <p>
          Bản mổ SÂU của video mẫu{total != null ? ` — ${total} video` : ""}: cấu trúc theo mốc thời gian, lời khuyên
          dùng ngay, cơ chế phễu và cách áp cho GWT. Bấm một dòng để mở đầy đủ kèm full transcript.
        </p>
      </div>

      {loi ? (
        <DataError error={loi} />
      ) : !rows || rows.length === 0 ? (
        <EmptyState tieuDe="Chưa có bản phân tích chuyên sâu nào" moTa="Bản mổ sâu của video mẫu sẽ hiện ở đây khi được thêm vào bảng video_deep_analysis." />
      ) : (
        <TableWrap vien role="region" tabIndex={0} aria-label="Danh sách phân tích sâu">
          <Table variant="thuong" className="min-w-[640px]" aria-label="Danh sách phân tích sâu">
            <TableHeader>
              <TableRow>
                <TableHead>Video</TableHead>
                <TableHead>Nền tảng</TableHead>
                <TableHead>Tuyến</TableHead>
                <TableHead>Lời khuyên</TableHead>
                <TableHead>Yếu tố viral</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} className="row-link">
                  <TableCell className="td-title">
                    <Link href={`/wiki/marketing/du-lieu/phan-tich-sau/${r.id}`} prefetch={false}>
                      {r.video_title || "(chưa đặt tiêu đề)"}
                    </Link>
                    <small>{r.channel_name || "—"}</small>
                  </TableCell>
                  <TableCell><span className="tag">{platformLabel(r.platform)}</span></TableCell>
                  <TableCell><CatBadge cat={cat5a(r.content_category)} /></TableCell>
                  <TableCell>
                    {r.useful_advice?.length ? (
                      <span className="chip mono" style={{ fontSize: ".68rem" }}>{r.useful_advice.length} mẹo</span>
                    ) : (
                      <span style={{ color: "var(--ink-3)", fontSize: ".78rem" }}>—</span>
                    )}
                  </TableCell>
                  <TableCell style={{ fontSize: ".78rem", color: "var(--ink-3)" }}>
                    {r.viral_elements?.length ? `${r.viral_elements.length} yếu tố` : "—"}
                  </TableCell>
                  <TableCell className="row-arrow">
                    <Link href={`/wiki/marketing/du-lieu/phan-tich-sau/${r.id}`} prefetch={false} aria-label="Mở">›</Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrap>
      )}
    </section>
  );
}
