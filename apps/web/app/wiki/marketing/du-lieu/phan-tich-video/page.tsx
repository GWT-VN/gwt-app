import { listTabView } from "@/app/actions";
import { PageHeader } from "@/components/ui/page-header";
import AnalysesView from "@/components/marketing/AnalysesView";
import DataError from "@/components/marketing/DataError";
import { getAnalyses } from "@/lib/marketing/supabase-mkt";
import { hoiQuyen } from "@/lib/nen-tang/kiem-quyen";
import { kiemTraVaoCua, requireNhanSu } from "@/lib/nen-tang/phien";

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
  // Hàng tab (khuôn Ticket F): action tab `bang_view` gác khu CSKH (requireStaff) — người ngoài CS (vd vai marketing) gọi là
  // bị đá sang /work, nên chỉ người vào được CSKH mới thấy hàng tab; người khác vẫn tìm / lọc / sắp đủ.
  const u = await requireNhanSu();
  const coTab = (await kiemTraVaoCua(u.email ?? "")).duocVao;
  const [tabRieng, quyen] = coTab
    ? await Promise.all([listTabView("mkt_video_tab"), hoiQuyen({ viewChung: ["he_thong.view_chung", "QUANLY"] })])
    : [[], { viewChung: false }];

  return (
    <section className="view">
      <div className="page-head">
        <PageHeader duongDan={<div className="eyebrow">Dữ liệu Supabase · video_analyses</div>} tieuDe={<>Phân tích video</>} />
        <p>
          Kho video viral đã mổ theo khung 5A/PAAST{total != null ? ` — ${total} video` : ""}. Bấm một dòng để mở
          chi tiết bên phải.
        </p>
      </div>
      {loi ? <DataError error={loi} /> : <AnalysesView rows={rows ?? []} tabRieng={tabRieng} coTab={coTab} quyenTabChung={quyen.viewChung} />}
    </section>
  );
}
