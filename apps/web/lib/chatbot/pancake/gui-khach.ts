// chép từ GWT-ERP lib/chatbot/kenh/pancake/gui-khach.ts @c2f3719 (bỏ guiAnh/taiLenAnh/TepGui)
/**
 * CỬA DUY NHẤT gửi gì đó tới khách qua Pancake (đã chốt 2026-10-20) — mọi file khác trong thư mục này vẫn chỉ GET (guard
 * chi-mot-cua-gui.test.ts). Bản này chỉ gửi chữ (`reply_inbox`; ảnh bỏ). Chỉ được tạo khi tự gửi bật / lệnh gửi thử gõ GUI.
 * Pancake trả HTTP 200 cả khi chưa gửi được → phải xem `success` (openapi: "200 does not guarantee the message was sent").
 */
const GOC = "https://pages.fm/api/public_api/v1";
export class GuiKhachError extends Error {
  readonly code: string;
  constructor(code: string) { super(code); this.code = code; this.name = "GuiKhachError"; }
}

const sachMa = (s: unknown) => (typeof s === "string" ? s.replace(/[^A-Za-z0-9_]/g, "_").slice(0, 54) : "");

export function taoGuiKhach(
  pageId: string, token: string, fetchImpl: typeof fetch = fetch,
) {
  const url = (duoi: string) => {
    const u = new URL(`${GOC}/pages/${encodeURIComponent(pageId)}${duoi}`);
    u.searchParams.set("page_access_token", token);
    return u;
  };
  const gui = (u: URL, body: string) => fetchImpl(u, {
    method: "POST", headers: { "content-type": "application/json" }, body,
    signal: AbortSignal.timeout(15_000),
  });

  /** Một tin `reply_inbox`; trả id tin. Hỏng → `GUI_KHACH_*`, KHÔNG thử lại: gửi trùng cho khách tệ hơn gửi thiếu. */
  async function guiTin(conversationId: string, noiDung: { message: string }): Promise<string> {
    let r: Response;
    try {
      r = await gui(url(`/conversations/${encodeURIComponent(conversationId)}/messages`), JSON.stringify({ action: "reply_inbox", ...noiDung }));
    } catch { throw new GuiKhachError("GUI_KHACH_MANG"); }
    if (!r.ok) throw new GuiKhachError(`GUI_KHACH_HTTP_${r.status}`);
    const j = (await r.json().catch(() => null)) as { success?: unknown; id?: unknown; message_code?: unknown } | null;
    if (j?.success === true && typeof j.id === "string" && j.id) return j.id;
    const ma = sachMa(j?.message_code);
    throw new GuiKhachError(ma ? `GUI_KHACH_${ma}` : "GUI_KHACH_THAT_BAI");
  }

  return {
    /** Tin chữ. */
    gui: (conversationId: string, message: string): Promise<string> => guiTin(conversationId, { message }),
  };
}
