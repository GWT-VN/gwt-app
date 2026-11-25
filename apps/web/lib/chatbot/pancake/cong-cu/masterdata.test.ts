import { beforeEach, describe, expect, it } from "vitest";

// Hai ca ĐỌC DB dưới đây nghiệm thu bằng CÂU khách đọc — câu ở seam chữ, số ở đây.

import {
  docSoLieuMay,
  quenMasterdata,
  soHoac,
  type SoLieuMay,
} from "./masterdata.ts";

/** Fake KhachBang: `select()` vừa thenable (đường alias không .in) vừa có `.in` (đường api). */
function khachGia(
  alias: Array<{ alias_norm: string; internal_code: string }>,
  bang: Record<string, unknown[]>,
) {
  return {
    schema: () => ({
      from: (ten: string) => ({
        select: () => ({
          in: async () => ({ data: bang[ten] ?? [], error: null }),
          then: (res: (v: { data: unknown; error: null }) => void) => res({ data: alias, error: null }),
        }),
      }),
    }),
  };
}

describe("docSoLieuMay — biến thể lệch dữ liệu (Q3, 2026-09-18)", () => {
  beforeEach(() => quenMasterdata());

  it("'WH30' → WH30A ≠ WH30AECO (lõi khác) → bienTheMoHo, số liệu để trống", async () => {
    const khach = khachGia(
      [{ alias_norm: "WH30A", internal_code: "WH30A" }, { alias_norm: "WH30AECO", internal_code: "WH30AECO" }],
      {
        chatbot_price: [
          { internal_code: "WH30A", product_name: "GE WH30A", gia_ban: 249950000 },
          { internal_code: "WH30AECO", product_name: "GE WH30A ECO", gia_ban: 149950000 },
        ],
        chatbot_machine_filter: [
          { internal_code: "WH30A", filter_name: "GTEF-30A01", chu_ky_raw: "5 năm" },
          { internal_code: "WH30AECO", filter_name: "GE PAC", chu_ky_raw: "3-6 tháng" },
        ],
        chatbot_warranty: [], chatbot_promotion: [],
      },
    );
    const sl = await docSoLieuMay("WH30", khach as never);
    expect(sl?.bienTheMoHo).toEqual(["WH30A", "WH30AECO"]);
    expect(sl?.gia).toEqual([]);
    expect(sl?.loi).toEqual([]);
  });

  it("'CTS10' → CTS10NB/NW CÙNG số liệu → gộp như cũ, KHÔNG bienTheMoHo", async () => {
    const khach = khachGia(
      [{ alias_norm: "CTS10NB", internal_code: "CTS10NB" }, { alias_norm: "CTS10NW", internal_code: "CTS10NW" }],
      {
        chatbot_price: [
          { internal_code: "CTS10NB", product_name: "GE CTS10 (đen)", gia_ban: 30950000 },
          { internal_code: "CTS10NW", product_name: "GE CTS10 (trắng)", gia_ban: 30950000 },
        ],
        chatbot_machine_filter: [
          { internal_code: "CTS10NB", filter_name: "GE CFNC", chu_ky_raw: "12 tháng" },
          { internal_code: "CTS10NW", filter_name: "GE CFNC", chu_ky_raw: "12 tháng" },
        ],
        chatbot_warranty: [], chatbot_promotion: [],
      },
    );
    const sl = await docSoLieuMay("CTS10", khach as never);
    expect(sl?.bienTheMoHo).toBeUndefined();
    expect(sl?.gia).toHaveLength(2);
    expect(sl?.loi).toHaveLength(1);
  });

  it("mã 'ma' có alias nhưng không có dòng số liệu KHÔNG làm lệch giả — 'WH15' → WH15A có số + WH15X rỗng → gộp bình thường", async () => {
    const khach = khachGia(
      [{ alias_norm: "WH15A", internal_code: "WH15A" }, { alias_norm: "WH15X", internal_code: "WH15X" }],
      {
        chatbot_price: [{ internal_code: "WH15A", product_name: "GE WH15A", gia_ban: 179950000 }],
        chatbot_machine_filter: [{ internal_code: "WH15A", filter_name: "GTEF-15A01", chu_ky_raw: "5 năm" }],
        chatbot_warranty: [], chatbot_promotion: [],
      },
    );
    const sl = await docSoLieuMay("WH15", khach as never);
    expect(sl?.bienTheMoHo).toBeUndefined();
    expect(sl?.gia).toHaveLength(1);
    expect(sl?.loi).toHaveLength(1);
  });
});

/**
 * GIÁ LÕI (2026-09-18): `api.chatbot_price` chứa CẢ dòng máy lẫn dòng lõi. Dòng lõi
 * khớp với lõi của máy theo TÊN (`product_name` ↔ `filter_name`, có thể thừa dấu cách).
 * Hai bẫy khoá ở đây: (1) dòng giá lõi KHÔNG được lọt vào giá MÁY; (2) lõi không khớp
 * tên (WH-family) phải ra `gia: null` chứ không mượn số của lõi khác.
 */
describe("docSoLieuMay — giá lõi khớp theo tên", () => {
  beforeEach(() => quenMasterdata());

  const GIA_MAY = { internal_code: "CTS10NB", product_name: "Máy lọc nước GE CTS10", gia_ban: 30950000 };
  const GIA_LOI = { internal_code: "LX-CFNC-001-G", product_name: "Bộ lọc GE CFNC cho máy CTS10", gia_ban: 5000000 };

  it("giá lõi vào LoiLoc.gia; dòng giá lõi KHÔNG lọt vào giá máy", async () => {
    const khach = khachGia(
      [{ alias_norm: "CTS10NB", internal_code: "CTS10NB" }],
      {
        chatbot_price: [GIA_MAY, GIA_LOI],
        // `filter_name` thừa dấu cách cuối — đúng như dữ liệu live.
        chatbot_machine_filter: [{ internal_code: "CTS10NB", filter_name: "Bộ lọc GE CFNC cho máy CTS10 ", chu_ky_raw: "12 tháng" }],
        chatbot_warranty: [], chatbot_promotion: [],
      },
    );
    const sl = await docSoLieuMay("CTS10", khach as never);
    expect(sl?.gia).toEqual([{ ten: "Máy lọc nước GE CTS10", dong: 30950000 }]);
    expect(sl?.loi[0].gia).toBe(5000000);
  });

  it("lõi KHÔNG khớp tên (WH-family) → gia null, ", async () => {
    const khach = khachGia(
      [{ alias_norm: "WH15A", internal_code: "WH15A" }],
      {
        chatbot_price: [{ internal_code: "WH15A", product_name: "GE WH15A", gia_ban: 179950000 }],
        chatbot_machine_filter: [{ internal_code: "WH15A", filter_name: "GTEF-15A01", chu_ky_raw: "5 năm" }],
        chatbot_warranty: [], chatbot_promotion: [],
      },
    );
    const sl = await docSoLieuMay("WH15A", khach as never);
    expect(sl?.loi[0].gia).toBeNull();
  });
});

// PostgREST trả numeric/bigint dưới dạng CHUỖI — số CTKM (giá sau KM, %giảm)
// đi qua soHoac trước khi lên prompt. Bẫy: chuỗi rỗng KHÔNG được hoá 0.
describe("soHoac", () => {
  it("ép chuỗi numeric của PostgREST về number (giữ cả số đã là number)", () => {
    expect(soHoac("31960000")).toBe(31960000);
    expect(soHoac("0.15")).toBe(0.15);
    expect(soHoac("0")).toBe(0);
    expect(soHoac(20)).toBe(20);
  });

  it("rỗng / khoảng trắng / phi số / null / NaN → null (không hoá 0)", () => {
    expect(soHoac("")).toBeNull();
    expect(soHoac("   ")).toBeNull();
    expect(soHoac("abc")).toBeNull();
    expect(soHoac(null)).toBeNull();
    expect(soHoac(undefined)).toBeNull();
    expect(soHoac(Number.NaN)).toBeNull();
  });
});
