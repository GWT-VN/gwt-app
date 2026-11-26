import { describe, expect, it } from "vitest";
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
  it("daGui: một dòng đầu rồi các tin, bỏ U+2063", async () => {
    const { goi, f } = gia();
    await taoBao("https://d/x", f).daGui({ kenh: "Fanpage", nhom: "hoi_gia", tomTat: "hỏi giá", tin: [`Dạ chào${DAU_BOT}`, "ạ"], thu: false });
    expect(goi).toHaveLength(1);
    expect(goi[0].url).toBe("https://d/x");
    expect(goi[0].body.content).toBe("✉️ Fanpage · hoi_gia · hỏi giá\nDạ chào\nạ");
    expect(goi[0].body.content).not.toContain(DAU_BOT);
    expect(goi[0].body.allowed_mentions).toEqual({ parse: [], roles: [] });
  });
  it("daGui thử", async () => {
    const { goi, f } = gia();
    await taoBao("w", f).daGui({ kenh: "K", nhom: "n", tomTat: "t", tin: [], thu: true });
    expect(goi[0].body.content).toBe("✉️ THỬ — chưa gửi · K · n · t");
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
    expect(goi[0].body.content).toContain("\\[x\\]\\(y\\)");
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
