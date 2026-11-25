// chép từ GWT-ERP tests/chatbot/pancake-doc.test.ts @c2f3719 (bỏ ca dsQuangCao)
import { describe, expect, it, vi } from "vitest";

import { PancakeError, taoPancake } from "./doc.ts";

const traJson = (body: unknown, status = 200) => vi.fn(async () => new Response(JSON.stringify(body), { status }));

describe("taoPancake", () => {
  it("dsHoiThoai: GET v2, đủ query, trả mảng conversations", async () => {
    const f = traJson({ conversations: [{ id: "c1", type: "INBOX", seen: false }] });
    const ds = await taoPancake("P1", "BIMAT", f as never).dsHoiThoai({ since: 100, until: 200, truocId: "c0" });
    expect(ds).toHaveLength(1);
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    const u = new URL(url);
    expect(u.origin + u.pathname).toBe("https://pages.fm/api/public_api/v2/pages/P1/conversations");
    expect(Object.fromEntries(u.searchParams)).toEqual({
      page_access_token: "BIMAT", type: "INBOX", order_by: "updated_at", since: "100", until: "200", last_conversation_id: "c0",
    });
    expect(init.method).toBe("GET");
  });

  it("tinNhan: GET v1 messages, trả mảng messages", async () => {
    const f = traJson({ success: true, messages: [{ id: "m1", message: "x", inserted_at: "t", from: {} }] });
    const ds = await taoPancake("P1", "BIMAT", f as never).tinNhan("c 1");
    expect(ds[0].id).toBe("m1");
    const [url] = f.mock.calls[0] as unknown as [string];
    expect(new URL(url).pathname).toBe("/api/public_api/v1/pages/P1/conversations/c%201/messages");
  });

  it("HTTP lỗi → PancakeError mã + status, không chứa token", async () => {
    const e = await taoPancake("P1", "BIMAT", traJson({}, 401) as never).dsHoiThoai({ since: 1, until: 2 }).catch((x) => x);
    expect(e).toBeInstanceOf(PancakeError);
    expect(e.status).toBe(401);
    expect(e.message).toBe("PANCAKE_HTTP_401");
    expect(String(e.message) + String(e.stack)).not.toContain("BIMAT");
  });

  it("fetch ném (URL có token trong lỗi gốc) → mã ngắn, không lộ token", async () => {
    const f = vi.fn(async () => { throw new Error("connect fail https://pages.fm/x?page_access_token=BIMAT"); });
    const e = await taoPancake("P1", "BIMAT", f as never).tinNhan("c1").catch((x) => x);
    expect(e.message).toBe("PANCAKE_UNREACHABLE");
    expect(e.status).toBeNull();
    expect(String(e.message)).not.toContain("BIMAT");
  });

  it("200 + success:false (đo thật: token sai → error_code 102) → PancakeError; 102 mang status 401, không lộ token", async () => {
    const e = await taoPancake("P1", "BIMAT", traJson({ success: false, error_code: 102, message: "Invalid access_token" }) as never)
      .dsHoiThoai({ since: 1, until: 2 }).catch((x) => x);
    expect(e).toBeInstanceOf(PancakeError);
    expect([e.message, e.status]).toEqual(["PANCAKE_LOI_102", 401]);
    expect(String(e.message)).not.toContain("BIMAT");
    const e2 = await taoPancake("P1", "T", traJson({ success: false, error_code: 105 }) as never).tinNhan("c").catch((x) => x);
    expect([e2.message, e2.status]).toEqual(["PANCAKE_LOI_105", 200]);
    const e3 = await taoPancake("P1", "T", traJson({ success: false }) as never).tinNhan("c").catch((x) => x);
    expect(e3.message).toBe("PANCAKE_LOI_0");
  });

  it("200 nhưng body không phải JSON hoặc thiếu mảng → PANCAKE_BAD_BODY", async () => {
    const f = vi.fn(async () => new Response("<html>", { status: 200 }));
    await expect(taoPancake("P1", "T", f as never).dsHoiThoai({ since: 1, until: 2 })).rejects.toThrow("PANCAKE_BAD_BODY");
    await expect(taoPancake("P1", "T", traJson({ ok: 1 }) as never).tinNhan("c")).rejects.toThrow("PANCAKE_BAD_BODY");
  });

  it("tinNhan {trang}: đọc lùi bằng current_count = số tin đã có, bỏ tin trùng ở trang sau, dừng khi trang thiếu", async () => {
    const tin = (id: number) => ({ id: `m${id}`, message: "x", inserted_at: new Date(Date.UTC(2026, 9, 1, 0, id)).toISOString(), from: {} });
    const trang = (tu: number, so: number) => ({ messages: Array.from({ length: so }, (_, i) => tin(tu - i)) });
    const f = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(trang(100, 30))))
      .mockResolvedValueOnce(new Response(JSON.stringify(trang(71, 30)))) // trùng m71 của trang 1
      .mockResolvedValueOnce(new Response(JSON.stringify(trang(42, 5))));
    const nghi = vi.fn(async () => {});
    const ms = await taoPancake("P1", "T", f as never, nghi).tinNhan("c", { trang: 9 });
    expect(f).toHaveBeenCalledTimes(3);
    expect(f.mock.calls.map(([u]) => new URL(u as string).searchParams.get("current_count"))).toEqual([null, "30", "59"]);
    expect(ms).toHaveLength(63); // 30 + 29 (bỏ m71) + 4 (bỏ m42)
    expect(new Set(ms.map((m) => m.id)).size).toBe(63);
    expect(ms[0].id).toBe("m100");
    // Nghỉ 250 ms trước MỖI trang sau trang đầu (đo 2026-10-21: đọc 20 trang liền → 429), không nghỉ trước trang đầu.
    expect(nghi.mock.calls).toEqual([[250], [250]]);
    const g = traJson({ messages: trang(10, 30).messages });
    await taoPancake("P1", "T", g as never, async () => {}).tinNhan("c", { trang: 9 });
    expect(g).toHaveBeenCalledTimes(2); // trang 2 toàn tin trùng → dừng
  });

  it("429 (2026-10-23): chờ rồi gọi lại tối đa 3 lần — 1 s, 2 s, 3 s, hoặc theo Retry-After (≤ 5 s); vẫn 429 thì ném PANCAKE_HTTP_429", async () => {
    const r429 = (h: Record<string, string> = {}) => new Response("{}", { status: 429, headers: h });
    const ok = () => new Response(JSON.stringify({ messages: [{ id: "m1", message: "x", inserted_at: "t", from: {} }] }));
    const f = vi.fn().mockResolvedValueOnce(r429()).mockResolvedValueOnce(r429({ "retry-after": "9" })).mockResolvedValueOnce(ok());
    const nghi = vi.fn(async () => {});
    expect((await taoPancake("P1", "T", f as never, nghi).tinNhan("c"))[0].id).toBe("m1");
    expect(nghi.mock.calls).toEqual([[1000], [5000]]);
    const g = vi.fn(async () => r429());
    const nghi2 = vi.fn(async () => {});
    await expect(taoPancake("P1", "T", g as never, nghi2).tinNhan("c")).rejects.toMatchObject({ code: "PANCAKE_HTTP_429", status: 429 });
    expect(g).toHaveBeenCalledTimes(4);
    expect(nghi2.mock.calls).toEqual([[1000], [2000], [3000]]);
  });

  it("tinNhan một trang (job phút) không nghỉ", async () => {
    const nghi = vi.fn(async () => {});
    await taoPancake("P1", "T", traJson({ messages: [] }) as never, nghi).tinNhan("c");
    expect(nghi).not.toHaveBeenCalled();
  });

  it("tinNhan {trang}: trần 20 trang (quét lịch sử đọc hết cuộc dài), xin 99 vẫn chỉ 20 lần", async () => {
    const tin = (id: number) => ({ id: `m${id}`, message: "x", inserted_at: new Date(Date.UTC(2026, 9, 1, 0, 0, id)).toISOString(), from: {} });
    let n = 0;
    const f = vi.fn(async () => new Response(JSON.stringify({ messages: Array.from({ length: 30 }, () => tin((n += 1))) })));
    const ms = await taoPancake("P1", "T", f as never, async () => {}).tinNhan("c", { trang: 99 });
    expect(f).toHaveBeenCalledTimes(20);
    expect(ms).toHaveLength(600);
  });

  it("giờ không có múi → thêm Z (giả định UTC); có Z hoặc +07:00 giữ nguyên; chỉ đổi đúng một trường", async () => {
    const hang = (updated_at: string) => ({ id: "c", type: "INBOX", seen: false, updated_at });
    const ds = await taoPancake("P1", "T", traJson({
      conversations: [hang("2026-10-14T03:53:23.000000"), hang("2026-10-14T03:53:23.000Z"), hang("2026-10-14T10:53:23+07:00")],
    }) as never).dsHoiThoai({ since: 1, until: 2 });
    expect(ds.map((h) => h.updated_at)).toEqual(["2026-10-14T03:53:23.000000Z", "2026-10-14T03:53:23.000Z", "2026-10-14T10:53:23+07:00"]);
    expect(ds[0]).toEqual({ id: "c", type: "INBOX", seen: false, updated_at: "2026-10-14T03:53:23.000000Z" });
    const tin = (inserted_at: string) => ({ id: "m", message: "x", inserted_at, from: {} });
    const ms = await taoPancake("P1", "T", traJson({
      messages: [tin("2026-10-14T03:53:23.000000"), tin("2026-10-14T03:53:23Z"), tin("2026-10-14T10:53:23+0700")],
    }) as never).tinNhan("c");
    expect(ms.map((m) => m.inserted_at)).toEqual(["2026-10-14T03:53:23.000000Z", "2026-10-14T03:53:23Z", "2026-10-14T10:53:23+0700"]);
  });

  it("tinNhan: xếp tin mới nhất đứng đầu dù API trả tăng dần (loc.ts đi từ đầu mảng)", async () => {
    const tin = (id: string, inserted_at: string) => ({ id, message: "x", inserted_at, from: {} });
    const ms = await taoPancake("P1", "T", traJson({
      messages: [tin("m1", "2026-10-14T03:01:00.000000"), tin("m2", "2026-10-14T03:02:00.000000"), tin("m3", "2026-10-14T03:03:00.000000")],
    }) as never).tinNhan("c");
    expect(ms.map((m) => m.id)).toEqual(["m3", "m2", "m1"]);
    const giam = await taoPancake("P1", "T", traJson({
      messages: [tin("m3", "2026-10-14T03:03:00.000000"), tin("m2", "2026-10-14T03:02:00.000000")],
    }) as never).tinNhan("c");
    expect(giam.map((m) => m.id)).toEqual(["m3", "m2"]); // đã giảm dần thì giữ nguyên
  });

  it("giờ đã chuẩn hoá cho cùng một thời điểm dù TZ của tiến trình là gì", async () => {
    const tzGoc = process.env.TZ;
    try {
      for (const tz of ["UTC", "Asia/Ho_Chi_Minh", "America/Los_Angeles"]) {
        process.env.TZ = tz;
        const [h] = await taoPancake("P1", "T", traJson({ conversations: [{ id: "c", updated_at: "2026-10-14T03:53:23.000000" }] }) as never)
          .dsHoiThoai({ since: 1, until: 2 });
        expect(Date.parse(h.updated_at)).toBe(Date.UTC(2026, 9, 14, 3, 53, 23));
      }
    } finally {
      if (tzGoc === undefined) delete process.env.TZ; else process.env.TZ = tzGoc;
    }
  });
});
