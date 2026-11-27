import { describe, expect, it, vi } from "vitest";
import { taoBao } from "./bao.ts";
import { DAU_BOT } from "./loc.ts";

function gia(status = 204) {
  const goi: { url: string; body: { content: string; allowed_mentions: unknown } }[] = [];
  const f = (async (url: string, init: { body: string }) => {
    goi.push({ url, body: JSON.parse(init.body) });
    return new Response(null, { status });
  }) as unknown as typeof fetch;
  return { goi, f };
}

describe("taoBao", () => {
  it("daGui: dòng đầu rồi khối trích dẫn, bỏ U+2063, tin cách nhau dòng trích trống", async () => {
    const { goi, f } = gia();
    await taoBao("https://d/x", f).daGui({ kenh: "Fanpage", nhom: "hoi_gia", tomTat: "hỏi giá", tin: [`Dạ chào${DAU_BOT}`, "ạ"], thu: false });
    expect(goi).toHaveLength(1);
    expect(goi[0].url).toBe("https://d/x");
    expect(goi[0].body.content).toBe("✉️ Fanpage · hoi_gia · hỏi giá\n> Dạ chào\n> \u200b\n> ạ");
    expect(goi[0].body.content).not.toContain(DAU_BOT);
    expect(goi[0].body.allowed_mentions).toEqual({ parse: [], roles: [] });
  });
  it("daGui thử", async () => {
    const { goi, f } = gia();
    await taoBao("w", f).daGui({ kenh: "K", nhom: "n", tomTat: "t", tin: [], thu: true });
    expect(goi[0].body.content).toBe("✉️ THỬ — chưa gửi · K · n · t");
  });
  it("sdt: báo khách để lại SĐT, không có số trong tin", async () => {
    const f = vi.fn(async () => new Response(null, { status: 204 }));
    await taoBao("w", f as never).sdt({ kenh: "Lọc tổng", nhom: "tu_van", tomTat: "muốn tư vấn lọc tổng" });
    const body = JSON.parse((f.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(body.content).toBe("📞 Lọc tổng · khách để lại SĐT chờ tư vấn · tu_van · muốn tư vấn lọc tổng — NV gọi lại giúp");
  });
  it("chuyenNguoi: khiếu nại thêm 🔴 + ping role", async () => {
    const { goi, f } = gia();
    const b = taoBao("w", f);
    await b.chuyenNguoi({ kenh: "K", nhom: "n", lyDo: "gấp", tomTat: "t", khieuNai: true, ping: "123" });
    expect(goi[0].body.content).toBe("🙋 🔴 <@&123> K · n · gấp · t");
    expect(goi[0].body.allowed_mentions).toEqual({ parse: [], roles: ["123"] });
    await b.chuyenNguoi({ kenh: "K", nhom: "n", lyDo: "x", tomTat: "t", khieuNai: false, ping: "123" });
    expect(goi[1].body.content).toBe("🙋 K · n · x · t");
    expect(goi[1].body.allowed_mentions).toEqual({ parse: [], roles: [] });
  });
  it("loi", async () => {
    const { goi, f } = gia();
    await taoBao("w", f).loi({ kenh: "K", ma: "E1" });
    expect(goi[0].body.content).toBe("⚠️ K · gửi hỏng E1 — NV trả lời giúp");
  });
  it("thoát @everyone/markdown trong chữ của khách", async () => {
    const { goi, f } = gia();
    await taoBao("w", f).daGui({ kenh: "K", nhom: "n", tomTat: "**a**", tin: ["@everyone [x](y)"], thu: false });
    expect(goi[0].body.content).toContain("\\*\\*a\\*\\*");
    expect(goi[0].body.content).not.toContain("@everyone");
    expect(goi[0].body.content).toContain("\\[x\\](y)");
  });
  it("giữ xuống dòng + gạch đầu dòng của tin, # đầu dòng không thành tiêu đề", async () => {
    const { goi, f } = gia();
    await taoBao("w", f).daGui({ kenh: "K", nhom: "n", tomTat: "t", tin: ["Dạ, giá:\n\n\n\n•  A: 1đ\n# B"], thu: true });
    expect(goi[0].body.content).toBe("✉️ THỬ — chưa gửi · K · n · t\n> Dạ, giá:\n> \u200b\n> • A: 1đ\n> \\# B");
  });
  it("cắt 2000, không xẻ surrogate", async () => {
    const { goi, f } = gia();
    await taoBao("w", f).daGui({ kenh: "K", nhom: "n", tomTat: "t", tin: ["😀".repeat(3000)], thu: false });
    expect(goi[0].body.content.length).toBeLessThanOrEqual(2000);
  });
  it("kênh Forum: có threadId → đăng vào bài đó (?thread_id=)", async () => {
    const { goi, f } = gia();
    await taoBao("https://d/x", f, "1234567890").loi({ kenh: "K", ma: "E" });
    expect(goi[0].url).toBe("https://d/x?thread_id=1234567890");
  });
  it("HTTP lỗi → DISCORD_HTTP_<status>", async () => {
    const { f } = gia(500);
    await expect(taoBao("w", f).loi({ kenh: "K", ma: "E" })).rejects.toThrow("DISCORD_HTTP_500");
  });
  it("fetch ném → chỉ mã DISCORD_MANG, không lộ URL", async () => {
    const f = (async () => { throw new TypeError("Failed to parse URL from https://d/secret-token"); }) as unknown as typeof fetch;
    await expect(taoBao("https://d/secret-token", f).loi({ kenh: "K", ma: "E" })).rejects.toThrow(/^DISCORD_MANG$/);
  });
});
