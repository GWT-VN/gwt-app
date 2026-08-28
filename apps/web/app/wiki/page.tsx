import Link from "next/link";
import { ALL_CASES } from "@/lib/marketing/data/cases";
import { LUAT_COUNT } from "@/lib/marketing/data/luat-sua";
import { listRules } from "@/lib/marketing/content";
import { getCounts } from "@/lib/marketing/supabase-mkt";
import { Icon } from "@/lib/marketing/icons";
import { SAN_PHAM } from "@/lib/wiki/data/san-pham";
import { NHANH } from "@/lib/wiki/nav";

/** Trang chủ khu Wiki — cửa vào của cả hai nhánh. */
export default async function WikiHome() {
  const counts = await getCounts();
  const soLuat = listRules().length;
  const soDuKien = SAN_PHAM.reduce((n, sp) => n + sp.facts.length, 0);

  const soLieu = {
    marketing: [
      { n: counts.analyses ?? "—", l: "video đã phân tích" },
      { n: LUAT_COUNT, l: "luật sửa content" },
      { n: ALL_CASES.length, l: "ca WIN/FAIL" },
      { n: soLuat, l: "luật tuân thủ" },
    ],
    "san-pham": [
      { n: SAN_PHAM.length, l: "sản phẩm có PKB" },
      { n: soDuKien, l: "dữ kiện đã truy nguồn" },
      { n: SAN_PHAM.filter((s) => s.trangThai === "dang-ban").length, l: "máy đang bán" },
      { n: 10, l: "phần mỗi PKB" },
    ],
  } as const;

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">Wiki nội bộ GWT</div>
        <h1>Hai kho tri thức, một chỗ tra</h1>
        <p>
          <b>Marketing</b> trả lời <i>“làm video thế nào”</i>. <b>Sản phẩm</b> trả lời{" "}
          <i>“máy này thật ra là gì, và được nói gì với khách”</i>. Chọn nhánh bên dưới, hoặc dùng
          thanh bên trái.
        </p>
      </div>

      <div className="grid grid-2">
        {NHANH.map((n) => (
          <Link className="card link wiki-nhanh-the" href={n.href} key={n.ma}>
            <div className="card-ic" aria-hidden="true" style={{ fontSize: 22 }}>{n.icon}</div>
            <h3>{n.ten}</h3>
            <p>{n.moTa}</p>
            <div className="wiki-nhanh-so">
              {soLieu[n.ma].map((s) => (
                <span key={s.l}>
                  <b>{s.n}</b> {s.l}
                </span>
              ))}
            </div>
            <div className="go">Mở →</div>
          </Link>
        ))}
      </div>

      <div className="notice" style={{ marginTop: 26 }}>
        <Icon.warn />
        <div>
          Hai nhánh có <b>luật khác nhau</b>. Nhánh Sản phẩm gắn nhãn 🟢🟡🔵🔴 cho từng dữ kiện —
          nhãn đó là <b>luật phát ngôn với khách</b>, phải đọc trước khi trích bất cứ con số nào ra
          ngoài.
        </div>
      </div>
    </section>
  );
}
