/** Báo Discord gọn qua webhook kênh thường (không Forum). Webhook chỉ từ env, không vào lỗi/log. */
import { DAU_BOT } from "./loc.ts";

// chép từ GWT-ERP lib/chatbot/kenh/pancake/bao-discord.ts @c2f3719 (thoat, catDonVi)
/** Chữ của khách không được thành markdown/nhắc @ Discord: thêm `\` trước ký tự đặc biệt, chèn U+200B sau `@`. */
const thoat = (s: string) =>
  s.replace(/[\\*_~`|[\]()<>]/g, "\\$&").replace(/^#/, "\\#").replaceAll("@", "@\u200b");
// Cắt theo đơn vị UTF-16, không để lại nửa surrogate pair.
const catDonVi = (s: string, n: number) => { let r = ""; for (const ch of s) { if (r.length + ch.length > n) break; r += ch; } return r; };
const sach = (s: string) => thoat(s.replaceAll(DAU_BOT, "").replace(/\s+/g, " ").trim());

/** `threadId`: webhook của kênh Forum bắt buộc đăng vào một bài (thiếu → Discord trả 400). */
export function taoBao(webhook: string, fetchImpl: typeof fetch = fetch, threadId?: string) {
  const url = threadId ? `${webhook}?thread_id=${encodeURIComponent(threadId)}` : webhook;
  const gui = async (content: string, ping?: string) => {
    let r: Response;
    try {
      r = await fetchImpl(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: catDonVi(content, 2000), allowed_mentions: { parse: [], roles: ping ? [ping] : [] } }),
        signal: AbortSignal.timeout(15_000),
      });
    } catch { throw new Error("DISCORD_MANG"); } // lỗi gốc có thể chứa URL webhook (token) → chỉ ném mã
    if (!r.ok) throw new Error(`DISCORD_HTTP_${r.status}`);
  };
  return {
    daGui: (o: { kenh: string; nhom: string; tomTat: string; tin: string[]; thu: boolean }) =>
      gui([`✉️ ${o.thu ? "THỬ — chưa gửi · " : ""}${o.kenh} · ${o.nhom} · ${sach(o.tomTat)}`, ...o.tin.map((t) => sach(t))].join("\n")),
    chuyenNguoi: (o: { kenh: string; nhom: string; lyDo: string; tomTat: string; khieuNai: boolean; ping?: string }) =>
      gui(`🙋 ${o.khieuNai ? `🔴 ${o.ping ? `<@&${o.ping}> ` : ""}` : ""}${o.kenh} · ${o.nhom} · ${sach(o.lyDo)} · ${sach(o.tomTat)}`, o.khieuNai ? o.ping : undefined),
    loi: (o: { kenh: string; ma: string }) => gui(`⚠️ ${o.kenh} · gửi hỏng ${sach(o.ma)} — NV trả lời giúp`),
  };
}
