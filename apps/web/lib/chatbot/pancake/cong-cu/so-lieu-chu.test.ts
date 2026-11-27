import { describe, expect, it } from "vitest";

import { giaTriQua, khoiSoLieu, khoiThongSo, traLoiGiaDanhMuc } from "./so-lieu-chu.ts";
import type { SoLieuMay } from "./masterdata.ts";

/**
 * Seam CHỮ: mọi câu/khối dựng từ `SoLieuMay` đo ở đây, không đo qua module đọc DB.
 * Ca dời nguyên kỳ vọng từ `masterdata.test.ts` (Task 4, 2026-09-22) — chữ không đổi một ký tự.
 *
 * Đáng test kỹ vì đây là nơi sinh ra CON SỐ TIỀN nói với khách. Sai định dạng
 * hay thiếu vế "đã gồm VAT" là khách hiểu lệch 10% giá trị đơn hàng.
 */
const MAY: SoLieuMay = {
  ten: "CTS10",
  maNoiBo: ["CTS10NB", "CTS10NW"],
  loi: [{ tenLoi: "Bộ lọc GE CFNC cho máy CTS10", chuKy: "12 tháng", gia: null }],
  baoHanh: null,
  gia: [],
  khuyenMai: null,
};

describe("khoiSoLieu", () => {
  it("không có số liệu thì trả chuỗi RỖNG, không trả khối trống", () => {
    // Khối rỗng vẫn tốn token và vẫn dặn model "ưu tiên hơn đoạn tài liệu" —
    // tức bảo nó ưu tiên một danh sách không có gì.
    expect(khoiSoLieu(null)).toBe("");
  });

  it("định dạng tiền kiểu Việt và nói rõ ĐÃ GỒM VAT", () => {
    const k = khoiSoLieu({ ...MAY, gia: [{ ten: "Máy lọc nước GE CTS10", dong: 30950000 }] });
    expect(k).toContain("30.950.000 đ");
    expect(k).toContain("đã gồm VAT");
    // Không được để lọt dãy số trần: model hay tự chấm câu vào giữa dãy số dài.
    expect(k).not.toContain("30950000");
  });

  it("giá đứng TRƯỚC chu kỳ thay lõi", () => {
    const k = khoiSoLieu({ ...MAY, gia: [{ ten: "GE CTS10", dong: 30950000 }] });
    expect(k.indexOf("Giá niêm yết")).toBeLessThan(k.indexOf("Bộ lọc GE CFNC"));
  });

  // Đo 2026-08-17: dòng lõi không có nhãn ("Bộ lọc CFNC…: 12 tháng thay một
  // lần") làm model dán chu kỳ vào câu hỏi GIÁ lõi — "có giá là 12 tháng thay
  // một lần". Dòng phải tự nói rõ giá trị của nó là CHU KỲ THAY.
  it("dòng lõi mang nhãn 'Chu kỳ thay' — không để trần giá trị", () => {
    const k = khoiSoLieu(MAY);
    expect(k).toContain("- Chu kỳ thay Bộ lọc GE CFNC cho máy CTS10: 12 tháng một lần");
    expect(k).not.toContain("CTS10: 12 tháng thay một lần");
  });

  // Đo 2026-07-31: "CTS10" ứng CTS10NB (đen) và CTS10NW (trắng), hôm nay cùng
  // giá. Vẫn phải nêu ĐỦ hai dòng thay vì gộp thành một số — ngày hai màu lệch
  // giá thì gộp là nói sai một trong hai, mà không ai thấy.
  it("giữ ĐỦ giá của từng biến thể", () => {
    const k = khoiSoLieu({
      ...MAY,
      gia: [
        { ten: "GE CTS10 (màu đen)", dong: 30950000 },
        { ten: "GE CTS10 (màu trắng)", dong: 31950000 },
      ],
    });
    expect(k).toContain("30.950.000 đ");
    expect(k).toContain("31.950.000 đ");
  });

  it("chỉ có bảo hành thì không sinh dòng giá", () => {
    const k = khoiSoLieu({
      ...MAY, loi: [], gia: [],
      baoHanh: { namToanMay: 2, namLoi: 1, phamViLoi: "lõi lọc", nguyenVan: "" },
    });
    expect(k).toContain("2 năm toàn máy");
    expect(k).not.toContain("Giá niêm yết");
  });

  it("có nguyên văn bảo hành thì dùng nguyên văn, không tự dựng câu", () => {
    const k = khoiSoLieu({
      ...MAY,
      baoHanh: {
        namToanMay: 2, namLoi: 1, phamViLoi: "lõi lọc",
        nguyenVan: "Bảo hành 24 tháng, riêng lõi 12 tháng",
      },
    });
    expect(k).toContain("Bảo hành 24 tháng, riêng lõi 12 tháng");
    expect(k).not.toContain("2 năm toàn máy");
  });

  // CTKM: số volatile, chỉ nói khi có dòng; %giảm/giá sau KM/quà đưa vào khối MASTERDATA.
  it("nêu khuyến mãi tháng này khi có: %giảm, giá sau KM, quà, kênh", () => {
    const k = khoiSoLieu({
      ...MAY,
      khuyenMai: {
        kenh: "GWT", giamPct: 20, giaSauKm: 31960000, quaGiaTri: 8500000,
        quaMoTa: "Combo lõi CFNC + vận chuyển", tongGiaTri: null, pctSaving: null,
        dieuKien: "Áp dụng đến hết tháng",
      },
    });
    expect(k).toContain("Khuyến mãi tháng này (kênh GWT)");
    expect(k).toContain("giảm 20%");
    expect(k).toContain("31.960.000 đ");
    expect(k).toContain("Quà tặng: Combo lõi CFNC + vận chuyển");
    expect(k).toContain("Điều kiện: Áp dụng đến hết tháng");
    expect(k).not.toContain("Shopee");
  });

  it("KM kênh Facebook ghi là giá bán trực tiếp, không nhắc Shopee", () => {
    const k = khoiSoLieu({
      ...MAY,
      khuyenMai: { kenh: "Facebook", giamPct: 15, giaSauKm: 38207500, quaGiaTri: null, quaMoTa: "", tongGiaTri: null, pctSaving: null, dieuKien: "" },
    });
    expect(k).toContain("Khuyến mãi tháng này (giá bán trực tiếp): giảm 15%");
    expect(k).not.toContain("kênh Facebook");
    expect(k).not.toContain("Shopee");
  });

  it("không có khuyến mãi thì KHÔNG sinh dòng CTKM", () => {
    expect(khoiSoLieu(MAY)).not.toContain("Khuyến mãi");
  });
});

describe("khoiSoLieu — giá lõi", () => {
  it("khoiSoLieu: dòng lõi có giá thì nêu giá ngay trong dòng đó", () => {
    const k = khoiSoLieu({
      ...MAY, loi: [{ tenLoi: "Bộ lọc GE CFNC cho máy CTS10", chuKy: "12 tháng", gia: 5000000 }],
    });
    expect(k).toContain("- Chu kỳ thay Bộ lọc GE CFNC cho máy CTS10: 12 tháng một lần (giá 5.000.000 đ)");
  });
});

describe("khoiThongSo", () => {
  // Đo 2026-11-27: kích thước chỉ nằm ở mẩu tài liệu ~100 ký tự, tìm kiếm lúc thấy lúc không → bot chuyển NV câu hỏi thông số.
  const WH = (muc: string, noiDung: string, thuTu: number) => ({ ma: "WH15A", muc, noiDung, thuTu });

  it("không có đoạn nào thì chuỗi rỗng", () => {
    expect(khoiThongSo([])).toBe("");
  });

  it("chỉ lấy mục thông số, kích thước, điều kiện lắp đặt — theo thứ tự đó, bỏ Mô tả / Danh mục", () => {
    const r = khoiThongSo([
      WH("Điều kiện lắp đặt", "Áp lực nước từ bơm cấp: 0,15–0,4 MPa.", 12),
      WH("Mô tả", "Giải pháp lọc tổng GE 15A…", 4),
      WH("Kích thước & khối lượng", "Kích thước máy (Sâu×Rộng×Cao): 550×650×950 mm.", 8),
      WH("Danh mục", "Ngành hàng: Machines.", 6),
    ]);
    expect(r).toBe([
      "THÔNG SỐ MASTERDATA (chính xác, ưu tiên hơn đoạn tài liệu):",
      "- Kích thước & khối lượng: Kích thước máy (Sâu×Rộng×Cao): 550×650×950 mm.",
      "- Điều kiện lắp đặt: Áp lực nước từ bơm cấp: 0,15–0,4 MPa.",
    ].join("\n"));
  });

  it("biến thể cùng thông số (CTS10NB/NW) gộp một dòng; khác nhau thì ghi mã", () => {
    const giong = khoiThongSo([
      { ma: "CTS10NB", muc: "Kích thước & khối lượng", noiDung: "430×242×400 mm.", thuTu: 8 },
      { ma: "CTS10NW", muc: "Kích thước & khối lượng", noiDung: "430×242×400 mm.", thuTu: 8 },
    ]);
    expect(giong.split("\n")).toHaveLength(2);
    const khac = khoiThongSo([
      { ma: "A1", muc: "Kích thước & khối lượng", noiDung: "1×1×1 mm.", thuTu: 8 },
      { ma: "A2", muc: "Kích thước & khối lượng", noiDung: "2×2×2 mm.", thuTu: 8 },
    ]);
    expect(khac).toContain("- A1 · Kích thước & khối lượng: 1×1×1 mm.");
    expect(khac).toContain("- A2 · Kích thước & khối lượng: 2×2×2 mm.");
  });
});

describe("bảng giá nhiều máy kèm tổng giá trị quà", () => {
  const km = (o: Partial<NonNullable<SoLieuMay["khuyenMai"]>>) => ({ kenh: "Facebook", giamPct: null, giaSauKm: null, quaGiaTri: null, quaMoTa: "", tongGiaTri: null, pctSaving: null, dieuKien: "", ...o });
  it("giaTriQua: cột giá trị trước, trống thì số trong mô tả combo", () => {
    expect(giaTriQua(km({ quaGiaTri: 14900000 }))).toBe(14900000);
    expect(giaTriQua(km({ quaMoTa: "combo trị giá 27.850.000đ, gồm: 1. 01 máy GN610" }))).toBe(27850000);
    expect(giaTriQua(km({ quaMoTa: "Combo quà tặng 56.400.000đ; 1. 02 máy GN610" }))).toBe(56400000);
    expect(giaTriQua(km({}))).toBeNull();
    expect(giaTriQua(null)).toBeNull();
  });
  it("mỗi máy có quà ghi ', quà tặng trị giá N'; máy không quà thì không", () => {
    const r = traLoiGiaDanhMuc([{ ten: "Lọc tổng", ds: [
      { ...MAY, ten: "WH30A", gia: [{ dong: 249950000 } as never], khuyenMai: km({ giaSauKm: 249950000, quaMoTa: "combo trị giá 56.400.000đ, gồm: …" }) },
      { ...MAY, ten: "GN610", gia: [{ dong: 16950000 } as never], khuyenMai: km({ giaSauKm: 11865000 }) },
    ] }], { xinSo: false, daCoSo: false })!;
    expect(r.soLieu).toContain("WH30A khuyến mãi còn 249.950.000 đ (giá gốc 249.950.000 đ), quà tặng trị giá 56.400.000 đ");
    expect(r.soLieu).toContain("GN610 khuyến mãi còn 11.865.000 đ (giá gốc 16.950.000 đ)");
    expect(r.soLieu).not.toMatch(/GN610[^,\n]*quà/);
  });
});
