// PROTOTYPE vứt đi — dữ liệu giả (không PII) + hằng/hàm thuần của menu thuộc tính. File thường (không 'use client').
import type { Icon } from '@phosphor-icons/react'
import {
  CellSignalHigh,
  CellSignalLow,
  CellSignalMedium,
  CheckCircle,
  Circle,
  CircleDashed,
  CircleHalf,
  Minus,
  WarningOctagon,
  XCircle,
} from '@phosphor-icons/react/ssr'
import { congNgay, ghepIso, homNay } from '../../chon-gio/_chon-gio/gio'

export type TrangThai = 'cho' | 'dang-lam' | 'cho-khach' | 'xong' | 'huy'
export type UuTien = 'khong' | 'khan' | 'cao' | 'vua' | 'thap'
export type Sub = 'trang-thai' | 'nguoi-lam' | 'uu-tien' | 'nhan'

/** Một mức: icon riêng + màu token (không `mau` → icon muted theo menuItem). */
type Muc<T extends string> = { id: T; ten: string; Icon: Icon; mau?: string; dam?: 'fill' | 'regular' }

export const TRANG_THAI: Muc<TrangThai>[] = [
  { id: 'cho', ten: 'Chờ xử lý', Icon: CircleDashed },
  { id: 'dang-lam', ten: 'Đang làm', Icon: CircleHalf, mau: 'text-(--color-text-warning)', dam: 'fill' },
  { id: 'cho-khach', ten: 'Chờ khách', Icon: Circle, mau: 'text-(--color-text-info)' },
  { id: 'xong', ten: 'Xong', Icon: CheckCircle, mau: 'text-(--color-text-success)', dam: 'fill' },
  { id: 'huy', ten: 'Huỷ', Icon: XCircle },
]

export const UU_TIEN: Muc<UuTien>[] = [
  { id: 'khong', ten: 'Không', Icon: Minus },
  { id: 'khan', ten: 'Khẩn', Icon: WarningOctagon, mau: 'text-(--color-text-danger)', dam: 'fill' },
  { id: 'cao', ten: 'Cao', Icon: CellSignalHigh },
  { id: 'vua', ten: 'Vừa', Icon: CellSignalMedium },
  { id: 'thap', ten: 'Thấp', Icon: CellSignalLow },
]

export const NHAN = [
  { id: 'loi-may', ten: 'Lỗi máy', color: 'danger' },
  { id: 'bao-hanh', ten: 'Bảo hành', color: 'info' },
  { id: 'lap-dat', ten: 'Lắp đặt', color: 'success' },
  { id: 'thay-loi', ten: 'Thay lõi', color: 'warning' },
  { id: 'vip', ten: 'Khách VIP', color: 'discovery' },
] as const

/** 12 nhân viên giả → menu con có ô gõ để tìm (CHUAN-FILTER: quá 10 mục). */
export const NGUOI = [
  'Trần Minh An', 'Lê Thu Bình', 'Phạm Quốc Cường', 'Vũ Hải Dương', 'Đỗ Mai Hạnh', 'Hoàng Gia Huy',
  'Ngô Bảo Khánh', 'Bùi Ngọc Lan', 'Đặng Đức Long', 'Phan Thảo My', 'Trịnh Văn Nam', 'Lý Kim Oanh',
].map((ten, i) => ({ id: `nv-${String(i + 1).padStart(2, '0')}`, ten }))
export const CHUA_GIAO = 'chua-giao'

export type Ticket = {
  ma: string
  tieuDe: string
  trangThai: TrangThai
  /** id nhân viên; null = chưa giao. */
  nguoiLam: string | null
  uuTien: UuTien
  nhan: string[]
  /** ISO +07:00 (giống chon-gio) hoặc "YYYY-MM-DD" (chỉ ngày); null = chưa có hạn. */
  han: string | null
}

export function ticketDau(): Ticket[] {
  const nay = homNay()
  const t = (ma: string, tieuDe: string, trangThai: TrangThai, nguoiLam: string | null, uuTien: UuTien, nhan: string[], han: string | null): Ticket => ({
    ma, tieuDe, trangThai, nguoiLam, uuTien, nhan, han,
  })
  return [
    t('TK-1021', 'Máy lọc báo lỗi E3', 'dang-lam', 'nv-01', 'cao', ['loi-may'], ghepIso(nay, '17:30')),
    t('TK-1022', 'Thay lõi định kỳ quý 4', 'cho', null, 'vua', ['thay-loi'], ghepIso(congNgay(nay, 1), '09:00')),
    t('TK-1023', 'Rò nước dưới tủ', 'cho-khach', 'nv-04', 'khan', ['loi-may', 'bao-hanh'], ghepIso(congNgay(nay, -1), '10:00')),
    t('TK-1024', 'Lắp đặt máy mới tầng 3', 'cho', 'nv-08', 'khong', ['lap-dat'], null),
    t('TK-1025', 'Khách hỏi lịch bảo trì', 'xong', 'nv-02', 'thap', [], ghepIso(congNgay(nay, -3), '15:00')),
    t('TK-1026', 'Vòi nóng không ra nước', 'dang-lam', 'nv-11', 'cao', ['loi-may', 'vip'], ghepIso(congNgay(nay, 2), '14:30')),
    t('TK-1027', 'Đổi địa chỉ lắp đặt', 'huy', null, 'thap', ['lap-dat'], null),
    t('TK-1028', 'Kiểm tra TDS sau thay lõi', 'cho', 'nv-06', 'vua', ['thay-loi', 'bao-hanh'], congNgay(nay, 5)), // hạn chỉ ngày (CEO 22/11)
  ]
}

const PHIM: Record<string, Sub> = { s: 'trang-thai', a: 'nguoi-lam', p: 'uu-tien', l: 'nhan' }

/** Phím tắt → menu con / 'han' (⇧D). Có Ctrl/Meta/Alt hay đang ghép chữ → null. */
export function phimMuc(e: { key: string; shiftKey: boolean; ctrlKey: boolean; metaKey: boolean; altKey: boolean; isComposing?: boolean }): Sub | 'han' | null {
  if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return null
  const k = e.key.toLowerCase()
  if (e.shiftKey) return k === 'd' ? 'han' : null
  return PHIM[k] ?? null
}

/** Đích của menu mở trên dòng `ma`: dòng nằm trong vùng chọn (≥ 2) → cả vùng (theo thứ tự bảng); không → chỉ dòng đó. */
export function dichCua(ma: string, chon: Set<string>, thuTu: string[]): string[] {
  return chon.has(ma) && chon.size > 1 ? thuTu.filter((m) => chon.has(m)) : [ma]
}

/** Tự kiểm: `npx tsx app/prototype/menu-thuoc-tinh/_menu/du-lieu.ts` (cwd apps/web) — in [] là đạt. */
export function tuKiem() {
  const sai: string[] = []
  const k = (key: string, o: Partial<Parameters<typeof phimMuc>[0]> = {}) =>
    phimMuc({ key, shiftKey: false, ctrlKey: false, metaKey: false, altKey: false, ...o })
  if (k('p') !== 'uu-tien') sai.push('p')
  if (k('A') !== 'nguoi-lam') sai.push('A (caps lock)')
  if (k('D', { shiftKey: true }) !== 'han') sai.push('⇧D')
  if (k('S', { shiftKey: true }) !== null) sai.push('⇧S phải null')
  if (k('p', { ctrlKey: true }) !== null) sai.push('Ctrl+P phải null')
  if (k('p', { isComposing: true }) !== null) sai.push('IME phải null')
  const tt = ['A', 'B', 'C', 'D']
  if (dichCua('B', new Set(['D', 'B']), tt).join() !== 'B,D') sai.push('dich trong vùng')
  if (dichCua('A', new Set(['D', 'B']), tt).join() !== 'A') sai.push('dich ngoài vùng')
  if (dichCua('B', new Set(['B']), tt).join() !== 'B') sai.push('dich 1 dòng')
  return sai
}
