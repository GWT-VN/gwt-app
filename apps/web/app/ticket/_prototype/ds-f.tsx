'use client'

// PROTOTYPE vứt đi — PA F "Đề xuất theo nghiên cứu" (docs/rework/2026-11-25-nghien-cuu-cskh-ho-so-may.md mục 4b):
// L1 Bảng + thẻ Xem nhanh (bố cục Twenty, xem-nhanh-f.tsx: tab, nhóm trường, sửa trạng thái / phụ trách, Hẹn KTV) · L3 view mặc định có số đếm,
// hạn/SLA bằng tag màu · L2 Kanban theo khâu là dạng xem phụ. Không gọi mutation thật — sửa chỉ đổi state trên màn.
import { Suspense, useCallback, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  AddressBook,
  ArrowsClockwise,
  CalendarPlus,
  Cube,
  ShieldCheck,
  User,
  UserPlus,
  WarningCircle,
  Wrench,
} from '@phosphor-icons/react/ssr'
import type { Ticket } from '@/app/actions'
import { hrefBoLoc, KhungChon, OChonDong, OChonTatCa, OTimKiem, PhanTrang, ThanhDaChon, ThanhDangLoc, useDaChon } from '@/bang'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { Button } from '@/components/ui/button'
import { CaiDatHienThi, DataViewToolbar, TrangDuLieu, type CaiDatRef, type DangXem } from '@/components/ui/data-view-toolbar'
import { EmptyState } from '@/components/ui/empty-state'
import type { MucTrangThai } from '@/components/ui/inline-edit'
import { KanbanBoard, NoiDungTheTruong, type CotKanban, type TruongThe } from '@/components/ui/kanban-board'
import { ListView, NhanDau, NutMoMa, NutMoTen, type CotDanhSach } from '@/components/ui/list-view'
import { nutMoTen } from '@/components/ui/list-view-styles'
import { Table, TableBody, TableCell, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import { CHON_BANG_GHIM } from '@/components/ui/table-styles'
import { recordPickerLuuY } from '@/components/ui/inline-edit-styles'
import { Tabs, TabsCount, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ColCotBang, KeoCot, TieuDeCot } from '@/components/ui/tieu-de-cot'
import { ThemCot } from '@/components/ui/them-cot'
import { laGhim, RONG_O_CHON, RONG_THEM_COT, useCotBang, type CotBang } from '@/components/ui/use-cot-bang'
import { XemNhanh } from '@/components/ui/xem-nhanh'
import { apLoc, docTatCa, ghiDieuKien, type DieuKienLoc } from '@/bang/locTruong'
import { ChipLoc, NutLoc, useMoLoc, type TruongLoc } from '@/components/ui/bo-loc-truong'
import { chuaLuu, DauPrototype, mayLoi, ngayNgan, NutTaoTicket, tenKhach, useDatUrl, type DuLieuTicket } from './chung'
import { CHUA_GIAO, han, maMayNgan, TOI_F as TOI, TRUONG_F } from './truong-f'
import { TAB_XEM, theXemNhanhF, type TabXem } from './xem-nhanh-f'

// ── Giả định (DB chưa có trường) — ghi trên màn ─────────────────────────────────────────────────────────────────────
// "Của tôi" = TOI · hạn = ngày tạo + 3 ngày (khẩn + 1): truong-f.ts (server lọc dùng chung).
const NGAY = 86_400_000
/** Chờ vật tư = đang mở, đã có KT, loại Thay lõi / Sửa chữa. */
const choVatTu = (t: Ticket) => t.state === 'Open' && !!t.ky_thuat && (t.ticket_type === 'Thay lõi' || t.ticket_type === 'Sửa chữa')
/** Hẹn hôm nay = đang mở, đã có KT (không chờ vật tư), hoạt động cuối là hôm nay — hoặc vừa bấm "Hẹn KTV". */
const laHomNay = (iso: string | null) => !!iso && new Date(iso).toDateString() === new Date().toDateString()

/** Sửa tại chỗ (prototype). `khau`: thả thẻ vào cột Khâu — Khâu là giá trị SUY RA, chưa có trường DB → ghi đè trên màn. */
export type SuaF = { state?: Ticket['state']; cs?: string | null; hen?: boolean; khau?: string }
export type DongF = Ticket & { hen: boolean; khau?: string }
type Sua = SuaF
type Dong = DongF

const henNay = (t: Dong) => t.state === 'Open' && (t.hen || (!!t.ky_thuat && !choVatTu(t) && laHomNay(t.hoat_dong_cuoi ?? null)))
const sla = (t: Ticket): 'qua' | 'sap' | null => {
  if (t.state !== 'Open') return null
  const con = han(t) - Date.now()
  return con < 0 ? 'qua' : con < NGAY ? 'sap' : null
}
const soNgayQua = (t: Ticket) => Math.max(1, Math.floor((Date.now() - han(t)) / NGAY))

// ── View mặc định (L3) ──────────────────────────────────────────────────────────────────────────────────────────────
const VIEW = [
  { v: 'cua-toi', ten: 'Của tôi', loc: (t: Dong) => t.state === 'Open' && t.cs_ten === TOI },
  { v: 'chua-giao', ten: 'Chưa giao', loc: (t: Dong) => t.state === 'Open' && !t.cs_ten },
  { v: 'qua-han', ten: 'Quá hạn', loc: (t: Dong) => sla(t) === 'qua' },
  { v: 'mo', ten: 'Tất cả đang mở', loc: (t: Dong) => t.state === 'Open' },
  // Hai view ít dùng đứng cuối → hàng tab thu gọn (TabsList `thuGon`) đẩy chúng vào "Thêm ▾" trước (đo 1440: 729/679px).
  { v: 'vat-tu', ten: 'Chờ vật tư', loc: (t: Dong) => choVatTu(t) },
  { v: 'hen-nay', ten: 'Hẹn hôm nay', loc: henNay },
] as const
type View = (typeof VIEW)[number]['v']

// ── Nhãn ────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const TT: MucTrangThai[] = [
  { gt: 'Open', nhan: 'Đang mở', color: 'info' },
  { gt: 'Done', nhan: 'Đã xong', color: 'success' },
  { gt: 'Cancel', nhan: 'Đã huỷ', color: 'secondary' },
]

// Bảng/danh sách: MỘT nhãn màu mỗi hàng (Trạng thái) — CEO 26/11 "quá nhiều dạng label rối mắt". Bảo hành, hạn = chữ;
// màu chữ chỉ cho ngoại lệ (hết BH, quá hạn, sắp hạn). Khẩn = icon đỏ đầu hàng. Xem nhanh cũng vậy (xem-nhanh-f.tsx).
const CHU_DO = 'text-(--color-text-danger)'

/** Khẩn: icon đỏ (kiểu ưu tiên của Linear) thay badge — tên đọc được cho trình đọc màn hình. */
export function IconKhan() {
  return <WarningCircle weight="fill" role="img" aria-label="Khẩn" className={recordPickerLuuY} />
}

/** Bảo hành dạng chữ cho bảng/danh sách; `ngan` (ô bảng hẹp): "Còn BH" / "Hết BH". */
export function ChuBaoHanh({ t, ngan }: { t: Ticket; ngan?: boolean }) {
  if (!t.serial) return ngan ? null : <span className="text-muted-foreground">—</span>
  if (!t.warranty_activated) return <span className="text-muted-foreground">Chưa kích hoạt</span>
  return t.con_han_may ? (
    <span className="text-muted-foreground">{ngan ? 'Còn BH' : 'Còn bảo hành'}</span>
  ) : (
    <span className={CHU_DO}>{ngan ? 'Hết BH' : 'Hết bảo hành'}</span>
  )
}

/** Hạn/SLA dạng chữ: đỏ quá hạn, cam sắp hạn (< 24 giờ); còn lại chữ ngày mờ. */
export function NhanHan({ t }: { t: Ticket }) {
  const s = sla(t)
  if (s === 'qua') return <span className={`tabular-nums ${CHU_DO}`}>Quá {soNgayQua(t)} ngày</span>
  if (s === 'sap') return <span className="tabular-nums text-(--color-text-warning)">Hạn {ngayNgan(new Date(han(t)).toISOString())}</span>
  return <span className="tabular-nums text-muted-foreground">{t.state === 'Open' ? ngayNgan(new Date(han(t)).toISOString()) : '—'}</span>
}

const chuDau = (ten: string) =>
  ten
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

function NguoiPhuTrach({ ten }: { ten: string | null }) {
  return ten ? (
    <Avatar title={ten}>
      <AvatarFallback>{chuDau(ten)}</AvatarFallback>
    </Avatar>
  ) : (
    <span className="text-muted-foreground">—</span>
  )
}

function TrangThaiO({ t }: { t: Ticket }) {
  return (
    <Badge variant="soft" color={TT.find((m) => m.gt === t.state)?.color}>
      {TT.find((m) => m.gt === t.state)?.nhan}
    </Badge>
  )
}

/**
 * Bề rộng thật của khung chứa (ResizeObserver); null trước lần đo đầu. Ref dạng callback: khung chỉ mount khi đang ở
 * dạng Bảng (đổi từ Danh sách/Kanban sang thì vẫn bắt được).
 */
function useRongKhung() {
  const [w, setW] = useState<number | null>(null)
  const ro = useRef<ResizeObserver | null>(null)
  const ref = useCallback((el: HTMLDivElement | null) => {
    ro.current?.disconnect()
    if (!el) return
    ro.current = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)))
    ro.current.observe(el)
  }, [])
  return [ref, w] as const
}

/** Dạng xem cho người dùng chọn ở F (CEO 26/11 "giữ 2 dạng"). */
const XEM_F = ['bang', 'kanban'] as const satisfies readonly DangXem[]

/** Vùng chứa hẹp hơn mức này (điện thoại) → ListView thay Bảng. */
const RONG_BANG_TOI_THIEU = 640

// ── Bảng (L1) ───────────────────────────────────────────────────────────────────────────────────────────────────────
// Cột theo DS (`CotBang`, useCotBang): thứ tự / độ rộng / ẩn ghi lên URL (`cot_thu_tu`, `cot_rong`, `cot_an`). Cột đầu
// "Ticket · khách" khoá (không kéo, không ẩn) nhưng co dãn được như mọi cột; phần dư của khung do cột "+" cuối ăn
// (`ColCotBang`, học Twenty) — kéo tay co cột nào chỉ cột đó đổi.
// Mã gộp vào ô khách (như ListView), badge bảo hành gộp đầu ô máy ("dải máy").
// Độ rộng KHÔNG gõ tay (CEO 26/11 "chiều rộng cột = chiều dài content dài nhất để tránh bị cắt thông tin"): mọi cột tự
// vừa tiêu đề + ô dài nhất của trang đang xem (`useCotBang` đo, `refBang`); cột chữ tự do có trần `rongToiDa` để một giá
// trị cực dài không kéo cột rộng vô lý — quá trần mới cắt (ô có title). Tổng vượt khung → bảng cuộn ngang.
const COT: CotBang[] = [
  { id: 'khach', ten: 'Ticket · khách', kieu: 'thuong', khoa: true, rongToiDa: 400 },
  { id: 'may', ten: 'Máy · bảo hành', kieu: 'thuong', rongToiDa: 480 },
  { id: 'loi', ten: 'Loại lỗi', kieu: 'thuong', rongToiDa: 240 },
  { id: 'tt', ten: 'Trạng thái', kieu: 'loc' },
  { id: 'cs', ten: 'Phụ trách', kieu: 'loc' },
  { id: 'loai', ten: 'Loại', kieu: 'thuong', anMacDinh: true, rongToiDa: 240 },
  { id: 'tinh', ten: 'Tỉnh/TP', kieu: 'thuong', anMacDinh: true, rongToiDa: 240 },
  { id: 'tao', ten: 'Ngày tạo', kieu: 'sap', anMacDinh: true, nghia: { tang: 'Cũ nhất trước', giam: 'Mới tạo trước' } },
]
const COT_SAP = ['tao']
const TEN_COT = { tao: 'Ngày tạo' }
const NGHIA = { tao: { asc: 'cũ nhất trước', desc: 'mới tạo trước' } }
type Sap = { cot: string; tang: boolean }

const O: Record<string, (t: Dong, mo: (ma: string) => void) => React.ReactNode> = {
  khach: (t, mo) => (
    <span className="flex min-w-0 items-center gap-2 border-none border-current">
      {/* Mã đứng đầu ô — thẳng mép chữ tiêu đề cột (CEO 26/11). Khẩn = icon SAU mã, không chừa khe đầu ô. */}
      <span className="shrink-0 tabular-nums text-muted-foreground">{t.ticket_code}</span>
      {t.khan && t.state === 'Open' && <IconKhan />}
      <button type="button" className={nutMoTen} onClick={() => mo(t.ticket_code)}>
        {tenKhach(t)}
      </button>
    </span>
  ),
  may: (t) => (
    <span className="flex min-w-0 items-center gap-2 border-none border-current">
      {/* Chỉ chừa khe khi có serial — khe rỗng + gap làm chữ máy thụt 8px so với tiêu đề cột (đo 26/11). */}
      {t.serial && (
        <span className="shrink-0 border-none border-current">
          <ChuBaoHanh t={t} ngan />
        </span>
      )}
      {/* Chỉ mã máy ngắn (CEO 26/11); tên đầy đủ + serial xem ở title / Xem nhanh. */}
      <span className="min-w-0 truncate" title={[t.product_name, t.source_serial].filter(Boolean).join(' · ') || undefined}>
        {maMayNgan(t)}
      </span>
    </span>
  ),
  loi: (t) => <span className="block truncate text-muted-foreground">{t.dong_may?.[0] ? mayLoi(t) : '—'}</span>,
  tt: (t) => <TrangThaiO t={t} />,
  cs: (t) => <NguoiPhuTrach ten={t.cs_ten} />,
  han: (t) => <NhanHan t={t} />,
  loai: (t) => <span className="block truncate">{t.ticket_type ?? '—'}</span>,
  tinh: (t) => <span className="block truncate">{t.province ?? '—'}</span>,
  tao: (t) => <span className="tabular-nums text-muted-foreground">{ngayNgan(t.created_at)}</span>,
}

function DongBang({ t, hien, mo }: { t: Dong; hien: CotBang[]; mo: (ma: string) => void }) {
  const { daChon } = useDaChon()
  return (
    <TableRow chon={daChon.includes(t.ticket_code)}>
      <OChonDong khoa={t.ticket_code} moTa={`ticket ${t.ticket_code}`} />
      {hien.map((c, i) => (
        <TableCell key={c.id} cot={c.id} phai={c.phai} ghim={laGhim(c, i)}>
          {O[c.id](t, mo)}
        </TableCell>
      ))}
      {/* Ô dưới cột "+" (ThemCot). */}
      <TableCell aria-hidden="true" />
    </TableRow>
  )
}

/** Khoá phụ mã ticket (CHUAN-FILTER luật 2) — không đảo theo chiều. */
const soSanh = ({ cot, tang }: Sap) => (a: Ticket, b: Ticket) =>
  (cot === 'han' ? han(a) - han(b) : Date.parse(a.created_at) - Date.parse(b.created_at)) * (tang ? 1 : -1) ||
  a.ticket_code.localeCompare(b.ticket_code)

// ── Danh sách (điện thoại + dạng xem Danh sách) ────────────────────────────────────────────────────────────────────
const COT_DS: CotDanhSach<Dong>[] = [
  {
    id: 'ticket',
    ten: 'Ticket · khách',
    rong: 'minmax(0,2fr)',
    dienThoai: 'tren',
    o: (t) => (
      <>
        {t.khan && t.state === 'Open' && (
          <NhanDau gon>
            <IconKhan />
          </NhanDau>
        )}
        <NutMoMa ma={t.ticket_code} />
        <NutMoTen ten={tenKhach(t)} />
      </>
    ),
  },
  { id: 'may', ten: 'Máy · lỗi', rong: 'minmax(0,1.2fr)', anKhiHep: true, dienThoai: 'duoi', o: (t) => <span className="min-w-0 truncate text-muted-foreground">{mayLoi(t)}</span> },
  { id: 'bh', ten: 'Bảo hành', rong: '132px', dienThoai: 'trenPhai', o: (t) => <ChuBaoHanh t={t} /> },
  { id: 'cs', ten: 'Phụ trách', rong: '72px', anKhiHep: true, o: (t) => <NguoiPhuTrach ten={t.cs_ten} /> },
]

// ── Kanban theo khâu (L2) ───────────────────────────────────────────────────────────────────────────────────────────
const KHAU: CotKanban[] = [
  { id: 'moi', nhan: 'Mới', color: 'discovery' },
  { id: 'cho-hen', nhan: 'Chờ hẹn', color: 'warning' },
  { id: 'da-hen', nhan: 'Đã hẹn KTV', color: 'info' },
  { id: 'vat-tu', nhan: 'Chờ vật tư', color: 'warning' },
  { id: 'xong', nhan: 'Xong', color: 'success' },
]
const khauCua = (t: Dong) =>
  t.state === 'Done' ? 'xong' : (t.khau ?? (!t.cs_ten ? 'moi' : choVatTu(t) ? 'vat-tu' : t.ky_thuat || t.hen ? 'da-hen' : 'cho-hen'))
/**
 * Nhóm cột Kanban (⚙ "Nhóm theo", URL `nhom`; mặc định Khâu không ghi). Twenty chỉ nhóm theo trường chọn / quan hệ một —
 * ở đây Khâu (suy ra), Trạng thái, Phụ trách. Nhóm đang ẩn: URL `nhom_an` (id cột, phẩy), đổi nhóm theo thì bỏ.
 */
const NHOM_KB = [
  { giaTri: 'khau', nhan: 'Khâu' },
  { giaTri: 'tt', nhan: 'Trạng thái' },
  { giaTri: 'cs', nhan: 'Phụ trách' },
] as const
type NhomKb = (typeof NHOM_KB)[number]['giaTri']
/** Cột "Không có giá trị" (Twenty "No Value") khi nhóm theo trường để trống được (Phụ trách). */
const KHONG_GT = '__trong'

/** Thẻ Kanban dạng trường (Twenty): rỗng hiện tên trường mờ; một nhãn màu tối đa — ở đây 0 badge, ngoại lệ tô màu chữ. */
const truongThe = (d: Dong): TruongThe[] => [
  { id: 'khach', icon: <AddressBook />, ten: 'Khách', giaTri: d.customer_name },
  {
    id: 'may',
    icon: <Cube />,
    ten: 'Máy',
    giaTri: d.product_name && (
      <>
        {d.product_name}
        {d.source_serial && <span className="tabular-nums text-muted-foreground"> · {d.source_serial}</span>}
      </>
    ),
  },
  { id: 'loi', icon: <Wrench />, ten: 'Lỗi gần nhất', giaTri: d.dong_may?.[0]?.nhan },
  { id: 'bh', icon: <ShieldCheck />, ten: 'Bảo hành', giaTri: d.serial ? <ChuBaoHanh t={d} /> : null },
  { id: 'cs', icon: <User />, ten: 'Phụ trách', giaTri: d.cs_ten },
]

export function TicketF({ rows: goc, tong, trang, soTrang, demo, tuyChonLoc = {} }: DuLieuTicket) {
  const spRo = useSearchParams()
  const sp = new URLSearchParams(spRo.toString())
  const pathname = usePathname()
  const dat = useDatUrl()
  const [sua, setSua] = useState<Record<string, Sua>>({})
  const [kbTam, setKbTam] = useState<Record<string, string | null>>({})
  const c = useCotBang(COT, { url: true })
  // Tách sẵn: luật react-hooks/refs coi cả `c` là ref nếu `c.refBang` gắn thẳng vào `ref=`.
  const { refBang } = c
  const caiDat = useRef<CaiDatRef>(null)
  // Dạng xem ở URL (`bo_cuc` = mục "Bố cục" của ⚙; mặc định Bảng không ghi) — chép link mở lại đúng dạng xem. CEO 26/11
  // "giữ 2 dạng": chỉ Bảng + Kanban cho chọn; `bo_cuc=danh-sach` cũ → Bảng. Danh sách (ListView) chỉ còn là cách hiện tự
  // động khi khung < RONG_BANG_TOI_THIEU (điện thoại).
  const dangXem: DangXem = XEM_F.find((x) => x === sp.get('bo_cuc')) ?? 'bang'
  const doiXem = (v: DangXem) => dat({ bo_cuc: v === 'bang' ? null : v }, true)

  // ── Lọc theo trường (bang/locTruong, URL = tham số mang tên trường): server đã lọc thật; lọc lại ở đây để sửa tại chỗ
  // (prototype, chưa lưu) cũng ra/vào bộ lọc ngay.
  const dk = docTatCa(sp, TRUONG_F)
  const rows: Dong[] = apLoc(
    goc.map((t) => {
      const s = sua[t.ticket_code]
      return { ...t, state: s?.state ?? t.state, cs_ten: s && 'cs' in s ? (s.cs ?? null) : t.cs_ten, hen: !!s?.hen, khau: s?.khau }
    }),
    dk,
    TRUONG_F,
    { toi: TOI },
  )
  // Danh sách giá trị lấy từ dữ liệu CHƯA lọc (server gửi) — không co lại theo chính bộ lọc đang bật.
  const nguoi = (tuyChonLoc.cs ?? []).filter((n) => n !== CHUA_GIAO).map((n) => ({ gt: n, nhan: n }))
  const ttCo = TT.filter((m) => tuyChonLoc.tt?.includes(m.gt))
  const truongLoc: TruongLoc[] = TRUONG_F.map((x) => ({
    id: x.id,
    ten: x.ten,
    kieu: x.kieu,
    tuyChon:
      x.id === 'tt'
        ? ttCo.map((m) => ({ giaTri: m.gt, nhan: m.nhan }))
        : tuyChonLoc[x.id]?.map((g) => ({ giaTri: g, nhan: x.id === 'cs' && g === CHUA_GIAO ? 'Chưa giao' : g })),
  }))
  const datLoc = (id: string, d: DieuKienLoc | null) => dat({ [id]: ghiDieuKien(d, TRUONG_F.find((x) => x.id === id)!.kieu) })
  // Menu tiêu đề cột → "Lọc…" mở pop lọc của đúng trường (đủ phép + "Tôi"); đã có chip → mở chip đó (học Twenty).
  const { nut: refNutLoc, chip: refChipLoc, mo: moLocTruong } = useMoLoc()
  const doi = (ma: string) => (s: Sua) => setSua((m) => ({ ...m, [ma]: { ...m[ma], ...s } }))

  // ── URL → sắp (`cot`/`chieu`, CHUAN-FILTER) ──
  const cotUrl = COT_SAP.includes(sp.get('cot') ?? '') ? sp.get('cot')! : null
  const sap: Sap | null = cotUrl ? { cot: cotUrl, tang: sp.get('chieu') !== 'desc' } : null
  const datSap = (s: Sap | null) => dat({ cot: s?.cot ?? null, chieu: s ? (s.tang ? 'asc' : 'desc') : null })
  const view = (VIEW.find((x) => x.v === sp.get('view'))?.v ?? 'cua-toi') as View
  const dong = rows.filter(VIEW.find((x) => x.v === view)!.loc)
  if (sap) dong.sort(soSanh(sap))

  // ── Kanban: nhóm theo + nhóm ẩn (URL) ──
  const docKb = (k: string) => (k in kbTam ? kbTam[k] : sp.get(k))
  const nhomTheo: NhomKb = NHOM_KB.find((x) => x.giaTri === docKb('nhom'))?.giaTri ?? 'khau'
  const nhomAn = (docKb('nhom_an') ?? '').split(',').filter(Boolean)
  const cotNhom: CotKanban[] =
    nhomTheo === 'khau'
      ? KHAU
      : nhomTheo === 'tt'
        ? TT.map((m) => ({ id: m.gt, nhan: m.nhan, color: m.color }))
        : [...nguoi.map((n) => ({ id: n.gt, nhan: n.nhan })), { id: KHONG_GT, nhan: 'Không có giá trị' }]
  const cotKb = cotNhom.filter((x) => !nhomAn.includes(x.id))
  const cotCuaThe = (d: Dong) => (nhomTheo === 'khau' ? khauCua(d) : nhomTheo === 'tt' ? d.state : (d.cs_ten ?? KHONG_GT))
  // Nhóm theo Trạng thái có cột "Đã huỷ"; Khâu / Phụ trách bỏ ticket huỷ (như trước). Thẻ ở nhóm ẩn không tính.
  const theKanban = rows.filter((d) => (nhomTheo === 'tt' || d.state !== 'Cancel') && cotKb.some((x) => x.id === cotCuaThe(d)))
  // `nhom` / `nhom_an` chỉ màn dùng: router.replace (gọi lại server) mất 3–5s ở dev (đo 26/11); history.replaceState đổi URL
  // nhưng useSearchParams không theo → giữ bản tạm trên màn (có hiệu lực ngay, như Twenty "lưu ngay") + ghi URL chạy nền.
  const datNgay = (sua: Record<string, string | null>) => {
    setKbTam((m) => ({ ...m, ...sua }))
    dat(sua, true)
  }
  const datNhomAn = (ds: string[]) => datNgay({ nhom_an: ds.length ? ds.join(',') : null })
  /** Kéo thẻ / "Chuyển sang…" → cập nhật lạc quan (chỉ state trên màn, prototype không mutation). */
  const chuyenThe = (id: string, cot: string) => {
    if (nhomTheo === 'tt') return doi(id)({ state: cot as Ticket['state'] })
    if (nhomTheo === 'cs') return doi(id)({ cs: cot === KHONG_GT ? null : cot })
    doi(id)(cot === 'xong' ? { state: 'Done', khau: undefined } : { state: 'Open', khau: cot })
  }
  const xem = sp.get('xem')
  const nguon = dangXem === 'kanban' ? theKanban : dong
  const i = xem ? nguon.findIndex((t) => t.ticket_code === xem) : -1
  const t = i >= 0 ? nguon[i] : null
  // Tab của thẻ (`xem_tab`): như `nhom` — bản tạm trên màn có hiệu lực ngay, URL ghi chạy nền (router.replace chậm ở dev).
  // Đóng thẻ (✕, Esc, nút xem nhanh) → bỏ tab; lật / mở bản ghi khác → giữ tab.
  const [tabTam, setTabTam] = useState<TabXem | null>(null)
  const mo = (ma: string | null) => {
    if (!ma) setTabTam(null)
    dat({ xem: ma, ...(ma ? {} : { xem_tab: null }) }, true)
  }
  const tabXem: TabXem = tabTam ?? TAB_XEM.find((x) => x === sp.get('xem_tab')) ?? 'tong'
  const doiTab = (v: TabXem) => {
    setTabTam(v)
    dat({ xem_tab: v === 'tong' ? null : v }, true)
  }

  const dieuKien = [
    ...(sp.get('q') ? [{ nhan: 'Tìm', giaTri: sp.get('q')!, href: hrefBoLoc(pathname, sp, 'q') }] : []),
    // Mỗi điều kiện = một ChipLoc (bấm sửa, × gỡ).
    ...dk.map((d) => {
      const x = truongLoc.find((y) => y.id === d.truong)!
      return { nhan: x.ten, giaTri: '', chip: <ChipLoc ref={refChipLoc(d.truong)} truong={x} dieuKien={d} onDoi={datLoc} /> }
    }),
  ]
  const thamSoLoc = TRUONG_F.map((x) => x.id)

  const tongRong = RONG_O_CHON + c.tongRong + RONG_THEM_COT
  const [khungRef, rongKhung] = useRongKhung()
  const bang = (
    <TableWrap>
      <KeoCot cot={c.hien} doiCho={c.doiCho}>
        <Table ref={refBang} layout="fixed" style={{ minWidth: tongRong }}>
          {/* Cột cuối (dưới ô "+") ăn phần dư của khung. */}
          <ColCotBang hien={c.hien} doRong={c.doRong} />
          <TableHeader>
            <TableRow>
              <OChonTatCa nhan="ticket" />
              {c.hien.map((x, j) => (
                <TieuDeCot
                  key={x.id}
                  cot={x}
                  viTri={j}
                  menuPhai={j === c.hien.length - 1}
                  // Cột cuối vẫn co dãn được: cột "+" phía sau đỡ tay co (không thò qua mép phải bảng).
                  coDan={{ rong: c.doRong[x.id], onDoi: (px) => c.coDan(x.id, px) }}
                  menuCot={c.menuCot(x.id)}
                  sap={
                    x.kieu === 'sap'
                      ? {
                          chieu: sap?.cot === x.id ? (sap.tang ? 'tang' : 'giam') : null,
                          onDoi: (ch) => datSap(ch ? { cot: x.id, tang: ch === 'tang' } : null),
                        }
                      : undefined
                  }
                  moLoc={
                    TRUONG_F.some((y) => y.id === x.id)
                      ? { dang: dk.some((d) => d.truong === x.id), onMo: (neo) => moLocTruong(x.id, neo) }
                      : undefined
                  }
                />
              ))}
              <ThemCot cot={COT} an={c.an} onHien={c.themCot} onTuyChinh={() => caiDat.current?.mo('cot')} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {dong.map((d) => (
              <DongBang key={d.ticket_code} t={d} hien={c.hien} mo={mo} />
            ))}
          </TableBody>
        </Table>
      </KeoCot>
    </TableWrap>
  )
  const ds = (
    <ListView aria-label="Ticket CSKH" cot={COT_DS} dong={dong} khoa={(d) => d.ticket_code} onMo={(d) => mo(d.ticket_code)} dangMo={xem} moKhi="ten" />
  )

  return (
    <XemNhanh
      coDinh
      the={
        t &&
        theXemNhanhF({
          t,
          rows,
          nguoi,
          sua: doi(t.ticket_code),
          tab: tabXem,
          onTab: doiTab,
          moDuoc: (ma) => nguon.some((x) => x.ticket_code === ma),
          onMo: mo,
        })
      }
      onDong={() => mo(null)}
      onTruoc={i > 0 ? () => mo(nguon[i - 1].ticket_code) : undefined}
      onSau={i >= 0 && i < nguon.length - 1 ? () => mo(nguon[i + 1].ticket_code) : undefined}
    >
      <TrangDuLieu>
        <DauPrototype
          ma="F"
          demo={demo}
          cach={`Đề xuất theo nghiên cứu (L1 + L3, Kanban theo khâu là dạng xem phụ ở nút dạng xem). Bấm tab view; nút "Lọc" (cạnh ⚙): chọn trường → điều kiện → giá trị = một chip (bấm chip sửa, × gỡ; server lọc thật theo URL) — hoặc bấm tiêu đề cột → "Lọc…" mở đúng trường đó; bấm TÊN khách mở Xem nhanh (đổi trạng thái / phụ trách, Hẹn KTV); tick ô đầu dòng → thanh hàng loạt. Giả định: "Của tôi" = ${TOI}; hạn = ngày tạo + 3 ngày (khẩn + 1); Chờ vật tư = đã có KT + loại Thay lõi/Sửa chữa; Hẹn hôm nay = có KT, hoạt động hôm nay. Không lưu gì.`}
        />
        <CauHinhBangDs giaoDien={{ ...O_TIM_PILL, ...CHON_BANG_GHIM }} thanhHangLoat="surface" tenCot={TEN_COT} nghiaSapXep={NGHIA}>
          <DataViewToolbar
            tieuDe="Ticket CSKH"
            dem={{ thay: dangXem === 'kanban' ? theKanban.length : dong.length, tong }}
            timKiem={
              <Suspense>
                <OTimKiem placeholder="Mã ticket, serial, khách, SĐT…" aria-label="Tìm ticket" />
              </Suspense>
            }
            nutChinh={<NutTaoTicket />}
            tabs={
              dangXem === 'kanban' ? undefined : (
                <Tabs value={view} onValueChange={(v) => dat({ view: v, xem: null })}>
                  <TabsList variant="pill" thuGon aria-label="View ticket">
                    {VIEW.map((x) => {
                      const n = rows.filter(x.loc).length
                      return (
                        <TabsTrigger key={x.v} value={x.v}>
                          {x.ten} <TabsCount color={x.v === 'qua-han' && n ? 'danger' : undefined}>{n}</TabsCount>
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>
                </Tabs>
              )
            }
            loc={<NutLoc ref={refNutLoc} truong={truongLoc} dieuKien={dk} onDoi={datLoc} />}
            caiDat={
              <CaiDatHienThi
                ref={caiDat}
                dangXem={dangXem}
                onDoiXem={doiXem}
                dangXemCo={XEM_F}
                cot={c.thuTu.map((id) => COT.find((x) => x.id === id)!)}
                onDoiChoCot={c.doiCho}
                cotAn={c.an}
                onCotAn={(an) => COT.forEach((x) => c.anHien(x.id, !an.includes(x.id)))}
                sapXep={sap ?? undefined}
                onSapXep={datSap}
                nhom={{
                  kanban: true,
                  tuyChon: [...NHOM_KB],
                  giaTri: nhomTheo,
                  onDoi: (v) => datNgay({ nhom: v === 'khau' ? null : v, nhom_an: null }),
                }}
                nhomAn={{
                  ds: cotNhom.filter((x) => nhomAn.includes(x.id)).map((x) => ({ giaTri: x.id, nhan: x.nhan })),
                  onHien: (id) => datNhomAn(nhomAn.filter((x) => x !== id)),
                }}
              />
            }
            dangXem={dangXem}
            onDoiXem={doiXem}
            dangXemCo={XEM_F}
            xemNhanh={t != null}
            onXemNhanh={(bat) => mo(bat ? (nguon[0]?.ticket_code ?? null) : null)}
          />
          <ThanhDangLoc
            dieuKien={dieuKien}
            hienThi={dangXem === 'kanban' ? theKanban.length : dong.length}
            tong={dangXem === 'kanban' ? theKanban.length : dong.length}
            nhan="ticket"
            anSoDong
            sapXep={sap ? { ...sap, macDinh: false } : undefined}
            // "Xoá lọc" giữ prototype (`variant`), view, dạng xem, trạng thái cột — chỉ bỏ điều kiện lọc/sắp.
            hrefXoaLoc={hrefBoLoc(pathname, sp, 'q', ...thamSoLoc, 'cot', 'chieu', 'xem')}
          />
          <KhungChon
            khoaTrang={dong.map((d) => d.ticket_code)}
            tong={dong.length}
            bat={dangXem !== 'kanban'}
            thamSo={{
              view,
              q: sp.get('q') ?? '',
              ...Object.fromEntries(thamSoLoc.map((k) => [k, sp.get(k) ?? ''])),
              cot: cotUrl ?? '',
              chieu: sp.get('chieu') ?? '',
            }}
          >
            {dangXem === 'kanban' ? (
              <KanbanBoard
                cot={cotKb}
                the={theKanban.map((d) => ({
                  id: d.ticket_code,
                  cot: cotCuaThe(d),
                  ten: d.ticket_code,
                  noiDung: (
                    <NoiDungTheTruong
                      dau={
                        <>
                          {/* Mã đứng đầu (thẳng mép trường dưới), Khẩn = icon SAU mã — như ô bảng. */}
                          {d.ticket_code}
                          {d.khan && d.state === 'Open' && <IconKhan />}
                        </>
                      }
                      truong={truongThe(d)}
                    />
                  ),
                }))}
                onChuyen={chuyenThe}
                onMo={(ma) => mo(ma)}
                menuCot={{
                  them: { nhan: 'Thêm ticket', onThem: chuaLuu },
                  onAn: (c) => datNhomAn([...nhomAn, c.id]),
                }}
              />
            ) : !dong.length ? (
              <EmptyState size="sm" kieu="loc" tieuDe="Không có ticket nào trong view này" moTa="Thử view khác hoặc bỏ bớt từ khoá, điều kiện lọc." />
            ) : (
              // Bảng là dạng xem chính; hết chỗ thì CUỘN NGANG (Twenty) — không đổi sang ListView khi vừa thêm/giãn cột
              // (cột vừa thêm biến mất, mất focus: đo 26/11). Chỉ vùng chứa < 640 (điện thoại) mới dùng ListView 1–2 dòng.
              // Đo bằng ResizeObserver; mốc container cố định 952 cũ giấu Bảng ở 1440 (vùng 927).
              <div ref={khungRef} className="border-none border-current">
                {rongKhung === null || rongKhung >= RONG_BANG_TOI_THIEU ? bang : ds}
              </div>
            )}
            <ThanhDaChon nhan="ticket">
              <Button variant="ghost" size="sm" onClick={chuaLuu}>
                <UserPlus aria-hidden="true" />
                Giao cho…
              </Button>
              <Button variant="ghost" size="sm" onClick={chuaLuu}>
                <ArrowsClockwise aria-hidden="true" />
                Đổi trạng thái
              </Button>
              <Button variant="ghost" size="sm" onClick={chuaLuu}>
                <CalendarPlus aria-hidden="true" />
                Hẹn KTV
              </Button>
            </ThanhDaChon>
          </KhungChon>
          <Suspense>
            <PhanTrang trang={trang} soTrang={soTrang} tong={tong} nhan="ticket" />
          </Suspense>
        </CauHinhBangDs>
      </TrangDuLieu>
    </XemNhanh>
  )
}
