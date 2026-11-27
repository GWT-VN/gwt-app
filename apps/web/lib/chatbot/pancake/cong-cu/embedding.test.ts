import { afterEach, describe, expect, it, vi } from "vitest";

import { CONFIG } from "./config.ts";
import { EmbeddingError, embedTexts } from "./embedding.ts";

// Thay zod bằng kiểm tay: các ca từ chối phải giữ nguyên như bản ERP (data mảng {embedding:number[], index:int>=0}).
const vec = (seed: number) => Array.from({ length: CONFIG.EMBED_DIM }, (_u, i) => (i === 0 ? seed : 0));
const tra = (body: unknown, status = 200) => vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }));
const dung = (items: Array<{ embedding: number[]; index: number }>) => tra({ data: items });

describe("embedTexts", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("trả theo thứ tự đầu vào, sắp theo index của phản hồi", async () => {
    vi.stubEnv("OPENAI_API_KEY", "k");
    const f = dung([{ embedding: vec(2), index: 1 }, { embedding: vec(1), index: 0 }]);
    const ra = await embedTexts(["a", "b"], f as never);
    expect(ra.map((v) => v[0])).toEqual([1, 2]);
  });
  it("vai query: nhúng bằng tiền tố query (mặc định rỗng) và chuẩn hoá khoảng trắng", async () => {
    vi.stubEnv("OPENAI_API_KEY", "k");
    const f = dung([{ embedding: vec(1), index: 0 }]);
    await embedTexts(["  a \n b  "], f as never, "query");
    const body = JSON.parse((f.mock.calls[0] as unknown as [string, { body: string }])[1].body);
    expect(body.input).toEqual(["a b"]);
  });
  it.each([
    ["data không phải mảng", { data: "x" }],
    ["thiếu embedding", { data: [{ index: 0 }] }],
    ["embedding không phải số", { data: [{ embedding: ["a"], index: 0 }] }],
    ["index âm", { data: [{ embedding: [1], index: -1 }] }],
    ["index không nguyên", { data: [{ embedding: [1], index: 0.5 }] }],
    ["null", null],
  ])("phản hồi sai hình (%s) → EMBEDDING_RESPONSE_INVALID, không thử lại", async (_t, body) => {
    vi.stubEnv("OPENAI_API_KEY", "k");
    const f = tra(body);
    await expect(embedTexts(["a"], f as never)).rejects.toMatchObject({ code: "EMBEDDING_RESPONSE_INVALID", retryable: false });
    expect(f).toHaveBeenCalledTimes(1);
  });
  it("index trùng / thiếu → EMBEDDING_RESPONSE_INVALID", async () => {
    vi.stubEnv("OPENAI_API_KEY", "k");
    const f = dung([{ embedding: vec(1), index: 0 }, { embedding: vec(2), index: 0 }]);
    await expect(embedTexts(["a", "b"], f as never)).rejects.toMatchObject({ code: "EMBEDDING_RESPONSE_INVALID" });
  });
  it("sai số chiều → EMBEDDING_DIMENSION_MISMATCH", async () => {
    vi.stubEnv("OPENAI_API_KEY", "k");
    await expect(embedTexts(["a"], dung([{ embedding: [1, 2], index: 0 }]) as never)).rejects.toMatchObject({ code: "EMBEDDING_DIMENSION_MISMATCH" });
  });
  it("429 thử lại đúng một lần rồi thành công; 400 không thử lại", async () => {
    vi.stubEnv("OPENAI_API_KEY", "k");
    const f = vi.fn()
      .mockResolvedValueOnce(new Response("{}", { status: 429 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [{ embedding: vec(1), index: 0 }] }), { status: 200 }));
    expect(await embedTexts(["a"], f as never)).toHaveLength(1);
    expect(f).toHaveBeenCalledTimes(2);
    const f400 = tra({}, 400);
    await expect(embedTexts(["a"], f400 as never)).rejects.toBeInstanceOf(EmbeddingError);
    expect(f400).toHaveBeenCalledTimes(1);
  });
  it("thiếu khoá khi máy chủ nhúng ở ngoài → EMBEDDING_API_KEY_MISSING; mảng rỗng không gọi fetch", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const f = vi.fn();
    await expect(embedTexts(["a"], f as never)).rejects.toMatchObject({ code: "EMBEDDING_API_KEY_MISSING" });
    expect(await embedTexts([], f as never)).toEqual([]);
    expect(f).not.toHaveBeenCalled();
  });
});
