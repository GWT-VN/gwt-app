// Gọi Anthropic Messages API bằng fetch thuần, đầu ra JSON có cấu trúc (dạng body theo nhánh Claude của GWT-ERP chat/llm.ts @c2f3719).
// Không bật suy luận: như ERP khi reasoningEffort "" → thinking tắt, effort low. Lỗi chỉ mang mã, không kèm khoá hay tin khách.

// Cách tắt suy luận khác theo model (đo ở ERP 2026-10-15); model lạ → "disabled".
const TAT_SUY_LUAN: ReadonlyArray<[string, { type: string }]> = [
  ["claude-sonnet-5-5", { type: "between_tools" }],
  ["claude-opus-5-5", { type: "adaptive" }],
  ["claude-fable-5", { type: "adaptive" }],
];

export async function goiClaudeJson(o: {
  apiKey: string; model: string; system: string; user: string;
  schema: Record<string, unknown>; maxTokens: number; fetchImpl?: typeof fetch;
}): Promise<{ text: string; truncated: boolean }> {
  const body = {
    model: o.model,
    max_tokens: o.maxTokens,
    system: o.system,
    messages: [{ role: "user", content: o.user }],
    thinking: TAT_SUY_LUAN.find(([tien]) => o.model.startsWith(tien))?.[1] ?? { type: "disabled" },
    output_config: { effort: "low", format: { type: "json_schema", schema: o.schema } },
  };
  let res: Response;
  try {
    res = await (o.fetchImpl ?? fetch)("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": o.apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    throw new Error("CLAUDE_MANG");
  }
  if (!res.ok) throw new Error(`CLAUDE_HTTP_${res.status}`);
  let j: { content?: { type: string; text?: string }[]; stop_reason?: string };
  try { j = await res.json(); } catch { throw new Error("CLAUDE_MANG"); }
  return {
    text: (j.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join(""),
    truncated: j.stop_reason === "max_tokens",
  };
}
