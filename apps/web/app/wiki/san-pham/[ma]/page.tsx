import Link from "next/link";
import { notFound } from "next/navigation";
import { SAN_PHAM } from "@/lib/wiki/data/san-pham";
import { CONG_BO, NHOM, phanCuaNhom } from "@/lib/wiki/kieu";
import { Icon } from "@/lib/marketing/icons";

export function generateStaticParams() {
  return SAN_PHAM.map((sp) => ({ ma: sp.ma }));
}

export async function generateMetadata({ params }: { params: Promise<{ ma: string }> }) {
  const { ma } = await params;
  const sp = SAN_PHAM.find((s) => s.ma === ma);
  return { title: sp ? `${sp.ten} · Wiki GWT` : "Wiki GWT" };
}

/** Trang chủ một sản phẩm: thẻ định danh + 4 nhóm thông tin + thống kê nhãn công bố. */
export default async function TrangSanPham({ params }: { params: Promise<{ ma: string }> }) {
  const { ma } = await params;
  const sp = SAN_PHAM.find((s) => s.ma === ma);
  if (!sp) notFound();

  // Đếm theo nhãn công bố — cho người đọc thấy ngay tỷ lệ "được nói" / "cấm nói".
  const demCongBo = (["🟢", "🟡", "🔵", "🔴"] as const).map((nhan) => ({
    nhan,
    ...CONG_BO[nhan],
    n: sp.facts.filter((f) => f.congBo === nhan).length,
  }));

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">Product Knowledge Base · {sp.phienBanPKB} · cập nhật {sp.capNhat}</div>
        <h1>{sp.ten}</h1>
        <p>{sp.tenDayDu} · {sp.kieuLap}</p>
        <div className="wiki-the-meta">
          <span className="chip mono">{sp.maNoiBo}</span>
          <span className="chip mono">NSX: {sp.maNSX}</span>
          <span className="chip">{sp.loai}</span>
        </div>
      </div>

      <div className="stats">
        <Link className="stat" href={`/wiki/san-pham/${sp.ma}/tra-cuu`}>
          <div className="num">{sp.facts.length}</div>
          <div className="lab">Dữ kiện đã truy nguồn</div>
        </Link>
        {demCongBo.map((c) => (
          <Link
            className="stat"
            href={`/wiki/san-pham/${sp.ma}/tra-cuu?congBo=${encodeURIComponent(c.nhan)}`}
            key={c.nhan}
            title={c.giaiThich}
          >
            <div className="num">
              <span aria-hidden="true">{c.nhan}</span> {c.n}
            </div>
            <div className="lab">{c.ten}</div>
          </Link>
        ))}
      </div>

      <h2 className="wiki-tieu-de-muc">Đọc theo vai của bạn</h2>
      <div className="grid grid-2">
        {NHOM.map((n) => {
          const phan = phanCuaNhom(sp, n.ma);
          if (!phan.length) return null;
          return (
            <Link className="card link" href={`/wiki/san-pham/${sp.ma}/nhom/${n.ma}`} key={n.ma}>
              <div className="card-ic" aria-hidden="true" style={{ fontSize: 20 }}>{n.icon}</div>
              <h3>{n.ten}</h3>
              <p>{n.moTa}</p>
              <div className="wiki-the-meta">
                {n.vai.map((v) => (
                  <span className="chip" key={v}>{v}</span>
                ))}
              </div>
              <div className="wiki-nhanh-so">
                {phan.map((p) => (
                  <span key={p.so}>Phần {p.so} · {p.ten}</span>
                ))}
              </div>
              <div className="go">Mở →</div>
            </Link>
          );
        })}
      </div>

      <div className="notice" style={{ marginTop: 26 }}>
        <Icon.warn />
        <div>
          <b>Phần 1 — Bảng sự thật</b> cố ý hiện trong cả ba nhóm nghiệp vụ. Nó là nguồn chân lý duy
          nhất: cắt nó ra theo vai thì người đọc không tra được dữ kiện nằm ngoài phần của mình, và
          sẽ tự suy diễn — đúng cái mà PKB sinh ra để chặn.
        </div>
      </div>
    </section>
  );
}
