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
        <div className="eyebrow">Dữ liệu Supabase · video_deep_analysis</div>
        <h1>Phân tích chuyên sâu</h1>
        <p>
          Bản mổ SÂU của video mẫu{total != null ? ` — ${total} video` : ""}: cấu trúc theo mốc thời gian, lời khuyên
          dùng ngay, cơ chế phễu và cách áp cho GWT. Bấm một dòng để mở đầy đủ kèm full transcript.
        </p>
      </div>

      {loi ? (
        <DataError error={loi} />
      ) : !rows || rows.length === 0 ? (
        <div className="empty">Chưa có bản phân tích chuyên sâu nào.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Video</th>
                <th>Nền tảng</th>
                <th>Tuyến</th>
                <th>Lời khuyên</th>
                <th>Yếu tố viral</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="row-link">
                  <td className="td-title">
                    <Link href={`/wiki/marketing/du-lieu/phan-tich-sau/${r.id}`} prefetch={false}>
                      {r.video_title || "(chưa đặt tiêu đề)"}
                    </Link>
                    <small>{r.channel_name || "—"}</small>
                  </td>
                  <td><span className="tag">{platformLabel(r.platform)}</span></td>
                  <td><CatBadge cat={cat5a(r.content_category)} /></td>
                  <td>
                    {r.useful_advice?.length ? (
                      <span className="chip mono" style={{ fontSize: ".68rem" }}>{r.useful_advice.length} mẹo</span>
                    ) : (
                      <span style={{ color: "var(--ink-3)", fontSize: ".78rem" }}>—</span>
                    )}
                  </td>
                  <td style={{ fontSize: ".78rem", color: "var(--ink-3)" }}>
                    {r.viral_elements?.length ? `${r.viral_elements.length} yếu tố` : "—"}
                  </td>
                  <td className="row-arrow">
                    <Link href={`/wiki/marketing/du-lieu/phan-tich-sau/${r.id}`} prefetch={false} aria-label="Mở">›</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
