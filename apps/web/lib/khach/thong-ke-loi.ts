/**
 * Thống kê lỗi theo máy cho hồ sơ khách (module "Máy & lỗi", tab Ticket). File thường — page (server) và HoSoKhach
 * (client) cùng dùng.
 */
import type { Ticket } from '@/app/actions'
import { CHUA_PHAN_LOAI } from '@/lib/loi/dongMay'

/** Một dòng máy báo lỗi của một ticket, kèm trạng thái + ngày của ticket. */
export type DongLoiMay = {
  ticket_code: string
  state: Ticket['state']
  serial: string | null
  internal_code: string | null
  product_name: string | null
  loi_code: string
  loi_ten: string | null
  ngay: string
}

export type LoiCuaMay = { code: string; ten: string; so_lan: number; gan_nhat: string; tickets: string[] }
export type ThongKeMay = { may: string | null; ten: string | null; loi: LoiCuaMay[] }

/** Dòng máy (ticket_may hoặc `Ticket.dong_may`) của một ticket → `DongLoiMay`; tên máy tra theo serial. */
export function dongLoiCuaTicket(
  t: Pick<Ticket, 'ticket_code' | 'state' | 'created_at'>,
  dong: { serial: string | null; internal_code: string | null; loi_code: string; loi_ten: string | null }[],
  tenMay: (serial: string) => string | null,
): DongLoiMay[] {
  return dong.map((d) => ({
    ticket_code: t.ticket_code,
    state: t.state,
    serial: d.serial,
    internal_code: d.internal_code,
    product_name: d.serial ? tenMay(d.serial) : null,
    loi_code: d.loi_code,
    loi_ten: d.loi_ten,
    ngay: t.created_at.slice(0, 10),
  }))
}

/**
 * Đếm theo máy (serial) × mã lỗi, bỏ ticket huỷ. `so_lan` = số TICKET (một ticket hai dòng cùng lỗi tính một).
 * Máy sắp theo tổng số lần giảm dần, máy chưa rõ serial (`may: null`) luôn cuối; lỗi trong máy theo số lần rồi gần nhất;
 * `tickets` mới trước.
 */
export function thongKeLoiTheoMay(dong: DongLoiMay[]): ThongKeMay[] {
  const theoMay = new Map<string | null, { ten: string | null; loi: Map<string, { ten: string; ve: Map<string, string> }> }>()
  for (const d of dong) {
    if (d.state === 'Cancel') continue
    let m = theoMay.get(d.serial)
    if (!m) theoMay.set(d.serial, (m = { ten: null, loi: new Map() }))
    m.ten ??= d.product_name ?? d.internal_code
    let l = m.loi.get(d.loi_code)
    if (!l) {
      const ten = d.loi_code === CHUA_PHAN_LOAI ? 'Chưa phân loại' : (d.loi_ten ?? d.loi_code)
      m.loi.set(d.loi_code, (l = { ten, ve: new Map() }))
    }
    // ticket → ngày (giữ ngày lớn nhất nếu trùng ticket)
    if ((l.ve.get(d.ticket_code) ?? '') < d.ngay) l.ve.set(d.ticket_code, d.ngay)
  }
  const ra = [...theoMay].map(([may, m]) => ({
    may,
    ten: m.ten,
    loi: [...m.loi].map(([code, l]) => {
      const ve = [...l.ve].sort((a, b) => b[1].localeCompare(a[1]))
      return { code, ten: l.ten, so_lan: ve.length, gan_nhat: ve[0][1], tickets: ve.map(([t]) => t) }
    }).sort((a, b) => b.so_lan - a.so_lan || b.gan_nhat.localeCompare(a.gan_nhat) || a.code.localeCompare(b.code)),
  }))
  const tong = (m: ThongKeMay) => m.loi.reduce((s, l) => s + l.so_lan, 0)
  return ra.sort((a, b) => Number(a.may === null) - Number(b.may === null) || tong(b) - tong(a))
}
