import Link from "next/link";
import { notFound } from "next/navigation";
import { CatBadge, Chips, Field } from "@/components/marketing/DetailBits";
import DataError from "@/components/marketing/DataError";
import { cat5a, platformLabel } from "@/lib/marketing/format";
import { getDeepAnalysis, SupabaseConfigError } from "@/lib/marketing/supabase-mkt";
import { Icon } from "@/lib/marketing/icons";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getDeepAnalysis(id).catch(() => null);
  return { title: row?.video_title ?? "Phân tích chuyên sâu" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let row;
  try {
    row = await getDeepAnalysis(id);
  } catch (e) {
    if (e instanceof SupabaseConfigError) return <ConfigLoi error={e} />;
    throw e;
  }
  if (!row) notFound();

  const steps = Array.isArray(row.structure) ? row.structure : [];

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">
          <Link href="/wiki/marketing/du-lieu/phan-tich-sau" style={{ color: "inherit" }}>Phân tích chuyên sâu</Link>
        </div>
        <div className="meta-row" style={{ marginBottom: 8 }}>
          <CatBadge cat={cat5a(row.content_category)} />
          <span className="tag">{platformLabel(row.platform)}</span>
          {row.channel_type && <span className="chip">{row.channel_type}</span>}
        </div>
        <h1>{row.video_title || "(chưa đặt tiêu đề)"}</h1>
        <p>
          {row.channel_name || "—"}
          {row.url && (
            <>
              {" · "}
              <a href={row.url} target="_blank" rel="noopener noreferrer">Mở video gốc ↗</a>
            </>
          )}
        </p>
      </div>

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div style={{ display: "grid", gap: 16 }}>
          {row.useful_advice?.length ? (
            <div className="card">
              <div className="fl" style={{ marginBottom: 10 }}>▸ Lời khuyên dùng ngay</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8 }}>
                {row.useful_advice.map((a, i) => (
                  <li key={i} style={{ fontSize: ".9rem", lineHeight: 1.5 }}>{a}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {steps.length ? (
            <div className="card">
              <div className="fl" style={{ marginBottom: 10 }}>Cấu trúc theo mốc thời gian</div>
              <div style={{ display: "grid", gap: 10 }}>
                {steps.map((s, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 10, alignItems: "baseline" }}>
                    <span className="chip mono" style={{ whiteSpace: "nowrap" }}>{s.time || "—"}</span>
                    <div>
                      {s.role && <b style={{ fontSize: ".82rem" }}>{s.role}</b>}
                      <div style={{ fontSize: ".88rem", color: "var(--ink-2)", lineHeight: 1.5 }}>{s.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="card">
          <div className="fl" style={{ marginBottom: 10 }}>Chấm theo khung</div>
          <div className="field-block">
            <div className="fl">S-FACES</div>
            <Chips items={row.s_faces} />
          </div>
          <div className="field-block">
            <div className="fl">CRAVES</div>
            <Chips items={row.craves_triggers} />
          </div>
          <div className="field-block">
            <div className="fl">Tầng Maslow</div>
            <Chips items={[row.maslow_layer]} />
          </div>
          {row.viral_elements?.length ? (
            <div className="field-block">
              <div className="fl">Yếu tố viral</div>
              <Chips items={row.viral_elements} />
            </div>
          ) : null}
          {row.funnel_notes && <Field label="Cơ chế phễu">{row.funnel_notes}</Field>}
          {row.evaluation && <Field label="Đánh giá">{row.evaluation}</Field>}
          {row.conclusion && <Field label="▸ Công thức rút ra" formula>{row.conclusion}</Field>}
          {row.gwt_application && <Field label="▸ Áp cho GWT" formula>{row.gwt_application}</Field>}
          {row.compliance_notes && <Field label="⚠ Lưu ý tuân thủ">{row.compliance_notes}</Field>}
          <div className="field-block">
            <div className="fl">Tags</div>
            <Chips items={row.tags} hash />
          </div>
        </div>
      </div>

      {row.transcript ? (
        <>
          <div className="page-head" style={{ marginTop: 30 }}>
            <h1 style={{ fontSize: "1.2rem" }}>Transcript đầy đủ</h1>
          </div>
          <div className="notice" style={{ marginTop: 0 }}>
            <Icon.warn />
            <div>
              Transcript do máy nhận dạng + soát tay. Theo{" "}
              <Link href="/wiki/marketing/luat/nguon-dan-chung">rule nguồn dẫn chứng mục 8b</Link>: mọi{" "}
              <b>con số, đơn vị, tên riêng</b> ở đây là <b>hạng C</b> — nghe lại bản gốc trước khi trích.
            </div>
          </div>
          <div className="card">
            <div style={{ whiteSpace: "pre-wrap", fontSize: ".9rem", lineHeight: 1.65 }}>{row.transcript}</div>
          </div>
        </>
      ) : null}
    </section>
  );
}

function ConfigLoi({ error }: { error: unknown }) {
  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">Phân tích chuyên sâu</div>
        <h1>Không mở được bản phân tích này</h1>
      </div>
      <DataError error={error} />
    </section>
  );
}
