import Link from "next/link";
import { SAN_PHAM } from "@/lib/wiki/data/san-pham";
import { NHOM, phanCuaNhom } from "@/lib/wiki/kieu";
import { Icon } from "@/lib/marketing/icons";

export const metadata = { title: "Wiki Sản phẩm · GWT" };

const NHAN_TRANG_THAI: Record<string, string> = {
  "dang-ban": "Đang bán",
  "ngung-ban": "Ngừng bán",
  nhap: "Bản nháp",
};

/** Danh sách sản phẩm có PKB. Thêm máy mới = thêm thư mục trong content/, không sửa file này. */
export default function DanhSachSanPham() {
  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">Nhánh Sản phẩm</div>
        <h1>Product Knowledge Base</h1>
        <p>
          Mỗi máy một bộ hồ sơ 10 phần theo cùng một khuôn. Mọi câu nói về sản phẩm phải truy được
          về một mã <span className="chip mono">F-xxx</span> trong phần Bảng sự thật — không có mã
          thì không được nói.
        </p>
      </div>

      <div className="grid grid-3">
        {SAN_PHAM.map((sp) => {
          const soPhan = sp.phan.filter((p) => p.coNoiDung).length;
          return (
            <Link className="card link" href={`/wiki/san-pham/${sp.ma}`} key={sp.ma}>
              <div className="card-ic" aria-hidden="true" style={{ fontSize: 20 }}>💧</div>
              <h3>{sp.ten}</h3>
              <p>{sp.tomTat}</p>
              <div className="wiki-the-meta">
                <span className="chip mono">{sp.maNoiBo}</span>
                <span className="chip">{sp.kieuLap}</span>
                <span className="chip">{NHAN_TRANG_THAI[sp.trangThai] ?? sp.trangThai}</span>
              </div>
              <div className="wiki-nhanh-so">
                <span><b>{sp.facts.length}</b> dữ kiện</span>
                <span><b>{soPhan}/10</b> phần</span>
                <span>PKB <b>{sp.phienBanPKB}</b></span>
              </div>
              <div className="go">Mở →</div>
            </Link>
          );
        })}
      </div>

      <div className="notice" style={{ marginTop: 26 }}>
        <Icon.warn />
        <div>
          Thêm một máy mới: chép thư mục{" "}
          <span className="chip mono">content/wiki/san-pham/_khuon-mau</span>, viết{" "}
          <span className="chip mono">pkb.md</span> theo khuôn rồi chạy{" "}
          <span className="chip mono">npm --prefix apps/web run sync:wiki</span>. Không phải sửa code.
        </div>
      </div>

      <div className="wiki-nhom-luoi" style={{ marginTop: 26 }}>
        {NHOM.map((n) => (
          <div className="card" key={n.ma}>
            <h3>
              <span aria-hidden="true">{n.icon}</span> {n.ten}
            </h3>
            <p>{n.moTa}</p>
            <div className="wiki-the-meta">
              {n.vai.map((v) => (
                <span className="chip" key={v}>{v}</span>
              ))}
            </div>
            <div className="wiki-nhanh-so">
              {SAN_PHAM.map((sp) => (
                <span key={sp.ma}>
                  {sp.ten}: <b>{phanCuaNhom(sp, n.ma).length}</b> phần
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
