import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/components/marketing/Markdown";
import { listRules, readRule } from "@/lib/marketing/content";

export function generateStaticParams() {
  return listRules().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = listRules().find((r) => r.slug === slug);
  return { title: doc?.title ?? slug };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const md = readRule(slug);
  if (!md) notFound();

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">
          <Link href="/wiki/marketing/luat" style={{ color: "inherit" }}>Luật &amp; tuân thủ</Link> · rules/{slug}.md
        </div>
      </div>
      <article className="doc-card">
        <Markdown>{md}</Markdown>
      </article>
    </section>
  );
}
