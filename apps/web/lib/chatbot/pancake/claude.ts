// Gọi Anthropic Messages API bằng fetch thuần, đầu ra JSON có cấu trúc (dạng body theo nhánh Claude của GWT-ERP chat/llm.ts @c2f3719).
// Không bật suy luận: như ERP khi reasoningEffort "" → thinking tắt, effort low. Lỗi chỉ mang mã, không kèm khoá hay tin khách.
import type { GoiCongCu, TraGpt } from "./openai.ts";

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

// ---- Soạn trả lời bằng Claude có công cụ (anh Dũng chốt 2026-11-26: đổi GPT → Haiku) ----
// Cùng giao diện goiGpt (openai.ts) để tu-tra.ts giữ nguyên dạng tin OpenAI chat; dịch hai chiều ở đây.
// Suy luận BẬT mặc định (anh Dũng chốt 2026-11-26 sau đo 7 câu: 0/7 rớt kiểm căn cứ, tắt là 2/7; bớt chèn giá) — `suyLuan: false` để tắt.
// Khi bật (thinking adaptive): khối thinking của lượt có tool_use phải gửi lại NGUYÊN VĂN ở lượt sau, mà dạng OpenAI không có chỗ
// chứa → nhớ nguyên khối trả về theo id tool_use (KHOI_GOC), gặp lại tin assistant có id đó thì gửi y nguyên.

interface TinOA { role: string; content?: unknown; tool_calls?: GoiCongCu[]; tool_call_id?: string }
interface HamOA { function: { name: string; description?: string; parameters?: unknown } }
type KhoiRa = { type: string; text?: string; id?: string; name?: string; input?: unknown };

// ponytail: Map chung cả tiến trình, chặn 500 mục (một lượt soạn ≤ 5 vòng); tiến trình chạy 1 lượt / phút rồi thoát.
const KHOI_GOC = new Map<string, KhoiRa[]>();
const docJson = (s: string): unknown => { try { return JSON.parse(s); } catch { return {}; } };

function sangClaude(messages: unknown[]): { system: string; messages: { role: string; content: unknown[] }[] } {
  const system: string[] = [];
  const ra: { role: string; content: unknown[] }[] = [];
  // Tin cùng vai liền nhau gộp một: mọi tool_result của một lượt phải chung MỘT tin user.
  const them = (role: string, khoi: unknown[]) => {
    const cuoi = ra.at(-1);
    if (cuoi?.role === role) cuoi.content.push(...khoi); else ra.push({ role, content: khoi });
  };
  for (const t of messages as TinOA[]) {
    const chu = typeof t.content === "string" ? t.content : "";
    if (t.role === "system") system.push(chu);
    else if (t.role === "user") them("user", [{ type: "text", text: chu }]);
    else if (t.role === "assistant" && t.tool_calls?.[0] && KHOI_GOC.has(t.tool_calls[0].id)) them("assistant", KHOI_GOC.get(t.tool_calls[0].id)!);
    else if (t.role === "assistant") them("assistant", [
      ...(chu.trim() ? [{ type: "text", text: chu }] : []),
      ...(t.tool_calls ?? []).map((g) => ({ type: "tool_use", id: g.id, name: g.function.name, input: docJson(g.function.arguments) })),
    ]);
    else if (t.role === "tool") them("user", [{ type: "tool_result", tool_use_id: t.tool_call_id, content: chu }]);
  }
  return { system: system.join("\n\n"), messages: ra };
}

export async function goiClaudeCongCu(o: { apiKey: string; model: string; messages: unknown[]; tools: unknown[]; suyLuan?: boolean; fetchImpl?: typeof fetch }): Promise<TraGpt> {
  const suyLuan = o.suyLuan ?? true;
  const { system, messages } = sangClaude(o.messages);
  const tools = (o.tools as HamOA[]).map((h) => ({ name: h.function.name, description: h.function.description ?? "", input_schema: h.function.parameters, strict: true }));
  let res: Response;
  try {
    res = await (o.fetchImpl ?? fetch)("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": o.apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: o.model, max_tokens: suyLuan ? 16000 : 4000, system, messages, tools, tool_choice: { type: "auto" },
        thinking: { type: suyLuan ? "adaptive" : "disabled" }, output_config: { effort: "medium" },
      }),
      signal: AbortSignal.timeout(90_000),
    });
  } catch { throw new Error("CLAUDE_MANG"); }
  if (!res.ok) throw new Error(`CLAUDE_HTTP_${res.status}`);
  let j: { content?: KhoiRa[]; stop_reason?: string };
  try { j = await res.json(); } catch { throw new Error("CLAUDE_MANG"); }
  const khoi = j.content ?? [];
  const dauTool = khoi.find((k) => k.type === "tool_use")?.id;
  if (dauTool) { KHOI_GOC.set(dauTool, khoi); if (KHOI_GOC.size > 500) KHOI_GOC.delete(KHOI_GOC.keys().next().value!); }
  const tool_calls = khoi.filter((k) => k.type === "tool_use")
    .map((k) => ({ id: k.id ?? "", type: "function", function: { name: k.name ?? "", arguments: JSON.stringify(k.input ?? {}) } }));
  const lyDo = j.stop_reason ?? "";
  return {
    message: {
      content: khoi.filter((k) => k.type === "text").map((k) => k.text ?? "").join("") || null,
      refusal: lyDo === "refusal" ? "refusal" : null,
      ...(tool_calls.length ? { tool_calls } : {}),
    },
    finish: lyDo === "max_tokens" ? "length" : lyDo === "tool_use" ? "tool_calls" : "stop",
  };
}
