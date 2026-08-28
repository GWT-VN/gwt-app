import KhuShell from "@/components/marketing/KhuShell";
import { requireNhanSu } from "@/lib/nen-tang/phien";
import { buildSearchIndex } from "@/lib/marketing/search-index";
import { getCounts } from "@/lib/marketing/supabase-mkt";
import "./marketing.css";

export const metadata = { title: "Marketing OS · GWT" };

/**
 * Khu Marketing — cổng NỀN TẢNG: mọi nhân sự đang hoạt động đều vào được
 * (giống khu Việc), không đòi vai trò CS. Wiki khung/luật là thứ cả công ty nên đọc.
 *
 * `data-khu="marketing"` là thứ kích hoạt toàn bộ marketing.css — bỏ nó đi thì
 * trang mất sạch style mà không báo lỗi gì.
 */
export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  await requireNhanSu();
  const counts = await getCounts();
  const searchIndex = buildSearchIndex();

  return (
    <div data-khu="marketing" className="mkt-root">
      <KhuShell counts={counts} searchIndex={searchIndex}>
        {children}
      </KhuShell>
    </div>
  );
}
