import WikiShell from "@/components/wiki/WikiShell";
import { requireNhanSu } from "@/lib/nen-tang/phien";
import { buildSearchIndex } from "@/lib/wiki/search-index";
import { getCounts } from "@/lib/marketing/supabase-mkt";
import "./wiki.css";

export const metadata = { title: "Wiki · GWT" };

/**
 * Khu Wiki — cổng NỀN TẢNG: mọi nhân sự đang hoạt động đều vào được (giống khu Việc),
 * không đòi vai trò CS. Wiki khung/luật/sản phẩm là thứ cả công ty nên đọc.
 *
 * Hai nhánh dùng CHUNG vỏ này: `/wiki/marketing` và `/wiki/san-pham`.
 *
 * `data-khu="wiki"` là thứ kích hoạt toàn bộ wiki.css — bỏ nó đi thì trang mất sạch
 * style mà không báo lỗi gì.
 */
export default async function WikiLayout({ children }: { children: React.ReactNode }) {
  await requireNhanSu();
  const counts = await getCounts();
  const searchIndex = buildSearchIndex();

  return (
    <div data-khu="wiki" className="mkt-root">
      <WikiShell counts={counts} searchIndex={searchIndex}>
        {children}
      </WikiShell>
    </div>
  );
}
