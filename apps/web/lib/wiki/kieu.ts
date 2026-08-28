/**
 * Kiểu dữ liệu Product Wiki. Dùng chung cho script sinh dữ liệu và cho các trang.
 *
 * Nguồn sự thật là `content/wiki/san-pham/<mã>/pkb.md`; file này chỉ mô tả hình dạng
 * mà `tools/scripts/sync-wiki-sanpham.mjs` bóc ra.
 */

/** Bốn nhóm thông tin — chia theo NGƯỜI ĐỌC, không theo chủ đề. */
export type MaNhom = "ky-thuat" | "san-pham" | "truyen-thong" | "quan-ly" | "xuong-song";

export type Nhom = {
  ma: MaNhom;
  ten: string;
  icon: string;
  /** Ai là người đọc chính của nhóm này. */
  vai: string[];
  moTa: string;
};

/**
 * Bốn nhóm hiện trên thanh bên. `xuong-song` KHÔNG có ở đây — Phần 1 cố ý xuất hiện
 * trong cả ba nhóm nghiệp vụ thay vì đứng riêng một chỗ (xem `PHAN_CUA_NHOM`).
 */
export const NHOM: Nhom[] = [
  {
    ma: "ky-thuat",
    ten: "Kỹ thuật",
    icon: "🔧",
    vai: ["Kỹ thuật", "CSKH"],
    moTa: "Lắp đặt, an toàn, vệ sinh, thay lõi, tra mã lỗi và xử lý sự cố hiện trường.",
  },
  {
    ma: "san-pham",
    ten: "Thông tin sản phẩm",
    icon: "📦",
    vai: ["Sales", "CSKH", "Marketing"],
    moTa: "Bảng sự thật, bộ hỏi–đáp đã kiểm chứng và lộ trình đào tạo.",
  },
  {
    ma: "truyen-thong",
    ten: "Truyền thông",
    icon: "📣",
    vai: ["Sales", "Marketing"],
    moTa: "Được nói gì, cấm nói gì, và nguyên liệu đã duyệt nguồn để viết bài.",
  },
  {
    ma: "quan-ly",
    ten: "Quản lý sản phẩm",
    icon: "🗂️",
    vai: ["PM sản phẩm"],
    moTa: "Nguồn dữ liệu, ma trận đối chiếu và sổ mâu thuẫn còn mở.",
  },
];

export type Phan = {
  so: number;
  slug: string;
  ten: string;
  nhom: MaNhom;
  coNoiDung: boolean;
  noiDung: string;
};

export type Fact = {
  /** `F-C17` */
  ma: string;
  /** Chữ cái nhóm dữ kiện trong Phần 1: A…M */
  nhom: string;
  tenNhom: string;
  duKien: string;
  giaTri: string;
  nguon: string;
  /** A · B · C · D · E · X — mã đã chuẩn hoá để lọc. Rỗng nếu không suy ra được. */
  hang: string;
  /** Nguyên văn ô "Hạng" — có dòng ghi "mâu thuẫn" thay vì một chữ cái. */
  hangGoc: string;
  /** 🟢 🟡 🔵 🔴 — rỗng nếu không tìm thấy nhãn nào. */
  congBo: string;
};

export type SanPham = {
  ma: string;
  ten: string;
  tenDayDu: string;
  loai: string;
  kieuLap: string;
  maNoiBo: string;
  maNSX: string;
  phienBanPKB: string;
  capNhat: string;
  trangThai: string;
  tomTat: string;
  anh: string | null;
  /** Bìa + mục lục, phần trước `# PHẦN 0`. */
  bia: string;
  phan: Phan[];
  facts: Fact[];
};

/**
 * Phần nào hiện trong nhóm nào.
 *
 * Phần 1 (bảng sự thật) cố ý lặp ở CẢ BA nhóm nghiệp vụ. Nó là "nguồn chân lý duy nhất" —
 * mọi câu nói về sản phẩm phải truy được về một mã `F-xxx` trong đó. Cắt nó ra làm ba
 * theo vai thì hỏng đúng cái luật gốc của tài liệu, và người đọc sẽ không tra được dữ kiện
 * nằm ngoài phần của mình.
 */
export function phanCuaNhom(sp: SanPham, nhom: MaNhom): Phan[] {
  const co = sp.phan.filter((p) => p.coNoiDung);
  if (nhom === "quan-ly") return co.filter((p) => p.nhom === "quan-ly");
  const rieng = co.filter((p) => p.nhom === nhom);
  const bangSuThat = co.filter((p) => p.nhom === "xuong-song");
  return [...bangSuThat, ...rieng];
}

/** Nhãn công bố → nghĩa + màu, dùng chung mọi nơi hiển thị. */
export const CONG_BO: Record<string, { ten: string; giaiThich: string; lop: string }> = {
  "🟢": { ten: "Công bố", giaiThich: "Được nói với khách, được lên hình, lên landing page.", lop: "cb-xanh" },
  "🟡": { ten: "Có điều kiện", giaiThich: "Nói được nhưng phải đúng câu chữ quy định ở Phần 2.", lop: "cb-vang" },
  "🔵": { ten: "Nội bộ", giaiThich: "Nhân viên biết để tư vấn; không đưa lên tài liệu xuất bản, không đọc số cho khách.", lop: "cb-xanh-duong" },
  "🔴": { ten: "Cấm", giaiThich: "Không được nói dưới bất kỳ hình thức nào.", lop: "cb-do" },
};

/** Hạng tin cậy → nghĩa. */
export const HANG: Record<string, string> = {
  A: "Ghi trong HDSD chính hãng đi kèm máy",
  B: "Tài liệu chính hãng khác (deck NSX, mô tả chứng nhận)",
  C: "Tài liệu kỹ thuật nội bộ hoặc cấp họ máy — có thể khác bản đang bán",
  D: "Tài liệu VN chưa truy được nguồn gốc",
  E: "Suy luận số học của người soạn — không phải công bố của hãng",
  X: "Đã xác định là SAI, phải gỡ khỏi mọi tài liệu",
};
