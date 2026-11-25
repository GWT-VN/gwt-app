// Một lời gọi OpenAI Chat Completions có tools, bằng fetch thuần (như claude.ts). Model do nơi gọi truyền (PANCAKE_TRA_LOI_MODEL).
// Không gửi temperature (model suy luận không nhận). Lỗi chỉ mang mã, không kèm khoá hay tin khách.

export interface GoiCongCu { id: string; type?: string; function: { name: string; arguments: string } }
export interface TraGpt { message: { content: string | null; refusal?: string | null; tool_calls?: GoiCongCu[] }; finish: string }

export async function goiGpt(o: { apiKey: string; model: string; messages: unknown[]; tools: unknown[]; fetchImpl?: typeof fetch }): Promise<TraGpt> {
  let res: Response;
  try {
    res = await (o.fetchImpl ?? fetch)("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${o.apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ model: o.model, messages: o.messages, tools: o.tools, tool_choice: "auto", max_completion_tokens: 8000 }),
      signal: AbortSignal.timeout(60_000),
    });
  } catch {
    throw new Error("GPT_MANG");
  }
  if (!res.ok) throw new Error(`GPT_HTTP_${res.status}`);
  let j: { choices?: { message?: TraGpt["message"]; finish_reason?: string }[] };
  try { j = await res.json(); } catch { throw new Error("GPT_MANG"); }
  const c = j.choices?.[0];
  if (!c?.message) throw new Error("GPT_MANG");
  return { message: c.message, finish: c.finish_reason ?? "" };
}
