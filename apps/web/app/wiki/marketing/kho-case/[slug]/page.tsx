import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_CASES, getCase, PAAST_NAME, VERDICT_LABEL } from "@/lib/marketing/data/cases";
import { LUAT_GROUPS } from "@/lib/marketing/data/luat-sua";
import { Icon } from "@/lib/marketing/icons";

export function generateStaticParams() {
  return ALL_CASES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: getCase(slug)?.title ?? "Case" };
}

/** Danh sách gạch đầu dòng có tiêu đề + màu nhấn theo tính chất. */
function Bullets({
  title,
  items,
  accent,
  icon,
}: {
  title: string;
  items?: string[];
  accent: string;
  icon?: string;
}) {
  if (!items?.length) return null;
  return (
    <div className="card" style={{ borderLeft: `3px solid ${accent}` }}>
      <div className="fl" style={{ marginBottom: 8 }}>
        {icon} {title}
      </div>
      <ul style={{ margin: 0, paddingLeft: "1.15em", color: "var(--ink-2)", fontSize: ".88rem" }}>
        {items.map((t, i) => (
          <li key={i} style={{ margin: ".4em 0", lineHeight: 1.6 }}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

/** Luật sửa content nào liên quan tới ca này — chỉ hiện luật có thật trong danh sách 46 luật. */
function relatedLaws(names?: string[]) {
  if (!names?.length) return [];
  const all = LUAT_GROUPS.flatMap((g) => g.items.map((l) => ({ ...l, g: g.g })));
  return names
    .map((n) => all.find((l) => l.t === n))
    .filter((l): l is (typeof all)[number] => Boolean(l));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) notFound();

  const laws = relatedLaws(c.laws);
  const missing = (c.laws ?? []).length - laws.length;

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">
          <Link href="/wiki/marketing/kho-case" style={{ color: "inherit" }}>Kho case</Link> · {c.code} · {c.buoi}
        </div>
        <div className="meta-row" style={{ marginBottom: 8 }}>
          <span className={c.verdict === "win" ? "badge-win" : c.verdict === "fix" ? "pill-status" : c.verdict === "ref" ? "tag" : "badge-fail"}>
            {VERDICT_LABEL[c.verdict]}
          </span>
          <span className="tag">{c.brandFull}</span>
          {c.paastScore && <span className="chip mono">{c.paastScore}</span>}
        </div>
        <h1>{c.title}</h1>
        <p style={{ color: "var(--accent-strong)", fontWeight: 600 }}>{c.verdictNote}</p>
      </div>

      {c.metrics?.length ? (
        <div className="metricgrid" style={{ marginBottom: 20 }}>
          {c.metrics.map((m) => (
            <div className="m" key={m.label}>
              <div className="mv" style={{ fontSize: ".95rem" }}>{m.value}</div>
              <div className="ml">{m.label}</div>
            </div>
          ))}
        </div>
      ) : null}

      {c.story && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="fl" style={{ marginBottom: 8 }}>Video kể gì</div>
          <p style={{ margin: 0, color: "var(--ink-2)", fontSize: ".9rem", lineHeight: 1.7 }}>{c.story}</p>
        </div>
      )}

      {c.paast?.length ? (
        <>
          <div className="page-head" style={{ margin: "24px 0 12px" }}>
            <h1 style={{ fontSize: "1.15rem", margin: 0 }}>Chấm theo PAAST</h1>
          </div>
          <div className="grid grid-2" style={{ marginBottom: 20 }}>
            {c.paast.map((p, i) => (
              <div className="card" key={i}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                  <span className="cat cat-A2" style={{ fontSize: ".7rem" }}>{PAAST_NAME[p.k].split(" — ")[0]}</span>
                  <b style={{ fontSize: ".9rem" }}>{p.label}</b>
                </div>
                <p style={{ margin: 0, fontSize: ".86rem", color: "var(--ink-2)", lineHeight: 1.6 }}>{p.text}</p>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <Bullets title="Điểm đúng" items={c.worked} accent="var(--good)" icon="✓" />
        <Bullets title="Điểm sai" items={c.failed} accent="var(--a4)" icon="✕" />
        <Bullets title="Lời CEO Thiện trong buổi" items={c.thien} accent="var(--accent)" icon="❝" />
        <Bullets title="Hướng sửa" items={c.fix} accent="var(--warn)" icon="→" />
      </div>

      <div className="card" style={{ marginTop: 18, borderLeft: "3px solid var(--accent)", background: "var(--surface-2)" }}>
        <div className="fl" style={{ marginBottom: 8 }}>▸ Áp cho GWT thế nào</div>
        <p style={{ margin: 0, color: "var(--ink-2)", fontSize: ".92rem", lineHeight: 1.75 }}>{c.gwt}</p>
      </div>

      {laws.length > 0 && (
        <>
          <div className="page-head" style={{ margin: "28px 0 10px" }}>
            <h1 style={{ fontSize: "1.1rem", margin: 0 }}>Luật sửa content liên quan</h1>
            <p style={{ fontSize: ".84rem" }}>
              Ca này là bằng chứng thực tế cho những luật dưới đây —{" "}
              <Link href="/wiki/marketing/khung/luat-sua">xem đủ 46 luật</Link>.
            </p>
          </div>
          <div className="principles">
            {laws.map((l) => (
              <div className="principle" key={l.t}>
                <div className="pn">§</div>
                <div className="pc">
                  <b>{l.t}</b>
                  <span className="tag" style={{ marginLeft: 8 }}>{l.g}</span>
                  <p>{l.d}</p>
                </div>
              </div>
            ))}
          </div>
          {missing > 0 && (
            <div className="notice">
              <Icon.warn />
              <div>{missing} luật liên quan chưa khớp được tên trong danh sách — kiểm tra lại chính tả ở dữ liệu case.</div>
            </div>
          )}
        </>
      )}

      <div style={{ marginTop: 30 }}>
        <Link className="btn btn-primary" href="/wiki/marketing/kho-case" style={{ display: "inline-block", textDecoration: "none" }}>
          ← Về kho case
        </Link>
      </div>
    </section>
  );
}
