import { listTabView } from "@/app/actions";
import { PageHeader } from "@/components/ui/page-header";
import DataError from "@/components/marketing/DataError";
import IdeasView from "@/components/marketing/IdeasView";
import { getIdeas } from "@/lib/marketing/supabase-mkt";
import { hoiQuyen } from "@/lib/nen-tang/kiem-quyen";
import { kiemTraVaoCua, requireNhanSu } from "@/lib/nen-tang/phien";

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
  // Hàng tab (khuôn Ticket F): action tab `bang_view` gác khu CSKH (requireStaff) — người ngoài CS (vd vai marketing) gọi là
  // bị đá sang /work, nên chỉ người vào được CSKH mới thấy hàng tab; người khác vẫn tìm / lọc / sắp đủ.
  const u = await requireNhanSu();
  const coTab = (await kiemTraVaoCua(u.email ?? "")).duocVao;
  const [tabRieng, quyen] = coTab
    ? await Promise.all([listTabView("mkt_y_tuong_tab"), hoiQuyen({ viewChung: ["he_thong.view_chung", "QUANLY"] })])
    : [[], { viewChung: false }];

  return (
    <section className="view">
      <div className="page-head">
        <PageHeader duongDan={<div className="eyebrow">Dữ liệu Supabase · video_ideas</div>} tieuDe={<>Video Ideas cho GWT</>} />
        <p>
          Ý tưởng video cho GWT sinh từ nguồn tham khảo, theo góc KOL kỹ sư nước
          {total != null ? ` — ${total} ý tưởng` : ""}. Bấm một dòng để xem chi tiết.
        </p>
      </div>
      {loi ? <DataError error={loi} /> : <IdeasView rows={rows ?? []} tabRieng={tabRieng} coTab={coTab} quyenTabChung={quyen.viewChung} />}
    </section>
  );
}
