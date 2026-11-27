// chép từ GWT-ERP tests/chatbot/pancake-so-cuoc.test.ts @c2f3719
import { describe, expect, it } from "vitest";

import { chuanSoCuoc } from "./so-cuoc.ts";

describe("chuanSoCuoc — sổ cuộc chat (đã chốt 2026-10-21)", () => {
  it("che PII, gộp khoảng trắng, bỏ trùng, bỏ mục rỗng / không phải chữ", () => {
    expect(chuanSoCuoc({ nhu_cau: "  anh ở  nhà 4 người\nSĐT 0123456789 ", da_xong: ["đã báo giá CTS20", "đã báo giá CTS20", "", 5], con_mo: ["hỏi lắp"] }))
      .toEqual({ nhu_cau: "anh ở nhà 4 người SĐT {SĐT}", da_xong: ["đã báo giá CTS20"], con_mo: ["hỏi lắp"] });
  });
  it("quá trần → giữ mục MỚI nhất; JSON luôn dưới CHECK 6000 của DB", () => {
    const dai = "x".repeat(400);
    const so = chuanSoCuoc({ nhu_cau: dai.repeat(3), da_xong: Array.from({ length: 20 }, (_, i) => `${i} ${dai}`), con_mo: Array.from({ length: 9 }, (_, i) => `mo ${i}`) })!;
    expect([...so.nhu_cau]).toHaveLength(500);
    expect(so.da_xong).toHaveLength(12);
    expect(so.da_xong[11].startsWith("19 ")).toBe(true);
    expect(so.con_mo).toEqual(["mo 3", "mo 4", "mo 5", "mo 6", "mo 7", "mo 8"]);
    expect(JSON.stringify(so).length).toBeLessThanOrEqual(5800);
  });
  it("sai dạng hoặc rỗng hết → null (= chưa có sổ)", () => {
    for (const x of [null, undefined, "chữ", [], {}, { nhu_cau: " ", da_xong: [], con_mo: [] }]) expect(chuanSoCuoc(x)).toBeNull();
  });
  it("xung_ho hợp lệ được giữ; giá trị lạ bị bỏ khoá", () => {
    expect(chuanSoCuoc({ nhu_cau: "x", da_xong: [], con_mo: [], xung_ho: { goi: "cô", xung: "chau" } })?.xung_ho).toEqual({ goi: "cô", xung: "chau" });
    expect(chuanSoCuoc({ nhu_cau: "x", da_xong: [], con_mo: [], xung_ho: { goi: "sếp", xung: "em" } })).not.toHaveProperty("xung_ho");
    // review 2026-11-25: sổ chỉ có xung_ho vẫn là sổ (lượt sau nhớ cách gọi); xung_ho lạ + rỗng hết → null
    expect(chuanSoCuoc({ xung_ho: { goi: "cô", xung: "chau" } })).toEqual({ nhu_cau: "", da_xong: [], con_mo: [], xung_ho: { goi: "cô", xung: "chau" } });
    expect(chuanSoCuoc({ xung_ho: { goi: "sếp", xung: "em" } })).toBeNull();
  });
});

describe("doan (đoán xưng hô từ tên)", () => {
  it("đọc doan hợp lệ; rác bị bỏ, tên không phải chữ cái → null", () => {
    expect(chuanSoCuoc({ nhu_cau: "x", doan: { gioi: "nam", ten: "Hùng" } })?.doan).toEqual({ gioi: "nam", ten: "Hùng" });
    expect(chuanSoCuoc({ nhu_cau: "x", doan: { gioi: "nam", ten: "Hùng1" } })?.doan).toEqual({ gioi: "nam", ten: null });
    expect(chuanSoCuoc({ nhu_cau: "x", doan: { gioi: "male", ten: "Hùng" } })?.doan).toBeUndefined();
    expect(chuanSoCuoc({ doan: "nam" })).toBeNull();
  });
});
