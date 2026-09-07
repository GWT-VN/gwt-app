import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/components/marketing/Markdown";
import { TAI_LIEU } from "@/lib/wiki/data/san-pham";
import { HANG } from "@/lib/wiki/kieu";

/**
 * Tài liệu dạng trang trong khu Marketing video.
 *
 * Khu này có route TĨNH riêng (`/wiki/marketing/luat`, `/khung`, `/kho-case`, `/du-lieu`)
 * nên không rơi vào `/wiki/[khu]/[slug]` được. Next ưu tiên segment tĩnh, nên `[slug]` ở
 * đây chỉ nhận phần còn lại — đúng thứ mình cần.
 */
export function generateStaticParams() {
  return (TAI_LIEU.find((k) => k.khu === "marketing")?.bai ?? []).map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = TAI_LIEU.find((k) => k.khu === "marketing")?.bai.find((x) => x.slug === slug);
  return { title: b ? `${b.tieuDe} · Wiki GWT` : "Wiki GWT" };
}

export default async function TrangTaiLieuMarketing({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const khu = TAI_LIEU.find((k) => k.khu === "marketing");
  const b = khu?.bai.find((x) => x.slug === slug);
  if (!khu || !b) notFound();

  const i = khu.bai.findIndex((x) => x.slug === slug);
  const truoc = i > 0 ? khu.bai[i - 1] : null;
  const sau = i < khu.bai.length - 1 ? khu.bai[i + 1] : null;

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">
          <Link href="/wiki/marketing">Marketing video</Link>
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
        {truoc ? <Link href={`/wiki/marketing/${truoc.slug}`}>← {truoc.tieuDe}</Link> : <span />}
        {sau && <Link href={`/wiki/marketing/${sau.slug}`}>{sau.tieuDe} →</Link>}
      </nav>
    </section>
  );
}
