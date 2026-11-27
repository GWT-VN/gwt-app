import { listTabView } from "@/app/actions";
import { PageHeader } from "@/components/ui/page-header";
import DataError from "@/components/marketing/DataError";
import HookLibraryView from "@/components/marketing/HookLibraryView";
import { getHooks } from "@/lib/marketing/supabase-mkt";
import { hoiQuyen } from "@/lib/nen-tang/kiem-quyen";
import { kiemTraVaoCua, requireNhanSu } from "@/lib/nen-tang/phien";

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
  // Hàng tab (khuôn Ticket F): action tab `bang_view` gác khu CSKH (requireStaff) — người ngoài CS (vd vai marketing) gọi là
  // bị đá sang /work, nên chỉ người vào được CSKH mới thấy hàng tab; người khác vẫn tìm / lọc / sắp đủ.
  const u = await requireNhanSu();
  const coTab = (await kiemTraVaoCua(u.email ?? "")).duocVao;
  const [tabRieng, quyen] = coTab
    ? await Promise.all([listTabView("mkt_hook_tab"), hoiQuyen({ viewChung: ["he_thong.view_chung", "QUANLY"] })])
    : [[], { viewChung: false }];

  return (
    <section className="view">
      <div className="page-head">
        <PageHeader duongDan={<div className="eyebrow">Dữ liệu Supabase · hook_library</div>} tieuDe={<>Kho hook / CTA</>} />
        <p>
          Ngân hàng câu hook, kêu gọi, câu hỏi và câu kết ấn tượng{total != null ? ` — ${total} câu` : ""} chắt từ
          video mẫu, để dùng lại. Lọc theo loại và phong cách; bấm một dòng để xem mẫu dùng lại + bản viết cho GWT.
        </p>
      </div>
      {loi ? <DataError error={loi} /> : <HookLibraryView rows={rows ?? []} tabRieng={tabRieng} coTab={coTab} quyenTabChung={quyen.viewChung} />}
    </section>
  );
}
