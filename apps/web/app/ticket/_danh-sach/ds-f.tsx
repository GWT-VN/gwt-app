'use client'

// Danh sách ticket F — màn thật /ticket (docs/rework/2026-11-26-ticket-f-dung-that.md; gốc: PA F
// docs/rework/2026-11-25-nghien-cuu-cskh-ho-so-may.md mục 4b). Prototype /ticket?variant=F dựng CHÍNH component này (+ `dau`).
// L1 Bảng + thẻ Xem nhanh (bố cục Twenty, xem-nhanh-f.tsx) · L3 tab view có số đếm · L2 Kanban là dạng xem phụ.
// Dữ liệu: server (page.tsx → searchTickets) đã lọc theo tab + trường + tìm, sắp, cắt trang; số tab đếm ở DB.
// Sửa tại chỗ (Xem nhanh, kéo thẻ, hàng loạt) CHƯA nối mutation — chỉ đổi state trên màn (bước 4 của kế hoạch).
import { Suspense, useRef, useState, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowSquareOut,
  ArrowsClockwise,
  CalendarPlus,
  Copy,
  SidebarSimple,
  LinkSimple,
  Cube,
  ShieldCheck,
  User,
  UserPlus,
  Wrench,
} from '@phosphor-icons/react/ssr'
import type { Ticket } from '@/app/actions'
import { KhungChon, OChonDong, OChonTatCa, OTimKiem, PhanTrang, ThanhDaChon, useDaChon } from '@/bang'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge, BadgeDot } from '@/components/ui/badge'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { Button } from '@/components/ui/button'
import { CaiDatHienThi, DataViewToolbar, TrangDuLieu, type CaiDatRef, type DangXem } from '@/components/ui/data-view-toolbar'
import { EmptyState } from '@/components/ui/empty-state'
import { OSuaChon, OSuaNguoi, OSuaTrangThai, type MucTrangThai } from '@/components/ui/inline-edit'
import type { MucChon } from '@/bang/OChonGoiY'
import { CHUA_PHAN_LOAI } from '@/lib/loi/dongMay'
import { luuLoi, luuMay, luuTicket, taoLoiMoi } from './sua-ticket'
import type { MayKhach } from '@/app/ticket/loi-actions'
import { KanbanBoard, NoiDungTheTruong, type CotKanban, type TruongThe } from '@/components/ui/kanban-board'
import { ListView, NutMoMa, NutMoTen, type CotDanhSach } from '@/components/ui/list-view'
import { nutMoTen } from '@/components/ui/list-view-styles'
import { ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu'
import { Table, TableBody, TableCell, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import { CHON_BANG_GHIM, phanTrangLuoi } from '@/components/ui/table-styles'
import { ColCotBang, KeoCot, TieuDeCot } from '@/components/ui/tieu-de-cot'
import { ThemCot } from '@/components/ui/them-cot'
import { laGhim, RONG_O_CHON, RONG_THEM_COT, useCotBang, type CotBang } from '@/components/ui/use-cot-bang'
import { XemNhanh } from '@/components/ui/xem-nhanh'
import { cn } from '@/lib/utils'
import { docTatCa, ghiDieuKien, nhanChip, type DieuKienLoc } from '@/bang/locTruong'
import { moLocCot, NutLoc, useMoLoc, type TruongLoc } from '@/components/ui/bo-loc-truong'
import { hienNgay, type KieuNgay } from '@/lib/dinh-dang-ngay'
import { chuaLuu, laDemo, mayLoi, NutTaoTicket, tenKhach, useDatUrl, type DuLieuTicket } from './chung'
import { HopGanViec } from './the-tab'
import { BH_F, CHUA_GIAO, docViewF, dongDau, KHAN_CO, KHAN_KHONG, loiHopVoiMay, maCuaMay, maMayDong, maMayNgan, soDongThem, TRUONG_F } from './truong-f'
import { useTabTicket } from './tab-ticket'
import { RONG_BANG_TOI_THIEU, useRongKhung } from '@/components/ui/use-rong-khung'
import { TAB_XEM, theXemNhanhF, type TabXem } from './xem-nhanh-f'

/** Giá trị lạc quan khi kéo thẻ Kanban (đang lưu DB) — bỏ khi lưu xong (dữ liệu server mới về) hoặc trả lại khi lỗi. */
type Sua = Partial<Ticket>
export type DongF = Ticket
type Dong = DongF

// ── Nhãn ────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const TT: MucTrangThai[] = [
  // CEO 26/11: "trạng thái đang mở là màu vàng vì là ticket support KH" (đang hỗ trợ khách, chờ xử lý).
  { gt: 'Open', nhan: 'Đang mở', color: 'warning' },
  { gt: 'Done', nhan: 'Đã xong', color: 'success' },
  { gt: 'Cancel', nhan: 'Đã huỷ', color: 'secondary' },
]

// Bảng/danh sách: MỘT nhãn màu mỗi hàng (Trạng thái) — CEO 26/11 "quá nhiều dạng label rối mắt". Bảo hành = chữ;
// màu chữ chỉ cho ngoại lệ (hết BH, khẩn). Xem nhanh cũng vậy (xem-nhanh-f.tsx).
export const CHU_DO = 'text-(--color-text-danger)'

/** Khẩn (đang mở) = CHỮ tên/tiêu đề màu đỏ — CEO 26/11: "bỏ dấu chấm than đỏ ở đầu tên, cho hiện chữ tiêu đề màu đỏ là
 *  được". Không truyền nghĩa chỉ bằng màu: kèm `<SrKhan />` trước tên cho trình đọc màn hình. */
export const laKhan = (t: Ticket) => t.khan && t.state === 'Open'
export function SrKhan() {
  return <span className="sr-only">Khẩn: </span>
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

/** Mục pop Loại lỗi: lỗi còn dùng (không "ngưng") của máy cùng hàng + "Chưa phân loại" (luôn có). */
function mucLoi(ds: DuLieuTicket['dsLoi'], t: Ticket): MucChon[] {
  const may = maCuaMay(t)
  const co = ds
    .filter((d) => !d.ngung && loiHopVoiMay(d, may))
    .map((d) => ({ gt: d.code, nhan: d.ten, ...(d.choDuyet ? { phu: 'chờ duyệt' } : {}) }))
  return co.some((m) => m.gt === CHUA_PHAN_LOAI) ? co : [...co, { gt: CHUA_PHAN_LOAI, nhan: 'Chưa phân loại' }]
}

/** Chữ cặp Máy · Loại lỗi: đậm hơn một bậc (500) nhưng nhạt màu (muted, không tertiary — tương phản ≥ 4,5) — CEO 26/11
 *  "Mã máy và lỗi tăng thêm 1 weight nhưng cho giảm sắc độ xuống". "+N" / "Chưa phân loại" giữ chữ thường. */
const CHU_CAP = 'font-medium text-muted-foreground'

/** "+N" dòng máy khác — như nhau ở cột Máy và Loại lỗi (cặp đọc ngang cùng hàng). */
function ThemDong({ t }: { t: Ticket }) {
  const n = soDongThem(t)
  return n ? (
    <span className="shrink-0 tabular-nums text-muted-foreground" title={t.dong_may?.slice(1).map((d) => d.nhan).join(' · ')}>
      +{n}
    </span>
  ) : null
}

/** Thanh hàng loạt: Gắn việc cho các ticket đang chọn (trên trang này; ticket Demo bỏ qua). */
function NutGanViecHangLoat({ rows, onMo }: { rows: Ticket[]; onMo: (ds: Ticket[]) => void }) {
  const { daChon } = useDaChon()
  const ds = rows.filter((x) => daChon.includes(x.ticket_code) && !laDemo(x.ticket_code))
  return (
    <Button variant="ghost" size="sm" disabled={!ds.length} onClick={() => onMo(ds)}>
      <LinkSimple aria-hidden="true" />
      Gắn việc
    </Button>
  )
}

function TrangThaiO({ t }: { t: Ticket }) {
  return (
    <Badge variant="soft" color={TT.find((m) => m.gt === t.state)?.color}>
      <BadgeDot />
      {TT.find((m) => m.gt === t.state)?.nhan}
    </Badge>
  )
}

/** Dạng xem cho người dùng chọn ở F (CEO 26/11 "giữ 2 dạng"). */
const XEM_F = ['bang', 'kanban'] as const satisfies readonly DangXem[]


// ── Bảng (L1) ───────────────────────────────────────────────────────────────────────────────────────────────────────
// Cột theo DS (`CotBang`, useCotBang): thứ tự / độ rộng / ẩn ghi lên URL (`cot_thu_tu`, `cot_rong`, `cot_an`). Cột đầu
// "Ticket · khách" khoá (không kéo, không ẩn) nhưng co dãn được như mọi cột; phần dư của khung do cột "+" cuối ăn
// (`ColCotBang`, học Twenty) — kéo tay co cột nào chỉ cột đó đổi.
// Mã gộp vào ô khách (như ListView), badge bảo hành gộp đầu ô máy ("dải máy").
// Độ rộng KHÔNG gõ tay (CEO 26/11 "chiều rộng cột = chiều dài content dài nhất để tránh bị cắt thông tin"): mọi cột tự
// vừa tiêu đề + ô dài nhất của trang đang xem (`useCotBang` đo, `refBang`); cột chữ tự do có trần `rongToiDa` để một giá
// trị cực dài không kéo cột rộng vô lý — quá trần mới cắt (ô có title). Tổng vượt khung → bảng cuộn ngang.
const COT: CotBang[] = [
  // CEO 26/11 "thế đổi lại ticket ở đầu bảng đi": cột đầu (khoá, ghim) = Mã ticket; Khách là cột thường.
  { id: 'ma', ten: 'Mã ticket', kieu: 'thuong', khoa: true },
  { id: 'khach', ten: 'Khách', kieu: 'thuong', rongToiDa: 400 },
  { id: 'may', ten: 'Máy', kieu: 'thuong', rongToiDa: 240 },
  { id: 'loi', ten: 'Loại lỗi', kieu: 'thuong', rongToiDa: 240 },
  { id: 'bh', ten: 'Bảo hành', kieu: 'thuong' },
  { id: 'tt', ten: 'Trạng thái', kieu: 'loc' },
  { id: 'cs', ten: 'Phụ trách', kieu: 'loc' },
  { id: 'loai', ten: 'Loại', kieu: 'thuong', anMacDinh: true, rongToiDa: 240 },
  { id: 'tinh', ten: 'Tỉnh/TP', kieu: 'thuong', anMacDinh: true, rongToiDa: 240 },
  { id: 'tao', ten: 'Ngày tạo', kieu: 'sap', anMacDinh: true, ngay: true, nghia: { tang: 'Cũ nhất trước', giam: 'Mới tạo trước' } },
]
const COT_SAP = ['tao']
const TEN_COT = { tao: 'Ngày tạo' }
const NGHIA = { tao: { asc: 'cũ nhất trước', desc: 'mới tạo trước' } }
type Sap = { cot: string; tang: boolean }

/** Ngữ cảnh ô: mở Xem nhanh + dữ liệu chọn của ô sửa được (null = chỉ đọc: không quyền cs.ticket.tao_sua). */
type NgCanhO = {
  mo: (ma: string) => void
  kieuNgay: (id: string) => KieuNgay
  sua: {
    nhanVien: MucChon[]
    loai: MucChon[]
    dsLoi: DuLieuTicket['dsLoi']
    mayKhach: Record<string, MayKhach[]>
    /** Đổi máy: lạc quan cả cặp Máy + Bảo hành (+ Loại lỗi về Chưa phân loại), lỗi thì trả cả cặp. */
    doiMay: (t: Ticket, serial: string) => Promise<void>
  } | null
}

const O: Record<string, (t: Dong, ng: NgCanhO) => React.ReactNode> = {
  // CEO 26/11 "Tách cột mã ticket ra riêng cho dễ xem": ô Khách chỉ tên (nút mở Xem nhanh; khẩn = chữ đỏ, kể cả lúc
  // rê/focus) — mã ở cột "Mã ticket" riêng.
  // Mã = định danh chính: nút mở Xem nhanh, chữ thường; khẩn đang mở → MÃ chữ đỏ (kể cả lúc rê/focus) + sr-only.
  ma: (t, { mo }) => (
    <button type="button" className={cn(nutMoTen, 'block max-w-full tabular-nums', laKhan(t) && CHU_DO)} onClick={() => mo(t.ticket_code)}>
      {laKhan(t) && <SrKhan />}
      {t.ticket_code}
    </button>
  ),
  // Bấm tên khách = mở ticket như bấm mã (CEO 27/11 "Cho phép ấn vào ticket hoặc tên khách để vào ticket").
  // Ticket khẩn (đang mở): badge "Khẩn" (Badge DS soft danger) ngay sau tên khách (CEO 27/11).
  khach: (t, { mo }) => (
    <span className="flex min-w-0 items-center gap-2 border-none border-current">
      <button type="button" className={cn(nutMoTen, 'block min-w-0 truncate text-left')} title={tenKhach(t)} onClick={() => mo(t.ticket_code)}>
        {tenKhach(t)}
      </button>
      {laKhan(t) && (
        <Badge variant="soft" color="danger" className="shrink-0">
          Khẩn
        </Badge>
      )}
    </span>
  ),
  // CEO 26/11 "Chỉ cần 1 cột mã máy -> cột lỗi -> bảo hành": chỉ mã máy ngắn CỦA DÒNG MÁY ĐẦU (cặp với Loại lỗi cùng
  // hàng); tên đầy đủ + serial ở title.
  may: (t, { sua }) => {
    // CEO 26/11 "Cho sửa Máy": bấm ô → chọn trong máy của khách (mã ngắn + serial). Chưa gắn khách / khách chưa có máy
    // trong hệ thống / không quyền → chỉ đọc.
    const ds = sua && t.customer_id ? sua.mayKhach[t.customer_id] : undefined
    const dangChon = dongDau(t)?.serial ?? t.serial
    return (
      <span className="flex min-w-0 items-center gap-2 border-none border-current">
        {sua && ds?.length ? (
          <span className={cn('contents', CHU_CAP)}>
            <OSuaChon
              ma={t.ticket_code}
              truong="máy"
              value={dangChon}
              mucDangChon={dangChon ? { gt: dangChon, nhan: maMayDong(t) } : undefined}
              chuaGiao="—"
              options={ds.map((m) => ({ gt: m.serial, nhan: maMayNgan(m), phu: m.serial, anMa: true }))}
              onLuu={(v) => (v ? sua.doiMay(t, v) : Promise.reject(new Error('Chọn một máy.')))}
            />
          </span>
        ) : (
          <span className={cn('min-w-0 truncate', CHU_CAP)} title={[t.product_name, t.source_serial].filter(Boolean).join(' · ') || undefined}>
            {maMayDong(t)}
          </span>
        )}
        <ThemDong t={t} />
      </span>
    )
  },
  // Chỉ TÊN lỗi (không lặp mã máy — CEO 26/11 "tách loại lỗi ra khỏi mã máy"); chưa phân loại = chữ mờ.
  loi: (t, { sua }) => {
    const d = dongDau(t)
    if (sua)
      // Bấm ô → chọn lỗi CỦA MÁY cùng hàng (danh mục ma_may, như DB) + "Chưa phân loại"; lưu vào dòng máy đầu.
      return (
        <span className="flex min-w-0 items-center gap-2 border-none border-current">
          <span className={cn('contents', d && !d.chuaPhanLoai && CHU_CAP)}>
          <OSuaChon
            ma={t.ticket_code}
            truong="loại lỗi"
            value={d?.loi_code ?? null}
            mucDangChon={d ? { gt: d.loi_code, nhan: d.loi_ten } : undefined}
            chuaGiao="—"
            options={mucLoi(sua.dsLoi, t)}
            onLuu={(v) => luuLoi(t, v ?? CHUA_PHAN_LOAI)}
            // Lỗi chưa có → gõ rồi "＋ Thêm loại lỗi": vào danh mục CHỜ DUYỆT (CEO 27/11, phương án A).
            onTaoMoi={(q) => taoLoiMoi(t, q)}
          />
          </span>
          {d && sua.dsLoi.some((x) => x.code === d.loi_code && x.choDuyet) && (
            <span className="shrink-0 text-[12px] text-muted-foreground">chờ duyệt</span>
          )}
          <ThemDong t={t} />
        </span>
      )
    return (
      <span className="flex min-w-0 items-center gap-2 border-none border-current">
        <span className={cn('min-w-0 truncate', !d || d.chuaPhanLoai ? 'text-muted-foreground' : CHU_CAP)}>{d?.loi_ten ?? '—'}</span>
        <ThemDong t={t} />
      </span>
    )
  },
  // Bảo hành dạng CHỮ (một nhãn màu mỗi hàng là Trạng thái); hết BH chữ đỏ, chưa kích hoạt mờ, không serial "—".
  bh: (t) => (t.serial ? <span className="whitespace-nowrap"><ChuBaoHanh t={t} ngan /></span> : <span className="text-muted-foreground">—</span>),
  tt: (t, { sua }) =>
    sua ? (
      <OSuaTrangThai ma={t.ticket_code} value={{ tt: t.state }} muc={TT} onLuu={(v) => luuTicket(t.ticket_code, { state: v.tt as Ticket['state'] })} />
    ) : (
      <TrangThaiO t={t} />
    ),
  cs: (t, { sua }) =>
    sua ? (
      <OSuaNguoi
        gon
        ma={t.ticket_code}
        truong="người phụ trách"
        value={t.cs_phu_trach}
        mucDangChon={t.cs_phu_trach ? { gt: t.cs_phu_trach, nhan: t.cs_ten ?? '—' } : undefined}
        options={sua.nhanVien}
        onLuu={(v) => luuTicket(t.ticket_code, { cs_phu_trach: v })}
      />
    ) : (
      <NguoiPhuTrach ten={t.cs_ten} />
    ),
  loai: (t, { sua }) =>
    sua ? (
      <OSuaChon
        ma={t.ticket_code}
        truong="loại"
        value={t.ticket_type}
        chuaGiao="—"
        options={sua.loai}
        onLuu={(v) => (v ? luuTicket(t.ticket_code, { ticket_type: v }) : Promise.reject(new Error('Loại không được trống.')))}
      />
    ) : (
      <span className="block truncate">{t.ticket_type ?? '—'}</span>
    ),
  tinh: (t) => <span className="block truncate">{t.province ?? '—'}</span>,
  // Định dạng chọn ở menu tiêu đề cột ("Định dạng ngày", CEO 26/11), mặc định dd/MM.
  tao: (t, ng) => <span className="tabular-nums text-muted-foreground">{hienNgay(t.created_at, ng.kieuNgay('tao'))}</span>,
}

function DongBang({ t, hien, ng, menu }: { t: Dong; hien: CotBang[]; ng: NgCanhO; menu: ReactNode }) {
  const { daChon } = useDaChon()
  // Chuột phải vào dòng → menu thao tác của ticket (CEO 27/11 "thêm bảng action khi chuột phải vào một row") — ContextMenu
  // DS như `ListView menuDong`.
  return (
    <TableRow chon={daChon.includes(t.ticket_code)} menu={menu} tenMenu={`Thao tác ${t.ticket_code}`}>
      <OChonDong khoa={t.ticket_code} moTa={`ticket ${t.ticket_code}`} />
      {hien.map((c, i) => (
        <TableCell key={c.id} cot={c.id} phai={c.phai} ghim={laGhim(c, i)}>
          {O[c.id](t, ng)}
        </TableCell>
      ))}
      {/* Ô dưới cột "+" (ThemCot). */}
      <TableCell aria-hidden="true" />
    </TableRow>
  )
}


// ── Danh sách (điện thoại + dạng xem Danh sách) ────────────────────────────────────────────────────────────────────
const COT_DS: CotDanhSach<Dong>[] = [
  {
    id: 'ticket',
    ten: 'Ticket · khách',
    rong: 'minmax(0,2fr)',
    dienThoai: 'tren',
    // "MÃ · Tên khách" (mã trước, CEO 26/11); khẩn → MÃ đỏ (chữ mã của DS là màu phụ → đè màu trong khung này).
    o: (t) => (
      <>
        {laKhan(t) ? (
          <span className="contents [&_span]:text-(--color-text-danger)">
            <SrKhan />
            <NutMoMa ma={t.ticket_code} luonHien />
          </span>
        ) : (
          <NutMoMa ma={t.ticket_code} luonHien />
        )}
        <NutMoTen ten={tenKhach(t)} />
      </>
    ),
  },
  { id: 'may', ten: 'Máy · lỗi', rong: 'minmax(0,1.2fr)', anKhiHep: true, dienThoai: 'duoi', o: (t) => <span className={cn('min-w-0 truncate', CHU_CAP)}>{mayLoi(t)}</span> },
  { id: 'bh', ten: 'Bảo hành', rong: '132px', dienThoai: 'trenPhai', o: (t) => <ChuBaoHanh t={t} /> },
  { id: 'cs', ten: 'Phụ trách', rong: '72px', anKhiHep: true, o: (t) => <NguoiPhuTrach ten={t.cs_ten} /> },
]

// ── Kanban theo khâu (L2) ───────────────────────────────────────────────────────────────────────────────────────────
const KHAU: CotKanban[] = [
  { id: 'moi', nhan: 'Mới', color: 'discovery' },
  { id: 'cho-hen', nhan: 'Chờ hẹn', color: 'warning' },
  { id: 'da-hen', nhan: 'Đã hẹn KTV', color: 'info' },
  { id: 'xong', nhan: 'Xong', color: 'success' },
]
// Khâu = SUY RA (không có trường DB) → chỉ xem, không kéo (kế hoạch bước 4). CEO 26/11 bỏ "Chờ vật tư" (không có dữ liệu).
const khauCua = (t: Dong) => (t.state === 'Done' ? 'xong' : !t.cs_phu_trach ? 'moi' : t.ky_thuat ? 'da-hen' : 'cho-hen')
/**
 * Nhóm cột Kanban (⚙ "Nhóm theo", URL `nhom`; mặc định Trạng thái không ghi). Twenty chỉ nhóm theo trường chọn / quan hệ
 * một — ở đây Trạng thái (kéo = đổi trạng thái), Phụ trách (kéo = giao lại), Khâu (suy ra, chỉ xem). Nhóm đang ẩn: URL `nhom_an` (id cột, phẩy), đổi nhóm theo thì bỏ.
 */
const NHOM_KB = [
  { giaTri: 'tt', nhan: 'Trạng thái' },
  { giaTri: 'cs', nhan: 'Phụ trách' },
  { giaTri: 'khau', nhan: 'Khâu (chỉ xem)' },
] as const
type NhomKb = (typeof NHOM_KB)[number]['giaTri']
/** Cột "Không có giá trị" (Twenty "No Value") khi nhóm theo trường để trống được (Phụ trách). */
const KHONG_GT = '__trong'

/** Thẻ Kanban dạng trường (Twenty): rỗng hiện tên trường mờ; một nhãn màu tối đa — ở đây 0 badge, ngoại lệ tô màu chữ. */
const truongThe = (d: Dong): TruongThe[] => [
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
  { id: 'loi', icon: <Wrench />, ten: 'Loại lỗi', giaTri: dongDau(d)?.loi_ten },
  { id: 'bh', icon: <ShieldCheck />, ten: 'Bảo hành', giaTri: d.serial ? <ChuBaoHanh t={d} /> : null },
  { id: 'cs', icon: <User />, ten: 'Phụ trách', giaTri: d.cs_ten },
]

export function TicketF({
  rows: goc,
  tong,
  trang,
  soTrang,
  dsLoi,
  tuyChonLoc = {},
  tabRieng,
  quyenTabChung,
  quyenSua = false,
  nhanVien = [],
  mayKhach = {},
  dau,
}: DuLieuTicket & { dau?: ReactNode }) {
  const spRo = useSearchParams()
  const sp = new URLSearchParams(spRo.toString())
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

  // ── Lọc theo trường (bang/locTruong, URL = tham số mang tên trường): server lọc ở DB (searchTickets) — ở đây chỉ đọc
  // điều kiện để dựng chip. Sửa tại chỗ (chưa lưu) đè lên dòng server gửi.
  const dk = docTatCa(sp, TRUONG_F)
  const rows: Dong[] = goc.map((t) => {
    const s = sua[t.ticket_code]
    return s ? { ...t, ...s } : t
  })
  const ttCo = TT.filter((m) => tuyChonLoc.tt?.includes(m.gt))
  const truongLoc: TruongLoc[] = TRUONG_F.map((x) => ({
    id: x.id,
    ten: x.ten,
    kieu: x.kieu,
    tuyChon:
      x.id === 'tt'
        ? ttCo.map((m) => ({ giaTri: m.gt, nhan: m.nhan }))
        : x.id === 'loi'
          ? // Loại lỗi = mã danh mục lỗi (DB lọc theo mã), nhãn = tên lỗi.
            dsLoi.map((d) => ({ giaTri: d.code, nhan: d.ten }))
          : x.id === 'bh'
            ? BH_F.map((b) => ({ giaTri: b.gt, nhan: b.nhan }))
            : x.id === 'khan'
            ? [
                { giaTri: KHAN_CO, nhan: 'Có' },
                { giaTri: KHAN_KHONG, nhan: 'Không' },
              ]
            : tuyChonLoc[x.id]?.map((g) => ({ giaTri: g, nhan: x.id === 'cs' && g === CHUA_GIAO ? 'Chưa giao' : g })),
  }))
  const datLoc = (id: string, d: DieuKienLoc | null) => dat({ [id]: ghiDieuKien(d, TRUONG_F.find((x) => x.id === id)!.kieu) })
  // Menu tiêu đề cột → "Lọc…" mở pop lọc của đúng trường (đủ phép + "Tôi"); đã có chip → mở chip đó (học Twenty).
  const { nut: refNutLoc, mo: moLocTruong } = useMoLoc()

  // ── URL → sắp (`cot`/`chieu`, CHUAN-FILTER) ──
  const cotUrl = COT_SAP.includes(sp.get('cot') ?? '') ? sp.get('cot')! : null
  const sap: Sap | null = cotUrl ? { cot: cotUrl, tang: sp.get('chieu') !== 'desc' } : null
  const datSap = (s: Sap | null) => dat({ cot: s?.cot ?? null, chieu: s ? (s.tang ? 'asc' : 'desc') : null })
  const view = docViewF(sp.get('view'))
  // Server đã lọc theo tab + sắp (cột "Ngày tạo" ↔ created_at).
  const dong = rows

  // ── Kanban: nhóm theo + nhóm ẩn (URL) ──
  const docKb = (k: string) => (k in kbTam ? kbTam[k] : sp.get(k))
  const nhomTheo: NhomKb = NHOM_KB.find((x) => x.giaTri === docKb('nhom'))?.giaTri ?? 'tt'
  const nhomAn = (docKb('nhom_an') ?? '').split(',').filter(Boolean)
  const cotNhom: CotKanban[] =
    nhomTheo === 'khau'
      ? KHAU
      : nhomTheo === 'tt'
        ? TT.map((m) => ({ id: m.gt, nhan: m.nhan, color: m.color }))
        : // Nhân viên đang hoạt động + người đang mang ticket mà đã nghỉ (vẫn thấy thẻ của họ) + "Không có giá trị".
          [
            ...nhanVien.map((n) => ({ id: n.gt, nhan: n.nhan })),
            ...[...new Map(rows.filter((d) => d.cs_phu_trach && !nhanVien.some((n) => n.gt === d.cs_phu_trach)).map((d) => [d.cs_phu_trach!, d.cs_ten ?? '—'])).entries()].map(([id, nhan]) => ({ id, nhan })),
            { id: KHONG_GT, nhan: 'Không có giá trị' },
          ]
  const cotKb = cotNhom.filter((x) => !nhomAn.includes(x.id))
  const cotCuaThe = (d: Dong) => (nhomTheo === 'khau' ? khauCua(d) : nhomTheo === 'tt' ? d.state : (d.cs_phu_trach ?? KHONG_GT))
  // Nhóm theo Trạng thái có cột "Đã huỷ"; Khâu / Phụ trách bỏ ticket huỷ (như trước). Thẻ ở nhóm ẩn không tính.
  const theKanban = rows.filter((d) => (nhomTheo === 'tt' || d.state !== 'Cancel') && cotKb.some((x) => x.id === cotCuaThe(d)))
  // `nhom` / `nhom_an` chỉ màn dùng: router.replace (gọi lại server) mất 3–5s ở dev (đo 26/11); history.replaceState đổi URL
  // nhưng useSearchParams không theo → giữ bản tạm trên màn (có hiệu lực ngay, như Twenty "lưu ngay") + ghi URL chạy nền.
  const datNgay = (sua: Record<string, string | null>) => {
    setKbTam((m) => ({ ...m, ...sua }))
    dat(sua, true)
  }
  const datNhomAn = (ds: string[]) => datNgay({ nhom_an: ds.length ? ds.join(',') : null })
  /**
   * Kéo thẻ / "Chuyển sang…" → lưu DB thật (updateTicket): Trạng thái = đổi trạng thái, Phụ trách = giao lại. Lạc quan:
   * thẻ sang cột mới ngay; lỗi → về cột cũ + KanbanBoard báo (Thử lại). Khâu suy ra → không kéo được.
   */
  const chuyenThe = async (id: string, cot: string) => {
    if (nhomTheo === 'khau') throw new Error('Khâu chỉ xem — kéo thẻ ở nhóm Trạng thái hoặc Phụ trách')
    const cs = cot === KHONG_GT ? null : cot
    const moi: Sua = nhomTheo === 'tt' ? { state: cot as Ticket['state'] } : { cs_phu_trach: cs, cs_ten: cotNhom.find((x) => x.id === cot && cs)?.nhan ?? null }
    const bo = () =>
      setSua((m) => {
        const n = { ...m }
        delete n[id]
        return n
      })
    setSua((m) => ({ ...m, [id]: moi }))
    try {
      await luuTicket(id, nhomTheo === 'tt' ? { state: moi.state } : { cs_phu_trach: cs })
    } finally {
      bo()
    }
  }
  const xem = sp.get('xem')
  const nguon = dangXem === 'kanban' ? theKanban : dong
  const i = xem ? nguon.findIndex((t) => t.ticket_code === xem) : -1
  const t = i >= 0 ? nguon[i] : null
  // Tab của thẻ (`xem_tab`): như `nhom` — bản tạm trên màn có hiệu lực ngay, URL ghi chạy nền (router.replace chậm ở dev).
  // Đóng thẻ (✕, Esc, nút xem nhanh) → bỏ tab; lật / mở bản ghi khác → giữ tab.
  const [tabTam, setTabTam] = useState<TabXem | null>(null)
  // Gắn việc (Xem nhanh / thanh hàng loạt): ticket đang gắn; `lanViec` tăng → khối "Việc đã gắn" đọc lại.
  const [ganViec, setGanViec] = useState<Ticket[] | null>(null)
  const [lanViec, setLanViec] = useState(0)
  const mo = (ma: string | null) => {
    if (!ma) setTabTam(null)
    dat({ xem: ma, ...(ma ? {} : { xem_tab: null }) }, true)
  }
  // Bấm ticket (mã ở bảng, dòng ListView, thẻ Kanban) → mở THẲNG trang chi tiết (CEO 27/11 "click vào ticket sẽ mở ra màn
  // chi tiết luôn"). Đang bật thẻ Xem nhanh (nút ở thanh công cụ) thì bấm chỉ đổi bản ghi trong thẻ — README DataViewToolbar
  // "tắt → bấm bản ghi mở trang chi tiết". Ticket demo (không có trang chi tiết) vẫn mở Xem nhanh.
  const router = useRouter()
  const bam = (ma: string) => (xem || laDemo(ma) ? mo(ma) : router.push(`/ticket/${encodeURIComponent(ma)}`))
  const tabXem: TabXem = tabTam ?? TAB_XEM.find((x) => x === sp.get('xem_tab')) ?? 'tong'
  const doiTab = (v: TabXem) => {
    setTabTam(v)
    dat({ xem_tab: v === 'tong' ? null : v }, true)
  }

  // Lọc hiện ngay ở nhãn cột thành chip (tieu-de-cot) — KHÔNG còn hàng chip lọc phía trên (CEO 27/11 "Bỏ hết chip filter
  // cũ nhé. chốt bản filter hiện ở label"). Sửa/gỡ điều kiện qua menu tiêu đề cột hoặc nút Lọc.
  const thamSoLoc = TRUONG_F.map((x) => x.id)
  // Tab: 4 cố định (bộ lọc chọn sẵn) + tab tự tạo — tab tự tạo tự lưu bộ lọc đang xem (tab-ticket.tsx).
  const hangTab = useTabTicket({
    tabRieng,
    quyenTabChung,
    dieuKien: [
      ...(sp.get('q') ? [{ nhan: 'Tìm', giaTri: sp.get('q')! }] : []),
      ...dk.map((d) => {
        const x = truongLoc.find((y) => y.id === d.truong)!
        const n = nhanChip(d, x.ten, (g) => x.tuyChon?.find((o) => o.giaTri === g)?.nhan ?? g)
        return { nhan: n.truoc.replace(/:$/, ''), giaTri: n.giaTri }
      }),
    ],
  })

  /** Đổi máy ở ô: lạc quan Máy + Bảo hành (+ lỗi dòng đầu nếu không hợp máy mới); xong mà lỗi về Chưa phân loại → mở pop
   *  Loại lỗi của hàng để chọn tiếp (CEO 26/11 "mã máy thay đổi thì loại lỗi của cột lỗi trong hàng cũng thay đổi"). */
  const doiMay = async (t: Ticket, serial: string) => {
    const m = t.customer_id ? mayKhach[t.customer_id]?.find((x) => x.serial === serial) : undefined
    const ma = t.ticket_code
    if (m) {
      const d = dongDau(t)
      const veCpl = !!d && !d.chuaPhanLoai && !loiHopVoiMay(dsLoi.find((x) => x.code === d.loi_code) ?? { code: d.loi_code }, m.internal_code)
      const homNay = new Date(Date.now() + 7 * 3_600_000).toISOString().slice(0, 10)
      setSua((s) => ({
        ...s,
        [ma]: {
          serial,
          source_serial: serial,
          product_name: m.product_name,
          internal_code: m.internal_code,
          warranty_activated: m.warranty_activated,
          warranty_full_end: m.warranty_full_end,
          con_han_may: m.warranty_full_end ? m.warranty_full_end >= homNay : null,
          ...(d && {
            dong_may: [
              { ...d, serial, internal_code: m.internal_code, ...(veCpl && { loi_code: CHUA_PHAN_LOAI, loi_ten: 'Chưa phân loại', chuaPhanLoai: true }) },
              ...t.dong_may!.slice(1),
            ],
          }),
        },
      }))
    }
    // Ticket demo: chỉ đổi trên màn (giữ bản lạc quan), không gọi action — xem thử chọn máy khi DB local chưa có khách+máy.
    if (laDemo(ma)) return
    try {
      if (await luuMay(ma, serial))
        // Dữ liệu mới về rồi mới mở pop Loại lỗi của hàng (ô tìm tự focus).
        setTimeout(() => document.querySelector<HTMLElement>(`[aria-label="Sửa loại lỗi ${CSS.escape(ma)}"]`)?.click(), 300)
    } finally {
      setSua((s) => {
        const n = { ...s }
        delete n[ma]
        return n
      })
    }
  }
  // Ô sửa được (CEO 26/11 "Mở chọn giá trị" — học hành vi Twenty): Trạng thái, Phụ trách, Loại, Loại lỗi. Máy và Tỉnh/TP
  // chỉ đọc (Tỉnh/TP đọc từ KHÁCH; đổi máy cần đọc máy của khách + DB local chưa có ticket_may — báo phiên chính).
  const ng: NgCanhO = {
    mo: bam,
    kieuNgay: c.kieuNgay,
    sua: quyenSua
      ? { nhanVien, loai: (tuyChonLoc.loai ?? []).map((g) => ({ gt: g, nhan: g })), dsLoi, mayKhach, doiMay }
      : null,
  }
  const duongDan = (ma: string) => `/ticket/${encodeURIComponent(ma)}`
  const menuDong = (d: Dong) => (
    <>
      {!laDemo(d.ticket_code) && (
        <ContextMenuItem onSelect={() => router.push(duongDan(d.ticket_code))}>
          <ArrowSquareOut aria-hidden="true" />
          Mở chi tiết
        </ContextMenuItem>
      )}
      <ContextMenuItem onSelect={() => mo(d.ticket_code)}>
        <SidebarSimple aria-hidden="true" />
        Xem nhanh
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onSelect={() => void navigator.clipboard?.writeText(d.ticket_code)}>
        <Copy aria-hidden="true" />
        Sao chép mã ticket
      </ContextMenuItem>
      <ContextMenuItem onSelect={() => void navigator.clipboard?.writeText(location.origin + duongDan(d.ticket_code))}>
        <LinkSimple aria-hidden="true" />
        Sao chép đường dẫn
      </ContextMenuItem>
      {quyenSua && (
        <>
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={() => setGanViec([d])}>
            <UserPlus aria-hidden="true" />
            Giao việc…
          </ContextMenuItem>
        </>
      )}
    </>
  )
  const tongRong = RONG_O_CHON + c.tongRong + RONG_THEM_COT
  const [khungRef, rongKhung] = useRongKhung()
  const bang = (
    // `?bang=luoi`: bản thử bảng có viền cột, bo 24 (CEO 27/11) — mặc định giữ bảng dạng dòng.
    <TableWrap luoi={sp.get('bang') === 'luoi'}>
      <KeoCot cot={c.hien} doiCho={c.doiCho}>
        <Table ref={refBang} layout="fixed" style={{ minWidth: tongRong }}>
          {/* Cột cuối (dưới ô "+") ăn phần dư của khung. */}
          <ColCotBang hien={c.hien} doRong={c.doRong} choDo={c.choDo} />
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
                  ngay={c.ngayCot(x.id)}
                  sap={
                    x.kieu === 'sap'
                      ? {
                          chieu: sap?.cot === x.id ? (sap.tang ? 'tang' : 'giam') : null,
                          onDoi: (ch) => datSap(ch ? { cot: x.id, tang: ch === 'tang' } : null),
                        }
                      : undefined
                  }
                  moLoc={moLocCot(x.id, dk, truongLoc, moLocTruong)}
                />
              ))}
              <ThemCot cot={COT} an={c.an} onHien={c.themCot} onTuyChinh={() => caiDat.current?.mo('cot')} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {dong.map((d) => (
              <DongBang key={d.ticket_code} t={d} hien={c.hien} ng={ng} menu={menuDong(d)} />
            ))}
          </TableBody>
        </Table>
      </KeoCot>
    </TableWrap>
  )
  const ds = (
    <ListView
      aria-label="Ticket CSKH"
      cot={COT_DS}
      dong={dong}
      khoa={(d) => d.ticket_code}
      onMo={(d) => bam(d.ticket_code)}
      dangMo={xem}
      moKhi="ten"
      menuDong={menuDong}
    />
  )

  return (
    <XemNhanh
      coDinh
      the={
        t &&
        theXemNhanhF({
          t,
          rows,
          nhanVien,
          luu: quyenSua ? (patch) => luuTicket(t.ticket_code, patch) : null,
          lanViec,
          moGanViec: () => setGanViec([t]),
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
        {dau}
        <CauHinhBangDs giaoDien={{ ...O_TIM_PILL, ...CHON_BANG_GHIM, ...(sp.get('bang') === 'luoi' ? { phanTrang_khung: phanTrangLuoi } : {}) }} thanhHangLoat="surface" tenCot={TEN_COT} nghiaSapXep={NGHIA}>
          <DataViewToolbar
            tieuDe="Ticket CSKH"
            timKiem={
              <Suspense>
                <OTimKiem placeholder="Mã ticket, serial, khách, SĐT…" aria-label="Tìm ticket" />
              </Suspense>
            }
            nutChinh={<NutTaoTicket />}
            tabs={dangXem === 'kanban' ? undefined : hangTab.tabs}
            loc={
              // "Xoá bộ lọc" xoá mọi điều kiện lọc trường (giữ tìm, sắp, cột).
              <NutLoc
                ref={refNutLoc}
                truong={truongLoc}
                dieuKien={dk}
                onDoi={datLoc}
                onXoaHet={() => dat(Object.fromEntries(thamSoLoc.map((k) => [k, null])))}
                coCot={(id) =>
                  dangXem !== 'kanban' && dong.length > 0 &&
                  (rongKhung === null || rongKhung >= RONG_BANG_TOI_THIEU) &&
                  c.hien.some((x) => x.id === id)
                }
              />
            }
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
                  onDoi: (v) => datNgay({ nhom: v === 'tt' ? null : v, nhom_an: null }),
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
                  ten: `${d.ticket_code} · ${tenKhach(d)}`,
                  noiDung: (
                    <NoiDungTheTruong
                      dau={
                        // Mã rồi tên khách (CEO 26/11 "đổi lại ticket ở đầu"); khẩn → MÃ đỏ như ô bảng.
                        <>
                          <span className={cn('shrink-0', laKhan(d) && CHU_DO)}>
                            {laKhan(d) && <SrKhan />}
                            {d.ticket_code}
                          </span>
                          <span title={tenKhach(d)} className="min-w-0 truncate font-normal text-muted-foreground">
                            {tenKhach(d)}
                          </span>
                        </>
                      }
                      truong={truongThe(d)}
                    />
                  ),
                }))}
                onChuyen={chuyenThe}
                onMo={(ma) => bam(ma)}
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
              {quyenSua && <NutGanViecHangLoat rows={dong} onMo={setGanViec} />}
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
            <PhanTrang trang={trang} soTrang={soTrang} tong={tong} nhan="ticket" luonHien />
          </Suspense>
        </CauHinhBangDs>
      </TrangDuLieu>
      {ganViec && (
        <HopGanViec
          key={ganViec.map((x) => x.ticket_code).join()}
          ds={ganViec}
          nhanVien={nhanVien}
          open
          onOpenChange={(o) => !o && setGanViec(null)}
          onXong={() => setLanViec((n) => n + 1)}
        />
      )}
    </XemNhanh>
  )
}
