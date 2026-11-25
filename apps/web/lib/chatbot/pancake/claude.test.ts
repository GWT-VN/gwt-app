import { describe, expect, it, vi } from "vitest";

import { goiClaudeJson } from "./claude.ts";

const o = { apiKey: "khoa-bi-mat", model: "claude-haiku-5-5", system: "S", user: "U", schema: { type: "object" }, maxTokens: 300 };

describe("goiClaudeJson", () => {
  it("gửi đúng URL, header, model, schema; nối các khối text; truncated theo stop_reason", async () => {
    const f = vi.fn(async () => new Response(JSON.stringify({ content: [{ type: "text", text: "{\"a\"" }, { type: "text", text: ":1}" }], stop_reason: "max_tokens" })));
    const r = await goiClaudeJson({ ...o, fetchImpl: f as never });
    expect(r).toEqual({ text: "{\"a\":1}", truncated: true });
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect(init.headers).toMatchObject({ "x-api-key": "khoa-bi-mat", "anthropic-version": "2023-06-01", "content-type": "application/json" });
    const b = JSON.parse(init.body as string);
    expect(b).toMatchObject({ model: "claude-haiku-5-5", max_tokens: 300, system: "S", messages: [{ role: "user", content: "U" }] });
    expect(b.output_config.format).toEqual({ type: "json_schema", schema: { type: "object" } });
  });
  it("HTTP lỗi → CLAUDE_HTTP_<status>, không lộ khoá", async () => {
    const f = vi.fn(async () => new Response("khoa-bi-mat", { status: 429 }));
    const e = await goiClaudeJson({ ...o, fetchImpl: f as never }).catch((x: Error) => x) as Error;
    expect(e.message).toBe("CLAUDE_HTTP_429");
  });
  it("mạng hỏng → CLAUDE_MANG", async () => {
    const f = vi.fn(async () => { throw new Error("khoa-bi-mat"); });
    const e = await goiClaudeJson({ ...o, fetchImpl: f as never }).catch((x: Error) => x) as Error;
    expect(e.message).toBe("CLAUDE_MANG");
  });
});
