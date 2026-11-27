// chép từ GWT-ERP lib/chatbot/config.ts @c2f3719 — chỉ phần EMBED_* / TOP_K / TIMEOUT cho truy hồi (comment đo đạc xem bản ERP)
export const CONFIG = {
  EMBED_MODEL: process.env.EMBED_MODEL ?? "text-embedding-3-small",
  // Ollama / LM Studio / llama.cpp cũng phơi `/v1/embeddings` kiểu OpenAI: đổi sang máy chủ local = đổi biến này.
  EMBED_BASE_URL: process.env.EMBED_BASE_URL ?? "https://api.openai.com/v1",
  // PHẢI KHỚP vector(N) của cột embedding trong chatbot_chunks.
  EMBED_DIM: Number(process.env.EMBED_DIM ?? 1536),
  // Số chiều mô hình thực trả về; nhỏ hơn EMBED_DIM thì đệm 0 (cosine không đổi).
  EMBED_NATIVE_DIM: Number(process.env.EMBED_NATIVE_DIM ?? process.env.EMBED_DIM ?? 1536),
  // Tiền tố theo vai trò cho mô hình bất đối xứng (EmbeddingGemma…); mặc định rỗng — OpenAI không cần.
  EMBED_PREFIX_DOCUMENT: process.env.EMBED_PREFIX_DOCUMENT ?? "",
  EMBED_PREFIX_QUERY: process.env.EMBED_PREFIX_QUERY ?? "",
  TOP_K: 8, // số chunk lấy về
  TIMEOUT_MS: 20_000, // AbortController cho mọi call ngoài
  RETRY_BACKOFF_MS: 500,
} as const;
