import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/components/marketing/Markdown";
import { SAN_PHAM } from "@/lib/wiki/data/san-pham";
import { NHOM } from "@/lib/wiki/kieu";

export function generateStaticParams() {
  return SAN_PHAM.flatMap((sp) =>
    sp.phan.filter((p) => p.coNoiDung).map((p) => ({ ma: sp.ma, slug: p.slug })),
  );
}

export async function generateMetadata({ params }: { params: Promise<{ ma: string; slug: string }> }) {
  const { ma, slug } = await params;
  const sp = SAN_PHAM.find((s) => s.ma === ma);
  const p = sp?.phan.find((x) => x.slug === slug);
  return { title: sp && p ? `Phần ${p.so} — ${p.ten} · ${sp.ten}` : "Wiki GWT" };
}

/** Một Phần của PKB, render nguyên văn markdown đã cắt từ `pkb.md`. */
export default async function TrangPhan({ params }: { params: Promise<{ ma: string; slug: string }> }) {
  const { ma, slug } = await params;
  const sp = SAN_PHAM.find((s) => s.ma === ma);
  const p = sp?.phan.find((x) => x.slug === slug);
  if (!sp || !p || !p.coNoiDung) notFound();

  const coTrong = sp.phan.filter((x) => x.coNoiDung);
  const i = coTrong.findIndex((x) => x.so === p.so);
  const truoc = i > 0 ? coTrong[i - 1] : null;
  const sau = i >= 0 && i < coTrong.length - 1 ? coTrong[i + 1] : null;
  // Phần 1 thuộc cả ba nhóm nên không có "nhóm cha" duy nhất — trỏ về trang sản phẩm.
  const nhomCha = p.nhom === "xuong-song" ? null : NHOM.find((n) => n.ma === p.nhom);

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">
          <Link href={`/wiki/san-pham/${sp.ma}`}>{sp.ten}</Link>
          {nhomCha && (
            <>
              {" · "}
              <Link href={`/wiki/san-pham/${sp.ma}/nhom/${nhomCha.ma}`}>{nhomCha.ten}</Link>
            </>
          )}
          {" · "}Phần {p.so}
        </div>
      </div>

      {p.so === 1 && (
        <div className="notice" style={{ marginBottom: 18 }}>
          <span aria-hidden="true">🔎</span>
          <div>
            Cần tìm một dữ kiện cụ thể? <Link href={`/wiki/san-pham/${sp.ma}/tra-cuu`}>Trang tra cứu</Link>{" "}
            lọc được {sp.facts.length} dữ kiện theo nhóm, hạng và quyền công bố.
          </div>
        </div>
      )}

      <Markdown>{p.noiDung}</Markdown>

      <nav className="wiki-dieu-huong">
        {truoc ? (
          <Link href={`/wiki/san-pham/${sp.ma}/phan/${truoc.slug}`}>← Phần {truoc.so} · {truoc.ten}</Link>
        ) : (
          <span />
        )}
        {sau && <Link href={`/wiki/san-pham/${sp.ma}/phan/${sau.slug}`}>Phần {sau.so} · {sau.ten} →</Link>}
      </nav>
    </section>
  );
}
