// Một lời gọi OpenAI Responses API có tools, bằng fetch thuần (như claude.ts). Model do nơi gọi truyền (PANCAKE_TRA_LOI_MODEL).
// gpt-5.6+/6.x từ chối function tools trên chat/completions → dùng /v1/responses; dịch hai chiều ở đây để tu-tra.ts giữ dạng chat.
// Không gửi temperature (model suy luận không nhận). Lỗi chỉ mang mã, không kèm khoá hay tin khách.

export interface GoiCongCu { id: string; type?: string; function: { name: string; arguments: string } }
export interface TraGpt { message: { content: string | null; refusal?: string | null; tool_calls?: GoiCongCu[] }; finish: string }

interface TinChat { role?: string; content?: unknown; tool_call_id?: string; tool_calls?: GoiCongCu[] }
interface CongCuChat { function: { name: string; description?: string; parameters?: unknown } }
interface MucRa { type?: string; call_id?: string; name?: string; arguments?: string; content?: { type?: string; text?: string; refusal?: string }[] }

function sangInput(messages: unknown[]): unknown[] {
  return (messages as TinChat[]).flatMap((m): unknown[] => {
    if (m.role === "tool") return [{ type: "function_call_output", call_id: m.tool_call_id, output: String(m.content ?? "") }];
    if (m.role === "assistant" && m.tool_calls?.length) {
      return [
        ...(m.content ? [{ role: "assistant", content: m.content }] : []),
        ...m.tool_calls.map((c) => ({ type: "function_call", call_id: c.id, name: c.function.name, arguments: c.function.arguments })),
      ];
    }
    if (m.role === "system") return [{ role: "developer", content: m.content }];
    return [{ role: m.role, content: String(m.content ?? "") }];
  });
}

export async function goiGpt(o: { apiKey: string; model: string; messages: unknown[]; tools: unknown[]; fetchImpl?: typeof fetch }): Promise<TraGpt> {
  const tools = (o.tools as CongCuChat[]).map((t) => ({ type: "function", name: t.function.name, description: t.function.description, parameters: t.function.parameters, strict: false }));
  let res: Response;
  try {
    res = await (o.fetchImpl ?? fetch)("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${o.apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ model: o.model, input: sangInput(o.messages), tools, tool_choice: "auto", max_output_tokens: 8000, store: false }),
      signal: AbortSignal.timeout(120_000),
    });
  } catch {
    throw new Error("GPT_MANG");
  }
  if (!res.ok) throw new Error(`GPT_HTTP_${res.status}`);
  let j: { output?: MucRa[]; status?: string; error?: unknown; incomplete_details?: { reason?: string } | null };
  try { j = await res.json(); } catch { throw new Error("GPT_MANG"); }
  if (j.status === "failed" || j.error || !Array.isArray(j.output)) throw new Error("GPT_MANG");
  const items = j.output.filter((x) => x.type === "message").flatMap((x) => x.content ?? []);
  const text = items.filter((c) => c.type === "output_text").map((c) => c.text ?? "").join("");
  const refusal = items.find((c) => c.type === "refusal")?.refusal;
  const calls: GoiCongCu[] = j.output
    .filter((x) => x.type === "function_call")
    .map((x) => ({ id: x.call_id as string, type: "function", function: { name: x.name as string, arguments: x.arguments as string } }));
  return {
    message: { content: text || null, ...(refusal !== undefined ? { refusal } : {}), ...(calls.length ? { tool_calls: calls } : {}) },
    finish: j.status === "incomplete" ? (j.incomplete_details?.reason === "content_filter" ? "content_filter" : "length") : calls.length ? "tool_calls" : "stop",
  };
}
