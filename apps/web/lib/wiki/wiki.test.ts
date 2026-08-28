import { describe, expect, it } from "vitest";
import { SAN_PHAM } from "./data/san-pham";
import { CONG_BO, NHOM, phanCuaNhom, type SanPham } from "./kieu";
import { NHANH, crumbFor, navCuaNhanh, navSanPham, nhanhCua } from "./nav";

const ush10 = SAN_PHAM.find((s) => s.ma === "ush10") as SanPham;

describe("dữ liệu PKB bóc từ pkb.md", () => {
  it("có ít nhất một sản phẩm và USH10 nằm trong đó", () => {
    expect(SAN_PHAM.length).toBeGreaterThan(0);
    expect(ush10).toBeDefined();
  });

  it("USH10 có đủ 10 phần, phần nào cũng có nội dung", () => {
    expect(ush10.phan).toHaveLength(10);
    expect(ush10.phan.filter((p) => p.coNoiDung)).toHaveLength(10);
    expect(ush10.phan.map((p) => p.so)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("mỗi phần cắt ra đúng tiêu đề của nó, không nuốt sang phần sau", () => {
    for (const p of ush10.phan) {
      expect(p.noiDung.startsWith(`# PHẦN ${p.so}`), `phần ${p.so}`).toBe(true);
      // Chỉ được chứa ĐÚNG MỘT mốc `# PHẦN` — nhiều hơn là cắt hụt.
      expect(p.noiDung.match(/^#\s+PHẦN\s+\d+\s*[—–-]/gm) ?? []).toHaveLength(1);
    }
  });

  it("mã dữ kiện không trùng nhau", () => {
    const ma = ush10.facts.map((f) => f.ma);
    expect(new Set(ma).size).toBe(ma.length);
  });

  it("MỌI dữ kiện đều có nhãn công bố hợp lệ", () => {
    // Đây là điểm an toàn: một dòng không nhãn là một dòng người đọc không biết
    // được nói với khách hay không. Nhóm K/L/M không có cột Công bố nên nhãn phải
    // được lấy từ tiêu đề nhóm.
    const khongNhan = ush10.facts.filter((f) => !CONG_BO[f.congBo]);
    expect(khongNhan.map((f) => f.ma)).toEqual([]);
  });

  it("nhãn công bố là emoji đủ, không phải nửa surrogate", () => {
    // Regex thiếu cờ `u` từng cắt 🔵 thành "\ud83d". Chốt lại bằng test.
    for (const f of ush10.facts) {
      expect([...f.congBo]).toHaveLength(1);
      expect(f.congBo.codePointAt(0)).toBeGreaterThan(0xffff);
    }
  });

  it("dữ kiện nhạy cảm được gắn đúng nhãn", () => {
    const lay = (ma: string) => ush10.facts.find((f) => f.ma === ma);
    // Mục K = dữ liệu kinh doanh, toàn bộ nội bộ.
    expect(lay("F-K01")?.congBo).toBe("🔵");
    // Mục M = dữ kiện đã xác định SAI, hạng X, cấm nói.
    expect(lay("F-M01")?.congBo).toBe("🔴");
    expect(lay("F-M01")?.hang).toBe("X");
    // Mục L = suy luận số học, hạng E, nội bộ.
    expect(lay("F-L03")?.hang).toBe("E");
    expect(lay("F-L03")?.congBo).toBe("🔵");
  });

  it("tên nhóm đã bỏ phần chú thích trong ngoặc", () => {
    const l = ush10.facts.find((f) => f.ma === "F-L01");
    expect(l?.tenNhom).toBe("SUY LUẬN SỐ HỌC");
    expect(l?.tenNhom).not.toContain("(");
  });

  it("số hiệu TÜV đã chốt là 1111279087, không còn 1111297087 như dữ kiện đúng", () => {
    const i01 = ush10.facts.find((f) => f.ma === "F-I01");
    expect(i01?.giaTri).toContain("1111279087");
    expect(i01?.hang).toBe("A");
  });
});

describe("chia nhóm thông tin theo người đọc", () => {
  it("Phần 1 (bảng sự thật) hiện trong CẢ BA nhóm nghiệp vụ", () => {
    for (const nhom of ["ky-thuat", "san-pham", "truyen-thong"] as const) {
      const so = phanCuaNhom(ush10, nhom).map((p) => p.so);
      expect(so, nhom).toContain(1);
      expect(so[0], `${nhom}: bảng sự thật phải đứng đầu`).toBe(1);
    }
  });

  it("nhóm Quản lý KHÔNG kèm Phần 1 — nó có Phần 0 và 8", () => {
    const so = phanCuaNhom(ush10, "quan-ly").map((p) => p.so);
    expect(so).toEqual([0, 8]);
  });

  it("mỗi nhóm nghiệp vụ có đúng các phần đã quy ước", () => {
    expect(phanCuaNhom(ush10, "ky-thuat").map((p) => p.so)).toEqual([1, 3, 4, 5]);
    expect(phanCuaNhom(ush10, "san-pham").map((p) => p.so)).toEqual([1, 6, 9]);
    expect(phanCuaNhom(ush10, "truyen-thong").map((p) => p.so)).toEqual([1, 2, 7]);
  });

  it("gộp 4 nhóm là phủ hết 10 phần, không sót phần nào", () => {
    const phu = new Set(NHOM.flatMap((n) => phanCuaNhom(ush10, n.ma).map((p) => p.so)));
    expect([...phu].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});

describe("điều hướng khu Wiki", () => {
  it("nhận đúng nhánh từ đường dẫn", () => {
    expect(nhanhCua("/wiki")).toBeNull();
    expect(nhanhCua("/wiki/marketing")).toBe("marketing");
    expect(nhanhCua("/wiki/marketing/luat/ad-compliance-vn")).toBe("marketing");
    expect(nhanhCua("/wiki/san-pham")).toBe("san-pham");
    expect(nhanhCua("/wiki/san-pham/ush10/tra-cuu")).toBe("san-pham");
  });

  it("mọi href trong nav đều nằm dưới /wiki", () => {
    for (const nhanh of NHANH) {
      for (const g of navCuaNhanh(nhanh.ma)) {
        for (const i of g.items) expect(i.href.startsWith("/wiki/"), i.href).toBe(true);
      }
    }
  });

  it("nav nhánh Sản phẩm có mỗi máy một nhóm, kèm Tổng quan và Tra cứu", () => {
    const nav = navSanPham();
    expect(nav).toHaveLength(SAN_PHAM.length);
    const nhan = nav[0].items.map((i) => i.label);
    expect(nhan).toContain("Tổng quan");
    expect(nhan).toContain("Tra cứu dữ kiện");
  });

  it("breadcrumb khớp đường dài nhất, và trang gốc nhánh không nuốt trang con", () => {
    expect(crumbFor("/wiki/san-pham/ush10/tra-cuu")).toBe("Tra cứu dữ kiện");
    expect(crumbFor("/wiki/san-pham/ush10")).toBe("Tổng quan");
    // `/wiki/marketing` là gốc nhánh — không được thành breadcrumb của mọi trang con.
    expect(crumbFor("/wiki/marketing/kho-case")).toBe("Kho case WIN / FAIL");
  });
});
