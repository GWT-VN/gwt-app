'use client'

import { Fragment, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, SlidersHorizontal } from '@phosphor-icons/react/ssr'
import { cn } from '@/lib/utils'
import { Badge, BadgeDot } from './badge'
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from './context-menu'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'
import * as l from './list-view-styles'
import * as s from './table-styles'
import { TieuDeCot, type MucLoc, type PropsTieuDeCot } from './tieu-de-cot'
import type { NghiaSap } from './use-cot-bang'

/**
 * ListView — dạng xem Danh sách (README ListView, chốt 18/11): mỗi bản ghi MỘT dòng trên lưới CSS (`role="table"` /
 * `row` / `columnheader` / `cell`, không `<table>`), sửa ngay tại ô (InlineEdit — ô tự chặn nổi bọt), hiện hết danh sách
 * đang lọc (không phân trang; sắp/lọc do bên gọi — bang/ — làm).
 * - Bấm chỗ trống của dòng hoặc mã (`NutMoMa`) → `onMo`; dòng `tabIndex=0`, Enter mở; phím Menu / Shift+F10 / chuột phải
 *   → `menuDong` (ContextMenu DS — không nút ⋯ cuối dòng).
 * - Container query trên vùng đặt danh sách: ≤ 860 ẩn cột `anKhiHep` (+ mã, nhãn sau của `NhanDau`), vẫn 1 dòng;
 *   ≤ 480 hai dòng theo `dienThoai` (cột không khai vị trí thì ẩn), ẩn đầu cột.
 * - `nhom` → mỗi nhóm một `rowgroup`, tiêu đề = nhãn + số lượng, nhóm rỗng không hiện.
 * ponytail: chưa ảo hoá dòng (README: khi > ~200 dòng) — thêm `@tanstack/react-virtual` khi màn thật vượt mức đó.
 */

export type VungDienThoai = keyof typeof l.VUNG_DIEN_THOAI

export type CotDanhSach<T> = {
  id: string
  /** Nhãn đầu cột (chữ trần khi không có `tieuDe`). */
  ten: string
  /** Rãnh lưới của cột, vd `minmax(0,2.4fr)` · `140px` (README: `minmax(0,2.4fr) minmax(0,1fr) 140px 88px 40px`). */
  rong: string
  /** Căn phải (hạn, số). */
  phai?: boolean
  /** Ô đầu cột có menu thay chữ trần: `TieuDeDs` (một cột sắp/lọc) hoặc `TieuDeGop` (cột gộp). Tự mang `columnheader`. */
  tieuDe?: ReactNode
  /** ≤ 860 ẩn cột (Việc tiếp theo, Chủ — xem trong thẻ). */
  anKhiHep?: boolean
  /** ≤ 480 (2 dòng): chỗ của ô — trên / trên phải / dưới (chữ nhỏ muted) / dưới phải. Bỏ trống = ẩn trên điện thoại. */
  dienThoai?: VungDienThoai
  o: (d: T) => ReactNode
}

export type NhomDanhSach<T> = {
  theo: (d: T) => string
  /** Thứ tự nhóm + nhãn tiêu đề nhóm (thường là Badge như trong ô). */
  muc: { gt: string; nhan: ReactNode }[]
}

export type PropsListView<T> = {
  'aria-label': string
  cot: CotDanhSach<T>[]
  dong: T[]
  khoa: (d: T) => string
  onMo: (d: T) => void
  nhom?: NhomDanhSach<T>
  /** Mục ContextMenu của dòng (ContextMenuLabel / Item / Separator). */
  menuDong?: (d: T) => ReactNode
  /** Khoá bản ghi đang mở ở thẻ xem nhanh → dòng nền alpha-06. */
  dangMo?: string | null
  /**
   * Cái gì mở bản ghi: `dong` (mặc định) = bấm chỗ trống của dòng / mã · `ten` = CHỈ bấm tên (`NutMoTen`) hoặc mã
   * (`NutMoMa`) — chỗ trống không làm gì, dòng không con trỏ tay (CEO 25/11, màn Việc). Enter trên dòng vẫn mở.
   */
  moKhi?: 'dong' | 'ten'
  /**
   * Hàng nháp "+ Mới" (`useDongMoi`, CEO 25/11 "tạo ra một format mẫu y hệt rồi chọn từng mục"): một hàng cùng lưới cột,
   * nội dung từng ô do bên gọi vẽ (`o(cotId)`) — thường là ô sửa tại chỗ bọc `OSuaNhap` + ô gõ tên.
   */
  dongNhap?: (cotId: string) => ReactNode
  className?: string
}

export function ListView<T>({
  'aria-label': nhan,
  cot,
  dong,
  khoa,
  onMo,
  nhom,
  menuDong,
  dangMo,
  moKhi = 'dong',
  dongNhap,
  className,
}: PropsListView<T>) {
  const luoi = {
    '--lv-cot': cot.map((c) => c.rong).join(' '),
    '--lv-cot-hep': cot.filter((c) => !c.anKhiHep).map((c) => c.rong).join(' '),
  } as CSSProperties
  const nhomRa = nhom
    ? nhom.muc.map((m) => ({ ...m, dong: dong.filter((d) => nhom.theo(d) === m.gt) })).filter((g) => g.dong.length)
    : [{ gt: '', nhan: null, dong }]

  const veDong = (d: T) => {
    const k = khoa(d)
    const hang = (
      <div
        role="row"
        tabIndex={0}
        data-slot="list-view-row"
        data-khoa={k}
        data-xem={dangMo === k ? '' : undefined}
        aria-keyshortcuts={menuDong ? 'Shift+F10' : undefined}
        className={cn(l.hangDong, moKhi === 'ten' && l.hangChiMoTen)}
        onClick={(e) => {
          if (moKhi === 'ten' && !(e.target as Element).closest('[data-slot=list-view-ma],[data-slot=list-view-ten]')) return
          onMo(d)
        }}
        onKeyDown={(e: KeyboardEvent) => {
          if (e.key === 'Enter' && e.target === e.currentTarget) {
            e.preventDefault()
            onMo(d)
          }
        }}
      >
        {cot.map((c) => (
          <div key={c.id} role="cell" data-cot={c.id} className={cn(l.o, ...lopO(c))}>
            {c.o(d)}
          </div>
        ))}
      </div>
    )
    if (!menuDong) return <Fragment key={k}>{hang}</Fragment>
    return (
      <ContextMenu key={k}>
        <ContextMenuTrigger asChild>{hang}</ContextMenuTrigger>
        <ContextMenuContent aria-label={`Thao tác ${k}`}>{menuDong(d)}</ContextMenuContent>
      </ContextMenu>
    )
  }

  return (
    <div data-slot="list-view" className={cn(l.vo, className)}>
      <div role="table" aria-label={nhan} className={l.bang} style={luoi}>
        <div role="rowgroup">
          <div role="row" data-slot="list-view-header" className={l.hangDau}>
            {cot.map((c) =>
              c.tieuDe ? (
                // `contents`: ô đầu cột của bên gọi là con lưới trực tiếp; vỏ chỉ mang lớp ẩn theo khổ.
                <div key={c.id} className={cn('contents', c.anKhiHep && l.anHep)}>
                  {c.tieuDe}
                </div>
              ) : (
                <div key={c.id} role="columnheader" data-cot={c.id} className={cn(l.dau, c.phai && l.oPhai, c.anKhiHep && l.anHep)}>
                  {c.ten}
                </div>
              ),
            )}
          </div>
        </div>
        {nhomRa.map((g) => (
          <div key={g.gt} role="rowgroup" data-nhom={nhom ? g.gt : undefined}>
            {nhom && (
              <div role="row" className={l.nhomDau}>
                <div role="cell" aria-colspan={cot.length} className={l.nhomO}>
                  {g.nhan}
                  <span className={l.nhomSo}>{g.dong.length}</span>
                </div>
              </div>
            )}
            {g.dong.map(veDong)}
          </div>
        ))}
        {dongNhap && (
          <div role="rowgroup">
            <div role="row" data-slot="list-view-row" data-nhap="" className={l.hangNhap}>
              {cot.map((c) => (
                <div key={c.id} role="cell" data-cot={c.id} className={cn(l.o, ...lopO(c))}>
                  {dongNhap(c.id)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function lopO<T>(c: CotDanhSach<T>) {
  return [
    c.phai && l.oPhai,
    c.dienThoai ? l.VUNG_DIEN_THOAI[c.dienThoai] : l.anDienThoai,
    c.anKhiHep && (c.dienThoai ? l.anHepTruDienThoai : l.anHep),
  ]
}

/** Đầu cột một cột (sắp HOẶC lọc) trong lưới Danh sách — `TieuDeCot` của Table, kiểu nút `.ui-th-sort` của Danh sách. */
export function TieuDeDs({ className, ...p }: Omit<PropsTieuDeCot, 'la' | 'viTri' | 'coDan'>) {
  return <TieuDeCot {...p} la="div" className={cn(l.dauMenu, p.cot.phai && 'justify-self-end', className)} />
}

/** Khoá sắp của tiêu đề gộp — CHỈ cột có thứ tự (`kieu: 'sap'` + nghĩa bằng lời). Cột nhãn (loại lỗi…) không vào được. */
export type KhoaSap = { id: string; ten: string; kieu: 'sap'; nghia: NghiaSap }
type Chieu = 'tang' | 'giam'
type DangSap = { id: string; chieu: Chieu }

export type PropsTieuDeGop = {
  ten: string
  sap: { khoa: KhoaSap[]; dang: DangSap | null; onDoi: (v: DangSap | null) => void }
  /** Nhóm lọc theo tag (vd Ưu tiên, Loại lỗi) — tick nhiều, menu giữ mở. */
  loc?: { id: string; ten: string; tuyChon: MucLoc[]; daChon: string[]; onDoi: (gt: string[]) => void }[]
}

/**
 * TieuDeGop — đầu cột gộp của Danh sách (README: "Ticket · ưu tiên gấp trước"; spec §5.3): nhãn nói đang sắp theo gì;
 * menu Sắp xếp (khoá × chiều, nói nghĩa bằng lời) + Lọc theo từng nhóm tag. Loại lỗi KHÔNG BAO GIỜ là khoá sắp: khoá
 * phải `kieu: 'sap'` (lỗi kiểu) — lách kiểu thì ném lỗi lúc chạy như `TieuDeCot`.
 */
export function TieuDeGop({ ten, sap, loc = [] }: PropsTieuDeGop) {
  if (process.env.NODE_ENV !== 'production')
    for (const k of sap.khoa)
      if (k.kieu !== 'sap' || !k.nghia)
        throw new Error(
          `TieuDeGop: "${k.ten}" không sắp được — chỉ cột có thứ tự (kieu 'sap' + nghĩa) là khoá sắp; cột nhãn chỉ lọc theo tag (spec §5.3).`,
        )
  const dang = sap.dang && sap.khoa.find((k) => k.id === sap.dang!.id)
  const chieu = dang ? sap.dang!.chieu : null
  const soLoc = loc.reduce((n, g) => n + g.daChon.length, 0)
  const tenNho = ten.toLowerCase()
  return (
    <div
      role="columnheader"
      data-slot="table-head"
      aria-sort={chieu === 'tang' ? 'ascending' : chieu === 'giam' ? 'descending' : 'none'}
      className={cn(s.th, l.dauMenu)}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={s.thSort} data-on={dang || soLoc ? '' : undefined}>
            <span className="shrink-0">{ten}</span>
            {dang && chieu && (
              <>
                <span className="min-w-0 truncate">
                  · {dang.ten.toLowerCase()} {dang.nghia[chieu].toLowerCase()}
                </span>
                {chieu === 'tang' ? <ArrowUp aria-hidden="true" /> : <ArrowDown aria-hidden="true" />}
              </>
            )}
            {soLoc > 0 && (
              <span className={s.thLoc}>
                <SlidersHorizontal aria-hidden="true" />
                <span aria-hidden="true">{soLoc}</span>
                <span className="sr-only">, đang lọc {soLoc}</span>
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" aria-labelledby={undefined} aria-label={`Sắp xếp và lọc ${tenNho}`} className="w-[240px]">
          <DropdownMenuLabel>Sắp xếp</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={dang && chieu ? `${dang.id}:${chieu}` : ''}
            onValueChange={(v) => {
              const [id, ch] = v.split(':')
              sap.onDoi({ id, chieu: ch as Chieu })
            }}
          >
            {sap.khoa.flatMap((k) =>
              (['tang', 'giam'] as const).map((ch) => (
                <DropdownMenuRadioItem key={`${k.id}:${ch}`} value={`${k.id}:${ch}`}>
                  {k.ten} · {k.nghia[ch].toLowerCase()}
                </DropdownMenuRadioItem>
              )),
            )}
          </DropdownMenuRadioGroup>
          {dang && <DropdownMenuItem onSelect={() => sap.onDoi(null)}>Bỏ sắp xếp</DropdownMenuItem>}
          {loc.map((g) => (
            <Fragment key={g.id}>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Lọc · {g.ten.toLowerCase()}</DropdownMenuLabel>
              {g.tuyChon.map((m) => (
                <DropdownMenuCheckboxItem
                  key={m.giaTri}
                  checked={g.daChon.includes(m.giaTri)}
                  onSelect={(e) => e.preventDefault()}
                  onCheckedChange={(b) => g.onDoi(b ? [...g.daChon, m.giaTri] : g.daChon.filter((x) => x !== m.giaTri))}
                >
                  <Badge variant="outline">
                    {m.color && <BadgeDot color={m.color} />}
                    {m.nhan}
                  </Badge>
                </DropdownMenuCheckboxItem>
              ))}
            </Fragment>
          ))}
          {soLoc > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => loc.forEach((g) => g.daChon.length && g.onDoi([]))}>Bỏ lọc cột này</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

/**
 * `.b-nhan-dau`: khung nhãn đầu dòng (ưu tiên → loại lỗi) rộng cố định → tên khách thẳng cột. `gon`
 * (`.b-nhan-dau[data-gon]`, CEO chốt 23/11): danh sách chỉ MỘT nhãn đầu (vd ưu tiên của Việc) → khung ôm chữ.
 */
export function NhanDau({ children, gon }: { children: ReactNode; gon?: boolean }) {
  return (
    <span data-slot="list-view-nhan" data-gon={gon || undefined} className={cn(l.nhanDau, gon && l.nhanDauGon)}>
      {children}
    </span>
  )
}

/**
 * `.b-mo-ticket`: nút mã mở bản ghi — bấm nổi lên dòng (`onMo` của ListView), không tự xử lý. ListView ẩn mã khi khung
 * ≤ 860 (bấm dòng vẫn mở); `luonHien` = cột Mã của Bảng (luôn hiện, bên gọi bắt cú bấm).
 */
/** Tên mở bản ghi (`moKhi="ten"`) — bấm nổi lên dòng như `NutMoMa`; ở Table bên gọi bắt cú bấm. */
export function NutMoTen({ ten }: { ten: string }) {
  return (
    <button type="button" data-slot="list-view-ten" className={l.nutMoTen}>
      {ten}
    </button>
  )
}

/** Chỗ mã của hàng nháp (bản ghi chưa có mã): cùng khung + chữ mã như `NutMoMa`, không bấm được. Mặc định "Mới". */
export function MaCho({ chu = 'Mới' }: { chu?: string }) {
  return (
    <span data-slot="list-view-ma-cho" className={cn(l.nutMoMa, l.maCho)}>
      <span className={s.ma}>{chu}</span>
    </span>
  )
}

export function NutMoMa({ ma, luonHien }: { ma: string; luonHien?: boolean }) {
  return (
    <button
      type="button"
      data-slot="list-view-ma"
      aria-label={`Mở ${ma}`}
      className={cn(l.nutMoMa, luonHien && '@max-[860px]:inline-flex')}
    >
      <span className={s.ma}>{ma}</span>
    </button>
  )
}
