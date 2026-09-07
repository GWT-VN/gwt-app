import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/components/marketing/Markdown";
import { TAI_LIEU } from "@/lib/wiki/data/san-pham";
import { HANG } from "@/lib/wiki/kieu";
import { KHU } from "@/lib/wiki/nav";

export function generateStaticParams() {
  return TAI_LIEU.flatMap((k) => k.bai.map((b) => ({ khu: k.khu, slug: b.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ khu: string; slug: string }> }) {
  const { khu, slug } = await params;
  const b = TAI_LIEU.find((k) => k.khu === khu)?.bai.find((x) => x.slug === slug);
  return { title: b ? `${b.tieuDe} · Wiki GWT` : "Wiki GWT" };
}

/** Một bài tài liệu. */
export default async function TrangBai({ params }: { params: Promise<{ khu: string; slug: string }> }) {
  const { khu, slug } = await params;
  const meta = KHU.find((k) => k.ma === khu);
  const noiDung = TAI_LIEU.find((k) => k.khu === khu);
  const b = noiDung?.bai.find((x) => x.slug === slug);
  if (!meta || !noiDung || !b) notFound();

  const i = noiDung.bai.findIndex((x) => x.slug === slug);
  const truoc = i > 0 ? noiDung.bai[i - 1] : null;
  const sau = i < noiDung.bai.length - 1 ? noiDung.bai[i + 1] : null;

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">
          <Link href={`/wiki/${khu}`}>{meta.ten}</Link>
          {b.nhom && <> · {b.nhom}</>}
        </div>
      </div>

      {b.hang && (
        <div className="wiki-the-meta" style={{ marginBottom: 16 }}>
          <span className={`chip hang-${b.hang}`}>Hạng {b.hang}</span>
          <span className="wiki-vai-nhan">{HANG[b.hang] ?? ""}</span>
          {b.nguon && <span className="wiki-vai-nhan">· Nguồn: {b.nguon}</span>}
        </div>
      )}

      <Markdown>{b.noiDung}</Markdown>

      <nav className="wiki-dieu-huong">
        {truoc ? <Link href={`/wiki/${khu}/${truoc.slug}`}>← {truoc.tieuDe}</Link> : <span />}
        {sau && <Link href={`/wiki/${khu}/${sau.slug}`}>{sau.tieuDe} →</Link>}
      </nav>
    </section>
  );
}
