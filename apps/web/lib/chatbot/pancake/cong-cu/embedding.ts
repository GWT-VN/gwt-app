// chép từ GWT-ERP lib/chatbot/retrieval/embedding.ts @c2f3719

import { CONFIG } from "./config.ts";

const MAX_ATTEMPTS = 2;

/**
 * Vai trò của văn bản đem nhúng. Mô hình bất đối xứng (EmbeddingGemma, E5,
 * BGE) nhúng câu hỏi khác nhúng đoạn tài liệu, nên phải nói rõ.
 *
 * `"document"` là mặc định vì nhúng đoạn nhiều gấp bội nhúng câu hỏi — quên
 * truyền thì rơi về hướng ít gây hại nhất.
 */
export type EmbedRole = "document" | "query";

/** `CONFIG.EMBED_BASE_URL` chịu trách nhiệm chọn máy chủ; đây chỉ nối đường. */
function embeddingsUrl(): string {
  return `${CONFIG.EMBED_BASE_URL.replace(/\/+$/, "")}/embeddings`;
}

/**
 * Máy chủ nhúng chạy trên CHÍNH máy này (Ollama, LM Studio, llama.cpp) không
 * cần khoá — bắt đặt một khoá giả chỉ để chạy được là papercut vô nghĩa.
 *
 * Nới lỏng chỉ tới đây: gọi ra máy chủ ngoài mà thiếu khoá thì vẫn hỏng ngay,
 * không bắn một yêu cầu chắc chắn bị từ chối.
 */
function mayChuChayTrenMayNay(baseUrl: string): boolean {
  try {
    const host = new URL(baseUrl).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]";
  } catch {
    return false;
  }
}

/**
 * Adapter for `embedTexts`, mirroring `lib/documents/converters/vision.ts`'s
 * external-call idioms: a typed error carrying a `retryable` flag, so the
 * caller (`embedTexts`'s own retry loop) never has to string-match `.message`.
 */
export class EmbeddingError extends Error {
  readonly code: string;
  readonly retryable: boolean;
  constructor(code: string, retryable = false, options?: ErrorOptions) {
    super(code, options);
    this.name = "EmbeddingError";
    this.code = code;
    this.retryable = retryable;
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Pinned normalization for embedding input: trim outer whitespace and
 * collapse any run of internal whitespace (including newlines) to a single
 * space. Kept intentionally simple and deterministic — every caller of
 * `embedTexts` (Task 4's `semanticSplit`, Task 5's staging candidates, Task
 * 6's eval questions) must see the exact same text go into the API call that
 * a re-embed later would produce, so results stay comparable.
 */
function normalizeForEmbedding(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

/** Thay zod (gwt-app không có): data phải là mảng {embedding: number[], index: số nguyên ≥ 0}. */
function docPhanHoi(envelope: unknown): { embedding: number[]; index: number }[] | null {
  const data = (envelope as { data?: unknown } | null)?.data;
  if (!envelope || typeof envelope !== "object" || !Array.isArray(data)) return null;
  const ra: { embedding: number[]; index: number }[] = [];
  for (const it of data) {
    const e = (it as { embedding?: unknown } | null)?.embedding;
    const i = (it as { index?: unknown } | null)?.index;
    if (!Array.isArray(e) || !e.every((x) => typeof x === "number")) return null;
    if (typeof i !== "number" || !Number.isInteger(i) || i < 0) return null;
    ra.push({ embedding: e as number[], index: i });
  }
  return ra;
}

async function fetchAttempt(
  texts: string[],
  apiKey: string,
  fetchImpl: typeof fetch,
): Promise<number[][]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

  try {
    const response = await fetchImpl(embeddingsUrl(), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: CONFIG.EMBED_MODEL,
        input: texts,
        // text-embedding-3-* mặc định trả đủ chiều gốc (large = 3072) — cột là vector(1536): xin đúng EMBED_NATIVE_DIM.
        // Model khác (bge-m3, EmbeddingGemma…) không nhận tham số này.
        ...(CONFIG.EMBED_MODEL.startsWith("text-embedding-3-") ? { dimensions: CONFIG.EMBED_NATIVE_DIM } : {}),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const retryable = response.status === 429 || response.status >= 500;
      throw new EmbeddingError(`EMBEDDING_HTTP_${response.status}`, retryable);
    }

    let envelope: unknown;
    try {
      envelope = await response.json();
    } catch (cause) {
      if (controller.signal.aborted) {
        throw new EmbeddingError("EMBEDDING_TIMEOUT", true, { cause });
      }
      throw new EmbeddingError("EMBEDDING_RESPONSE_INVALID", false, { cause });
    }

    const items = docPhanHoi(envelope);
    if (!items) throw new EmbeddingError("EMBEDDING_RESPONSE_INVALID");
    if (items.length !== texts.length) {
      throw new EmbeddingError("EMBEDDING_RESPONSE_INVALID");
    }

    // Same length is not enough: a malformed-but-same-length response could
    // still repeat an index (silently dropping one text's embedding while
    // duplicating another's) or reference an index outside [0, n-1]. Require
    // the response's index set to be EXACTLY {0, 1, ..., n-1} — no
    // duplicates, no gaps, no out-of-range values — before trusting it to
    // reorder `texts`.
    const seenIndices = new Set<number>();
    for (const item of items) {
      if (item.index < 0 || item.index >= texts.length || seenIndices.has(item.index)) {
        throw new EmbeddingError("EMBEDDING_RESPONSE_INVALID");
      }
      seenIndices.add(item.index);
    }

    // The API is not guaranteed to preserve request order — sort by the
    // response's own `index` so the returned array lines up with `texts`.
    const sorted = [...items].sort((a, b) => a.index - b.index);
    const embeddings = sorted.map((item) => item.embedding);

    // So với số chiều mô hình KHAI là sẽ trả (`EMBED_NATIVE_DIM`), không phải
    // số chiều của cột. Hai con số bằng nhau khi dùng OpenAI; chỉ lệch khi
    // chạy mô hình local nhỏ hơn cột.
    for (const embedding of embeddings) {
      if (embedding.length !== CONFIG.EMBED_NATIVE_DIM) {
        throw new EmbeddingError("EMBEDDING_DIMENSION_MISMATCH");
      }
    }
    // Cắt bớt chiều là mất thông tin thật, khác hẳn đệm 0. Không im lặng làm —
    // hoặc đổi cột trong DB, hoặc dùng mô hình có Matryoshka rồi tự cắt ở phía
    // máy chủ nhúng.
    if (CONFIG.EMBED_NATIVE_DIM > CONFIG.EMBED_DIM) {
      throw new EmbeddingError("EMBEDDING_DIMENSION_MISMATCH");
    }
    if (CONFIG.EMBED_NATIVE_DIM === CONFIG.EMBED_DIM) return embeddings;

    // Đệm 0 cho vừa cột. Xem chứng minh cosine không đổi ở `lib/config.ts`.
    const dem = new Array<number>(CONFIG.EMBED_DIM - CONFIG.EMBED_NATIVE_DIM).fill(0);
    return embeddings.map((embedding) => [...embedding, ...dem]);
  } catch (error) {
    if (error instanceof EmbeddingError) throw error;
    if (controller.signal.aborted) {
      throw new EmbeddingError("EMBEDDING_TIMEOUT", true, { cause: error });
    }
    throw new EmbeddingError("EMBEDDING_NETWORK", true, { cause: error });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Embeds a batch of texts via the OpenAI embeddings API. Order of the
 * returned array always matches the order of `texts` (the API's own
 * response order is not trusted). Retries exactly once on 429 / 5xx /
 * network errors; 4xx (e.g. 400) is never retried. Shared foundation for
 * Task 4's `semanticSplit`, Task 5's staging-candidate embedding, and Task
 * 6's eval-question embedding — callers should not reimplement retry/timeout
 * logic on top of this.
 */
export async function embedTexts(
  texts: string[],
  fetchImpl: typeof fetch = fetch,
  vaiTro: EmbedRole = "document",
): Promise<number[][]> {
  if (texts.length === 0) return [];

  const apiKey = process.env.OPENAI_API_KEY?.trim() ?? "";
  if (!apiKey && !mayChuChayTrenMayNay(CONFIG.EMBED_BASE_URL)) {
    throw new EmbeddingError("EMBEDDING_API_KEY_MISSING");
  }

  // Tiền tố dán SAU khi chuẩn hoá, không phải trước: `normalizeForEmbedding`
  // gộp khoảng trắng, mà tiền tố của EmbeddingGemma có dấu cách cố ý.
  const prefix = vaiTro === "query"
    ? CONFIG.EMBED_PREFIX_QUERY
    : CONFIG.EMBED_PREFIX_DOCUMENT;
  const normalized = texts.map((text) => `${prefix}${normalizeForEmbedding(text)}`);

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      return await fetchAttempt(normalized, apiKey, fetchImpl);
    } catch (error) {
      if (
        !(error instanceof EmbeddingError)
        || !error.retryable
        || attempt === MAX_ATTEMPTS - 1
      ) throw error;

      await delay(CONFIG.RETRY_BACKOFF_MS);
    }
  }

  throw new EmbeddingError("EMBEDDING_UNREACHABLE");
}
