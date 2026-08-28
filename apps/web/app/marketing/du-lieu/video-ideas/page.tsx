import DataError from "@/components/marketing/DataError";
import IdeasView from "@/components/marketing/IdeasView";
import { getIdeas } from "@/lib/marketing/supabase-mkt";

export const metadata = { title: "Video Ideas" };

export default async function Page() {
  let rows: Awaited<ReturnType<typeof getIdeas>>["rows"] | null = null;
  let total: number | null = null;
  let loi: unknown = null;
  try {
    const kq = await getIdeas();
    rows = kq.rows;
    total = kq.total;
  } catch (e) {
    loi = e;
  }

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">Dữ liệu Supabase · video_ideas</div>
        <h1>Video Ideas cho GWT</h1>
        <p>
          Ý tưởng video cho GWT sinh từ nguồn tham khảo, theo góc KOL kỹ sư nước
          {total != null ? ` — ${total} ý tưởng` : ""}. Bấm một dòng để xem chi tiết.
        </p>
      </div>
      {loi ? <DataError error={loi} /> : <IdeasView rows={rows ?? []} />}
    </section>
  );
}
