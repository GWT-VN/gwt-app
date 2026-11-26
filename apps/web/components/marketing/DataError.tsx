import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/** Hiện lỗi đọc Supabase mà không làm sập cả trang. */
export default function DataError({ error }: { error: unknown }) {
  console.error("[wiki/marketing] Lỗi tải dữ liệu", error);
  return (
    <EmptyState kieu="loi" capTieuDe={2} tieuDe="Chưa tải được dữ liệu"
      moTa="Tải lại trang sau ít phút. Nếu tình trạng kéo dài, báo quản trị.">
      <Button asChild size="sm"><a href="">Tải lại</a></Button>
    </EmptyState>
  );
}
