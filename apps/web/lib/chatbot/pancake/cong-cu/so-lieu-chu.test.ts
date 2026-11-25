import { describe, expect, it } from "vitest";

import { khoiSoLieu } from "./so-lieu-chu.ts";
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
