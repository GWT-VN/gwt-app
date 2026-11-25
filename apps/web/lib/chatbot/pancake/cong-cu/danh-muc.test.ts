import { describe, expect, it } from "vitest";

import { doDanhMuc, MA_MAY, maMayTrongChu, nhomBaoGia } from "./danh-muc.ts";

describe("maMayTrongChu (mã máy gốc nhắc trong chữ)", () => {
  it.each([
    ["máy cts20 bị rỉ", ["CTS20"]],
    ["CTS10NB và CTS10NW", ["CTS10"]], // biến thể màu → mã gốc, bỏ trùng
    ["WH15AECO", ["WH15AECO"]], // khớp đúng thắng — không rơi về WH15A
    ["WH15AECOX", ["WH15AECO"]], // phần đuôi chỉ chữ → mã DÀI nhất làm tiền tố
    ["CTS10X1", []], // đuôi có số → không phải mã
    ["b04, wh15a/gn610.", ["B04", "WH15A", "GN610"]],
    ["lõi KDF55, giá bao nhiêu", []],
    ["", []],
  ])("%j → %j", (s, ra) => expect(maMayTrongChu(s)).toEqual(ra));
});

describe("doDanhMuc", () => {
  it("'Giá Máy lọc tổng nguồn GE là bao nhiêu' → đủ 4 WH", () =>
    expect(doDanhMuc("Giá Máy lọc tổng nguồn GE là bao nhiêu"))
      .toEqual(["WH15A", "WH15AECO", "WH30A", "WH30AECO"]));
  it("không dấu 'gia may loc tong bao nhieu' → khớp", () =>
    expect(doDanhMuc("gia may loc tong bao nhieu")).not.toBeNull());
  it("'máy để bàn nhà tôi hiện E5' → nhóm để bàn", () =>
    expect(doDanhMuc("máy để bàn nhà tôi hiện E5"))
      .toEqual(["CTS10", "CTS20", "CTD50", "B04"]));
  it("'máy âm tủ bếp loại nào lọc khỏe' → nhóm âm tủ", () =>
    expect(doDanhMuc("máy âm tủ bếp loại nào lọc khỏe"))
      .toEqual(["USH10", "GN610", "GN620", "DN810"]));
  // EV-010 (102 câu thật 2026-09-19): khách tả faucet dưới bồn rửa = máy ÂM TỦ; trước đó
  // bot hỏi lại "CTS20, B04 hay WH15" (để bàn + lọc tổng — không máy nào có faucet).
  it("'faucet' → nhóm âm tủ", () =>
    expect(doDanhMuc("Faucet nhà mình là loại tích hợp luôn cả vòi nước lọc thì việc lắp đặt có vấn đề j ko"))
      .toEqual(["USH10", "GN610", "GN620", "DN810"]));
  it("có ranh giới từ — 'tổng cộng' không phải 'lọc tổng'", () =>
    expect(doDanhMuc("tổng cộng bao nhiêu tiền")).toBeNull());
  it("câu không danh mục → null", () =>
    expect(doDanhMuc("nhà tôi nuôi mèo thì nên mua máy gì cho mèo uống")).toBeNull());
  it("câu giá trần không danh mục → null", () =>
    expect(doDanhMuc("nó bao nhiêu tiền")).toBeNull());
});

describe("MA_MAY (tập máy thật — để bộ đếm 'trộn máy' không tính nhầm mã lõi/vật liệu)", () => {
  it("chứa mọi mã máy", () => {
    for (const m of ["WH30A", "WH15A", "CTS10", "CTD50", "B04", "USH10", "GN620", "DN810"])
      expect(MA_MAY.has(m)).toBe(true);
  });
  it("KHÔNG chứa mã lõi lọc / vật liệu", () => {
    for (const x of ["KDF55", "SS316L", "PCF10-G01-G", "GT-PCF10-G01-G", "CPF"])
      expect(MA_MAY.has(x)).toBe(false);
  });
  it("đúng CHÍNH XÁC 12 mã máy (chốt cấu trúc — thêm/bớt/nhiễm mã lõi phải sửa test = buộc review)", () =>
    expect([...MA_MAY].sort()).toEqual(
      ["B04", "CTD50", "CTS10", "CTS20", "DN810", "GN610", "GN620", "USH10", "WH15A", "WH15AECO", "WH30A", "WH30AECO"],
    ));
});

// Luật viết CÓ DẤU (spec 2026-09-30-chatbot-luat-co-dau-design.md): câu có dấu so đúng dấu, câu gõ trần khớp như cũ.
describe("luật có dấu (KÉP) — danh-muc", () => {
  it("câu có dấu: 'để bán' / 'dễ bán' KHÔNG phải máy để bàn", () => {
    expect(doDanhMuc("máy này để bán hả em")).toBeNull();
    expect(doDanhMuc("loại này dễ bán không")).toBeNull();
  });
  it("câu không dấu, câu LẪN, chữ HOA + NFD vẫn khớp", () => {
    expect(doDanhMuc("may de ban gia bao nhieu")).toEqual(["CTS10", "CTS20", "CTD50", "B04"]);
    expect(doDanhMuc("máy loc tổng")).toEqual(["WH15A", "WH15AECO", "WH30A", "WH30AECO"]);
    expect(doDanhMuc("MÁY LỌC TỔNG".normalize("NFD"))).toEqual(["WH15A", "WH15AECO", "WH30A", "WH30AECO"]);
    expect(doDanhMuc("lắp âm tủ bếp được không")).toEqual(["USH10", "GN610", "GN620", "DN810"]);
  });
  it("khoảng trắng lạ (NBSP, tab, xuống dòng, nhiều dấu cách) như một dấu cách", () => {
    expect(doDanhMuc("MÁY LỌC\u00a0TỔNG")).toEqual(["WH15A", "WH15AECO", "WH30A", "WH30AECO"]);
    expect(doDanhMuc("máy để\tbàn")).toEqual(["CTS10", "CTS20", "CTD50", "B04"]);
    expect(doDanhMuc("máy âm\ntủ  bếp")).toEqual(["USH10", "GN610", "GN620", "DN810"]);
  });
  // Lỗi gõ dấu đã đo (2026-09-30): cụm cho "lộc", "tông", "dầu", "đâu" (trơ là từ có nghĩa); "đàu" qua LOI_GO.
  it("lỗi gõ dấu đã đo: 'lộc tổng', 'lọc tông', 'lọc dầu/đâu/đàu nguồn' vẫn là lọc tổng", () => {
    for (const cau of ["tư vấn giúp em bộ lộc tổng", "lọc tông của GE có mấy loại", "nhà phố nên lắp lọc dầu nguồn không",
      "hệ lọc đâu nguồn cho biệt thự", "lọc đàu nguồn lắp ở đâu"])
      expect(doDanhMuc(cau), cau).toEqual(["WH15A", "WH15AECO", "WH30A", "WH30AECO"]);
  });
});

describe("nhomBaoGia — máy ĐANG BÁN để báo giá (B04 ngừng bán, đã chốt 2026-10-20)", () => {
  it("B04 ra khỏi bảng giá / máy đang bán nhưng vẫn là máy (hỏi lại máy, mã máy khách cũ)", () => {
    expect(nhomBaoGia("máy để bàn giá bao nhiêu")).toEqual([{ ten: "Máy để bàn", dsMay: ["CTS10", "CTS20", "CTD50"] }]);
    expect(nhomBaoGia("").flatMap((n) => n.dsMay)).not.toContain("B04");
    expect(nhomBaoGia("").map((n) => n.ten)).toEqual(["Máy để bàn", "Máy âm tủ bếp", "Lọc tổng đầu nguồn"]);
    expect(doDanhMuc("máy để bàn")).toContain("B04");
    expect(MA_MAY.has("B04")).toBe(true);
  });
});
