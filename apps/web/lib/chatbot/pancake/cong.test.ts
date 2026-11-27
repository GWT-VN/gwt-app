import { describe, expect, it } from "vitest";

import { chanSauSoan, chanTruocSoan } from "./cong.ts";
import type { KetQuaTra } from "./tu-tra.ts";

const tr = (extra: Partial<Parameters<typeof chanTruocSoan>[0]> = {}) => chanTruocSoan({
  nhom: "tu_van", gap: false, coAnh: false, nvTrong24h: false, botLuotHomNay: 0, daGuiHomNay: 0, tranNgay: 20, tinKhach: "máy nào hợp nhà 4 người", ...extra,
});
const sau = (extra: Partial<KetQuaTra> = {}) => chanSauSoan({
  traLoi: "Dạ em tư vấn anh/chị ạ.", canNv: false, khongTraLoi: false, lyDo: "", chanTuGui: [], xungHo: null, soCuoc: null, ...extra,
});

describe("chanTruocSoan (R3–R7)", () => {
  it("đủ điều kiện → null", () => expect(tr()).toBeNull());
  it("nhóm ngoài danh sách / null", () => {
    expect(tr({ nhom: "don_hang" })).toBe("nhom_don_hang");
    expect(tr({ nhom: "khieu_nai" })).toBe("nhom_khieu_nai");
    expect(tr({ nhom: null })).toBe("nhom_chua_phan_loai");
  });
  it.each([
    ["gap", { gap: true }], ["khach_gui_anh", { coAnh: true }], ["nv_dang_xu_ly", { nvTrong24h: true }],
    ["qua_3_luot", { botLuotHomNay: 3 }], ["qua_tran_ngay", { daGuiHomNay: 20 }],
  ] as const)("%s", (ly, extra) => expect(tr(extra)).toBe(ly));
  it("hỏi trả góp / mặc cả (hoi_gia) → chặn; hỏi quà, khuyến mãi → KHÔNG chặn (bot được báo quà)", () => {
    expect(tr({ nhom: "hoi_gia", tinKhach: "mua trả góp được không" })).toBe("hoi_tra_gop_giam_gia");
    expect(tr({ nhom: "hoi_gia", tinKhach: "có tặng quà gì không" })).toBeNull();
    expect(tr({ nhom: "hoi_gia", tinKhach: "CTS20 đang khuyến mãi giá bao nhiêu" })).toBeNull();
    expect(tr({ nhom: "tu_van", tinKhach: "mua trả góp được không" })).toBeNull(); // chỉ áp cho hoi_gia
  });
  it.each(["giá trên shopee bao nhiêu", "Shopee bán rẻ hơn à", "sopee có bán ko", "mua shoppe dc ko", "SHOPEE"])("%s → hoi_shopee (mọi nhóm)", (t) => {
    expect(tr({ nhom: "hoi_gia", tinKhach: t })).toBe("hoi_shopee");
    expect(tr({ nhom: "tu_van", tinKhach: t })).toBe("hoi_shopee");
  });
  it("chữ chứa 'shop' khác không bị bắt", () => expect(tr({ nhom: "tu_van", tinKhach: "shop ơi máy này lắp sao" })).toBeNull());
});

describe("biên + không dấu", () => {
  it.each(["mua tra gop duoc khong", "gia tot hon duoc ko", "re hon chut duoc ko"])("%s → hoi_tra_gop_giam_gia", (t) =>
    expect(tr({ nhom: "hoi_gia", tinKhach: t })).toBe("hoi_tra_gop_giam_gia"));
  it.each(["có loại nào rẻ hơn không", "co phuong an nao re hon khong", "bộ nào rẻ hơn ạ"])("%s → không chặn (hỏi phương án rẻ hơn)", (t) =>
    expect(tr({ nhom: "hoi_gia", tinKhach: t })).toBeNull());
  it("rẻ hơn chút được không → chặn (mặc cả)", () => expect(tr({ nhom: "hoi_gia", tinKhach: "rẻ hơn chút được không" })).toBe("hoi_tra_gop_giam_gia"));
  it("co tang qua gi khong → không chặn", () => expect(tr({ nhom: "hoi_gia", tinKhach: "co tang qua gi khong" })).toBeNull());
  it("NFD có dấu vẫn chặn", () => expect(tr({ nhom: "hoi_gia", tinKhach: "mua trả góp được không".normalize("NFD") })).toBe("hoi_tra_gop_giam_gia"));
  it.each(["hôm qua em hỏi giá CTS20", "kỹ thuật qua nhà lúc nào"])("%s → không chặn", (t) =>
    expect(tr({ nhom: "hoi_gia", tinKhach: t })).toBeNull());
  it("botLuotHomNay 2 được, 3 chặn", () => {
    expect(tr({ botLuotHomNay: 2 })).toBeNull();
    expect(tr({ botLuotHomNay: 3 })).toBe("qua_3_luot");
  });
  it("trần ngày: tran-1 được, = tran chặn", () => {
    expect(tr({ daGuiHomNay: 19 })).toBeNull();
    expect(tr({ daGuiHomNay: 20 })).toBe("qua_tran_ngay");
  });
  it("đúng 6 đoạn được, 7 chặn", () => {
    const n = (k: number) => Array.from({ length: k }, (_, i) => `Đoạn ${i} ạ.`).join("\n\n");
    expect(sau({ traLoi: n(6) })).toBeNull();
    expect(sau({ traLoi: n(7) })).toBe("qua_6_doan");
  });
  it("trả lời NFD vẫn bắt trả góp", () => expect(sau({ traLoi: "Dạ có trả góp ạ.".normalize("NFD") })).toBe("tra_loi_nhac_tra_gop"));
});

describe("chanSauSoan", () => {
  it("sạch → null", () => expect(sau()).toBeNull());
  it("từng lý do", () => {
    expect(sau({ khongTraLoi: true })).toBe("khong_tra_loi");
    expect(sau({ canNv: true })).toBe("can_nv");
    expect(sau({ chanTuGui: ["so_khong_can_cu", "khac"] })).toBe("so_khong_can_cu");
    expect(sau({ traLoi: "  " })).toBe("rong");
    expect(sau({ traLoi: Array.from({ length: 7 }, (_, i) => `Đoạn ${i} ạ.`).join("\n\n") })).toBe("qua_6_doan");
  });
  it("khuyến mãi + quà đúng Masterdata không chặn; nhắc trả góp thì chặn", () => {
    expect(sau({ traLoi: "Dạ em báo giá: tháng này CTS20 khuyến mãi còn 33.957.500 đ ạ." })).toBeNull();
    expect(sau({ traLoi: "Dạ anh/chị mua sẽ được tặng 02 bình gas, lõi tặng dưới dạng voucher đổi lõi ạ." })).toBeNull();
    expect(sau({ traLoi: "Dạ bên em hỗ trợ trả góp 0% ạ." })).toBe("tra_loi_nhac_tra_gop");
  });
});
