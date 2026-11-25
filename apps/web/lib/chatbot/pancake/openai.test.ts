import { describe, expect, it, vi } from "vitest";

import { goiGpt } from "./openai.ts";

const o = { apiKey: "khoa-bi-mat", model: "gpt-x", messages: [{ role: "user", content: "U" }], tools: [{ type: "function" }] };
const traVe = (j: unknown, status = 200) => vi.fn(async () => new Response(JSON.stringify(j), { status }));

describe("goiGpt", () => {
  it("gửi đúng URL, header, body (tool_choice auto, max_completion_tokens, không temperature); trả message + finish", async () => {
    const msg = { role: "assistant", content: null, tool_calls: [{ id: "t1", type: "function", function: { name: "tra_may", arguments: "{\"ma\":\"CTS20\"}" } }] };
    const f = traVe({ choices: [{ message: msg, finish_reason: "tool_calls" }] });
    const r = await goiGpt({ ...o, fetchImpl: f as never });
    expect(r).toEqual({ message: msg, finish: "tool_calls" });
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.openai.com/v1/chat/completions");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ Authorization: "Bearer khoa-bi-mat", "content-type": "application/json" });
    const b = JSON.parse(init.body as string);
    expect(b).toMatchObject({ model: "gpt-x", messages: o.messages, tools: o.tools, tool_choice: "auto", max_completion_tokens: 8000 });
    expect(b).not.toHaveProperty("temperature");
  });
  it("HTTP lỗi → GPT_HTTP_<status>, không lộ khoá hay thân lỗi", async () => {
    const e = await goiGpt({ ...o, fetchImpl: traVe({ error: "khoa-bi-mat" }, 429) as never }).catch((x: Error) => x) as Error;
    expect(e.message).toBe("GPT_HTTP_429");
  });
  it("mạng hỏng / JSON hỏng / thiếu choices → GPT_MANG", async () => {
    const nem = vi.fn(async () => { throw new Error("khoa-bi-mat U"); });
    expect((await goiGpt({ ...o, fetchImpl: nem as never }).catch((x: Error) => x) as Error).message).toBe("GPT_MANG");
    const hong = vi.fn(async () => new Response("{hỏng"));
    expect((await goiGpt({ ...o, fetchImpl: hong as never }).catch((x: Error) => x) as Error).message).toBe("GPT_MANG");
    expect((await goiGpt({ ...o, fetchImpl: traVe({ choices: [] }) as never }).catch((x: Error) => x) as Error).message).toBe("GPT_MANG");
  });
});
