import { describe, expect, it, vi } from "vitest";

import { goiClaudeCongCu, goiClaudeJson } from "./claude.ts";

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

describe("goiClaudeCongCu — soạn trả lời bằng Claude, cùng giao diện goiGpt (2026-11-26)", () => {
  const tin = [
    { role: "system", content: "S" }, { role: "user", content: "U" },
    { role: "assistant", content: null, tool_calls: [{ id: "a", function: { name: "tra_may", arguments: "{\"ma\":\"WH30A\"}" } }, { id: "b", function: { name: "bang_gia", arguments: "{\"nhom\":\"loc_tong\"}" } }] },
    { role: "tool", tool_call_id: "a", content: "x" }, { role: "tool", tool_call_id: "b", content: "y" },
  ];
  const cu = [{ type: "function", function: { name: "tra_may", description: "D", parameters: { type: "object" }, strict: true } }];
  it("chuyển tin: system tách riêng, tool_calls → tool_use, nhiều tin tool gộp MỘT tin user tool_result", async () => {
    const f = vi.fn(async () => new Response(JSON.stringify({ content: [{ type: "text", text: "ok" }], stop_reason: "end_turn" })));
    await goiClaudeCongCu({ apiKey: "k", model: "claude-haiku-5-5", messages: tin, tools: cu, fetchImpl: f as never });
    const b = JSON.parse((f.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(b.system).toBe("S");
    expect(b.thinking).toEqual({ type: "adaptive" }); // mặc định bật suy luận (2026-11-26)
    expect(b.tools).toEqual([{ name: "tra_may", description: "D", input_schema: { type: "object" }, strict: true }]);
    expect(b.messages).toEqual([
      { role: "user", content: [{ type: "text", text: "U" }] },
      { role: "assistant", content: [{ type: "tool_use", id: "a", name: "tra_may", input: { ma: "WH30A" } }, { type: "tool_use", id: "b", name: "bang_gia", input: { nhom: "loc_tong" } }] },
      { role: "user", content: [{ type: "tool_result", tool_use_id: "a", content: "x" }, { type: "tool_result", tool_use_id: "b", content: "y" }] },
    ]);
  });
  it("trả về dạng goiGpt: tool_use → tool_calls, stop_reason → finish", async () => {
    const f = vi.fn(async () => new Response(JSON.stringify({
      content: [{ type: "text", text: "để em tra" }, { type: "tool_use", id: "t1", name: "tra_may", input: { ma: "CTS20" } }], stop_reason: "tool_use",
    })));
    const r = await goiClaudeCongCu({ apiKey: "k", model: "claude-haiku-5-5", messages: tin, tools: cu, fetchImpl: f as never });
    expect(r).toEqual({ message: { content: "để em tra", refusal: null, tool_calls: [{ id: "t1", type: "function", function: { name: "tra_may", arguments: "{\"ma\":\"CTS20\"}" } }] }, finish: "tool_calls" });
    const het = vi.fn(async () => new Response(JSON.stringify({ content: [], stop_reason: "max_tokens" })));
    expect((await goiClaudeCongCu({ apiKey: "k", model: "m", messages: tin, tools: cu, fetchImpl: het as never })).finish).toBe("length");
    const tc = vi.fn(async () => new Response(JSON.stringify({ content: [], stop_reason: "refusal" })));
    expect((await goiClaudeCongCu({ apiKey: "k", model: "m", messages: tin, tools: cu, fetchImpl: tc as never })).message.refusal).toBe("refusal");
  });
  it("suyLuan: bật thinking adaptive; lượt sau gửi lại NGUYÊN khối (cả thinking + chữ ký) của tin assistant có tool_use đó", async () => {
    const goc = [{ type: "thinking", thinking: "", signature: "sig1" }, { type: "tool_use", id: "t9", name: "tra_may", input: { ma: "GN620" } }];
    const f = vi.fn(async () => new Response(JSON.stringify({ content: goc, stop_reason: "tool_use" })));
    const r = await goiClaudeCongCu({ apiKey: "k", model: "claude-haiku-5-5", messages: tin.slice(0, 2), tools: cu, suyLuan: true, fetchImpl: f as never });
    expect(JSON.parse((f.mock.calls[0] as unknown as [string, RequestInit])[1].body as string).thinking).toEqual({ type: "adaptive" });
    const g = vi.fn(async () => new Response(JSON.stringify({ content: [{ type: "text", text: "xong" }], stop_reason: "end_turn" })));
    await goiClaudeCongCu({ apiKey: "k", model: "claude-haiku-5-5", suyLuan: true, tools: cu, fetchImpl: g as never,
      messages: [...tin.slice(0, 2), { role: "assistant", content: null, tool_calls: r.message.tool_calls }, { role: "tool", tool_call_id: "t9", content: "z" }] });
    expect(JSON.parse((g.mock.calls[0] as unknown as [string, RequestInit])[1].body as string).messages[1]).toEqual({ role: "assistant", content: goc });
  });
  it("HTTP lỗi → CLAUDE_HTTP_<status>; mạng hỏng → CLAUDE_MANG", async () => {
    const f = vi.fn(async () => new Response("khoa", { status: 529 }));
    expect(((await goiClaudeCongCu({ apiKey: "k", model: "m", messages: tin, tools: cu, fetchImpl: f as never }).catch((x: Error) => x)) as Error).message).toBe("CLAUDE_HTTP_529");
    const g = vi.fn(async () => { throw new Error("khoa"); });
    expect(((await goiClaudeCongCu({ apiKey: "k", model: "m", messages: tin, tools: cu, fetchImpl: g as never }).catch((x: Error) => x)) as Error).message).toBe("CLAUDE_MANG");
  });
});
