import { describe, expect, it, vi } from "vitest";

import { goiGpt } from "./openai.ts";

const o = { apiKey: "khoa-bi-mat", model: "gpt-x", messages: [{ role: "user", content: "U" }], tools: [{ type: "function", function: { name: "tra_may", description: "D", parameters: { type: "object" } } }] };
const traVe = (j: unknown, status = 200) => vi.fn(async () => new Response(JSON.stringify(j), { status }));
const body = (f: ReturnType<typeof traVe>) => JSON.parse(((f.mock.calls[0] as unknown as [string, RequestInit])[1]).body as string);
const msgOut = (content: unknown[]) => ({ type: "message", content });

describe("goiGpt", () => {
  it("gọi /v1/responses; system → developer; tools phẳng; body đúng, không temperature", async () => {
    const f = traVe({ output: [msgOut([{ type: "output_text", text: "xin chào" }])], status: "completed" });
    await goiGpt({ ...o, messages: [{ role: "system", content: "S" }, { role: "user", content: "U" }], fetchImpl: f as never });
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.openai.com/v1/responses");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ Authorization: "Bearer khoa-bi-mat", "content-type": "application/json" });
    const b = body(f);
    expect(b).toMatchObject({ model: "gpt-x", tool_choice: "auto", max_output_tokens: 8000, store: false });
    expect(b).not.toHaveProperty("temperature");
    expect(b.input).toEqual([{ role: "developer", content: "S" }, { role: "user", content: "U" }]);
    expect(b.tools).toEqual([{ type: "function", name: "tra_may", description: "D", parameters: { type: "object" }, strict: false }]);
  });
  it("vòng công cụ: assistant tool_calls + tool → function_call + function_call_output cùng call_id", async () => {
    const f = traVe({ output: [] });
    await goiGpt({
      ...o,
      messages: [
        { role: "assistant", content: "đợi em", tool_calls: [{ id: "c1", type: "function", function: { name: "tra_may", arguments: "{}" } }] },
        { role: "assistant", content: null, tool_calls: [{ id: "c2", type: "function", function: { name: "b", arguments: "{1}" } }] },
        { role: "tool", tool_call_id: "c1", content: "kq" },
      ],
      fetchImpl: f as never,
    });
    expect(body(f).input).toEqual([
      { role: "assistant", content: "đợi em" },
      { type: "function_call", call_id: "c1", name: "tra_may", arguments: "{}" },
      { type: "function_call", call_id: "c2", name: "b", arguments: "{1}" },
      { type: "function_call_output", call_id: "c1", output: "kq" },
    ]);
  });
  it("output có function_call → tool_calls, finish tool_calls", async () => {
    const f = traVe({ output: [{ type: "function_call", call_id: "c1", name: "tra_may", arguments: "{\"ma\":\"CTS20\"}" }], status: "completed" });
    const r = await goiGpt({ ...o, fetchImpl: f as never });
    expect(r).toEqual({ message: { content: null, tool_calls: [{ id: "c1", type: "function", function: { name: "tra_may", arguments: "{\"ma\":\"CTS20\"}" } }] }, finish: "tool_calls" });
  });
  it("chỉ chữ → content + stop; incomplete → length; tool_calls undefined", async () => {
    const out = [msgOut([{ type: "output_text", text: "a" }]), msgOut([{ type: "output_text", text: "b" }])];
    const r = await goiGpt({ ...o, fetchImpl: traVe({ output: out, status: "completed" }) as never });
    expect(r).toEqual({ message: { content: "ab" }, finish: "stop" });
    expect(r.message.tool_calls).toBeUndefined();
    const r2 = await goiGpt({ ...o, fetchImpl: traVe({ output: out, status: "incomplete" }) as never });
    expect(r2.finish).toBe("length");
  });
  it("incomplete: content_filter → content_filter; lý do khác → length kể cả có function_call", async () => {
    const fc = { type: "function_call", call_id: "c", name: "n", arguments: "{" };
    const r = await goiGpt({ ...o, fetchImpl: traVe({ output: [], status: "incomplete", incomplete_details: { reason: "content_filter" } }) as never });
    expect(r.finish).toBe("content_filter");
    const r2 = await goiGpt({ ...o, fetchImpl: traVe({ output: [fc], status: "incomplete", incomplete_details: { reason: "max_output_tokens" } }) as never });
    expect(r2.finish).toBe("length");
  });
  it("200 nhưng status failed hoặc có error → GPT_MANG", async () => {
    for (const j of [{ output: [], status: "failed" }, { output: [], error: { message: "x" } }]) {
      expect((await goiGpt({ ...o, fetchImpl: traVe(j) as never }).catch((x: Error) => x) as Error).message).toBe("GPT_MANG");
    }
  });
  it("refusal được ánh xạ", async () => {
    const r = await goiGpt({ ...o, fetchImpl: traVe({ output: [msgOut([{ type: "refusal", refusal: "không thể" }])], status: "completed" }) as never });
    expect(r.message.refusal).toBe("không thể");
    expect(r.message.content).toBeNull();
  });
  it("HTTP lỗi → GPT_HTTP_<status>, không lộ khoá hay thân lỗi", async () => {
    const e = await goiGpt({ ...o, fetchImpl: traVe({ error: "khoa-bi-mat" }, 429) as never }).catch((x: Error) => x) as Error;
    expect(e.message).toBe("GPT_HTTP_429");
  });
  it("mạng hỏng / JSON hỏng / thiếu output → GPT_MANG", async () => {
    const nem = vi.fn(async () => { throw new Error("khoa-bi-mat U"); });
    expect((await goiGpt({ ...o, fetchImpl: nem as never }).catch((x: Error) => x) as Error).message).toBe("GPT_MANG");
    const hong = vi.fn(async () => new Response("{hỏng"));
    expect((await goiGpt({ ...o, fetchImpl: hong as never }).catch((x: Error) => x) as Error).message).toBe("GPT_MANG");
    expect((await goiGpt({ ...o, fetchImpl: traVe({}) as never }).catch((x: Error) => x) as Error).message).toBe("GPT_MANG");
  });
});
