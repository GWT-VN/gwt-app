/** Kiểu dùng chung cho Danh mục lỗi / dòng máy / tra cứu (client + server). */
export type TrangThaiLoi = 'cho_duyet' | 'da_duyet' | 'ngung'
export type LoiDanhMuc = {
  code: string; nhom: string | null; ten: string; aliases: string[]; ma_may: string[]
  dau_hieu: string | null; huong_xu_ly: string | null; nguon: string | null
  trang_thai: TrangThaiLoi; duyet_boi: string | null; duyet_luc: string | null; thu_tu: number
}
export type TrangThaiDong = 'dang_xu_ly' | 'da_xu_ly' | 'khong_loi'
export type DongMay = {
  id: string; ticket_code: string; thu_tu: number
  serial: string | null; source_serial: string | null; internal_code: string | null
  loi_code: string; loi_ten: string | null
  mo_ta: string | null; huong_xu_ly: string | null; huong_xu_ly_nguon: 'danh_muc' | 'cs' | null
  trang_thai: TrangThaiDong; nguon: 'app' | 'tu_dong' | 'backfill'; created_at: string
}
/** Dữ liệu CS nhập cho một dòng (tạo ticket hoặc thêm dòng). serial = serial gõ (đã chuẩn hoá). */
export type DongMayInput = { serial?: string; loi_code?: string; mo_ta?: string; trang_thai?: TrangThaiDong }
export type KetQuaTraSerial =
  | { loai: 'sai_dang'; serial: string; loi: string }
  | { loai: 'da_lap'; serial: string; internal_code: string | null; product_name: string | null
      customer_id: string | null; customer_name: string | null; install_date: string | null; warranty_activated: boolean }
  | { loai: 'chua_kich_hoat'; serial: string; internal_code: string | null; product_name: string | null; trang_thai: string | null }
  | { loai: 'khong_co'; serial: string }
export type MayCuaKhach = { serial: string; internal_code: string | null; product_name: string | null; install_date: string | null; warranty_activated: boolean }
export type KhachVaMay = { id: string; full_name: string; primary_phone: string | null; may: MayCuaKhach[] }
