// Trường lọc + tab của danh sách ticket F (bộ lọc theo trường, docs/rework/2026-11-26-f-hoc-hanh-vi-twenty.md mục D).
// File THƯỜNG (không 'use client'): page.tsx (server) dùng cùng định nghĩa — DB lọc qua loc-db.ts, ticket Demo (dev)
// lọc trong bộ nhớ bằng `lay`; ds-f.tsx dựng bộ lọc + tab.
import type { Ticket } from '@/app/actions'
import type { TruongDuLieu } from '@/bang/locTruong'
import { CHUA_PHAN_LOAI } from '@/lib/loi/dongMay'

/** Giá trị của trường Khẩn. */
export const KHAN_CO = 'co'
export const KHAN_KHONG = 'khong'

/** Giá trị "Chưa giao" của Phụ trách (tên người không bao giờ là "-"). */
export const CHUA_GIAO = '-'
// Ngày của danh sách ticket F — CEO 26/11 "ngày tháng format 14/08/24": dd/MM/yy (cần giờ: dd/MM/yy HH:mm), giờ VN.
const DINH_DANG = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'Asia/Ho_Chi_Minh',
})
function phan(iso: string) {
  const p = Object.fromEntries(DINH_DANG.formatToParts(new Date(iso)).map((x) => [x.type, x.value]))
  return { ngay: `${p.day}/${p.month}/${p.year}`, gio: `${p.hour}:${p.minute}` }
}
/** dd/MM/yy (giờ VN); trống → "—". Chuỗi 'YYYY-MM-DD' (ngày thuần) giữ đúng ngày đó. */
export const ngayNgan = (iso: string | null | undefined) => (iso ? phan(iso.length === 10 ? `${iso}T12:00:00+07:00` : iso).ngay : '—')
/** dd/MM/yy HH:mm (giờ VN); trống → null. */
export const ngayGioNgan = (iso: string | null | undefined) => {
  if (!iso) return null
  const x = phan(iso)
  return `${x.ngay} ${x.gio}`
}

/** "Máy · lỗi": dòng máy đầu tiên (ticket_may), không có thì tên máy. */
export const mayLoi = (t: Ticket) => t.dong_may?.[0]?.nhan ?? t.product_name ?? '—'
/** Mã máy ngắn cho bảng (CEO 26/11: "chỉ cần mã máy ngắn gọn" — CTS20, GN610…). DB không có cột này (đo prod 26/11:
 *  internal_code = GPUN-4000XEN-G, serial_registry.model = mã kho) — mã thương mại nằm ngay sau "GE " trong tên.
 *  ponytail: suy từ tên; catalog có cột mã ngắn thì đọc cột đó. */
export const maMayNgan = (t: Pick<Ticket, 'product_name' | 'internal_code'>) =>
  t.product_name?.match(/\bGE\s+([A-Z0-9][\w-]*)/)?.[1] ?? t.internal_code ?? t.product_name ?? '—'

/**
 * Máy · Loại lỗi là MỘT CẶP của cùng dòng máy đầu (CEO 26/11 "tách loại lỗi ra khỏi mã máy" · "cột mã máy sẽ liên kết
 * với mã lỗi"). Mã ngắn của dòng: dòng cùng máy với ticket (cùng serial / internal_code) → tên máy của ticket
 * (maMayNgan); dòng máy khác → internal_code của dòng (DB dòng máy không kèm tên máy). Chưa có dòng → máy của ticket.
 */
export const dongDau = (t: Ticket) => t.dong_may?.[0]
export function maMayDong(t: Ticket): string {
  const d = dongDau(t)
  const cungMay = !d?.internal_code || d.internal_code === t.internal_code || (!!d.serial && d.serial === t.serial)
  return cungMay ? maMayNgan(t) : maMayNgan({ product_name: null, internal_code: d.internal_code })
}
/** Một mẫu ILIKE của Postgres (`%`, `_`, `\` thoát) có khớp chuỗi không — không phân biệt hoa thường. */
const thoat = (c: string) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
function ilike(mau: string, s: string): boolean {
  let re = ''
  for (let i = 0; i < mau.length; i++) {
    const c = mau[i]
    if (c === '\\' && i + 1 < mau.length) re += thoat(mau[++i])
    else if (c === '%') re += '.*'
    else if (c === '_') re += '.'
    else re += thoat(c)
  }
  return new RegExp(`^${re}$`, 'is').test(s)
}

/**
 * Lỗi có dùng được cho máy này không — cùng luật DB (`loi_danh_muc.ma_may` = mẫu ILIKE trên internal_code, rỗng = mọi
 * model; migration 20261109120000). Pop Loại lỗi chỉ liệt kê lỗi của máy cùng hàng. "Chưa phân loại" luôn được.
 */
export function loiHopVoiMay(loi: { code: string; ma_may?: string[] }, internalCode: string | null | undefined): boolean {
  if (loi.code === CHUA_PHAN_LOAI || !loi.ma_may?.length) return true
  return loi.ma_may.some((m) => ilike(m, internalCode ?? ''))
}
/** internal_code của máy ở cột Máy cùng hàng (dòng máy đầu, không có → máy của ticket). */
export const maCuaMay = (t: Ticket) => dongDau(t)?.internal_code ?? t.internal_code

/** Số dòng máy khác ngoài dòng đầu ("+N" ở cả hai cột Máy và Loại lỗi). */
export const soDongThem = (t: Ticket) => Math.max(0, (t.dong_may?.length ?? 0) - 1)

/** Bảo hành của ticket (cột + trường lọc "Bảo hành"); cùng nghĩa với ChuBaoHanh và điều kiện DB ở loc-db.ts. */
export const BH_F = [
  { gt: 'con', nhan: 'Còn BH' },
  { gt: 'het', nhan: 'Hết BH' },
  { gt: 'chua', nhan: 'Chưa kích hoạt' },
  { gt: 'khong', nhan: 'Chưa có serial' },
] as const
export const bhCua = (t: Pick<Ticket, 'serial' | 'warranty_activated' | 'con_han_may'>) =>
  !t.serial ? 'khong' : !t.warranty_activated ? 'chua' : t.con_han_may ? 'con' : 'het'

/** Thứ tự = thứ tự trong danh sách "Tìm trường". `id` = tên tham số URL (CHUAN-FILTER: `tt`, `cs`, `loai`, `tinh` dùng lại).
 *  `loi` ở DB = mã loại lỗi (v_tickets_loi.loi_codes); `lay` của nó (nhãn dòng máy) chỉ còn cho ticket Demo. */
export const TRUONG_F: (TruongDuLieu<Ticket> & { ten: string })[] = [
  { id: 'tt', ten: 'Trạng thái', kieu: 'chon', lay: (t) => t.state },
  // Khẩn: chọn Có / Không (DB: cột boolean `khan`, loc-db.ts). Tab "Khẩn" = tt=Open & khan=co.
  { id: 'khan', ten: 'Khẩn', kieu: 'chon', lay: (t) => (t.khan ? KHAN_CO : KHAN_KHONG) },
  { id: 'cs', ten: 'Phụ trách', kieu: 'nguoi', lay: (t) => t.cs_ten ?? CHUA_GIAO },
  // Lọc theo MÃ lỗi (DB: v_tickets_loi.loi_codes), nhãn = tên lỗi; `lay` chỉ cho ticket Demo.
  { id: 'loi', ten: 'Loại lỗi', kieu: 'chon', lay: (t) => t.dong_may?.[0]?.loi_code },
  { id: 'bh', ten: 'Bảo hành', kieu: 'chon', lay: bhCua },
  { id: 'loai', ten: 'Loại', kieu: 'chon', lay: (t) => t.ticket_type },
  { id: 'tinh', ten: 'Tỉnh/TP', kieu: 'chon', lay: (t) => t.province },
  { id: 'tao', ten: 'Ngày tạo', kieu: 'ngay', lay: (t) => t.created_at },
  { id: 'khach', ten: 'Khách', kieu: 'chu', lay: (t) => t.customer_name },
  { id: 'ma', ten: 'Mã ticket', kieu: 'chu', lay: (t) => t.ticket_code },
  { id: 'may', ten: 'Máy · serial', kieu: 'chu', lay: (t) => [t.product_name, t.source_serial].filter(Boolean).join(' ') },
]

/**
 * Tab = BỘ LỌC CHỌN SẴN (CEO 26/11: "Các tab ở đây là tab được chọn sẵn filter ấy. mặc định sẽ là 4 cái kia cố định. view
 * thứ 5 thì tùy customize"; trước đó: "Chỉ cần tab tất cả/khẩn/đã xong/đã hủy thế thôi"). `loc` = query của các tham số lọc
 * (cùng cơ chế lọc theo trường): bấm tab → URL = `view` + `loc`, chip lọc hiện như lọc thường, sửa/thêm được. URL `view`
 * chỉ đánh dấu tab đang chọn (mặc định `tat-ca` không ghi). Của tôi / Chưa giao: lọc trường Phụ trách ("Tôi" / "Chưa giao").
 */
export const VIEW_F = [
  { v: 'tat-ca', ten: 'Tất cả', loc: '' },
  { v: 'khan', ten: 'Khẩn', loc: `tt=Open&khan=${KHAN_CO}` },
  { v: 'xong', ten: 'Đã xong', loc: 'tt=Done' },
  { v: 'huy', ten: 'Đã huỷ', loc: 'tt=Cancel' },
] as const
export type ViewF = (typeof VIEW_F)[number]['v']
export const docViewF = (v: string | null | undefined): ViewF => VIEW_F.find((x) => x.v === v)?.v ?? 'tat-ca'

/** Giá trị có trong dữ liệu (CHƯA lọc) cho trường chọn — danh sách giá trị không co lại theo chính bộ lọc đang bật. */
export function tuyChonF(rows: Pick<Ticket, 'state' | 'cs_ten' | 'ticket_type' | 'province'>[]): Record<string, string[]> {
  return Object.fromEntries(
    TRUONG_F.filter((x) => (x.kieu === 'chon' || x.kieu === 'nguoi') && !['loi', 'khan', 'bh'].includes(x.id)).map((x) => [
      x.id,
      // "Chưa giao" cuối danh sách (sau tên người).
      [...new Set(rows.map((r) => x.lay(r as Ticket)).filter((v): v is string => !!v))].sort(
        (a, b) => Number(a === CHUA_GIAO) - Number(b === CHUA_GIAO) || a.localeCompare(b, 'vi'),
      ),
    ]),
  )
}

/** Tham số URL thuộc "bộ lọc" của một tab: lọc trường + tìm + sắp. */
export const KHOA_LOC: string[] = [...TRUONG_F.map((x) => x.id), 'q', 'cot', 'chieu']
/** Tham số cột (thứ tự / độ rộng / ẩn) — tab tự tạo lưu cả phần này. */
export const KHOA_COT = ['cot_thu_tu', 'cot_rong', 'cot_an']

/** Chuẩn hoá query của các khoá cho trước (bỏ rỗng, sắp theo khoá) — so "tab đã đổi chưa" và lưu tab. */
export function locCua(sp: URLSearchParams, khoa: string[] = KHOA_LOC): string {
  const p = new URLSearchParams()
  for (const k of [...khoa].sort()) {
    const v = sp.get(k)
    if (v) p.set(k, v)
  }
  return p.toString()
}

/** URL khi bấm tab: giữ tham số không thuộc bộ lọc (dạng xem, cột, variant…), thay bộ lọc bằng `loc` của tab. */
export function queryTab(sp: URLSearchParams, loc: string, view: string | null, bo: string[] = KHOA_LOC): string {
  const p = new URLSearchParams(sp.toString())
  for (const k of [...bo, 'view', 'tab', 'xem', 'xem_tab', 'trang']) p.delete(k)
  for (const [k, v] of new URLSearchParams(loc)) p.set(k, v)
  if (view) p.set('view', view)
  return p.toString()
}
