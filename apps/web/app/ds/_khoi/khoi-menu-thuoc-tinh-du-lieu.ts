// Dữ liệu demo (không PII) + hàm thuần của khối mẫu ghép Menu thuộc tính. File thường (không 'use client').
// Nguồn: prototype app/prototype/menu-thuoc-tinh (CEO duyệt 20/11) — chép, KHÔNG import từ prototype.
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

/**
 * Cao/Vừa/Thấp: CellSignal* bản `fill` + màu chữ chính (bản regular nét mảnh màu muted thì ba mức khó phân biệt — lỗi
 * của prototype, Task 1 đã sửa ở khối DropdownMenu).
 */
export const UU_TIEN: Muc<UuTien>[] = [
  { id: 'khong', ten: 'Không', Icon: Minus },
  { id: 'khan', ten: 'Khẩn', Icon: WarningOctagon, mau: 'text-(--color-text-danger)', dam: 'fill' },
  { id: 'cao', ten: 'Cao', Icon: CellSignalHigh, mau: 'text-foreground', dam: 'fill' },
  { id: 'vua', ten: 'Vừa', Icon: CellSignalMedium, mau: 'text-foreground', dam: 'fill' },
  { id: 'thap', ten: 'Thấp', Icon: CellSignalLow, mau: 'text-foreground', dam: 'fill' },
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
  /** ISO +07:00; null = chưa có hạn. */
  han: string | null
}

/**
 * "Hôm nay" cố định 20/11/2026 (mốc `tuNgay` của ô Hạn): HTML máy chủ = máy khách, trạng thái "quá hạn" đúng dù xem ngày
 * nào (cùng cách khối DateTimePicker).
 */
export const HOM_NAY = '2026-11-20'

const t = (ma: string, tieuDe: string, trangThai: TrangThai, nguoiLam: string | null, uuTien: UuTien, nhan: string[], han: string | null): Ticket => ({
  ma, tieuDe, trangThai, nguoiLam, uuTien, nhan, han,
})
export const TICKET_DAU: Ticket[] = [
  t('TK-1021', 'Máy lọc báo lỗi E3', 'dang-lam', 'nv-01', 'cao', ['loi-may'], '2026-11-20T17:30:00+07:00'),
  t('TK-1022', 'Thay lõi định kỳ quý 4', 'cho', null, 'vua', ['thay-loi'], '2026-11-21T09:00:00+07:00'),
  t('TK-1023', 'Rò nước dưới tủ', 'cho-khach', 'nv-04', 'khan', ['loi-may', 'bao-hanh'], '2026-11-19T10:00:00+07:00'),
  t('TK-1024', 'Lắp đặt máy mới tầng 3', 'cho', 'nv-08', 'khong', ['lap-dat'], null),
  t('TK-1025', 'Khách hỏi lịch bảo trì', 'xong', 'nv-02', 'thap', [], '2026-11-17T15:00:00+07:00'),
  t('TK-1026', 'Vòi nóng không ra nước', 'dang-lam', 'nv-11', 'cao', ['loi-may', 'vip'], '2026-11-22T14:30:00+07:00'),
  t('TK-1027', 'Đổi địa chỉ lắp đặt', 'huy', null, 'thap', ['lap-dat'], null),
  t('TK-1028', 'Kiểm tra TDS sau thay lõi', 'cho', 'nv-06', 'vua', ['thay-loi', 'bao-hanh'], '2026-11-25T09:00:00+07:00'),
]

/** Phím tắt chuẩn của menu thuộc tính: S trạng thái · A người làm · P ưu tiên · L nhãn · ⇧D hạn. */
export const PHIM_SUB: Record<Sub, string> = { 'trang-thai': 's', 'nguoi-lam': 'a', 'uu-tien': 'p', nhan: 'l' }
const SUB_THEO_PHIM = Object.fromEntries(Object.entries(PHIM_SUB).map(([s, k]) => [k, s])) as Record<string, Sub>

/**
 * Phím bấm TRONG menu đang mở → menu con / 'han' (⇧D). Ngoài menu dùng `usePhimTat` (lib/phim-tat.ts) — trong menu thì
 * focus nằm ở portal (ngoài vùng bảng) nên khung menu tự bắt. Có Ctrl/⌘/Alt, hay bộ gõ đang ghép chữ (IME) → null.
 */
export function phimMuc(e: {
  key: string
  shiftKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  altKey: boolean
  isComposing?: boolean
  keyCode?: number
}): Sub | 'han' | null {
  if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing || e.key === 'Process' || e.keyCode === 229) return null
  const k = e.key.toLowerCase()
  if (e.shiftKey) return k === 'd' ? 'han' : null
  return SUB_THEO_PHIM[k] ?? null
}

/** Đích của menu mở trên dòng `ma`: dòng nằm trong vùng chọn (≥ 2) → cả vùng (theo thứ tự bảng); không → chỉ dòng đó. */
export function dichCua(ma: string, chon: string[], thuTu: string[]): string[] {
  return chon.includes(ma) && chon.length > 1 ? thuTu.filter((m) => chon.includes(m)) : [ma]
}

/** "TK-1021" hoặc "3 ticket". */
export const tenDich = (dich: string[]) => (dich.length > 1 ? `${dich.length} ticket` : dich[0])
