import type { Nhom } from "./phan-loai.ts";
import { tachDoan } from "./dung-tin.ts";
import type { KetQuaTra } from "./tu-tra.ts";

/** R3: chỉ ba nhóm này được tự gửi. */
export const NHOM_DUOC_GUI: ReadonlySet<string> = new Set(["tu_van", "loi_loc", "hoi_gia"]);

// Bot được báo giá bán trực tiếp + khuyến mãi + quà đúng như Masterdata (anh Dũng chốt 2026-11-27: "báo giá bán trực tiếp và
// kèm quà"). Còn chuyển người: khách mặc cả / trả góp / voucher, và mọi tin khách nhắc Shopee (giá Shopee dao động theo voucher).
// "rẻ hơn" chỉ chặn khi là MẶC CẢ ("rẻ hơn chút được không"); "có loại nào rẻ hơn không" là hỏi phương án → bot trả lời (lọc tổng: giới thiệu ECO).
const KHACH_HOI_GIAM = /trả góp|giảm thêm|bớt|rẻ hơn (?:chút|tí|xíu|nữa|được|đc|dc)|giá tốt|voucher/i;
const TRA_LOI_TRA_GOP = /trả góp/i;
// Khách hay gõ không dấu → so thêm trên bản bỏ dấu, chỉ cụm cụ thể.
const KHACH_HOI_GIAM_KHONG_DAU = /\b(?:tra gop|giam them|bot (?:cho|gia|duoc)|re hon (?:chut|ti|xiu|nua|duoc|dc)|gia tot|voucher)\b/;
const KHACH_NHAC_SHOPEE = /\b(?:s+h?o+p+e+|sp shopee)\b/; // shopee, sopee, shoppe, shope — so trên bản bỏ dấu
const boDau = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

/** Lý do phải chuyển người TRƯỚC khi soạn; null = được soạn. */
export function chanTruocSoan(o: {
  nhom: Nhom | null; gap: boolean; coAnh: boolean; nvTrong24h: boolean;
  botLuotHomNay: number; daGuiHomNay: number; tranNgay: number; tinKhach: string;
}): string | null {
  if (!o.nhom || !NHOM_DUOC_GUI.has(o.nhom)) return `nhom_${o.nhom ?? "chua_phan_loai"}`;
  if (o.gap) return "gap";
  if (o.coAnh) return "khach_gui_anh";
  if (o.nvTrong24h) return "nv_dang_xu_ly";
  if (o.botLuotHomNay >= 3) return "qua_3_luot";
  if (o.daGuiHomNay >= o.tranNgay) return "qua_tran_ngay";
  if (KHACH_NHAC_SHOPEE.test(boDau(o.tinKhach))) return "hoi_shopee";
  if (o.nhom === "hoi_gia" && (KHACH_HOI_GIAM.test(o.tinKhach.normalize("NFC")) || KHACH_HOI_GIAM_KHONG_DAU.test(boDau(o.tinKhach)))) return "hoi_tra_gop_giam_gia";
  return null;
}

/** Lý do chuyển người SAU khi soạn; null = được tự gửi. */
export function chanSauSoan(k: KetQuaTra): string | null {
  if (k.khongTraLoi) return "khong_tra_loi";
  if (k.canNv) return "can_nv";
  if (k.chanTuGui[0]) return k.chanTuGui[0];
  if (!k.traLoi.trim()) return "rong";
  if (tachDoan(k.traLoi).length > 6) return "qua_6_doan";
  if (TRA_LOI_TRA_GOP.test(k.traLoi.normalize("NFC"))) return "tra_loi_nhac_tra_gop";
  return null;
}
