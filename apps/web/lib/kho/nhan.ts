/**
 * Nhãn tiếng Việt cho mã của kho serial — CÙNG bộ chữ với Google Sheet theo dõi do bot Bắp ghi
 * (gwt-discord-bot/shopee/kho-sheet.mjs NHAN), để người dùng đọc app và Sheet thấy một kiểu.
 * Thuần, không đụng DB → component client import được.
 */
export const NHAN: Record<string, string> = {
  nhap: 'Nhập kho', xuat: 'Xuất kho', dieu_chuyen: 'Điều chuyển', dinh_danh: 'Định danh serial', thanh_ly: 'Thanh lý',
  phuong_an: 'Ghi phương án', sua: 'Sửa dữ liệu', kiem_ke: 'Kiểm kê',
  hang_moi: 'hàng mới', nhan_lai: 'nhận lại', thu_hoi: 'thu hồi', sau_sua_chua: 'nhận lại sau sửa chữa', khac: 'khác',
  ban: 'bán', tang: 'tặng', trung_bay: 'trưng bày', quay_chup: 'đi quay/chụp', test_nuoc: 'đi test/kiểm định nước', bao_hanh: 'gửi bảo hành',
  bao_tri: 'gửi bảo trì', sua_chua: 'gửi sửa chữa', khong_tim_thay: 'không tìm thấy',
  moi: 'mới', da_qua_su_dung: 'đã qua sử dụng', hong: 'hỏng', da_tan_trang: 'đã tân trang', chua_xac_nhan: 'chưa xác nhận',
  chua_dinh_danh: 'chưa định danh (chưa có serial)',
  san_sang: 'sẵn sàng', dang_su_dung: 'đang sử dụng', cho_kiem_tra: 'chờ kiểm tra', dang_bao_hanh: 'đang bảo hành', dang_bao_tri: 'đang bảo trì',
  dang_sua_chua: 'đang sửa chữa', de_xuat_thanh_ly: 'đề xuất thanh lý', da_thanh_ly: 'đã thanh lý',
  cong_ty: 'công ty', khach: 'khách', tiep_tuc: 'tiếp tục dùng', refurbish: 'refurbish (tân trang)',
  nhap_dot: 'nháp', da_ap: 'đã áp', huy: 'huỷ',
  kiem_dinh: 'kiểm định', nha_cung_cap: 'nhà cung cấp', khong_ro: 'không rõ', kho: 'kho',
}

export const n = (x: string | null | undefined): string => (x == null || x === '' ? '' : NHAN[x] ?? String(x))

/** "Nhập kho — hàng mới"; mục đích trùng tên loại (điều chuyển…) thì bỏ. */
export function nhanLoaiPhieu(loai: string, mucDich?: string | null): string {
  const muc = mucDich && mucDich !== loai && !['dieu_chuyen', 'phuong_an', 'thanh_ly', 'dinh_danh'].includes(mucDich) ? ` — ${n(mucDich)}` : ''
  return `${n(loai)}${muc}`
}

export const TINH_TRANG = ['moi', 'da_qua_su_dung', 'hong', 'da_tan_trang', 'chua_xac_nhan'] as const
export const TRANG_THAI = ['san_sang', 'dang_su_dung', 'cho_kiem_tra', 'dang_bao_hanh', 'dang_bao_tri', 'dang_sua_chua', 'de_xuat_thanh_ly', 'da_thanh_ly'] as const
export const LOAI_PHIEU = ['nhap', 'xuat', 'dieu_chuyen', 'dinh_danh', 'phuong_an', 'thanh_ly', 'sua', 'kiem_ke'] as const

/** Màu badge theo tình trạng / trạng thái — giống màu tô trên Sheet (đỏ / vàng / xanh). */
export function mauTinhTrang(x: string | null | undefined): string {
  if (!x) return 'bg-slate-100 text-slate-600'
  if (['hong', 'de_xuat_thanh_ly', 'khong_tim_thay'].includes(x)) return 'bg-red-50 text-red-700 ring-1 ring-red-200'
  if (['chua_xac_nhan', 'cho_kiem_tra', 'chua_dinh_danh'].includes(x)) return 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
  if (['moi', 'san_sang'].includes(x)) return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
  return 'bg-slate-100 text-slate-700'
}
