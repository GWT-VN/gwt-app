import { describe, expect, it } from "vitest";

import { docCauHinh, trongGioBot, type CauHinh } from "./cau-hinh.ts";

const TOKEN = "BIMAT.TOKEN.FAKE";
const env = (extra: Record<string, string | undefined> = {}) => ({
  PANCAKE_TU_GUI: "thu",
  PANCAKE_PAGES: JSON.stringify([{ id: "111111", ten: "Lọc tổng" }, { id: "pzl_709301169730155182", ten: "Zalo" }]),
  PANCAKE_PAGE_TOKEN_111111: TOKEN,
  PANCAKE_PAGE_TOKEN_pzl_709301169730155182: TOKEN,
  PANCAKE_TU_GUI_TRANG: "111111",
  PANCAKE_HOTLINE: "1900 1234",
  PANCAKE_TRA_LOI_MODEL: "gpt-fake",
  DISCORD_WEBHOOK_PANCAKE_BAO: "https://discord.example/webhook",
  SUPABASE_URL: "https://x.supabase.example", SUPABASE_SERVICE_ROLE_KEY: "k", ANTHROPIC_API_KEY: "a", OPENAI_API_KEY: "o",
  ...extra,
});
const ok = (e: Record<string, string | undefined>) => {
  const r = docCauHinh(e);
  if (!("ch" in r)) throw new Error(r.loi);
  return r.ch;
};
// giờ VN → Date UTC (2026-11-23 là thứ Hai, 2026-11-29 là Chủ nhật)
const VN = (ngay: number, hhmm: string) => new Date(`2026-11-${ngay}T${hhmm}:00+07:00`);

describe("docCauHinh", () => {
  it("DISCORD_PANCAKE_BAO_THREAD: tuỳ chọn, chỉ chữ số", () => {
    expect(ok(env()).baoThread).toBeUndefined();
    expect(ok(env({ DISCORD_PANCAKE_BAO_THREAD: " 1234567890 " })).baoThread).toBe("1234567890");
    expect(docCauHinh(env({ DISCORD_PANCAKE_BAO_THREAD: "abc" }))).toEqual({ loi: "DISCORD_PANCAKE_BAO_THREAD phải là id thread Discord (chữ số)" });
  });
  it("vắng PANCAKE_TU_GUI → tat, mặc định giờ/trần/model, không đòi biến khác", () => {
    const ch = ok({});
    expect(ch).toMatchObject({ cheDo: "tat", tranNgay: 20, modelPhanLoai: "claude-sonnet-5-5", gioBot: null });
    expect(ch.gioLam.tu).toBe(480);
  });
  it("thu đủ biến → ch; demDir mặc định mở rộng ~", () => {
    const ch = ok(env({ PANCAKE_GIO_BOT: "18:00-22:00", PANCAKE_TRAN_NGAY: "5" }));
    expect(ch.trangGui).toEqual(new Set(["111111"]));
    expect(ch.gioBot).toEqual({ tu: 1080, den: 1320 });
    expect(ch.tranNgay).toBe(5);
    expect(ch.demDir.startsWith("~")).toBe(false);
    expect(ch.demDir.endsWith("/Bots/state")).toBe(true);
  });
  it("R1: pzl_ / spo_ trong PANCAKE_TU_GUI_TRANG → loi", () => {
    expect(docCauHinh(env({ PANCAKE_TU_GUI_TRANG: "pzl_709301169730155182" }))).toHaveProperty("loi");
    expect(docCauHinh(env({
      PANCAKE_PAGES: JSON.stringify([{ id: "spo_1254020613", ten: "Shopee" }]), PANCAKE_PAGE_TOKEN_spo_1254020613: TOKEN,
      PANCAKE_TU_GUI_TRANG: "spo_1254020613",
    }))).toHaveProperty("loi");
  });
  it.each([
    ["PANCAKE_TRA_LOI_MODEL", { PANCAKE_TRA_LOI_MODEL: "" }],
    ["PANCAKE_HOTLINE", { PANCAKE_HOTLINE: "abc" }],
    ["PANCAKE_TU_GUI_TRANG", { PANCAKE_TU_GUI_TRANG: "" }],
    ["PANCAKE_PAGES", { PANCAKE_PAGES: "{" }],
    ["PANCAKE_PAGE_TOKEN_111111", { PANCAKE_PAGE_TOKEN_111111: undefined }],
    ["PANCAKE_GIO_LAM", { PANCAKE_GIO_LAM: "xx" }],
    ["PANCAKE_GIO_BOT", { PANCAKE_GIO_BOT: "25:00-22:00" }],
    ["PANCAKE_TRAN_NGAY", { PANCAKE_TRAN_NGAY: "0" }],
    ["PANCAKE_TRAN_NGAY", { PANCAKE_TRAN_NGAY: "1e21" }],
    ["PANCAKE_TRAN_NGAY", { PANCAKE_TRAN_NGAY: "0x10" }],
    ["PANCAKE_TRAN_NGAY", { PANCAKE_TRAN_NGAY: "1001" }],
    ["PANCAKE_TU_GUI", { PANCAKE_TU_GUI: "co" }],
    ["DISCORD_WEBHOOK_PANCAKE_BAO", { DISCORD_WEBHOOK_PANCAKE_BAO: undefined }],
    ["OPENAI_API_KEY", { OPENAI_API_KEY: undefined }],
    ["SUPABASE_SERVICE_ROLE_KEY", { SUPABASE_SERVICE_ROLE_KEY: undefined }],
  ])("sai/thiếu %s → loi nêu tên biến, không lộ token", (ten, extra) => {
    const r = docCauHinh(env(extra));
    expect(r).toHaveProperty("loi");
    const loi = (r as { loi: string }).loi;
    expect(loi).toContain(ten);
    expect(loi).not.toContain("BIMAT");
  });
});

describe("trongGioBot (R2)", () => {
  const g = (gioBot: CauHinh["gioBot"] = null) => ({ gioLam: ok({}).gioLam, gioBot });
  it("thứ 2 10:00 (giờ làm) → false; thứ 2 19:00 → true; CN 10:00 → true", () => {
    expect(trongGioBot(VN(23, "10:00"), g())).toBe(false);
    expect(trongGioBot(VN(23, "19:00"), g())).toBe(true);
    expect(trongGioBot(VN(29, "10:00"), g())).toBe(true);
  });
  it("gioBot 18:00-22:00: 23:00 → false, 19:00 → true", () => {
    const b = { tu: 1080, den: 1320 };
    expect(trongGioBot(VN(23, "23:00"), g(b))).toBe(false);
    expect(trongGioBot(VN(23, "19:00"), g(b))).toBe(true);
  });
  it("biên giờ làm: 08:00 false, 07:59 true, 18:00 true, 17:59 false; CN 10:00 true", () => {
    expect(trongGioBot(VN(23, "08:00"), g())).toBe(false);
    expect(trongGioBot(VN(23, "07:59"), g())).toBe(true);
    expect(trongGioBot(VN(23, "18:00"), g())).toBe(true);
    expect(trongGioBot(VN(23, "17:59"), g())).toBe(false);
    expect(trongGioBot(VN(29, "10:00"), g())).toBe(true);
  });
  it("biên gioBot 18:00-22:00: 21:59 true, 22:00 false", () => {
    const b = { tu: 1080, den: 1320 };
    expect(trongGioBot(VN(23, "21:59"), g(b))).toBe(true);
    expect(trongGioBot(VN(23, "22:00"), g(b))).toBe(false);
  });
  it("gioBot qua nửa đêm 22:00-06:00: 23:30 true, 05:59 true, 06:00 false", () => {
    const b = { tu: 1320, den: 360 };
    expect(trongGioBot(VN(23, "23:30"), g(b))).toBe(true);
    expect(trongGioBot(VN(24, "05:59"), g(b))).toBe(true);
    expect(trongGioBot(VN(24, "06:00"), g(b))).toBe(false);
  });
  it("PANCAKE_TRAN_NGAY 1000 nhận", () => expect(ok(env({ PANCAKE_TRAN_NGAY: "1000" })).tranNgay).toBe(1000));
});
