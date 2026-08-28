import Link from "next/link";
import { notFound } from "next/navigation";
import { getTuyen, TUYEN } from "@/lib/marketing/data/a5-detail";
import { ALL_CASES } from "@/lib/marketing/data/cases";
import { LUAT_GROUPS } from "@/lib/marketing/data/luat-sua";
import { Icon } from "@/lib/marketing/icons";

export function generateStaticParams() {
  return TUYEN.map((t) => ({ cat: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params;
  const t = getTuyen(cat);
  return { title: t ? `${t.cat} — ${t.name}` : "Tuyến 5A" };
}

function List({ items, ordered = false }: { items: string[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag style={{ margin: 0, paddingLeft: "1.2em", color: "var(--ink-2)", fontSize: ".88rem" }}>
      {items.map((s, i) => (
        <li key={i} style={{ margin: ".4em 0", lineHeight: 1.65 }}>{s}</li>
      ))}
    </Tag>
  );
}

function Card({ label, children, accent }: { label: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="card" style={accent ? { borderLeft: `3px solid ${accent}` } : undefined}>
      <div className="fl" style={{ marginBottom: 9 }}>{label}</div>
      {children}
    </div>
  );
}

export default async function Page({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params;
  const t = getTuyen(cat);
  if (!t) notFound();

  const idx = TUYEN.findIndex((x) => x.cat === t.cat);
  const prev = TUYEN[idx - 1];
  const next = TUYEN[idx + 1];

  const cases = (t.cases ?? []).map((s) => ALL_CASES.find((c) => c.slug === s)).filter(Boolean);
  const allLaws = LUAT_GROUPS.flatMap((g) => g.items.map((l) => ({ ...l, g: g.g })));
  const laws = (t.laws ?? []).map((n) => allLaws.find((l) => l.t === n)).filter(Boolean);

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">
          <Link href="/wiki/marketing/khung/5a" style={{ color: "inherit" }}>Chiến lược 5A</Link> · Tuyến {t.cat}
        </div>
        <div className="meta-row" style={{ marginBottom: 8 }}>
          <span className={`cat cat-${t.cat}`} style={{ fontSize: ".8rem", padding: "3px 10px" }}>{t.cat}</span>
          <span className="tag">{t.en}</span>
        </div>
        <h1>{t.name}</h1>
        <p><b style={{ color: "var(--ink)" }}>Nhiệm vụ:</b> {t.purpose}</p>
      </div>

      <div className="card" style={{ borderLeft: "3px solid var(--accent)", background: "var(--surface-2)", marginBottom: 20 }}>
        <div className="fl" style={{ marginBottom: 6 }}>Câu hỏi người xem đang tự trả lời</div>
        <p style={{ margin: 0, fontSize: "1.02rem", color: "var(--ink)", fontStyle: "italic" }}>{t.question}</p>
      </div>

      <div className="read" style={{ maxWidth: "72ch", marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Bản chất</h2>
        {t.essence.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="grid grid-2" style={{ alignItems: "start", marginBottom: 20 }}>
        <Card label="Nên gồm những dạng gì"><List items={t.forms} /></Card>
        <Card label="KPI chính" accent="var(--good)"><List items={t.kpis} /></Card>
      </div>

      <Card label="⚠ Lưu ý chiến lược — chỗ hay làm sai" accent="var(--warn)">
        <List items={t.strategy} />
      </Card>

      <div className="page-head" style={{ margin: "30px 0 12px" }}>
        <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Lý thuyết nền</h1>
        <p style={{ fontSize: ".86rem" }}>Vì sao tuyến này hoạt động — không phải mẹo, là cơ chế tâm lý đã được nghiên cứu.</p>
      </div>
      <div className="card" style={{ borderLeft: "3px solid var(--a5)" }}>
        <h3 style={{ margin: "0 0 3px" }}>{t.theory.name}</h3>
        <div className="chip mono" style={{ fontSize: ".68rem", marginBottom: 12 }}>{t.theory.origin}</div>
        <List items={t.theory.essence} />
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed var(--line)" }}>
          <div className="fl" style={{ marginBottom: 5 }}>Hướng phát triển sâu</div>
          <p style={{ margin: 0, fontSize: ".88rem", color: "var(--ink-2)", lineHeight: 1.7 }}>{t.theory.deepen}</p>
        </div>
        <div style={{ marginTop: 14, background: "var(--accent-soft)", borderRadius: 9, padding: "12px 15px" }}>
          <div className="fl" style={{ marginBottom: 5, color: "var(--accent-ink)" }}>◆ Kim chỉ nam</div>
          <p style={{ margin: 0, fontSize: ".9rem", color: "var(--accent-ink)", lineHeight: 1.7 }}>{t.theory.compass}</p>
        </div>
      </div>

      <div className="page-head" style={{ margin: "30px 0 12px" }}>
        <h1 style={{ fontSize: "1.2rem", margin: 0 }}>AI ở tuyến {t.cat}</h1>
      </div>
      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <Card label="Dùng AI thế nào" accent="var(--good)"><List items={t.aiUse} /></Card>
        <div className="card" style={{ borderLeft: "3px solid var(--a4)" }}>
          <div className="fl" style={{ marginBottom: 9 }}>Rủi ro của AI</div>
          <List items={t.aiRisk.risk} />
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px dashed var(--line)" }}>
            <div className="fl" style={{ marginBottom: 5 }}>Nguyên tắc khắc phục</div>
            <p style={{ margin: 0, fontSize: ".88rem", color: "var(--ink-2)", lineHeight: 1.7 }}>{t.aiRisk.fix}</p>
          </div>
        </div>
      </div>

      <div className="page-head" style={{ margin: "30px 0 12px" }}>
        <h1 style={{ fontSize: "1.2rem", margin: 0 }}>▸ Áp cho GWT</h1>
      </div>
      <div className="card" style={{ borderLeft: "3px solid var(--accent)", background: "var(--surface-2)" }}>
        <div className="fl" style={{ marginBottom: 8 }}>Đề tài gợi ý</div>
        <List items={t.gwtIdeas} />
        <p style={{ marginTop: 14, marginBottom: 0, fontSize: ".9rem", color: "var(--ink-2)", lineHeight: 1.75 }}>
          {t.gwtNote}
        </p>
      </div>

      {cases.length > 0 && (
        <>
          <div className="page-head" style={{ margin: "30px 0 10px" }}>
            <h1 style={{ fontSize: "1.15rem", margin: 0 }}>Ca minh hoạ trong kho case</h1>
          </div>
          <div className="grid grid-2">
            {cases.map((c) => (
              <Link className="card link" href={`/wiki/marketing/kho-case/${c!.slug}`} key={c!.slug}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <span className={c!.verdict === "win" ? "badge-win" : c!.verdict === "ref" ? "tag" : c!.verdict === "fix" ? "pill-status" : "badge-fail"}>
                    {c!.verdictNote.split("—")[0].trim()}
                  </span>
                  <span className="chip mono" style={{ fontSize: ".64rem" }}>{c!.code}</span>
                </div>
                <h3>{c!.title}</h3>
                <p>{c!.summary}</p>
                <div className="go">Xem ca →</div>
              </Link>
            ))}
          </div>
        </>
      )}

      {laws.length > 0 && (
        <>
          <div className="page-head" style={{ margin: "30px 0 10px" }}>
            <h1 style={{ fontSize: "1.15rem", margin: 0 }}>Luật sửa content hay dùng ở tuyến này</h1>
          </div>
          <div className="principles">
            {laws.map((l) => (
              <div className="principle" key={l!.t}>
                <div className="pn">§</div>
                <div className="pc">
                  <b>{l!.t}</b>
                  <span className="tag" style={{ marginLeft: 8 }}>{l!.g}</span>
                  <p>{l!.d}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="notice" style={{ marginTop: 26 }}>
        <Icon.warn />
        <div>
          A1–A5 là <b>5 chức năng chiến lược</b>, không phải 5 format cố định. Một video có thể nghiêng 70% {t.cat} và
          30% tuyến khác — điều quan trọng là biết nó đang làm nhiệm vụ gì.
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 26, flexWrap: "wrap" }}>
        {prev && (
          <Link className="btn btn-primary" href={`/wiki/marketing/khung/5a/${prev.slug}`} style={{ textDecoration: "none", background: "var(--surface)", color: "var(--ink)", border: "1px solid var(--line-2)", width: "auto" }}>
            ← {prev.cat} {prev.name}
          </Link>
        )}
        {next && (
          <Link className="btn btn-primary" href={`/wiki/marketing/khung/5a/${next.slug}`} style={{ textDecoration: "none", width: "auto" }}>
            {next.cat} {next.name} →
          </Link>
        )}
      </div>
    </section>
  );
}
