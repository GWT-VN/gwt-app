// Cặp "khách báo ↔ xử lý" của các lần lỗi sau trong một ticket (bảng ticket_lan_loi).
// Lần 1 nằm ở tickets.description / tickets.last_note; bảng chỉ chứa lần 2 trở đi.

export const GIOI_HAN_LAN_LOI = 4000

export type LanLoi = {
  id: string
  ticket_code: string
  lan: number
  mo_ta: string
  xu_ly: string | null
  tao_boi: string | null
  created_at: string
  /** Ngày khách báo lần này ('YYYY-MM-DD'); trống/chưa có cột → dùng created_at. */
  ngay?: string | null
}

export type LanLoiSach = { mo_ta: string; xu_ly: string | null }

export function lamSachLanLoi(i: { mo_ta?: unknown; xu_ly?: unknown }): { ok: true; row: LanLoiSach } | { ok: false; error: string } {
  const moTa = typeof i.mo_ta === 'string' ? i.mo_ta.trim() : ''
  if (!moTa) return { ok: false, error: 'Nhập mô tả khách báo.' }
  const xuLy = typeof i.xu_ly === 'string' ? i.xu_ly.trim() : ''
  if (moTa.length > GIOI_HAN_LAN_LOI || xuLy.length > GIOI_HAN_LAN_LOI) {
    return { ok: false, error: `Mỗi ô tối đa ${GIOI_HAN_LAN_LOI} ký tự.` }
  }
  return { ok: true, row: { mo_ta: moTa, xu_ly: xuLy || null } }
}

/** Số lần kế tiếp: lớn nhất + 1; chưa có dòng nào → 2 (lần 1 là nội dung gốc của ticket). */
export function lanTiepTheo(ds: readonly { lan: number }[]): number {
  return ds.reduce((m, x) => Math.max(m, x.lan), 1) + 1
}

/** CSKH_NGUON=md: lần lỗi hiển thị từ MD (lan-loi-md-actions) → ghi ticket_lan_loi ST là ghi vào chỗ không ai thấy. */
export const LAN_LOI_O_MD = 'Lần lỗi đang lưu ở Masterdata — thêm / sửa ở thẻ Lần lỗi.'
