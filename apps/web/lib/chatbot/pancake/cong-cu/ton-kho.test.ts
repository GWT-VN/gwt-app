import { describe, expect, it, vi } from "vitest";

import { tomTatTon, type DongTon } from "./ton-kho.ts";

// Tồn Shopee tạm (đã chốt 2026-10-23): Bắp ghi sales.shopee_stocks, nháp chỉ nói còn / hết.
const NOW = new Date("2026-10-23T08:00:00Z");
const d = (o: Partial<DongTon>): DongTon => ({
  item_name: "Máy lọc nước GE", model_name: null, item_sku: null, model_sku: null, item_status: "NORMAL", stock: 0,
  synced_at: "2026-10-23T07:45:00+00:00", ...o,
});

describe("tomTatTon", () => {
  // Dạng ảnh tồn thật (2026-10-23): lõi lọc / quà tặng cũng mang mã máy trong TÊN — chỉ SKU phân biệt được máy.
  const THAT = [
    d({ item_name: "Máy lọc nước âm tủ bếp 2in1 GE DN810", item_sku: "GTUN-8500XDS-G", stock: 0 }),
    d({ item_name: "Lõi lọc máy lọc nước âm tủ bếp 2in1 GE DN810", model_name: "GE PCFF", model_sku: "LX-PPF-003-G", stock: 3 }),
    d({ item_name: "Máy lọc nước để bàn GE CTS20 nối trực tiếp nguồn nước", item_sku: "CTS20NG", stock: 160 }),
    d({ item_name: "Lõi lọc máy lọc nước để bàn GE CTS20", model_name: "Bộ lọc GE PCF", model_sku: "LX-PCF-005-G", stock: 0 }),
    d({ item_name: "[Quà tặng không bán] Essentials Set - máy lọc nước GE CTD50", item_sku: "CTD50NG-QT", stock: 4 }),
    d({ item_name: "Máy lọc nước để bàn GE CTD50", item_sku: "CTD50NG", stock: 0 }),
    d({ item_name: "Máy lọc nước để bàn GE CTD50", item_sku: "CTD50NG", item_status: "UNLIST", stock: 80 }),
    d({ item_name: "Máy lọc nước nóng lạnh sparkling GE CTS10", model_name: "Màu đen", model_sku: "CTS10NB", stock: 0 }),
    d({ item_name: "Máy lọc nước nóng lạnh sparkling GE CTS10", model_name: "Màu trắng", model_sku: "CTS10NW ", stock: 60 }),
  ];
  it("còn hàng: khớp SKU máy (mã trên tem), KHÔNG nói số lượng; giờ cập nhật theo giờ VN", () => {
    const s = tomTatTon("cts20", THAT, NOW);
    expect(s).toBe("TỒN KHO SHOPEE (cập nhật 14:45 23/10, chỉ biết còn / hết, không có số lượng): CTS20 — còn hàng.");
    expect(s).not.toContain("160");
  });
  it("lõi lọc còn hàng KHÔNG làm máy thành còn hàng (DN810 máy hết, lõi DN810 còn) — lỗi đo trên ảnh tồn thật", () => {
    expect(tomTatTon("DN810", THAT, NOW)).toContain("DN810 — hết hàng.");
  });
  it("quà tặng (SKU …-QT) không tính; sản phẩm UNLIST không tính → CTD50 hết hàng", () => {
    expect(tomTatTon("CTD50", THAT, NOW)).toContain("CTD50 — hết hàng.");
    // quà tặng mang ĐÚNG SKU máy (có thật trên Shopee, đang ẩn) — bật lên cũng không tính
    expect(tomTatTon("GN610", [d({ item_name: "[Quà tặng không bán] Máy lọc nước mini âm tủ bếp GE GN610", item_sku: "GPUN-4000XEN-G", stock: 100 })], NOW))
      .toContain("không thấy GN610 đang bán");
  });
  it("máy có phân loại (SKU ở model_sku, có khoảng trắng thừa): nói từng màu còn / hết", () => {
    expect(tomTatTon("CTS10", THAT, NOW)).toContain("CTS10 — còn hàng (phân loại: Màu đen hết; Màu trắng còn).");
  });
  it("máy có trong bảng tem mà không thấy SKU đang bán → chưa rõ; lõi / lọc tổng → không tra được, chưa rõ", () => {
    expect(tomTatTon("USH10", THAT, NOW)).toContain("không thấy USH10 đang bán trên Shopee — chưa rõ USH10 còn hàng không.");
    expect(tomTatTon("CFNC", THAT, NOW)).toContain("không tra lõi, phụ kiện, lọc tổng) — chưa rõ CFNC còn hàng không.");
    expect(tomTatTon("WH15A", THAT, NOW)).toContain("chưa rõ WH15A còn hàng không.");
  });
  it("ảnh tồn cũ quá 3 giờ hay chưa có → chưa rõ (Bắp đã dừng ghi)", () => {
    expect(tomTatTon("CTS20", [d({ item_sku: "CTS20NG", stock: 5, synced_at: "2026-10-23T04:30:00+00:00" })], NOW))
      .toBe("TỒN KHO SHOPEE: chưa có dữ liệu mới (cập nhật cuối 11:30 23/10) — chưa rõ CTS20 còn hàng không.");
    expect(tomTatTon("CTS20", [], NOW)).toBe("TỒN KHO SHOPEE: chưa có dữ liệu mới — chưa rõ CTS20 còn hàng không.");
  });
});
