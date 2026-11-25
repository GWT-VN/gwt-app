// chép từ GWT-ERP lib/chatbot/retrieval/retrieve.ts @c2f3719
/**
 * Bọc RPC truy hồi sản xuất `chatbot_match_chunks_hybrid`. KHÔNG biết gì về LLM.
 *
 * Nhận `rpc` từ ngoài thay vì tự dựng client Supabase: route HTTP đưa vào
 * client của phiên đăng nhập (nên đi qua RLS), còn test đưa vào hàm giả. Module
 * này không cần biết cái nào là cái nào.
 *
 * Lưu ý: file này VẪN chỉ chạy được phía máy chủ, dù không tự khai
 * `import "server-only"` — nó import `embedTexts`, mà `embedding.ts` có khai.
 * Vitest gỡ được nhờ alias trong `vitest.config.mts`; `npx tsx` thì KHÔNG, nên
 * đừng viết script đo đạc import thẳng vào đây. Muốn đo thì gọi qua route HTTP,
 * như `scripts/dev-hoi.mjs` làm.
 */
import { CONFIG } from "./config.ts";
import { embedTexts } from "./embedding.ts";
import { normalizeForFullTextSearch } from "./text-normalize.ts";

export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  content: string;
  headingPath: string[];
  score: number;
  /** Hạng bài wiki (metadata.hang do dong-bo-wiki ghi); null = chunk không phải wiki. */
  hang?: string | null;
}

export interface RetrieveResult {
  chunks: RetrievedChunk[];
  embedMs: number;
  retrieveMs: number;
}

export type RpcFn = (
  name: string,
  args: Record<string, unknown>,
) => Promise<{ data: unknown; error: { message: string } | null }>;

export class RetrieveError extends Error {
  readonly code: string;
  constructor(code: string, options?: ErrorOptions) {
    super(code, options);
    this.name = "RetrieveError";
    this.code = code;
  }
}

interface HangDB {
  chunk_id?: unknown;
  document_id?: unknown;
  document_title?: unknown;
  content?: unknown;
  metadata?: unknown;
  score?: unknown;
}

function hangTu(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const h = (metadata as { hang?: unknown }).hang;
  return typeof h === "string" && h.trim() ? h.trim() : null;
}

/** Chunk chỉ nhân viên dùng (nap-kho ghi `chiNv` cho "Xử lý sự cố") — không bao giờ đến bot trả lời khách. */
function chiNvTu(metadata: unknown): boolean {
  return !!metadata && typeof metadata === "object" && (metadata as { chiNv?: unknown }).chiNv === true;
}

function mucLucTu(metadata: unknown): string[] {
  if (!metadata || typeof metadata !== "object") return [];
  const hp = (metadata as { headingPath?: unknown }).headingPath;
  return Array.isArray(hp) ? hp.filter((x): x is string => typeof x === "string") : [];
}

export async function retrieveChunks(
  hoi: string,
  topK: number = CONFIG.TOP_K,
  rpc: RpcFn,
  embedImpl: typeof embedTexts = embedTexts,
): Promise<RetrieveResult> {
  const t0 = Date.now();
  const [vector] = await embedImpl([hoi], undefined, "query");
  const embedMs = Date.now() - t0;

  const t1 = Date.now();
  // BỎ DẤU trước khi truyền. Cột `tsv` của `chatbot_chunks` được sinh từ
  // `content_search`, tức bản đã bỏ dấu — truyền câu hỏi nguyên dấu thì nhánh
  // tìm theo từ khoá KHÔNG khớp gì cả, mà không hề báo lỗi. Đo ngày 2026-07-30:
  // "Trọng lượng" trượt, "Trong luong" khớp; 5/5 cặp đều vậy.
  const { data, error } = await rpc("match_chunks_hybrid", {
    p_query_text: normalizeForFullTextSearch(hoi),
    p_query_embedding: JSON.stringify(vector),
    p_match_count: topK,
  });
  const retrieveMs = Date.now() - t1;

  if (error) throw new RetrieveError("RETRIEVE_RPC_FAILED", { cause: error });

  const rows = (Array.isArray(data) ? (data as HangDB[]) : []).filter((row) => !chiNvTu(row.metadata));
  const chunks = rows.map((row) => ({
    chunkId: String(row.chunk_id ?? ""),
    documentId: String(row.document_id ?? ""),
    documentTitle: String(row.document_title ?? ""),
    content: String(row.content ?? ""),
    headingPath: mucLucTu(row.metadata),
    score: Number(row.score ?? 0),
    hang: hangTu(row.metadata),
  }));

  return { chunks, embedMs, retrieveMs };
}
