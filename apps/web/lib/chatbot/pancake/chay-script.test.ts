import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { chonGui, docCauHinhChay, doThuMucDem, docEnvText, docThamSo, napEnv, taoDem } from "./chay-script.ts";

describe("docEnvText", () => {
  it("bỏ comment, nháy giữ nguyên ' #', giá trị trần cắt comment cuối dòng", () => {
    expect(docEnvText('# c\nA=1 # x\nB="a # b"\nC=\'q\'\n\nD=x=y\nkhongdau')).toEqual({ A: "1", B: "a # b", C: "q", D: "x=y" });
  });
});
describe("docThamSo", () => {
  it("--kho", () => { expect(docThamSo(["--kho"]).kho).toBe(true); expect(docThamSo([]).kho).toBe(false); });
});
describe("docCauHinhChay", () => {
  const env = {
    PANCAKE_TU_GUI: "bat", PANCAKE_PAGES: '[{"id":"123456","ten":"A"}]', PANCAKE_PAGE_TOKEN_123456: "t", PANCAKE_TU_GUI_TRANG: "123456",
    PANCAKE_HOTLINE: "0123456789", DISCORD_WEBHOOK_PANCAKE_BAO: "w", SUPABASE_URL: "u", SUPABASE_SERVICE_ROLE_KEY: "k",
    ANTHROPIC_API_KEY: "a", OPENAI_API_KEY: "o",
  };
  it("thiếu PANCAKE_TRA_LOI_MODEL → loi", () => {
    expect(docCauHinhChay(env, false)).toEqual({ loi: "thiếu PANCAKE_TRA_LOI_MODEL" });
  });
  it("--kho ép chế độ thu", () => {
    const r = docCauHinhChay({ ...env, PANCAKE_TRA_LOI_MODEL: "m" }, true);
    expect("ch" in r && r.ch.cheDo).toBe("thu");
    const r2 = docCauHinhChay({ ...env, PANCAKE_TRA_LOI_MODEL: "m" }, false);
    expect("ch" in r2 && r2.ch.cheDo).toBe("bat");
  });
});
describe("taoDem", () => {
  it("đếm, sang ngày VN thì về 0, file hỏng = 0, tạo thư mục", () => {
    const dir = join(mkdtempSync(join(tmpdir(), "dem-")), "con");
    let t = new Date("2026-11-25T10:00:00Z");
    const d = taoDem(dir, "p1", () => t);
    expect(d.doc()).toBe(0);
    d.tang(); d.tang();
    expect(d.doc()).toBe(2);
    t = new Date("2026-11-25T16:59:00Z"); // 23:59 VN, cùng ngày
    expect(d.doc()).toBe(2);
    t = new Date("2026-11-25T17:01:00Z"); // 00:01 VN hôm sau
    expect(d.doc()).toBe(0);
    d.tang();
    expect(JSON.parse(readFileSync(join(dir, "pancake-app-dem-p1.json"), "utf8"))).toEqual({ ngay: "2026-11-26", so: 1 });
    writeFileSync(join(dir, "pancake-app-dem-p1.json"), "{hỏng");
    expect(d.doc()).toBe(0);
  });
});

describe("napEnv", () => {
  it("khoá của file vào được process.env; inline thắng file; trùng khoá trong file: dòng sau thắng", () => {
    const proc: Record<string, string | undefined> = { PANCAKE_TU_GUI: "thu" };
    napEnv(proc, docEnvText("PANCAKE_TU_GUI=bat\nOPENAI_API_KEY=a\nOPENAI_API_KEY=b"));
    expect(proc).toEqual({ PANCAKE_TU_GUI: "thu", OPENAI_API_KEY: "b" });
  });
});
describe("doThuMucDem", () => {
  it("ghi được → true; không ghi được → false", () => {
    const dir = mkdtempSync(join(tmpdir(), "dem-"));
    expect(doThuMucDem(dir)).toBe(true);
    const tep = join(dir, "la-file"); writeFileSync(tep, "");
    expect(doThuMucDem(join(tep, "con"))).toBe(false);
  });
  it("tang() không ném khi thư mục hỏng", () => {
    const dir = mkdtempSync(join(tmpdir(), "dem-")); const tep = join(dir, "f"); writeFileSync(tep, "");
    expect(() => taoDem(join(tep, "con"), "p")["tang"]()).not.toThrow();
  });
});
describe("chonGui", () => {
  const env = {
    PANCAKE_PAGES: '[{"id":"123456","ten":"A"}]', PANCAKE_PAGE_TOKEN_123456: "t", PANCAKE_TU_GUI_TRANG: "123456", PANCAKE_HOTLINE: "0123456789",
    DISCORD_WEBHOOK_PANCAKE_BAO: "w", SUPABASE_URL: "u", SUPABASE_SERVICE_ROLE_KEY: "k", ANTHROPIC_API_KEY: "a", OPENAI_API_KEY: "o", PANCAKE_TRA_LOI_MODEL: "m",
  };
  const gui = async () => "id";
  const dung = (che: string, kho: boolean) => {
    const r = docCauHinhChay({ ...env, PANCAKE_TU_GUI: che }, kho);
    if (!("ch" in r)) throw new Error("cau hinh");
    let goi = 0;
    const g = chonGui(r.ch.cheDo, "123456", "t", () => { goi += 1; return { gui }; });
    return { g, goi };
  };
  it("chỉ bat mới có cửa gửi; thu và --kho thì không dựng", () => {
    expect(dung("bat", false).g).toBe(gui);
    expect(dung("thu", false)).toEqual({ g: undefined, goi: 0 });
    expect(dung("bat", true)).toEqual({ g: undefined, goi: 0 });
  });
});
