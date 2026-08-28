import AnalysesView from "@/components/marketing/AnalysesView";
import DataError from "@/components/marketing/DataError";
import { getAnalyses } from "@/lib/marketing/supabase-mkt";

export const metadata = { title: "Phân tích video" };

export default async function Page() {
  let content: React.ReactNode;
  let total: number | null = null;
  try {
    const { rows, total: n } = await getAnalyses();
    total = n;
    content = <AnalysesView rows={rows} />;
  } catch (e) {
    content = <DataError error={e} />;
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
      {content}
    </section>
  );
}
