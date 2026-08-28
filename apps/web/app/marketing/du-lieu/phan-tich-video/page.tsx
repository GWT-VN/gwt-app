import AnalysesView from "@/components/marketing/AnalysesView";
import DataError from "@/components/marketing/DataError";
import { getAnalyses } from "@/lib/marketing/supabase-mkt";

export const metadata = { title: "Phân tích video" };

export default async function Page() {
  let rows: Awaited<ReturnType<typeof getAnalyses>>["rows"] | null = null;
  let total: number | null = null;
  let loi: unknown = null;
  try {
    const kq = await getAnalyses();
    rows = kq.rows;
    total = kq.total;
  } catch (e) {
    loi = e;
  }

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">Dữ liệu Supabase · video_analyses</div>
        <h1>Phân tích video</h1>
        <p>
          Kho video viral đã mổ theo khung 5A/PAAST{total != null ? ` — ${total} video` : ""}. Bấm một dòng để mở
          chi tiết bên phải.
        </p>
      </div>
      {loi ? <DataError error={loi} /> : <AnalysesView rows={rows ?? []} />}
    </section>
  );
}
