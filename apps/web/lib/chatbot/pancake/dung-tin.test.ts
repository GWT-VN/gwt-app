// tachDoan / inDamUnicode / tenGoi chép từ GWT-ERP tests/chatbot/pancake-tu-gui.test.ts + pancake-bubble.test.ts @c2f3719
import { describe, expect, it } from "vitest";

import type { TinPancake } from "./doc.ts";
import { dungTinGui, inDamUnicode, kieuMo, tachDoan, tenGoi, type KieuMo } from "./dung-tin.ts";
import { DAU_BOT } from "./loc.ts";
import type { SoCuoc } from "./so-cuoc.ts";

const HL = "1900 1234";
const o = (kieu: KieuMo, extra: Partial<Parameters<typeof dungTinGui>[1]> = {}) =>
  ({ kieu, xungHo: { goi: "anh", xung: "em" } as const, tenKhach: "Hùng", hotline: HL, hoiSo: false, ...extra });
const b = (s: string) => `${s}${DAU_BOT}`;

describe("tachDoan / inDamUnicode / tenGoi (chép từ ERP)", () => {
  it("giữ ranh giới đoạn, tiêu đề kết ':' đi liền phần dưới", () => {
    expect(tachDoan("1\n\n2\n\n3\n\n4\n\n5\n\n6\n\n7")).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
    expect(tachDoan("Dạ, em gửi ạ.\n\n**Giá:**\n\n• **CTS10:** <a>\n• **CTS20:** <b>\n\n**Bảo hành:**\n• **1 năm:** x."))
      .toEqual(["Dạ, em gửi ạ.", "**Giá:**\n• **CTS10:** <a>\n• **CTS20:** <b>", "**Bảo hành:**\n• **1 năm:** x."]);
    expect(tachDoan(" A ạ \n \n\n\t\nB ạ\r\n\r\nC ạ ")).toEqual(["A ạ", "B ạ", "C ạ"]);
  });
  it("inDamUnicode", () => {
    expect(inDamUnicode("**CTS10:** 26.307.500đ")).toBe("𝐂𝐓𝐒𝟏𝟎: 26.307.500đ");
    expect(inDamUnicode("**1 năm:** toàn bộ")).toBe("𝟏 𝐧𝐚̆𝐦: toàn bộ");
    expect(inDamUnicode("**Đổi**")).toBe("Đ𝐨̂̉𝐢");
    expect(inDamUnicode("lẻ ** một dấu")).toBe("lẻ  một dấu");
  });
  it.each([
    ["Minh Anh", "Minh Anh"], ["  Kim   Ngân 🌸 ", "Kim Ngân"], ["𝐓𝐫𝐚𝐧𝐠", "Trang"],
    ["🌸🌸", null], ["Shop 0912 345 678", null], ["fb.com/@abc", null], ["A".repeat(31), null], [null, null], ["", null],
  ])("tenGoi(%o) → %o", (vao, ra) => expect(tenGoi(vao)).toBe(ra));
});

describe("dungTinGui", () => {
  const GPT = "Dạ, máy CTS20 bên em giá 12.990.000đ ạ.";
  it("gioi_thieu: chào + giới thiệu + câu GPT giữ 'Dạ' + hotline cuối", () => {
    expect(dungTinGui(GPT, o("gioi_thieu"))).toEqual([
      b("Chào anh Hùng! Em là trợ lý ảo của máy lọc nước GE ạ. Dạ, máy CTS20 bên em giá 12.990.000đ ạ."),
      b("Nếu cần hỗ trợ nhanh hơn anh có thể gọi hotline 1900 1234 ạ."),
    ]);
  });
  it("xưng cháu / gọi cô; hoiSo → xin SĐT; đã có hotline trong câu trả lời → không thêm", () => {
    const r = dungTinGui("Giá ạ.", o("gioi_thieu", { xungHo: { goi: "cô", xung: "chau" }, tenKhach: "Lan", hoiSo: true }));
    expect(r[0]).toBe(b("Chào cô Lan! Cháu là trợ lý ảo của máy lọc nước GE ạ. Giá ạ."));
    expect(r[1]).toContain("để lại SĐT");
    expect(dungTinGui("Hotline 1900 1234 ạ.", o("gioi_thieu"))).toHaveLength(1);
  });
  it("tên có số/emoji hoặc xungHo null → chào không tên, anh/chị, xưng em", () => {
    expect(dungTinGui("Giá ạ.", o("gioi_thieu", { xungHo: null, tenKhach: "Hùng 😎 0912" }))[0])
      .toBe(b("Chào anh/chị! Em là trợ lý ảo của máy lọc nước GE ạ. Giá ạ."));
    expect(dungTinGui("Giá ạ.", o("da", { xungHo: null, tenKhach: null }))[0]).toBe(b("Dạ anh/chị, giá ạ."));
  });
  it("chao: không giới thiệu, không hotline", () => {
    expect(dungTinGui("Máy còn hàng ạ.", o("chao", { xungHo: { goi: "chị", xung: "em" }, tenKhach: "Mai" })))
      .toEqual([b("Chào chị Mai! Máy còn hàng ạ.")]);
  });
  it("da: bỏ 'Dạ' của GPT, hạ chữ đầu từ thường, giữ mã máy", () => {
    expect(dungTinGui("Dạ, Lõi CFNC thay sau 12 tháng ạ.", o("da"))).toEqual([b("Dạ anh Hùng, lõi CFNC thay sau 12 tháng ạ.")]);
    expect(dungTinGui("Dạ CTS20 giá 1đ ạ.", o("da"))).toEqual([b("Dạ anh Hùng, CTS20 giá 1đ ạ.")]);
    expect(dungTinGui("Lõi CFNC thay sau 12 tháng ạ.", o("da"))[0]).toBe(b("Dạ anh Hùng, lõi CFNC thay sau 12 tháng ạ."));
  });
  it("thêm 'ạ' trước dấu cuối, hoặc ' ạ.' khi không dấu; chỉ mỗi tin", () => {
    expect(dungTinGui("Giá CTS20 là 12.990.000đ", o("da"))[0]).toBe(b("Dạ anh Hùng, giá CTS20 là 12.990.000đ ạ."));
    expect(dungTinGui("Giá rẻ.\n\nCó không?", o("da"))).toEqual([b("Dạ anh Hùng, giá rẻ ạ."), b("Có không ạ?")]);
  });
  it('"ạ" phải là từ riêng: "lạ" chưa tính', () => {
    expect(dungTinGui("Nước có mùi lạ.", o("da"))[0]).toBe(b("Dạ anh Hùng, nước có mùi lạ ạ."));
  });
  it("không còn nội dung (chỉ 'Dạ.' hoặc chỉ lời chào) → []", () => {
    expect(dungTinGui("Dạ.", o("da"))).toEqual([]);
    expect(dungTinGui("Chào anh!", o("chao"))).toEqual([]);
    expect(dungTinGui("Dạ, chào anh Hùng ạ.", o("gioi_thieu"))).toEqual([]);
    expect(dungTinGui("Dạ.\n\nGiá 1đ ạ.", o("da"))).toEqual([b("Giá 1đ ạ.")]);
  });
  it("câu chào GPT lỡ viết ở đầu bị bỏ — không hai câu chào", () => {
    const r = dungTinGui("Chào anh! Dạ, giá 1đ ạ.", o("chao"))[0];
    expect(r).toBe(b("Chào anh Hùng! Dạ, giá 1đ ạ."));
    expect(dungTinGui("Chào anh! Dạ, giá 1đ ạ.", o("da"))[0]).toBe(b("Dạ anh Hùng, giá 1đ ạ."));
  });
  it("in đậm Unicode, tin danh sách không bị ép 'ạ', mọi tin kết U+2063", () => {
    const r = dungTinGui("Dạ, em gửi ạ.\n\n**Giá:**\n• **CTS10:** 1đ", o("da"));
    expect(r[1]).toBe(b("𝐆𝐢𝐚́:\n• 𝐂𝐓𝐒𝟏𝟎: 1đ ạ."));
    expect(r.every((s) => s.endsWith(DAU_BOT))).toBe(true);
  });
});

describe("kieuMo", () => {
  const SO: SoCuoc = { nhu_cau: "x", da_xong: [], con_mo: [] };
  const NOW = new Date("2026-11-25T10:00:00Z");
  const t = (iso: string, message: string, from: TinPancake["from"]): TinPancake => ({ id: iso, message, inserted_at: iso, from });
  const bot = (iso: string) => t(iso, `Chào anh! Em là trợ lý ảo của máy lọc nước GE ạ.${DAU_BOT}`, { id: "P" });
  const khach = t("2026-11-25T09:59:00Z", "giá?", { id: "k1" });
  it("chưa có câu giới thiệu / sổ null → gioi_thieu", () => {
    expect(kieuMo([khach], NOW, SO)).toBe("gioi_thieu");
    expect(kieuMo([khach, bot("2026-11-25T09:00:00Z")], NOW, null)).toBe("gioi_thieu");
  });
  it("tin bot/NV gần nhất > 6 giờ → chao; ≤ 6 giờ → da", () => {
    expect(kieuMo([khach, bot("2026-11-25T03:00:00Z")], NOW, SO)).toBe("chao");
    expect(kieuMo([khach, bot("2026-11-25T05:00:00Z")], NOW, SO)).toBe("da");
    expect(kieuMo([khach, t("2026-11-25T09:00:00Z", "dạ", { id: "P", admin_id: "nv1" }), bot("2026-11-25T01:00:00Z")], NOW, SO)).toBe("da");
  });
});
