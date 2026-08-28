import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/components/marketing/Markdown";
import { PROCESS_DOCS, readProcessDoc } from "@/lib/marketing/content";

export function generateStaticParams() {
  return PROCESS_DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: PROCESS_DOCS.find((d) => d.slug === slug)?.title ?? "Quy trình" };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const md = readProcessDoc(slug);
  if (!md) notFound();

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">
          <Link href="/wiki/marketing/khung/quy-trinh" style={{ color: "inherit" }}>Quy trình sản xuất</Link> · Work GWT/Quy trình
        </div>
      </div>
      <article className="doc-card">
        <Markdown>{md}</Markdown>
      </article>
    </section>
  );
}
