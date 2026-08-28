import "server-only";
import { type Extract, extractFrom } from "./transcript";

/**
 * Đọc 4 bảng marketing qua PostgREST bằng SERVICE_ROLE.
 *
 * ⚠️ ĐÂY LÀ SUPABASE THỨ HAI — KHÔNG phải DB của GWT-App.
 * Bảng `video_analyses` / `video_ideas` nằm ở project riêng của repo GWT Marketing Kit
 * (`qynpywysgltspmgnhhga`, Tokyo), nơi các skill `transcribe_video` / `write_script` đang ghi vào.
 * Vì vậy dùng biến env RIÊNG có tiền tố `MKT_`, tuyệt đối không dùng chung
 * `SUPABASE_SERVICE_ROLE_KEY` của GWT-App (khoá khác, DB khác).
 * Kế hoạch gộp về một DB: xem `backlog/marketing.md`.
 *
 * CHỈ chạy server-side. `import "server-only"` khiến build FAIL ngay nếu có client
 * component lỡ import → khoá không bao giờ lọt vào bundle trình duyệt.
 * Lý do dùng service_role thay vì anon: `video_ideas` chưa có RLS policy nào cho anon.
 */

const URL_ENV = process.env.MKT_SUPABASE_URL;
const KEY_ENV = process.env.MKT_SUPABASE_SERVICE_ROLE_KEY;

export class SupabaseConfigError extends Error {}

function conn() {
  if (!URL_ENV || !KEY_ENV) {
    throw new SupabaseConfigError(
      "Thiếu MKT_SUPABASE_URL / MKT_SUPABASE_SERVICE_ROLE_KEY (Supabase của repo GWT Marketing Kit, KHÁC DB của GWT-App). Copy từ `.env` của repo Marketing Kit vào `.env.local`, và đặt trong Vercel env.",
    );
  }
  return { url: URL_ENV.replace(/\/+$/, ""), key: KEY_ENV };
}

type QueryOpts = { select?: string; order?: string; limit?: number; filter?: string };

async function rest<T>(table: string, opts: QueryOpts = {}): Promise<{ rows: T[]; total: number }> {
  const { url, key } = conn();
  const qs = new URLSearchParams();
  qs.set("select", opts.select ?? "*");
  if (opts.order) qs.set("order", opts.order);
  // filter dạng PostgREST thô, vd `id=eq.12` — chỉ dùng nội bộ, không nhận từ URL người dùng.
  if (opts.filter) {
    const [k, v] = opts.filter.split(/=([\s\S]*)/);
    qs.set(k, v);
  }
  const limit = opts.limit ?? 500;

  const res = await fetch(`${url}/rest/v1/${table}?${qs.toString()}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "count=exact",
      Range: `0-${limit - 1}`,
    },
    // Dữ liệu đổi qua chat/skill chứ không qua web → cache ngắn là đủ, đỡ gọi lại mỗi lần điều hướng.
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Supabase ${table} trả ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const rows = (await res.json()) as T[];
  const total = Number(res.headers.get("content-range")?.split("/")[1] ?? rows.length);
  return { rows, total: Number.isFinite(total) ? total : rows.length };
}

/* ---------- Kiểu dữ liệu (bám đúng cột thật, đã verify trên DB live 2026-08-26) ---------- */

export type VideoAnalysis = {
  id: number;
  url: string | null;
  platform: string | null;
  channel_name: string | null;
  video_title: string | null;
  is_new_channel: boolean | null;
  is_viral: boolean | null;
  metrics: Record<string, number | null> | null;
  transcript: string | null;
  content_type: string | null;
  industry: string | null;
  hook_type: string | null;
  viral_elements: string[] | null;
  structure: unknown;
  evaluation: string | null;
  conclusion: string | null;
  tags: string[] | null;
  analyzed_at: string | null;
  analyzed_by: string | null;
  content_category: string | null;
  s_faces: string[] | null;
  craves_triggers: string[] | null;
  maslow_layer: string | null;
  channel_type: string | null;
  kpi_primary: string[] | null;
  platform_fit: string | null;
};

export type VideoIdea = {
  id: string;
  idea_no: number | null;
  created_at: string | null;
  source_url: string | null;
  source_platform: string | null;
  original_summary: string | null;
  transcript: string | null;
  content_type: string | null;
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
  share_count: number | null;
  engagement_note: string | null;
  gwt_idea: string | null;
  gwt_hook: string | null;
  gwt_platform: string | null;
  gwt_product_fit: string | null;
  gwt_content_angle: string | null;
  status: string | null;
  assigned_to: string | null;
  tags: string[] | null;
};

/* ---------- Truy vấn dùng cho các trang ---------- */

const ANALYSIS_COLS = [
  "id","url","platform","channel_name","video_title","is_new_channel","is_viral","metrics",
  "content_type","industry","hook_type","viral_elements","evaluation","conclusion","tags",
  "analyzed_at","analyzed_by","content_category","s_faces","craves_triggers","maslow_layer",
  "channel_type","kpi_primary","platform_fit",
].join(",");

/** Dòng cho trang bảng: KHÔNG kèm transcript (dài), nhưng có sẵn phần bóc tách. */
export type AnalysisRow = Omit<VideoAnalysis, "transcript" | "structure"> & { extract: Extract };

export async function getAnalyses(): Promise<{ rows: AnalysisRow[]; total: number }> {
  // Transcript được tải để BÓC TÁCH ở server rồi bỏ đi — client chỉ nhận hook/kết/CTA,
  // nên payload gửi về trình duyệt không phình theo độ dài transcript.
  const { rows, total } = await rest<VideoAnalysis>("video_analyses", {
    select: `${ANALYSIS_COLS},transcript`,
    order: "analyzed_at.desc.nullslast,id.desc",
  });
  return {
    total,
    // Bỏ transcript (dài) và structure (không dùng ở bảng) trước khi gửi xuống client.
    rows: rows.map((r) => {
      const { transcript, structure: _bo, ...rest } = r;
      void _bo;
      return { ...rest, extract: extractFrom(transcript) };
    }),
  };
}

/** Một video kèm transcript đầy đủ — dùng cho trang chi tiết. */
export async function getAnalysis(id: number): Promise<VideoAnalysis | null> {
  const { rows } = await rest<VideoAnalysis>("video_analyses", {
    select: `${ANALYSIS_COLS},transcript,structure`,
    filter: `id=eq.${id}`,
    limit: 1,
  });
  return rows[0] ?? null;
}

export async function listAnalysisIds(): Promise<number[]> {
  const { rows } = await rest<{ id: number }>("video_analyses", { select: "id", limit: 1000 });
  return rows.map((r) => r.id);
}

const IDEA_COLS =
  "id,idea_no,created_at,source_url,source_platform,source_file_path,original_summary,content_type,view_count,like_count,comment_count,share_count,engagement_note,gwt_idea,gwt_hook,gwt_platform,gwt_product_fit,gwt_content_angle,status,assigned_to,tags";

/** Dòng cho trang bảng: bỏ transcript, giữ phần đã bóc (giống video_analyses). */
export type IdeaRow = Omit<VideoIdea, "transcript"> & { extract: Extract; hasTranscript: boolean };

export async function getIdeas(): Promise<{ rows: IdeaRow[]; total: number }> {
  const { rows, total } = await rest<VideoIdea>("video_ideas", {
    select: `${IDEA_COLS},transcript`,
    order: "idea_no.asc.nullslast",
  });
  return {
    total,
    rows: rows.map(({ transcript, ...rest }) => ({
      ...rest,
      extract: extractFrom(transcript),
      // Cột này của Supabase có thể là chuỗi "None" (do script Python ghi) — coi như rỗng.
      hasTranscript: Boolean(transcript && transcript !== "None" && transcript.trim()),
    })),
  };
}

export async function getIdea(id: string): Promise<VideoIdea | null> {
  // id là uuid — chặn mọi thứ không đúng dạng trước khi ghép vào query.
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { rows } = await rest<VideoIdea>("video_ideas", {
    select: `${IDEA_COLS},transcript`,
    filter: `id=eq.${id}`,
    limit: 1,
  });
  return rows[0] ?? null;
}

export async function listIdeaIds(): Promise<string[]> {
  const { rows } = await rest<{ id: string }>("video_ideas", { select: "id", limit: 1000 });
  return rows.map((r) => r.id);
}

export async function getCounts(): Promise<{ analyses: number | null; ideas: number | null }> {
  try {
    const { url, key } = conn();
    const head = async (table: string) => {
      const res = await fetch(`${url}/rest/v1/${table}?select=id`, {
        method: "HEAD",
        headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact", Range: "0-0" },
        next: { revalidate: 60 },
      });
      const n = Number(res.headers.get("content-range")?.split("/")[1]);
      return Number.isFinite(n) ? n : null;
    };
    const [analyses, ideas] = await Promise.all([head("video_analyses"), head("video_ideas")]);
    return { analyses, ideas };
  } catch {
    return { analyses: null, ideas: null };
  }
}
