import Link from "next/link";
import { notFound } from "next/navigation";
import TraCuuFact from "@/components/wiki/TraCuuFact";
import { SAN_PHAM } from "@/lib/wiki/data/san-pham";
import { CONG_BO } from "@/lib/wiki/kieu";

export function generateStaticParams() {
  return SAN_PHAM.map((sp) => ({ ma: sp.ma }));
}

export async function generateMetadata({ params }: { params: Promise<{ ma: string }> }) {
  const { ma } = await params;
  const sp = SAN_PHAM.find((s) => s.ma === ma);
  return { title: sp ? `Tra cứu dữ kiện — ${sp.ten}` : "Wiki GWT" };
}

export default async function TrangTraCuu({
  params,
  searchParams,
}: {
  params: Promise<{ ma: string }>;
  searchParams: Promise<{ congBo?: string }>;
}) {
  const { ma } = await params;
  const { congBo } = await searchParams;
  const sp = SAN_PHAM.find((s) => s.ma === ma);
  if (!sp) notFound();

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">
          <Link href={`/wiki/san-pham/${sp.ma}`}>{sp.ten}</Link> · Phần 1 · Bảng sự thật
        </div>
        <h1>Tra cứu dữ kiện</h1>
        <p>
          Mọi câu nói về sản phẩm phải truy được về một mã <span className="chip mono">F-xxx</span>{" "}
          ở đây. <b>Không có mã → không được nói.</b>
        </p>
      </div>

      <div className="wiki-chu-giai">
        {(["🟢", "🟡", "🔵", "🔴"] as const).map((n) => (
          <div key={n} className={`wiki-chu-giai-muc ${CONG_BO[n].lop}`}>
            <b>
              <span aria-hidden="true">{n}</span> {CONG_BO[n].ten}
            </b>
            <span>{CONG_BO[n].giaiThich}</span>
          </div>
        ))}
      </div>

      <TraCuuFact
        facts={sp.facts}
        congBoBanDau={congBo && CONG_BO[congBo] ? congBo : undefined}
      />

      <div className="notice" style={{ marginTop: 22 }}>
        <span aria-hidden="true">📖</span>
        <div>
          Bảng này là bản bóc tự động từ <b>Phần 1</b> để lọc cho nhanh. Bản đầy đủ có chú thích và
          ghi chú theo từng nhóm nằm ở{" "}
          <Link href={`/wiki/san-pham/${sp.ma}/phan/bang-su-that`}>Phần 1 — Bảng sự thật nguyên tử</Link>.
        </div>
      </div>
    </section>
  );
}
