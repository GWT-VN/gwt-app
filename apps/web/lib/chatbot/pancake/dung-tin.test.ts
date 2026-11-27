// tachDoan / inDamUnicode / tenGoi chép từ GWT-ERP tests/chatbot/pancake-tu-gui.test.ts + pancake-bubble.test.ts @c2f3719
import { describe, expect, it } from "vitest";

import type { TinPancake } from "./doc.ts";
import { dungTinGui, inDamUnicode, kieuMo, tachDoan, tenGoi, type KieuMo } from "./dung-tin.ts";
import { DAU_BOT } from "./loc.ts";
import type { SoCuoc } from "./so-cuoc.ts";

const HL = "1900 1234";
const o = (kieu: KieuMo, extra: Partial<Parameters<typeof dungTinGui>[1]> = {}) =>
  ({ kieu, xungHo: { goi: "anh", xung: "em" } as const, ten: "Hùng", hotline: HL, hoiSo: false, ...extra });
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
    const r = dungTinGui("Giá ạ.", o("gioi_thieu", { xungHo: { goi: "cô", xung: "chau" }, ten: "Lan", hoiSo: true }));
    expect(r[0]).toBe(b("Chào cô Lan! Cháu là trợ lý ảo của máy lọc nước GE ạ. Giá ạ."));
    expect(r[1]).toContain("để lại SĐT");
    expect(dungTinGui("Hotline 1900 1234 ạ.", o("gioi_thieu"))).toHaveLength(1);
  });
  it("tên có số/emoji hoặc xungHo null → chào không tên, anh/chị, xưng em", () => {
    expect(dungTinGui("Giá ạ.", o("gioi_thieu", { xungHo: null, ten: null }))[0])
      .toBe(b("Chào anh/chị! Em là trợ lý ảo của máy lọc nước GE ạ. Giá ạ."));
    expect(dungTinGui("Giá ạ.", o("da", { xungHo: null, ten: null }))[0]).toBe(b("Dạ anh/chị, giá ạ."));
  });
  it("chao: không giới thiệu, không hotline", () => {
    expect(dungTinGui("Máy còn hàng ạ.", o("chao", { xungHo: { goi: "chị", xung: "em" }, ten: "Mai" })))
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
    expect(dungTinGui("Chào anh!\n\nGiá 1đ ạ.", o("chao"))).toEqual([b("Chào anh Hùng! Giá 1đ ạ.")]);
    expect(dungTinGui("Dạ.\n\nGiá 1đ ạ.", o("da"))).toEqual([b("Dạ anh Hùng, giá 1đ ạ.")]);
  });
  it("câu chào GPT lỡ viết ở đầu bị bỏ — không hai câu chào", () => {
    const r = dungTinGui("Chào anh! Dạ, giá 1đ ạ.", o("chao"))[0];
    expect(r).toBe(b("Chào anh Hùng! Dạ, giá 1đ ạ."));
    expect(dungTinGui("Chào anh! Dạ, giá 1đ ạ.", o("da"))[0]).toBe(b("Dạ anh Hùng, giá 1đ ạ."));
  });
  it("in đậm Unicode, dòng cuối là bullet không thêm 'ạ', chèn dòng trống sau câu dẫn, mọi tin kết U+2063", () => {
    const r = dungTinGui("Dạ, em gửi ạ.\n\n**Giá:**\n• **CTS10:** 1đ", o("da"));
    expect(r[1]).toBe(b("𝐆𝐢𝐚́:\n\n• 𝐂𝐓𝐒𝟏𝟎: 1đ"));
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

describe("dungTinGui: gọi theo tên, một lời mời SĐT, bullet", () => {
  it("câu mẫu: Chào anh Hùng! + giới thiệu + Dạ, …", () => {
    expect(dungTinGui("Dạ, em gửi giá ạ.", o("gioi_thieu", { hoiSo: false }))[0]).toBe(b("Chào anh Hùng! Em là trợ lý ảo của máy lọc nước GE ạ. Dạ, em gửi giá ạ."));
  });
  it("không rõ giới + có tên gọi → 'Chào anh/chị Hùng!'; không tên → 'Chào anh/chị!'", () => {
    expect(dungTinGui("Giá ạ.", o("chao", { xungHo: null, ten: null }))[0]).toBe(b("Chào anh/chị! Giá ạ."));
  });
  it("GPT đã mời SĐT + có CAU_HO_TRO → chỉ còn một lời mời", () => {
    const r = dungTinGui("Dạ, em gửi giá ạ.\n\nAnh/chị cần tư vấn thêm về sản phẩm có thể để lại SĐT để được chuyên gia liên hệ hỗ trợ ạ.", o("gioi_thieu", { hoiSo: true }));
    expect(r).toHaveLength(2);
    expect(r.join(" ").match(/để lại SĐT/g)).toHaveLength(1);
    expect(r[1]).toContain("hotline");
    const r2 = dungTinGui("Giá 1đ ạ. Anh cần tư vấn thêm về sản phẩm có thể để lại SĐT để được chuyên gia liên hệ hỗ trợ ạ.", o("gioi_thieu", { hoiSo: true }));
    expect(r2.join(" ").match(/để lại SĐT/g)).toHaveLength(1);
  });
  it("dòng cuối là bullet → không thêm 'ạ'; câu thường vẫn có 'ạ'", () => {
    const r = dungTinGui("Dạ, em gửi giá ạ:\n• **A:** 1đ\n• **B:** 2đ", o("da"));
    expect(r[0]).not.toMatch(/ạ\.?\u2063$/);
    expect(r[0].endsWith(`2đ${DAU_BOT}`)).toBe(true);
    expect(dungTinGui("Giá 1đ", o("da"))[0]).toBe(b("Dạ anh Hùng, giá 1đ ạ."));
  });
  it("chèn một dòng trống giữa câu dẫn và bullet đầu; không giữa các bullet, không nhân đôi", () => {
    const t = dungTinGui("Em gửi giá ạ:\n• A: 1đ\n• B: 2đ", o("chao"))[0];
    expect(t).toBe(b("Chào anh Hùng! Em gửi giá ạ:\n\n• A: 1đ\n• B: 2đ"));
    expect(dungTinGui("Em gửi giá ạ:\n\n• A: 1đ\n• B: 2đ", o("chao"))[0]).toBe(t);
  });
  it("xưng hô rõ → đổi 'anh/chị' còn sót; anh/chị thì giữ nguyên", () => {
    const r = dungTinGui("Em gửi anh/chị giá ạ.\n\nAnh/chị cho em xin tên ạ.", o("da"));
    expect(r).toEqual([b("Dạ anh Hùng, em gửi anh giá ạ."), b("Anh cho em xin tên ạ.")]);
    expect(dungTinGui("Em gửi anh/chị giá ạ.", o("da", { xungHo: null, ten: null }))[0]).toBe(b("Dạ anh/chị, em gửi anh/chị giá ạ."));
  });
});
