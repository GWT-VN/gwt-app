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

/** Một thẻ máy ở tab Ticket hồ sơ khách: `serial: null` = "Chưa rõ máy". */
export type NhomMay<T> = { serial: string | null; ten: string | null; tickets: T[]; loi: LoiCuaMay[] }

/**
 * Gom ticket theo máy (tab Ticket hồ sơ khách — CEO 27/11 "tên máy KH mua → mở ra có ticket riêng cho máy đó"):
 * - Mỗi máy của khách một nhóm, kể cả máy chưa có ticket.
 * - Ticket thuộc máy theo dòng lỗi (báo nhiều máy → có ở mỗi máy; có thêm dòng không máy → có cả ở nhóm `serial: null`
 *   "Chưa rõ máy"); dòng lỗi toàn không máy mà ticket có `serial` → dòng đó là của máy ticket (`ganMayTicket`, trước khi
 *   đếm); không dòng lỗi → theo `serial` của ticket. Serial không thuộc máy của khách → nhóm riêng (tên từ dòng lỗi của
 *   serial đó, rồi tên trên ticket).
 * - `loi` = chip `Mã ×n` của máy (`thongKeLoiTheoMay`, bỏ ticket huỷ).
 * - Sắp: nhóm có ticket `dangXem` trước, rồi ticket gần nhất mới trước, rồi máy chưa có ticket (giữ thứ tự `may`);
 *   "Chưa rõ máy" luôn cuối. Ticket trong nhóm mới → cũ.
 */
export function gomTicketTheoMay<T extends Pick<Ticket, 'ticket_code' | 'created_at' | 'serial' | 'product_name'>>(
  tickets: T[],
  dongLoi: DongLoiMay[],
  may: { serial: string; product_name: string | null; internal_code: string | null }[],
  dangXem: string | null,
): NhomMay<T>[] {
  dongLoi = ganMayTicket(dongLoi, tickets)
  const loi = new Map(thongKeLoiTheoMay(dongLoi).map((m) => [m.may, m.loi]))
  const nhom = new Map<string | null, NhomMay<T>>()
  const lay = (serial: string | null, ten: string | null) => {
    let n = nhom.get(serial)
    if (!n) nhom.set(serial, (n = { serial, ten, tickets: [], loi: loi.get(serial) ?? [] }))
    return n
  }
  for (const m of may) lay(m.serial, m.product_name ?? m.internal_code)
  for (const t of [...tickets].sort((a, b) => b.created_at.localeCompare(a.created_at))) {
    const dong = dongLoi.filter((d) => d.ticket_code === t.ticket_code)
    const serials = new Set<string | null>(dong.length ? dong.map((d) => d.serial) : [t.serial])
    for (const s of serials) {
      const d = s ? dong.find((x) => x.serial === s) : undefined
      lay(s, s && (d?.product_name ?? d?.internal_code ?? t.product_name ?? null)).tickets.push(t)
    }
  }
  const coXem = (n: NhomMay<T>) => n.tickets.some((t) => t.ticket_code === dangXem)
  const moiNhat = (n: NhomMay<T>) => n.tickets[0]?.created_at ?? ''
  return [...nhom.values()].sort(
    (a, b) => Number(a.serial === null) - Number(b.serial === null) || Number(coXem(b)) - Number(coXem(a)) || moiNhat(b).localeCompare(moiNhat(a)),
  )
}

/** Ticket mà MỌI dòng lỗi đều không máy nhưng chính ticket có `serial` → gán serial đó cho các dòng (đếm lỗi cho máy đó). */
function ganMayTicket(dongLoi: DongLoiMay[], tickets: Pick<Ticket, 'ticket_code' | 'serial'>[]): DongLoiMay[] {
  const coMay = new Set(dongLoi.filter((d) => d.serial !== null).map((d) => d.ticket_code))
  const serial = new Map(tickets.filter((t) => t.serial && !coMay.has(t.ticket_code)).map((t) => [t.ticket_code, t.serial]))
  return dongLoi.map((d) => (d.serial === null && serial.has(d.ticket_code) ? { ...d, serial: serial.get(d.ticket_code)! } : d))
}
