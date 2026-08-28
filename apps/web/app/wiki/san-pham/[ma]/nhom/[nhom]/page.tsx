import Link from "next/link";
import { notFound } from "next/navigation";
import { SAN_PHAM } from "@/lib/wiki/data/san-pham";
import { NHOM, phanCuaNhom, type MaNhom } from "@/lib/wiki/kieu";
import { Icon } from "@/lib/marketing/icons";

export function generateStaticParams() {
  return SAN_PHAM.flatMap((sp) => NHOM.map((n) => ({ ma: sp.ma, nhom: n.ma })));
}

export async function generateMetadata({ params }: { params: Promise<{ ma: string; nhom: string }> }) {
  const { ma, nhom } = await params;
  const sp = SAN_PHAM.find((s) => s.ma === ma);
  const n = NHOM.find((x) => x.ma === nhom);
  return { title: sp && n ? `${n.ten} — ${sp.ten} · Wiki GWT` : "Wiki GWT" };
}

/** Một nhóm thông tin của một sản phẩm — liệt kê các Phần thuộc nhóm đó. */
export default async function TrangNhom({ params }: { params: Promise<{ ma: string; nhom: string }> }) {
  const { ma, nhom } = await params;
  const sp = SAN_PHAM.find((s) => s.ma === ma);
  const n = NHOM.find((x) => x.ma === nhom);
  if (!sp || !n) notFound();

  const phan = phanCuaNhom(sp, n.ma as MaNhom);
  if (!phan.length) notFound();

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">
          <Link href={`/wiki/san-pham/${sp.ma}`}>{sp.ten}</Link> · nhóm thông tin
        </div>
        <h1>
          <span aria-hidden="true">{n.icon}</span> {n.ten}
        </h1>
        <p>{n.moTa}</p>
        <div className="wiki-the-meta">
          <span className="wiki-vai-nhan">Dành cho:</span>
          {n.vai.map((v) => (
            <span className="chip" key={v}>{v}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-2">
        {phan.map((p) => {
          const laBangSuThat = p.nhom === "xuong-song";
          return (
            <Link className="card link" href={`/wiki/san-pham/${sp.ma}/phan/${p.slug}`} key={p.so}>
              <div className="card-ic">
                <span className="wiki-so-phan">{p.so}</span>
              </div>
              <h3>{p.ten}</h3>
              {laBangSuThat && (
                <p>
                  Nguồn chân lý duy nhất — <b>{sp.facts.length} dữ kiện</b> có mã, có nguồn, có nhãn
                  công bố. Hiện trong cả ba nhóm.
                </p>
              )}
              <div className="go">Đọc →</div>
            </Link>
          );
        })}

        {phan.some((p) => p.nhom === "xuong-song") && (
          <Link className="card link" href={`/wiki/san-pham/${sp.ma}/tra-cuu`}>
            <div className="card-ic"><Icon.grid /></div>
            <h3>Tra cứu dữ kiện</h3>
            <p>Lọc {sp.facts.length} dữ kiện theo nhóm, hạng tin cậy và quyền công bố. Gõ mã <span className="chip mono">F-xxx</span> ra ngay.</p>
            <div className="go">Mở →</div>
          </Link>
        )}
      </div>
    </section>
  );
}
