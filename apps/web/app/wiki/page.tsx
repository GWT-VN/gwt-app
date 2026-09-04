import Link from "next/link";
import { ALL_CASES } from "@/lib/marketing/data/cases";
import { LUAT_COUNT } from "@/lib/marketing/data/luat-sua";
import { listRules } from "@/lib/marketing/content";
import { getCounts } from "@/lib/marketing/supabase-mkt";
import { Icon } from "@/lib/marketing/icons";
import { SAN_PHAM } from "@/lib/wiki/data/san-pham";
import { TAI_LIEU } from "@/lib/wiki/data/san-pham";
import { KHU } from "@/lib/wiki/nav";

/** Trang chủ wiki — cửa vào của mọi khu. */
export default async function WikiHome() {
  const counts = await getCounts();
  const soLuat = listRules().length;
  const soDuKien = SAN_PHAM.reduce((n, sp) => n + sp.facts.length, 0);

  // Vài con số cho khu đã có nội dung; khu chưa có thì không có gì để đếm.
  const soLieu: Record<string, { n: number | string; l: string }[]> = {
    "san-pham": [
      { n: SAN_PHAM.length, l: "máy có PKB" },
      { n: soDuKien, l: "dữ kiện đã truy nguồn" },
    ],
    marketing: [
      { n: counts.analyses ?? "—", l: "video đã phân tích" },
      { n: LUAT_COUNT + soLuat, l: "luật sửa & tuân thủ" },
      { n: ALL_CASES.length, l: "ca WIN/FAIL" },
    ],
  };

  for (const k of TAI_LIEU) {
    soLieu[k.khu] = [{ n: k.bai.length, l: k.bai.length === 1 ? "tài liệu" : "tài liệu" }];
  }

  const daCo = KHU.filter((k) => k.trangThai === "co-noi-dung");
  const chuaCo = KHU.filter((k) => k.trangThai === "chua-co");

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">Wiki nội bộ GWT</div>
        <h1>Tri thức của công ty, gom về một chỗ</h1>
        <p>
          Mỗi mảng nghiệp vụ một khu. Khu nào đã có nội dung thì mở được ngay; khu chưa có
          vẫn hiện bên dưới để biết chỗ đó đang trống — thay vì mỗi người lại đẻ thêm một
          file Google Docs riêng.
        </p>
      </div>

      <div className="grid grid-2">
        {daCo.map((k) => (
          <Link className="card link" href={k.href!} key={k.ma}>
            <div className="card-ic" aria-hidden="true" style={{ fontSize: 22 }}>{k.icon}</div>
            <h3>{k.ten}</h3>
            <p>{k.moTa}</p>
            <div className="wiki-nhanh-so">
              {(soLieu[k.ma] ?? []).map((s) => (
                <span key={s.l}>
                  <b>{s.n}</b> {s.l}
                </span>
              ))}
            </div>
            <div className="go">Mở →</div>
          </Link>
        ))}
      </div>

      {chuaCo.length > 0 && <h2 className="wiki-tieu-de-muc">Sắp có</h2>}
      <div className="wiki-khu-luoi">
        {chuaCo.map((k) => (
          <div className="card wiki-khu-trong" key={k.ma}>
            <h3>
              <span aria-hidden="true">{k.icon}</span> {k.ten}
            </h3>
            <p>{k.moTa}</p>
            <div className="wiki-khu-nhan">Chưa có nội dung</div>
          </div>
        ))}
      </div>

      <div className="notice" style={{ marginTop: 26 }}>
        <Icon.warn />
        <div>
          Mỗi khu có <b>luật riêng</b>. Khu Sản phẩm gắn nhãn 🟢🟡🔵🔴 cho từng dữ kiện — nhãn
          đó là <b>luật phát ngôn với khách</b>, phải đọc trước khi trích bất cứ con số nào ra
          ngoài.
        </div>
      </div>
    </section>
  );
}
