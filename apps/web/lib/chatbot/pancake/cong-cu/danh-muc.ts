// chép từ GWT-ERP lib/chatbot/chat/danh-muc.ts @c2f3719
/**
 * Bảng DANH MỤC → danh sách MÁY (tên thương mại) — cầu nối cho câu gọi sản phẩm
 * bằng tên danh mục thay vì mã máy ("máy lọc tổng", "máy để bàn", "âm tủ").
 *
 * Nguồn: catalog_item live (project qynpy, đọc 2026-08-17, Danh mục cấp 1 =
 * Machines, lọc "Đang KD") + tên thương mại theo tài liệu kho. Là HẰNG SỐ CODE
 * có chủ đích — máy mới ra là chuyện vài tháng một lần; bảng bắt đầu trôi so
 * với masterdata thì mới đáng chuyển sang đọc DB (spec "Không làm đợt này").
 *
 * Từ khoá viết CÓ DẤU, dạng chuẩn của `chuanCau` (spec 2026-09-30-chatbot-luat-co-dau-design.md): câu gõ không dấu vẫn
 * khớp dạng trần, câu có dấu thì "để bán" không còn là "để bàn". Có ranh giới từ để "tổng cộng" không dính "lọc tổng".
 */
import { chuanCau, luat } from "./chuan-dau.ts";

const DANH_MUC: ReadonlyArray<{ ten: string; tuKhoa: readonly string[]; dsMay: readonly string[] }> = [
  {
    ten: "Lọc tổng đầu nguồn",
    // Lỗi gõ dấu đo 2026-09-30 (106.857 câu, mọi lần đều là lọc tổng/lọc đầu nguồn): "lộc tổng" 7 câu, "lọc tông" 5,
    // "lọc dầu nguồn" 2, "lọc đâu nguồn" 1. Nhận theo CỤM vì lộc/tông/dầu/đâu là từ có nghĩa; dạng bỏ dấu của cụm trùng từ
    // khoá cũ nên không đẻ khớp mới. "lọc đàu nguồn" không cần cụm: "đàu" nằm trong LOI_GO (chuan-dau.ts).
    tuKhoa: [
      "lọc tổng nguồn", "lọc tổng", "lọc đầu nguồn", "hệ lọc tổng",
      "lộc tổng", "lọc tông", "lọc dầu nguồn", "lọc đâu nguồn",
    ],
    dsMay: ["WH15A", "WH15AECO", "WH30A", "WH30AECO"],
  },
  {
    ten: "Máy để bàn",
    tuKhoa: ["máy để bàn", "để bàn"],
    dsMay: ["CTS10", "CTS20", "CTD50", "B04"],
  },
  {
    // "faucet" (EV-010, 2026-09-19): chỉ máy âm tủ đi kèm vòi riêng trên bồn rửa. KHÔNG thêm
    // "vòi" trần — dính "vòi sen" (sản phẩm khác); gõ không dấu còn trùng "với".
    tuKhoa: ["âm tủ bếp", "âm tủ", "gầm tủ", "faucet"],
    ten: "Máy âm tủ bếp",
    dsMay: ["USH10", "GN610", "GN620", "DN810"],
  },
];

/**
 * Tập mọi mã MÁY (tên thương mại) trong bảng danh mục — NGUỒN DUY NHẤT để phân
 * biệt mã máy với mã lõi lọc / vật liệu (KDF55, SS316L, GT-PCF10-G01-G…). Bộ đếm
 * "trộn máy" trong bộ đo dùng tập này để khỏi tính nhầm mã lõi/vật liệu thành máy
 * thứ hai (đo 2026-09-18: 2/2 câu "trộn máy" là false-positive kiểu đó).
 */
export const MA_MAY: ReadonlySet<string> = new Set(
  DANH_MUC.flatMap((dm) => dm.dsMay).map((m) => m.toUpperCase()),
);

const MA_DAI_TRUOC = [...MA_MAY].sort((a, b) => b.length - a.length);
/**
 * Mã MÁY gốc nhắc trong chữ, bỏ trùng, theo thứ tự gặp. Tách theo ký tự không phải chữ/số, viết hoa; mỗi token lấy mã MA_MAY DÀI
 * nhất làm tiền tố của nó mà phần đuôi chỉ là chữ: biến thể màu CTS10NB/CTS10NW → CTS10 (dùng chung tài liệu), WH15AECO giữ
 * WH15AECO (không rơi về WH15A), CTS10X1 (đuôi có số) → không phải mã.
 */
export function maMayTrongChu(s: string): string[] {
  const ra = new Set<string>();
  for (const w of s.toUpperCase().split(/[^\p{L}\p{N}]+/u)) {
    const ma = MA_DAI_TRUOC.find((m) => w.startsWith(m) && /^\p{L}*$/u.test(w.slice(m.length)));
    if (ma) ra.add(ma);
  }
  return [...ra];
}

/** dsMay của danh mục chứa máy `ma` (tên thương mại), hoặc null khi máy ngoài bảng. */
export function danhMucCuaMay(ma: string): string[] | null {
  const dm = DANH_MUC.find((d) => d.dsMay.some((m) => m.toUpperCase() === ma.toUpperCase()));
  return dm ? [...dm.dsMay] : null;
}

// Mỗi danh mục một luật: các từ khoá nối "|", có ranh giới từ.
const LUAT_DANH_MUC = DANH_MUC.map((dm) => luat(dm.tuKhoa.map((tk) => `\\b${tk}\\b`)));

// Ngừng bán MÁY, vẫn bán LÕI (đã chốt 2026-10-20): vẫn là MÁY trong DANH_MUC / MA_MAY (khách cũ hỏi lõi, bảo hành, báo lỗi —
// hỏi lại "máy nào" vẫn kể), nhưng không vào bảng giá máy, không vào "máy đang bán".
export const NGUNG_BAN: ReadonlySet<string> = new Set(["B04"]);

/** Nhóm máy ĐANG BÁN để báo giá câu hỏi giá chung chung (đã chốt 2026-10-20): danh mục câu nêu, không nêu → cả ba (máy uống trước). */
export function nhomBaoGia(cauHoi: string): Array<{ ten: string; dsMay: string[] }> {
  const cau = chuanCau(cauHoi);
  const i = LUAT_DANH_MUC.findIndex((re) => re.test(cau));
  const ds = i < 0 ? [DANH_MUC[1], DANH_MUC[2], DANH_MUC[0]] : [DANH_MUC[i]];
  return ds.map((d) => ({ ten: d.ten, dsMay: d.dsMay.filter((m) => !NGUNG_BAN.has(m)) }));
}

/** dsMay của danh mục ĐẦU TIÊN khớp trong câu, hoặc null. */
export function doDanhMuc(cauHoi: string): string[] | null {
  const cau = chuanCau(cauHoi);
  const i = LUAT_DANH_MUC.findIndex((re) => re.test(cau));
  return i < 0 ? null : [...DANH_MUC[i].dsMay];
}
