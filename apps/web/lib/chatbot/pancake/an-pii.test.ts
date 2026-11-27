// chép từ GWT-ERP tests/chatbot/pancake-an-pii.test.ts @c2f3719
import { describe, expect, it } from "vitest";

import { an, anCap, anPii, anSo, conSo, conSoLon } from "./an-pii.ts";

describe("anPii", () => {
  it.each([
    ["gọi em 0123456789 nhé", "gọi em {SĐT} nhé"],
    ["số +84 912 345 678 ạ", "số {SĐT} ạ"],
    ["sđt 0912.345.678", "sđt {SĐT}"],
    ["B04 16.950.000 đ, GN610 16.950.000đ", "B04 16.950.000 đ, GN610 16.950.000đ"], // mã máy + giá không phải SĐT (đo 2026-10-20)
    ["gọi 0123456789 được không", "gọi {SĐT} được không"],
    ["mail ban.a@vi-du.vn nhé", "mail {email} nhé"],
    ["xem https://vi-du.com/x?y=1 nhé", "xem {link} nhé"],
    ["xem https://gwt.vn/san-pham/cts10 nhé", "xem https://gwt.vn/san-pham/cts10 nhé"],
    ["giao số nhà 12 ngõ 5 Láng Hạ, mai nhé", "giao {địa chỉ}, mai nhé"],
    ["ở Tòa Ruby, tầng 3", "ở {địa chỉ}, tầng 3"],
    ["nhà em ở quận Cầu Giấy, Hà Nội", "nhà em ở {địa chỉ}, Hà Nội"],
    ["dạ anh Hùng ơi, em gửi giá", "dạ anh {tên} ơi, em gửi giá"],
    ["Chị Lan cần máy nào ạ", "Chị {tên} cần máy nào ạ"],
  ])("%s", (vao, ra) => expect(anPii(vao)).toBe(ra));

  // Vòng sửa 1 (R2–R4): SĐT dính chữ / mã nước kiểu khác / máy bàn, tên nhiều âm tiết, địa chỉ có "đc:".
  it.each([
    ["sdt0123456789 nhé", "sdt{SĐT} nhé"],
    ["zalo0123456789", "zalo{SĐT}"],
    ["(+84)912345678", "{SĐT}"],
    ["84912345678 ạ", "{SĐT} ạ"],
    ["0912  345 678", "{SĐT}"],
    ["gọi bàn 024 3856 1234 nhé", "gọi bàn {SĐT} nhé"],
    ["chị Lan Anh ơi", "chị {tên} ơi"],
    ["anh Nguyễn Văn Hùng cần máy", "anh {tên} cần máy"],
    ["đc: 12 Lê Lợi, Huế", "{địa chỉ}, Huế"],
    ["Địa chỉ: tầng 3 toà A", "{địa chỉ}"],
  ])("vòng sửa 1: %s", (vao, ra) => expect(anPii(vao)).toBe(ra));

  it("tên không kéo sang dòng sau", () => {
    expect(anPii("chị Lan\nEm gửi giá")).toBe("chị {tên}\nEm gửi giá");
  });

  it("địa chỉ không có dấu hai chấm là câu hỏi — giữ nguyên", () => {
    expect(anPii("địa chỉ cửa hàng ở đâu ạ")).toBe("địa chỉ cửa hàng ở đâu ạ");
  });

  it("mệnh đề địa chỉ cắt ở 40 ký tự sau từ khoá — tin dài không dấu câu không mất nội dung", () => {
    // "CTS10" nằm cách "ngõ 5" 48 ký tự, tức ngoài đuôi 40 ký tự nên còn nguyên (cách 16 ký tự thì vẫn nằm trong đuôi và bị che).
    const ra = anPii("em ở ngõ 5 nhé anh ơi cho em hỏi thêm một chút nữa là máy CTS10 lắp được không vậy ạ");
    expect(ra).toContain("{địa chỉ}");
    expect(ra).toContain("CTS10 lắp được không vậy ạ");
  });

  it("không che từ thường / mã máy", () => {
    for (const s of ["anh quan tâm chi phí", "đường nước nhà mình yếu", "máy cts10 và wh15a eco", "chị ơi máy CTS10 giá sao", "phường"]) {
      expect(anPii(s)).toBe(s);
    }
  });
});

describe("anSo", () => {
  it.each([
    ["CTS10 giá 30.950.000đ ạ", "CTS10 giá {số}đ ạ"],
    ["lõi lọc 4000L, 1.5L/phút", "lõi lọc {số}L, {số}L/phút"],
    ["nhà 4 tầng 5 người", "nhà {số} tầng {số} người"],
    ["giảm 10% tới 31/10", "giảm {số}% tới {số}"],
    ["máy cts10, wh15a eco, WH30AECO, lõi KDF55, GT-PCF10-G01-G", "máy cts10, wh15a eco, WH30AECO, lõi KDF55, GT-PCF10-G01-G"],
    ["{SĐT} và {địa chỉ}", "{SĐT} và {địa chỉ}"],
  ])("%s", (vao, ra) => expect(anSo(vao)).toBe(ra));

  // Vòng sửa 1 (R1, R5): chỉ MA_MAY hoặc mã VIẾT HOA ASCII (không dãy ≥5 số) mới là mã; từ thường dính số thì che.
  it.each([
    ["giá30tr", "giá{số}tr"],
    ["bh5nam", "bh{số}nam"],
    ["lần2", "lần{số}"],
    ["stk19034567890123", "stk{số}"],
    ["CTS10/CTS15 và CTS10,WH15A", "CTS10/CTS15 và CTS10,WH15A"],
    ["lõi KDF55, SS316L, GT-PCF10-G01-G, WH30AECO", "lõi KDF55, SS316L, GT-PCF10-G01-G, WH30AECO"],
    ["AB123456", "AB{số}"],
  ])("vòng sửa 1: %s", (vao, ra) => expect(anSo(vao)).toBe(ra));
});

describe("an / conSo", () => {
  it("an = anSo(anPii(…)): SĐT thành {SĐT} chứ không thành {số}", () => {
    expect(an("gọi 0123456789, giá 30.950.000đ")).toBe("gọi {SĐT}, giá {số}đ");
  });
  it("conSo: có số ngoài mã máy/mã lõi", () => {
    expect(conSo("máy CTS10 và lõi KDF55")).toBe(false);
    expect(conSo("bảo hành 5 năm")).toBe(true);
    expect(conSo("giá {số}đ")).toBe(false);
  });
  it("vòng sửa 1: SĐT dính chữ, số dính chữ thường", () => {
    expect(an("sdt0123456789")).toBe("sdt{SĐT}");
    expect(conSo("giá30tr")).toBe(true);
    expect(conSo("lõi KDF55")).toBe(false);
  });
});

describe("anSoLon / anCap — giữ số nhỏ, che tiền/%/số dài", () => {
  it("giữ số nhỏ chỉ thời gian/bước/lần", () => {
    expect(anCap("giữ nút lạnh 3 giây, bước 2 bấm 2 lần")).toBe("giữ nút lạnh 3 giây, bước 2 bấm 2 lần");
    expect(anCap("CTS20 giữ 5 giây")).toBe("CTS20 giữ 5 giây");
    expect(anCap("lọc 1.5 lít, 2 trên 3 vòi, 5 km")).toBe("lọc 1.5 lít, 2 trên 3 vòi, 5 km"); // "tr"/"k" chỉ tính khi là đơn vị trọn từ
    expect(anCap("nóng 90 độ, 5 đông lạnh")).toBe("nóng 90 độ, 5 đông lạnh"); // "độ", "đông" không phải "đô"
  });

  it.each([
    "giá 1.200.000đ", "còn 500k", "2 triệu", "1tr2", "giảm 15%", "năm 2025", "16950000", "3 củ", "5 Đồng", "9 nghìn", "1,5 triệu", "2,5%", "500/700k",
    "Phí thay lõi 3 trăm nghìn", "giảm 15 phần trăm", "giá 5 đô", "giá $5", "giá $ 5", "giá 5 USD", "giá 5usd", "giá 5$",
    "1 tỷ", "2 tỉ", "2 trieu", "500 nghin", "300 ngan", "1,5 tỷ",
  ])("che: %s", (s) => expect(conSoLon(s)).toBe(true));
  it("đơn vị tiền không dấu / tỷ: che đúng phần số, số nhỏ khác giữ", () => {
    expect(anCap("giữ 3 giây, giá 1 tỷ hoặc 2 trieu, 500 nghin")).toBe("giữ 3 giây, giá {số} tỷ hoặc {số} trieu, {số} nghin");
  });

  it("che đúng phần số", () => {
    expect(anCap("giá 1.200.000đ, giảm 15%, năm 2025")).toBe("giá {số}đ, giảm {số}%, năm {số}");
    expect(anCap("còn 2tr5 hoặc 2 triệu")).toBe("còn {số}tr{số} hoặc {số} triệu");
    expect(anCap("giữ 3 giây còn 500k")).toBe("giữ 3 giây còn {số}k");
    // số tách bởi , hoặc / : đơn vị cuối chuỗi tính cho cả chuỗi, không để lọt phần đầu
    expect(anCap("1,5 triệu")).toBe("{số} triệu");
    expect(anCap("2,5tr, giảm 2,5%, 500/700k")).toBe("{số}tr, giảm {số}%, {số}k");
    expect(anCap("1,2,3 bước")).toBe("1,2,3 bước");
    expect(anCap("20/10 gọi 3 lần")).toBe("20/10 gọi 3 lần");
    // đơn vị bằng chữ / ngoại tệ
    expect(anCap("giá $5, 3 trăm nghìn, 15 phần trăm, 5 USD, 2 đô")).toBe("giá ${số}, {số} trăm nghìn, {số} phần trăm, {số} USD, {số} đô");
    expect(anCap("giá $1,500 hoặc 7$")).toBe("giá ${số} hoặc {số}$"); // "$" trước tính cho cả chuỗi `số,số`
  });

  it("gọi 0123456789 → SĐT; anSo/an/conSo giữ nguyên chế độ che mọi số", () => {
    expect(anCap("gọi 0123456789")).toBe("gọi {SĐT}");
    expect(an("giữ 3 giây")).toBe("giữ {số} giây");
    expect(conSo("giữ 3 giây")).toBe(true);
    expect(conSoLon("giữ 3 giây")).toBe(false);
  });
});
