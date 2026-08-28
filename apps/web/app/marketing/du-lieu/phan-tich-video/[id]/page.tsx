import Link from "next/link";
import { notFound } from "next/navigation";
import { CatBadge, Chips, Field, MetricGrid } from "@/components/marketing/DetailBits";
import Highlights from "@/components/marketing/Highlights";
import TranscriptView from "@/components/marketing/TranscriptView";
import { cat5a, platformLabel } from "@/lib/marketing/format";
import DataError from "@/components/marketing/DataError";
import { getAnalysis, SupabaseConfigError } from "@/lib/marketing/supabase-mkt";
import { extractFrom, ts } from "@/lib/marketing/transcript";
import { Icon } from "@/lib/marketing/icons";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getAnalysis(Number(id)).catch(() => null);
  return { title: row?.video_title ?? `Video #${id}` };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n)) notFound();

  // Thiếu biến MKT_* (vd chưa set trên Vercel) thì báo tử tế, đừng ném 500 trắng trang.
  let row;
  try {
    row = await getAnalysis(n);
  } catch (e) {
    if (e instanceof SupabaseConfigError) return <ConfigLoi error={e} />;
    throw e;
  }
  if (!row) notFound();

  const extract = extractFrom(row.transcript);

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">
          <Link href="/marketing/du-lieu/phan-tich-video" style={{ color: "inherit" }}>Phân tích video</Link> · id {row.id}
        </div>
        <div className="meta-row" style={{ marginBottom: 8 }}>
          <CatBadge cat={cat5a(row.content_category)} />
          <span className="tag">{platformLabel(row.platform)}</span>
          {row.is_viral ? <span className="pill-viral">● Viral</span> : <span className="pill-not">Chưa viral</span>}
          {row.is_new_channel && <span className="chip">kênh mới</span>}
          {extract.duration > 0 && <span className="chip mono">{ts(extract.duration)}</span>}
        </div>
        <h1>{row.video_title || "(chưa đặt tiêu đề)"}</h1>
        <p>
          {row.channel_name || "—"}
          {row.industry ? ` · ${row.industry}` : ""}
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
          <div className="card">
            <div className="fl" style={{ marginBottom: 8 }}>Chỉ số</div>
            <MetricGrid metrics={row.metrics} />
          </div>

          <div className="card">
            <div className="fl" style={{ marginBottom: 10 }}>▸ Bóc riêng từ transcript</div>
            <Highlights extract={extract} />
          </div>
        </div>

        <div className="card">
          <div className="fl" style={{ marginBottom: 10 }}>Chấm theo khung</div>
          {row.hook_type && <Field label="Hook (loại)">{row.hook_type}</Field>}
          <div className="field-block">
            <div className="fl">S-FACES (Action)</div>
            <Chips items={row.s_faces} />
          </div>
          <div className="field-block">
            <div className="fl">CRAVES (Prefer)</div>
            <Chips items={row.craves_triggers} />
          </div>
          <div className="field-block">
            <div className="fl">Tầng Maslow · KPI</div>
            <Chips items={[row.maslow_layer, ...(row.kpi_primary ?? [])]} />
          </div>
          {row.viral_elements?.length ? (
            <div className="field-block">
              <div className="fl">Yếu tố viral</div>
              <Chips items={row.viral_elements} />
            </div>
          ) : null}
          {row.conclusion && <Field label="▸ Công thức rút ra (áp cho GWT)" formula>{row.conclusion}</Field>}
          {row.evaluation && <Field label="Đánh giá">{row.evaluation}</Field>}
          {row.platform_fit && <Field label="Độ hợp nền tảng">{row.platform_fit}</Field>}
          <div className="field-block">
            <div className="fl">Tags</div>
            <Chips items={row.tags} hash />
          </div>
        </div>
      </div>

      <div className="page-head" style={{ marginTop: 30 }}>
        <h1 style={{ fontSize: "1.2rem" }}>
          Transcript đầy đủ
          <span className="chip mono" style={{ marginLeft: 10, verticalAlign: "middle" }}>
            {extract.counts.v} lời thoại · {extract.counts.t} chữ trên hình
          </span>
        </h1>
        <p style={{ fontSize: ".86rem" }}>
          <span className="chip mono">V</span> lời thoại (STT) ·{" "}
          <span className="chip mono">T</span> chữ on-screen (đọc từ frame). Mốc là giây tính từ đầu video.
        </p>
      </div>

      <div className="notice" style={{ marginTop: 0 }}>
        <Icon.warn />
        <div>
          Transcript này do máy nhận dạng. Theo <Link href="/marketing/luat/nguon-dan-chung">rule nguồn dẫn chứng mục 8b</Link>:
          mọi <b>con số, đơn vị, tên riêng</b> ở đây là <b>hạng C</b> — nghe lại bản gốc trước khi trích hay phản biện.
        </div>
      </div>

      <TranscriptView raw={row.transcript} />
    </section>
  );
}

function ConfigLoi({ error }: { error: unknown }) {
  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">Phân tích video</div>
        <h1>Không mở được video này</h1>
      </div>
      <DataError error={error} />
    </section>
  );
}
