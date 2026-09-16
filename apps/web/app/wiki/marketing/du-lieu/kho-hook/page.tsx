import DataError from "@/components/marketing/DataError";
import HookLibraryView from "@/components/marketing/HookLibraryView";
import { getHooks } from "@/lib/marketing/supabase-mkt";

export const metadata = { title: "Kho hook / CTA" };

export default async function Page() {
  let rows: Awaited<ReturnType<typeof getHooks>>["rows"] | null = null;
  let total: number | null = null;
  let loi: unknown = null;
  try {
    const kq = await getHooks();
    rows = kq.rows;
    total = kq.total;
  } catch (e) {
    loi = e;
  }

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">Dữ liệu Supabase · hook_library</div>
        <h1>Kho hook / CTA</h1>
        <p>
          Ngân hàng câu hook, kêu gọi, câu hỏi và câu kết ấn tượng{total != null ? ` — ${total} câu` : ""} chắt từ
          video mẫu, để dùng lại. Lọc theo loại và phong cách; bấm một dòng để xem mẫu dùng lại + bản viết cho GWT.
        </p>
      </div>
      {loi ? <DataError error={loi} /> : <HookLibraryView rows={rows ?? []} />}
    </section>
  );
}
