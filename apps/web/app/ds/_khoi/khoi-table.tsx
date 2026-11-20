'use client'

import { Suspense, useMemo, useState, type ReactNode } from 'react'
import { KhungChon, OChonDong, OChonTatCa, ThanhDaChon, useDaChon } from '@/bang'
import { Avatar, AvatarFallback, chuCaiDau } from '@/components/ui/avatar'
import { Badge, BadgeDot } from '@/components/ui/badge'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  BangTrangThai,
  KeoCtx,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrap,
} from '@/components/ui/table'
import { CHON_BANG, cotDem, ma as lopMa } from '@/components/ui/table-styles'
import { KeoCot, TieuDeCot, type MucLoc } from '@/components/ui/tieu-de-cot'
import { useCotBang, type CotBang } from '@/components/ui/use-cot-bang'
import { BienThe, KhoiHang } from '../_khung/tam'
import { Nhan } from './khoi-filter-bar'

/* Dữ liệu demo (không PII): 30 ticket giả, "hôm nay" cố định 20/11/2026 để HTML máy chủ = máy khách. */

type MauTag = MucLoc['color']
const tag = (giaTri: string, nhan: string, color?: MauTag): MucLoc => ({ giaTri, nhan, color })
const LOAI = [tag('ro-ri', 'Rò rỉ nước', 'info'), tag('main', 'Main', 'discovery'), tag('nuoc', 'Chất lượng nước', 'success'), tag('app', 'App', 'warning'), tag('', 'Chưa phân loại')]
const TT = [tag('moi', 'Mới', 'discovery'), tag('xu-ly', 'Đang xử lý', 'info'), tag('cho', 'Chờ', 'warning'), tag('dong', 'Đóng', 'success')]
const NGUON = [tag('zalo', 'Zalo'), tag('goi', 'Gọi điện'), tag('web', 'Web')]
const KHACH = ['Công ty Demo An Phát', 'Khách sạn Demo Sen', 'Nhà hàng Demo Biển', 'Trường Demo Hoa Mai', 'Khách lẻ demo 01', 'Khách lẻ demo 02']
const NV = ['NV Demo An', 'NV Demo Bình', 'NV Demo Chi', 'NV Demo Giang']
const VIEC = ['Gọi khách xác nhận lỗi', 'Cử KT kiểm tra rò nước đáy máy', 'Hẹn lấy mẫu nước', 'Hướng dẫn kết nối app', 'Chờ duyệt thay bơm']
const MAU_UU = { 1: { nhan: 'P1', variant: 'solid', color: 'danger' }, 2: { nhan: 'P2', variant: 'soft', color: 'warning' }, 3: { nhan: 'P3', variant: 'soft', color: 'secondary' } } as const

type Ve = { ma: string; uu: 1 | 2 | 3; loai: string; khach: string; tt: string; viec: string; han: string; chu: string; may: string; lam: string; mo: number; nguon: string }
const VE: Ve[] = Array.from({ length: 30 }, (_, i) => ({
  ma: `TK-D${String(101 + i)}`,
  uu: (((i * 7) % 3) + 1) as 1 | 2 | 3,
  loai: LOAI[(i * 3) % LOAI.length].giaTri,
  khach: KHACH[(i + Math.floor(i / 3)) % KHACH.length],
  tt: TT[(i + Math.floor(i / 4)) % TT.length].giaTri,
  viec: VIEC[i % VIEC.length],
  han: `2026-11-${String(17 + ((i * 3) % 7)).padStart(2, '0')}T${String(8 + (i % 9)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`,
  chu: NV[i % NV.length],
  may: `Máy lọc demo ${['A1', 'B2', 'C3'][i % 3]} · SN-D${String(4000 + i * 13)}`,
  lam: NV[(i + 1) % NV.length],
  mo: (i * 11) % 23,
  nguon: NGUON[i % NGUON.length].giaTri,
}))
const HOM_NAY = '2026-11-20'

const COT: CotBang[] = [
  { id: 'uu', ten: 'Ưu tiên', rong: 76, kieu: 'sap', nghia: { tang: 'Gấp trước', giam: 'Ít gấp trước' } },
  { id: 'loai', ten: 'Loại lỗi', rong: 148, kieu: 'loc' },
  { id: 'ma', ten: 'Mã', rong: 104, kieu: 'sap', nghia: { tang: 'Cũ nhất trước', giam: 'Mới tạo trước' } },
  { id: 'khach', ten: 'Khách', rong: 128, kieu: 'loc' },
  { id: 'tt', ten: 'Trạng thái', rong: 124, kieu: 'loc' },
  { id: 'viec', ten: 'Việc tiếp theo', rong: 124, kieu: 'thuong' },
  { id: 'han', ten: 'Hạn', rong: 100, kieu: 'sap', nghia: { tang: 'Gần hạn nhất trước', giam: 'Xa hạn nhất trước' }, phai: true },
  { id: 'chu', ten: 'Chủ', rong: 60, kieu: 'loc' },
  { id: 'may', ten: 'Máy · serial', rong: 200, kieu: 'thuong', anMacDinh: true },
  { id: 'lam', ten: 'Người làm', rong: 132, kieu: 'loc', anMacDinh: true },
  { id: 'mo', ten: 'Số ngày mở', rong: 80, kieu: 'sap', nghia: { tang: 'Mới mở nhất trước', giam: 'Mở lâu nhất trước' }, phai: true, anMacDinh: true },
  { id: 'nguon', ten: 'Nguồn', rong: 100, kieu: 'loc', anMacDinh: true },
]
const TAG: Record<string, MucLoc[]> = {
  loai: LOAI,
  tt: TT,
  nguon: NGUON,
  khach: KHACH.map((k) => tag(k, k)),
  chu: NV.map((n) => tag(n, n)),
  lam: NV.map((n) => tag(n, n)),
}
/** Menu lọc liệt kê ĐÚNG giá trị đang có trong dữ liệu (README) — kể cả "Chưa phân loại" khi có dòng trống. */
const tuyChon = (id: string) => TAG[id].filter((t) => VE.some((v) => v[id as keyof Ve] === t.giaTri))

type Sap = { cot: string; chieu: 'tang' | 'giam' } | null
type Loc = Record<string, string[]>

function chon(ve: Ve[], sap: Sap, loc: Loc) {
  const ra = ve.filter((v) => Object.entries(loc).every(([id, ds]) => !ds.length || ds.includes(String(v[id as keyof Ve]))))
  if (sap) {
    const k = sap.cot as keyof Ve
    ra.sort((a, b) => (a[k] === b[k] ? (a.ma < b.ma ? -1 : 1) : (a[k] < b[k] ? -1 : 1) * (sap.chieu === 'tang' ? 1 : -1)))
  }
  return ra
}

function Han({ han }: { han: string }) {
  const ngay = han.slice(0, 10)
  if (ngay === HOM_NAY) return <span className="tabular-nums">{han.slice(11)}</span>
  if (ngay < HOM_NAY) {
    const tre = Math.round((Date.parse(HOM_NAY) - Date.parse(ngay)) / 864e5)
    return <span className="text-(--color-text-danger)">Quá {tre} ngày</span>
  }
  return <span className="tabular-nums">{`${ngay.slice(8)}/${ngay.slice(5, 7)}`}</span>
}

/** Cột người hẹp < 112px chỉ hiện avatar (README). */
function Nguoi({ ten, rong }: { ten: string; rong: number }) {
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 align-middle" title={rong < 112 ? ten : undefined}>
      <Avatar aria-hidden="true">
        <AvatarFallback>{chuCaiDau(ten)}</AvatarFallback>
      </Avatar>
      {rong < 112 ? <span className="sr-only">{ten}</span> : <span className="truncate">{ten}</span>}
    </span>
  )
}

const nhanTag = (ds: MucLoc[], gt: string) => ds.find((t) => t.giaTri === gt)!

function O({ v, id, rong }: { v: Ve; id: string; rong: number }): ReactNode {
  switch (id) {
    case 'uu': {
      const m = MAU_UU[v.uu]
      return <Badge variant={m.variant} color={m.color}>{m.nhan}</Badge>
    }
    case 'loai':
    case 'nguon': {
      const t = nhanTag(id === 'loai' ? LOAI : NGUON, v[id])
      return (
        <Badge variant="outline">
          {t.color && <BadgeDot color={t.color} />}
          {t.nhan}
        </Badge>
      )
    }
    case 'tt': {
      const t = nhanTag(TT, v.tt)
      return <Badge color={t.color}>{t.nhan}</Badge>
    }
    case 'ma':
      return <span className={lopMa}>{v.ma}</span>
    case 'han':
      return <Han han={v.han} />
    case 'mo':
      return <span className="tabular-nums">{v.mo.toLocaleString('vi-VN')} ngày</span>
    case 'chu':
    case 'lam':
      return <Nguoi ten={v[id]} rong={rong} />
    default:
      return <span className="block truncate">{v[id as keyof Ve]}</span>
  }
}

const KHONG_KEO = { current: 0 }

/**
 * Bảng ticket demo dùng chung khối trần (/ds/tron, so khớp) và bản hàng (/ds). `tinh` = khối trần: không URL, không
 * kéo thật — `keoTinh` vẽ trạng thái "đang kéo" cố định (cột nguồn mờ + vạch thả) như preview.
 */
function BangTicket({
  url = false,
  sapDau = null,
  soDong,
  keoTinh,
  className,
  cotHien,
}: {
  url?: boolean
  sapDau?: Sap
  soDong?: number
  keoTinh?: { keo: string; tren: { id: string; ben: 'trai' | 'phai' } }
  className?: string
  cotHien?: (c: ReturnType<typeof useCotBang>) => ReactNode
}) {
  const c = useCotBang(COT, { url })
  const [sap, setSap] = useState<Sap>(sapDau)
  const [loc, setLoc] = useState<Loc>({})
  const dong = useMemo(() => chon(VE, sap, loc).slice(0, soDong), [sap, loc, soDong])
  const tong = 36 + c.hien.reduce((t, x) => t + c.doRong[x.id], 0)
  const thamSo = { sap: sap ? `${sap.cot}.${sap.chieu}` : undefined, loc: JSON.stringify(loc) }

  const bang = (
    <Table layout="fixed" style={{ minWidth: tong }}>
      <colgroup>
        <col style={{ width: 36 }} />
        {c.hien.map((x) => (
          <col key={x.id} style={{ width: c.doRong[x.id] }} />
        ))}
        <col />
      </colgroup>
      <TableHeader>
        <TableRow>
          <OChonTatCa nhan="ticket" />
          {c.hien.map((x, i) => (
            <TieuDeCot
              key={x.id}
              cot={x}
              viTri={i}
              menuPhai={i === c.hien.length - 1}
              coDan={{ rong: c.doRong[x.id], onDoi: (px) => c.coDan(x.id, px) }}
              sap={x.kieu === 'sap' ? { chieu: sap?.cot === x.id ? sap.chieu : null, onDoi: (ch) => setSap(ch ? { cot: x.id, chieu: ch } : null) } : undefined}
              loc={x.kieu === 'loc' ? { tuyChon: tuyChon(x.id), daChon: loc[x.id] ?? [], onDoi: (gt) => setLoc((l) => ({ ...l, [x.id]: gt })) } : undefined}
            />
          ))}
          <TableHead aria-hidden="true" className={cotDem} />
        </TableRow>
      </TableHeader>
      <TableBody>
        {dong.map((v) => (
          <Dong key={v.ma} v={v}>
            {c.hien.map((x) => (
              <TableCell key={x.id} cot={x.id} phai={x.phai}>
                <O v={v} id={x.id} rong={c.doRong[x.id]} />
              </TableCell>
            ))}
            <TableCell aria-hidden="true" className={cotDem} />
          </Dong>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <KhungChon khoaTrang={dong.map((v) => v.ma)} tong={dong.length} bat thamSo={thamSo}>
      {cotHien?.(c)}
      {dong.length === 0 ? (
        <BangTrangThai
          trangThai="rongLoc"
          tieuDe="Không có ticket nào khớp bộ lọc"
          moTa="Thử bỏ bớt điều kiện lọc ở tiêu đề cột."
          onXoaLoc={() => setLoc({})}
        />
      ) : (
        <TableWrap className={className}>
          {keoTinh ? (
            <KeoCtx.Provider value={{ ...keoTinh, ketThuc: KHONG_KEO }}>{bang}</KeoCtx.Provider>
          ) : (
            <KeoCot cot={c.hien} doiCho={c.doiCho}>
              {bang}
            </KeoCot>
          )}
        </TableWrap>
      )}
      <ThanhDaChon nhan="ticket" />
    </KhungChon>
  )
}

/** Dòng: ô chọn của bang/ + nền info-soft khi đã chọn. */
function Dong({ v, children }: { v: Ve; children: ReactNode }) {
  const { daChon } = useDaChon()
  return (
    <TableRow chon={daChon.includes(v.ma)}>
      <OChonDong khoa={v.ma} moTa={`ticket ${v.ma}`} />
      {children}
    </TableRow>
  )
}

/** ⚙ → Cột hiển thị (bản rút gọn — DataViewToolbar dựng đủ): bật/tắt cột, menu giữ mở; đặt lại thứ tự/độ rộng/ẩn hiện. */
function CotHien({ c }: { c: ReturnType<typeof useCotBang> }) {
  return (
    <div className="flex items-center gap-2 border-none border-current">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Cột hiển thị
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Cột hiển thị</DropdownMenuLabel>
          {COT.map((x) => (
            <DropdownMenuCheckboxItem
              key={x.id}
              checked={!c.an.includes(x.id)}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={(b) => c.anHien(x.id, b)}
            >
              {x.ten}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={c.datLai}>Đặt lại cột</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

const COT_TAI = [{ ten: 'Đang tải' }, { ten: 'Thành tiền', so: true }]
const CU = (
  <TableWrap vien>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mã</TableHead>
          <TableHead>Khách</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {VE.slice(0, 3).map((v) => (
          <TableRow key={v.ma}>
            <TableCell>
              <span className={lopMa}>{v.ma}</span>
            </TableCell>
            <TableCell>{v.khach}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableWrap>
)

/**
 * #table — khối trần (/ds/tron, cổng so khớp): tái tạo ds/nguon/components/Table/preview.html — bảng cỡ thật (sắp theo
 * Ưu tiên), menu tiêu đề cột (mở bằng bấm thật trong cổng), trạng thái đang kéo (vẽ tĩnh), ba trạng thái tải/rỗng lọc/lỗi.
 */
export function KhoiTable() {
  return (
    <section id="table" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#table">Table</a>
      </h2>
      <div className="flex flex-col gap-6 border-none border-current">
        <CauHinhBangDs giaoDien={CHON_BANG}>
          <div data-so="bang" className="min-w-0 border-none border-current">
            <Nhan>Bảng — cỡ thật (sắp theo Ưu tiên; bảng tự cuộn ngang trong khung)</Nhan>
            <BangTicket sapDau={{ cot: 'uu', chieu: 'tang' }} soDong={6} />
          </div>
          <div data-so="keo" className="min-w-0 border-none border-current">
            <Nhan>Đang kéo cột “Loại lỗi” sang phải “Trạng thái”: cột nguồn mờ, vạch thả xanh suốt chiều cao</Nhan>
            <BangTicket sapDau={{ cot: 'uu', chieu: 'tang' }} soDong={6} keoTinh={{ keo: 'loai', tren: { id: 'tt', ben: 'phai' } }} />
          </div>
        </CauHinhBangDs>
        <div data-so="trang-thai" className="border-none border-current">
          <Nhan>Trạng thái: đang tải · rỗng do lọc · lỗi</Nhan>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3 border-none border-current">
            <BangTrangThai trangThai="tai" cot={COT_TAI} />
            <BangTrangThai trangThai="rongLoc" tieuDe="Không có đơn nào khớp bộ lọc" moTa='Thử bỏ bớt điều kiện "Kênh: Đại lý".' onXoaLoc={() => {}} />
            <BangTrangThai
              trangThai="loi"
              className="self-start"
              moTa="Mất kết nối máy chủ. Dữ liệu đang hiển thị có thể đã cũ."
              onThuLai={() => {}}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

/** #table dạng hàng (/ds). */
export function KhoiTableHang() {
  const [tai, setTai] = useState(false)
  // Demo: "Thử lại" → đang tải 1,2 giây → lại lỗi (máy chủ giả vẫn hỏng).
  const thuLai = () => {
    setTai(true)
    setTimeout(() => setTai(false), 1200)
  }
  return (
    <KhoiHang neo="table">
      <CauHinhBangDs giaoDien={CHON_BANG}>
        <BienThe
          ten="Bấm thử"
          moTa="30 ticket demo. Bấm tiêu đề cột: cột nhãn chỉ lọc theo tag, cột có thứ tự sắp theo nghĩa. Kéo tiêu đề để đổi chỗ (bàn phím: Space nhấc, ← →, Space thả), kéo mép phải để co dãn. Thứ tự, độ rộng, cột ẩn ghi lên đường dẫn."
        >
          <Suspense>
            <BangTicket url className="max-h-120" cotHien={(c) => <CotHien c={c} />} />
          </Suspense>
        </BienThe>
      </CauHinhBangDs>
      <BienThe ten="Đang tải" moTa="Khung + tiêu đề cột + vài dòng chờ; trình đọc màn hình nghe “Đang tải danh sách”.">
        <BangTrangThai trangThai="tai" cot={COT_TAI} soDong={4} />
      </BienThe>
      <BienThe ten="Rỗng do lọc" moTa="Nói điều kiện đang lọc và cho xoá bộ lọc ngay.">
        <BangTrangThai trangThai="rongLoc" moTa="Thử bỏ bớt điều kiện “Loại lỗi: Main”." onXoaLoc={() => {}} />
      </BienThe>
      <BienThe ten="Rỗng thật" moTa="Chưa có dữ liệu nào: nói thứ gì sẽ hiện ở đây và cách tạo cái đầu tiên.">
        <BangTrangThai
          trangThai="rongThat"
          tieuDe="Chưa có ticket nào"
          moTa="Ticket khách báo qua Zalo, điện thoại hoặc web sẽ hiện ở đây."
          hanhDong={<Button size="sm">Tạo ticket</Button>}
        />
      </BienThe>
      <BienThe ten="Lỗi" moTa="Báo lỗi + Thử lại, vẫn giữ dữ liệu cũ bên dưới và nói rõ có thể đã cũ.">
        <BangTrangThai trangThai={tai ? 'tai' : 'loi'} cot={[{ ten: 'Mã' }, { ten: 'Khách' }]} onThuLai={thuLai}>
          {CU}
        </BangTrangThai>
      </BienThe>
    </KhoiHang>
  )
}
