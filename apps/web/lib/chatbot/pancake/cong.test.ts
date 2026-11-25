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
  it("hỏi quà / trả góp (hoi_gia) → chặn; hỏi khuyến mãi thuần → không chặn", () => {
    expect(tr({ nhom: "hoi_gia", tinKhach: "có tặng quà gì không" })).toBe("hoi_qua_tra_gop");
    expect(tr({ nhom: "hoi_gia", tinKhach: "mua trả góp được không" })).toBe("hoi_qua_tra_gop");
    expect(tr({ nhom: "hoi_gia", tinKhach: "CTS20 đang khuyến mãi giá bao nhiêu" })).toBeNull();
    expect(tr({ nhom: "tu_van", tinKhach: "có tặng quà gì không" })).toBeNull(); // chỉ áp cho hoi_gia
  });
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
  it("khuyến mãi đúng giá Masterdata không chặn; nhắc quà/tặng thì chặn", () => {
    expect(sau({ traLoi: "Dạ em báo giá: tháng này CTS20 khuyến mãi còn 33.957.500 đ ạ." })).toBeNull();
    expect(sau({ traLoi: "Dạ anh/chị mua sẽ được tặng 02 bình gas ạ." })).toBe("tra_loi_nhac_qua");
  });
});
