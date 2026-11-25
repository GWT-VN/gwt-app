// chép từ GWT-ERP tests/chatbot/pancake-gui-khach.test.ts @c2f3719 (bỏ ca ảnh)
import { describe, expect, it, vi } from "vitest";

import { GuiKhachError, taoGuiKhach } from "./gui-khach.ts";

const traVe = (status: number, body: unknown) => vi.fn<typeof fetch>(async () => new Response(JSON.stringify(body), { status }));

describe("taoGuiKhach — cửa DUY NHẤT gửi tin cho khách qua Pancake", () => {
  it("POST v1 …/conversations/<id>/messages, body { action: reply_inbox, message }, token ở query; trả id tin", async () => {
    const f = traVe(200, { success: true, id: "m_1" });
    expect(await taoGuiKhach("435158503014641", "tok/en", f).gui("c 1", "Dạ ạ")).toBe("m_1");
    const [url, init] = f.mock.calls[0];
    const u = new URL(String(url));
    expect(u.origin + u.pathname).toBe("https://pages.fm/api/public_api/v1/pages/435158503014641/conversations/c%201/messages");
    expect(u.searchParams.get("page_access_token")).toBe("tok/en");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({ action: "reply_inbox", message: "Dạ ạ" });
  });
  it("HTTP 200 mà success false → ném mã có message_code (Pancake: 200 chưa chắc đã gửi)", async () => {
    await expect(taoGuiKhach("p", "t", traVe(200, { success: false, message_code: "out_of_window" })).gui("c", "x"))
      .rejects.toThrow("GUI_KHACH_out_of_window");
  });
  it("HTTP lỗi → GUI_KHACH_HTTP_<mã>; mạng hỏng → GUI_KHACH_MANG; mã lạ được làm sạch, ≤ 64 ký tự", async () => {
    await expect(taoGuiKhach("p", "t", traVe(429, {})).gui("c", "x")).rejects.toThrow("GUI_KHACH_HTTP_429");
    await expect(taoGuiKhach("p", "t", vi.fn<typeof fetch>(async () => { throw new Error("x"); })).gui("c", "x")).rejects.toThrow("GUI_KHACH_MANG");
    const e = await taoGuiKhach("p", "t", traVe(200, { success: false, message_code: `bad code-${"x".repeat(90)}` })).gui("c", "x").catch((x: Error) => x);
    expect((e as Error).message).toMatch(/^GUI_KHACH_[A-Za-z0-9_]+$/);
    expect((e as Error).message.length).toBeLessThanOrEqual(64);
  });
});

describe("taoGuiKhach — không thử lại", () => {
  it("lỗi mạng / 429 / success:false: fetch giả chỉ được gọi đúng 1 lần, lỗi là GuiKhachError có code", async () => {
    for (const f of [vi.fn<typeof fetch>(async () => { throw new Error("x"); }), traVe(429, {}), traVe(200, { success: false, message_code: "X" })]) {
      const e = await taoGuiKhach("p", "t", f).gui("c", "x").catch((x) => x);
      expect(e).toBeInstanceOf(GuiKhachError);
      expect(e.code).toBe(e.message);
      expect(f).toHaveBeenCalledTimes(1);
    }
    await expect(taoGuiKhach("p", "t", traVe(200, { success: false, message_code: "X" })).gui("c", "x")).rejects.toThrow("GUI_KHACH_X");
  });
});

