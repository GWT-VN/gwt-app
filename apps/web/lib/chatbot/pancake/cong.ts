import type { Nhom } from "./phan-loai.ts";
import { tachDoan } from "./dung-tin.ts";
import type { KetQuaTra } from "./tu-tra.ts";

/** R3: chỉ ba nhóm này được tự gửi. */
export const NHOM_DUOC_GUI: ReadonlySet<string> = new Set(["tu_van", "loi_loc", "hoi_gia"]);

// Spec cho phép báo giá + khuyến mãi đúng như Masterdata → "khuyến mãi"/"giảm" đứng một mình KHÔNG chặn.
const KHACH_HOI_QUA = /quà|tặng|trả góp|giảm thêm|bớt|rẻ hơn|giá tốt|voucher/i;
const TRA_LOI_NHAC_QUA = /quà|tặng|trả góp|voucher/i;

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
  if (o.nhom === "hoi_gia" && KHACH_HOI_QUA.test(o.tinKhach)) return "hoi_qua_tra_gop";
  return null;
}

/** Lý do chuyển người SAU khi soạn; null = được tự gửi. */
export function chanSauSoan(k: KetQuaTra): string | null {
  if (k.khongTraLoi) return "khong_tra_loi";
  if (k.canNv) return "can_nv";
  if (k.chanTuGui[0]) return k.chanTuGui[0];
  if (!k.traLoi.trim()) return "rong";
  if (tachDoan(k.traLoi).length > 6) return "qua_6_doan";
  if (TRA_LOI_NHAC_QUA.test(k.traLoi)) return "tra_loi_nhac_qua";
  return null;
}
