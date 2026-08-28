import Link from "next/link";
import { notFound } from "next/navigation";
import { Chips, Field } from "@/components/marketing/DetailBits";
import Highlights from "@/components/marketing/Highlights";
import TranscriptView from "@/components/marketing/TranscriptView";
import { fmt, platformLabel } from "@/lib/marketing/format";
import { Icon } from "@/lib/marketing/icons";
import DataError from "@/components/marketing/DataError";
import { getIdea, SupabaseConfigError } from "@/lib/marketing/supabase-mkt";
import { extractFrom, ts } from "@/lib/marketing/transcript";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getIdea(id).catch(() => null);
  return { title: row?.idea_no ? `Idea #${row.idea_no}` : "Video idea" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let row;
  try {
    row = await getIdea(id);
  } catch (e) {
    if (e instanceof SupabaseConfigError) return <ConfigLoi error={e} />;
    throw e;
  }
  if (!row) notFound();

  const extract = extractFrom(row.transcript);
  // gwt_idea thường dài cả đoạn — tiêu đề chỉ lấy mệnh đề đầu, phần đủ nằm ở thẻ bên phải.
  const full = row.gwt_idea || row.original_summary || "(chưa có ý tưởng)";
  const heading = full.length > 110 ? `${full.slice(0, full.lastIndexOf(" ", 110))}…` : full;
  const hasCues = extract.counts.v > 0 || extract.counts.t > 0;
  const metrics = (
    [
      ["views", row.view_count],
      ["likes", row.like_count],
      ["comments", row.comment_count],
      ["shares", row.share_count],
    ] as const
  ).filter(([, v]) => v != null);

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">
          <Link href="/marketing/du-lieu/video-ideas" style={{ color: "inherit" }}>Video Ideas</Link> · idea #{row.idea_no ?? "—"}
        </div>
        <div className="meta-row" style={{ marginBottom: 8 }}>
          <span className="chip mono">Idea #{row.idea_no ?? "—"}</span>
          <span className="tag">{platformLabel(row.source_platform)}</span>
          <span className="pill-status">{row.status || "idea"}</span>
          {row.content_type && <span className="chip">{row.content_type}</span>}
          {extract.duration > 0 && <span className="chip mono">{ts(extract.duration)}</span>}
        </div>
        <h1>{heading}</h1>
        <p>
          SP phù hợp: {row.gwt_product_fit?.replace(/,/g, ", ") || "—"}
          {row.source_url && (
            <>
              {" · "}
              <a href={row.source_url} target="_blank" rel="noopener noreferrer">Mở video nguồn ↗</a>
            </>
          )}
        </p>
      </div>

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div style={{ display: "grid", gap: 16 }}>
          {metrics.length > 0 && (
            <div className="card">
              <div className="fl" style={{ marginBottom: 8 }}>Chỉ số video nguồn</div>
              <div className="metricgrid">
                {metrics.map(([k, v]) => (
                  <div className="m" key={k}>
                    <div className="mv">{fmt(v)}</div>
                    <div className="ml">{k}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasCues && (
            <div className="card">
              <div className="fl" style={{ marginBottom: 10 }}>▸ Bóc riêng từ transcript video nguồn</div>
              <Highlights extract={extract} />
            </div>
          )}

          {row.original_summary && (
            <div className="card">
              <div className="fl" style={{ marginBottom: 8 }}>Tóm tắt video nguồn</div>
              <p style={{ margin: 0, fontSize: ".9rem", color: "var(--ink-2)", lineHeight: 1.7 }}>
                {row.original_summary}
              </p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="fl" style={{ marginBottom: 10 }}>Ý tưởng cho GWT</div>
          {row.gwt_idea && <Field label="▸ Ý tưởng" formula>{row.gwt_idea}</Field>}
          {row.gwt_hook && (
            <div className="field-block">
              <div className="fl">Hook đề xuất</div>
              <div className="fv" style={{ fontStyle: "italic", color: "var(--ink)" }}>“{row.gwt_hook}”</div>
            </div>
          )}
          {row.gwt_content_angle && <Field label="Góc nội dung">{row.gwt_content_angle}</Field>}
          {row.gwt_platform && (
            <div className="field-block">
              <div className="fl">Nền tảng đề xuất</div>
              <Chips items={row.gwt_platform.split(",").map((s) => s.trim())} />
            </div>
          )}
          {row.engagement_note && row.engagement_note !== "None" && (
            <Field label="Ghi chú tương tác">{row.engagement_note}</Field>
          )}
          <div className="field-block">
            <div className="fl">Tags</div>
            <Chips items={row.tags} hash />
          </div>
          <div className="field-block">
            <div className="fl">Ghi nhận</div>
            <div className="fv" style={{ fontSize: ".8rem", color: "var(--ink-3)" }}>
              {row.assigned_to && row.assigned_to !== "None" ? `Giao cho ${row.assigned_to} · ` : ""}
              {row.created_at ? new Date(row.created_at).toLocaleDateString("vi-VN") : ""}
            </div>
          </div>
        </div>
      </div>

      <div className="page-head" style={{ marginTop: 30 }}>
        <h1 style={{ fontSize: "1.2rem" }}>
          Transcript video nguồn
          {hasCues && (
            <span className="chip mono" style={{ marginLeft: 10, verticalAlign: "middle" }}>
              {extract.counts.v} lời thoại · {extract.counts.t} chữ trên hình
            </span>
          )}
        </h1>
        {hasCues && (
          <p style={{ fontSize: ".86rem" }}>
            <span className="chip mono">V</span> lời thoại (STT) · <span className="chip mono">T</span> chữ on-screen.
            Mốc là giây tính từ đầu video.
          </p>
        )}
      </div>

      <div className="notice" style={{ marginTop: 0 }}>
        <Icon.warn />
        <div>
          Transcript do máy nhận dạng. Theo <Link href="/marketing/luat/nguon-dan-chung">rule nguồn dẫn chứng mục 8b</Link>: mọi{" "}
          <b>con số, đơn vị, tên riêng</b> ở đây là <b>hạng C</b> — nghe lại bản gốc trước khi trích hay phản biện.
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
        <div className="eyebrow">Video Ideas</div>
        <h1>Không mở được ý tưởng này</h1>
      </div>
      <DataError error={error} />
    </section>
  );
}
