'use client'

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import {
  ArrowLeft,
  CaretRight,
  Check,
  Export,
  Eye,
  FloppyDisk,
  Funnel,
  GearSix,
  Kanban,
  LinkSimple,
  ListBullets,
  MagnifyingGlass,
  Rows,
  SidebarSimple,
  SortAscending,
  Table,
  X,
} from '@phosphor-icons/react/ssr'
import type { Icon } from '@phosphor-icons/react'
import { Popover as PopoverPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Checkbox } from './checkbox'
import {
  cdDau,
  cdGiaTri,
  cdKhung,
  cdMuc,
  cdMui,
  cdNeoDay,
  cdTick,
  cdTieuDe,
  DANG_XEM,
  dvBoCuc,
  dvCongCu,
  dvDau,
  dvDem,
  dvGoc,
  dvNgan,
  dvTabs,
  dvThanh,
  dvThanhPhai,
  dvTieuDe,
  dvTim,
  dvTimIcon,
  type DangXem,
} from './data-view-styles'
import { menuLabel, menuSeparator } from './menu-styles'
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from './popover'
import { Toggle, ToggleGroup, ToggleGroupItem } from './toggle-group'
import { Tooltip } from './tooltip'
import type { CotBang } from './use-cot-bang'

export { DANG_XEM, type DangXem }

const ICON_XEM: Record<DangXem, Icon> = { 'danh-sach': ListBullets, bang: Table, kanban: Kanban }

type PropsCongCu = {
  dangXem: DangXem
  onDoiXem: (v: DangXem) => void
  /** Thẻ xem nhanh đang bật — README: mặc định TẮT (tắt → bấm bản ghi mở trang chi tiết). */
  xemNhanh: boolean
  onXemNhanh: (bat: boolean) => void
  /** Nút ⚙ — thường là `<CaiDatHienThi …/>`. Không truyền thì không có ⚙ (và không có vạch ngăn đầu). */
  caiDat?: ReactNode
}

/**
 * Cụm công cụ phải hàng tab (`.b-cong-cu`): ⚙ │ Danh sách · Bảng · Kanban │ thẻ xem nhanh. Nút icon ghost 32, icon 18
 * (README), có `aria-label` + tooltip (mô tả thêm, hiện cả khi focus phím). Dạng xem = ToggleGroup single
 * (`radiogroup` / `radio` + `aria-checked`); bấm lại dạng đang chọn không bỏ chọn. Xem nhanh = Toggle `aria-pressed`.
 */
export function CongCuXem({ dangXem, onDoiXem, xemNhanh, onXemNhanh, caiDat }: PropsCongCu) {
  return (
    <div data-slot="data-view-tools" className={dvCongCu}>
      {caiDat && (
        <>
          {caiDat}
          <span data-slot="data-view-ngan" aria-hidden="true" className={dvNgan} />
        </>
      )}
      <ToggleGroup
        type="single"
        value={dangXem}
        onValueChange={(v) => v && onDoiXem(v as DangXem)}
        aria-label="Dạng xem"
        className={dvBoCuc}
      >
        {DANG_XEM.map(({ id, ten, tip }) => {
          const I = ICON_XEM[id]
          return (
            <Tooltip key={id} content={tip}>
              <ToggleGroupItem value={id} aria-label={ten} className="[&_svg]:size-[18px]">
                <I aria-hidden="true" />
              </ToggleGroupItem>
            </Tooltip>
          )
        })}
      </ToggleGroup>
      <span data-slot="data-view-ngan" aria-hidden="true" className={dvNgan} />
      {/* Như "Toggle pinned summary" của ChatGPT: tắt thì bấm bản ghi mở trang chi tiết. */}
      <Tooltip content={xemNhanh ? 'Ẩn thẻ xem nhanh' : 'Hiện thẻ xem nhanh'}>
        <Toggle
          pressed={xemNhanh}
          onPressedChange={onXemNhanh}
          aria-label="Thẻ xem nhanh bên phải"
          className="[&_svg]:size-[18px]"
        >
          <SidebarSimple mirrored aria-hidden="true" />
        </Toggle>
      </Tooltip>
    </div>
  )
}

/**
 * DataViewToolbar — đầu trang + thanh công cụ dùng chung cho mọi màn dữ liệu (README DataViewToolbar, chốt 18/11):
 * 1. Đầu trang: tiêu đề 24/28 600 · "đang thấy X / Y" · ô tìm (slot, rộng 240 + icon kính lúp) · nút chính.
 * 2. Hàng tab (slot `tabs` — DS `Tabs` biến thể `pill`) + `CongCuXem` bên phải.
 * - Đổi dạng xem không đụng tab / lọc / sắp: thanh chỉ báo `onDoiXem`, tab + lọc sống ở URL / màn (CHUAN-FILTER).
 * - Ô tìm là của màn (vd `OTimKiem` của bang/ trong `CauHinhBangDs`): thanh chỉ đặt chỗ + icon + bề rộng.
 * - Không đặt chip lọc / chữ gợi ý ở hàng tab (README) — chip lọc ở FilterBar.
 */
export function DataViewToolbar({
  tieuDe,
  capTieuDe: H = 'h1',
  dem,
  timKiem,
  nutChinh,
  tabs,
  ...congCu
}: {
  tieuDe: ReactNode
  /** Cấp thẻ tiêu đề — trang tài liệu (/ds) dùng h2. */
  capTieuDe?: 'h1' | 'h2'
  /** "đang thấy `thay` / `tong`". */
  dem?: { thay: number; tong: number }
  timKiem?: ReactNode
  nutChinh?: ReactNode
  tabs?: ReactNode
} & PropsCongCu) {
  return (
    <div data-slot="data-view-toolbar" className={dvGoc}>
      <header className={dvDau}>
        <H className={dvTieuDe}>{tieuDe}</H>
        {dem && (
          <span className={dvDem}>
            đang thấy {dem.thay} / {dem.tong}
          </span>
        )}
        <span aria-hidden="true" className="flex-1 border-none border-current" />
        {timKiem && (
          <div data-slot="data-view-search" className={dvTim}>
            <MagnifyingGlass aria-hidden="true" className={dvTimIcon} />
            {timKiem}
          </div>
        )}
        {nutChinh}
      </header>
      <div className={dvThanh}>
        <div className={dvTabs}>{tabs}</div>
        <div className={dvThanhPhai}>
          <CongCuXem {...congCu} />
        </div>
      </div>
    </div>
  )
}

// ======================= ⚙ Cài đặt hiển thị =======================

type Trang = '' | 'bocuc' | 'cot' | 'loc' | 'sap' | 'nhom'

const NHO = '(max-width: 767px)' // `@media (max-width: 767px)` của nguồn: ⚙ thành sheet đáy
const nghe = (f: () => void) => {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const m = window.matchMedia(NHO)
  m.addEventListener('change', f)
  return () => m.removeEventListener('change', f)
}
const doNho = () => typeof window !== 'undefined' && !!window.matchMedia?.(NHO).matches

function MucCd({
  I,
  ten,
  gt,
  mui,
  trang,
  onClick,
}: {
  I: Icon
  ten: string
  gt?: ReactNode
  mui?: boolean
  trang?: Trang
  onClick: () => void
}) {
  return (
    <button type="button" data-trang={trang} className={cdMuc} onClick={onClick}>
      <I aria-hidden="true" />
      {ten}
      <span className={cdGiaTri}>{gt}</span>
      {mui && <CaretRight aria-hidden="true" className={cdMui} />}
    </button>
  )
}

/** Mục chọn một (Bố cục, Nhóm theo, Sắp xếp): nút bật/tắt `aria-pressed` + ✓ (hoặc mũi tên chiều) dồn phải. */
function MucChon({ chon, onClick, children, dau }: { chon: boolean; onClick: () => void; children: ReactNode; dau?: ReactNode }) {
  return (
    <button type="button" aria-pressed={chon} className={cdMuc} onClick={onClick}>
      {dau}
      {children}
      {chon && <Check aria-hidden="true" className={cdTick} />}
    </button>
  )
}

/**
 * CaiDatHienThi — nút ⚙ + Popover "Cài đặt hiển thị" kiểu Notion View settings (README DataViewToolbar):
 * - Trang gốc: Bố cục · Cột hiển thị (chỉ dạng Bảng) · Lọc · Sắp xếp · Nhóm theo (không ở Kanban) — mỗi dòng giá trị
 *   hiện tại + ›; dưới: Sao chép link view · Lưu view của tôi · Lưu view chung · Xuất Excel. Mục không có hàm thì ẩn.
 * - Trang con có ← "Quay lại": vào trang con → focus ←; ← → về gốc, focus về đúng mục đã mở. State trang nằm trong
 *   Popover (không lồng DropdownMenu sâu). Đóng (Esc / ✕ / bấm ngoài / chọn hành động) → về gốc, focus về ⚙ (Radix).
 * - "Sắp xếp" chỉ liệt kê cột `kieu: 'sap'`, mỗi cột hai lựa chọn nói nghĩa bằng lời (`nghia.tang` / `nghia.giam`).
 * - ≤ 767 khung nhìn: sheet đáy cách mép 8, trần 70vh, z 60.
 * - Không phải `role="menu"`: Popover = hộp thoại không modal (Tab đi qua từng mục), mục chọn một là nút `aria-pressed`.
 */
export function CaiDatHienThi({
  dangXem,
  onDoiXem,
  cot = [],
  cotAn = [],
  onCotAn,
  loc,
  sapXep,
  onSapXep,
  nhom,
  onSaoChepLink,
  onLuuView,
  luuChung,
  onXuatExcel,
}: {
  dangXem: DangXem
  onDoiXem: (v: DangXem) => void
  /** Cột của Table (`CotBang`, use-cot-bang.ts): `khoa` luôn hiện; `kieu: 'sap'` vào trang Sắp xếp với `nghia`. */
  cot?: CotBang[]
  /** id cột đang ẩn. */
  cotAn?: string[]
  onCotAn?: (an: string[]) => void
  /** Trang con "Lọc": số điều kiện đang bật + nội dung (ô lọc của màn — bang/). */
  loc?: { so: number; noiDung: ReactNode }
  sapXep?: { cot: string; tang: boolean }
  onSapXep?: (s: { cot: string; tang: boolean }) => void
  /** `giaTri` '' = không nhóm. `tuyChon` không cần mục "Không nhóm" — tự thêm. */
  nhom?: { tuyChon: { giaTri: string; nhan: string }[]; giaTri: string; onDoi: (v: string) => void }
  onSaoChepLink?: () => void
  /** `chung`: lưu view chung (quyền quản lý) hay của tôi. */
  onLuuView?: (chung: boolean) => void
  /** Có quyền lưu view chung → hiện mục "Lưu view chung". */
  luuChung?: boolean
  onXuatExcel?: () => void
}) {
  const [mo, setMo] = useState(false)
  const [trang, setTrang] = useState<Trang>('')
  const vuaMo = useRef<Trang>('')
  const khung = useRef<HTMLDivElement>(null)
  const nho = useSyncExternalStore(nghe, doNho, () => false)

  // Đổi trang: trang con → focus ←; về gốc → focus mục đã mở trang con (mục mất — vd "Cột hiển thị" sau khi đổi Bố
  // cục sang Danh sách → mục đầu).
  useEffect(() => {
    const k = khung.current
    if (!mo || !k) return
    if (trang) k.querySelector<HTMLElement>('[data-slot="cd-lui"]')?.focus()
    else if (vuaMo.current) {
      ;(k.querySelector<HTMLElement>(`[data-trang="${vuaMo.current}"]`) ?? k.querySelector<HTMLElement>('[data-trang]'))?.focus()
      vuaMo.current = ''
    }
  }, [trang, mo])

  const doiMo = (o: boolean) => {
    setMo(o)
    if (!o) {
      setTrang('')
      vuaMo.current = ''
    }
  }
  const vao = (t: Trang) => {
    vuaMo.current = t
    setTrang(t)
  }
  const ve = () => setTrang('')
  const lam = (f?: () => void) => () => {
    f?.()
    doiMo(false)
  }

  const hien = cot.filter((c) => !cotAn.includes(c.id))
  const cotSap = cot.filter((c): c is Extract<CotBang, { kieu: 'sap' }> => c.kieu === 'sap')
  const tenXem = DANG_XEM.find((x) => x.id === dangXem)?.ten
  const IXem = ICON_XEM[dangXem]

  const dau = (ten: string) => (
    <div className={cdDau}>
      <Button data-slot="cd-lui" variant="ghost" size="icon-sm" aria-label="Quay lại" onClick={ve}>
        <ArrowLeft aria-hidden="true" />
      </Button>
      {ten}
    </div>
  )

  return (
    <Popover open={mo} onOpenChange={doiMo}>
      <Tooltip content="Cột, lọc, sắp xếp, nhóm">
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Cài đặt hiển thị" className="[&_svg]:size-[18px]">
            <GearSix aria-hidden="true" />
          </Button>
        </PopoverTrigger>
      </Tooltip>
      {nho && (
        <PopoverAnchor asChild>
          <span aria-hidden="true" className={cdNeoDay} />
        </PopoverAnchor>
      )}
      <PopoverContent
        ref={khung}
        aria-label="Cài đặt hiển thị"
        data-slot="cai-dat-hien-thi"
        align={nho ? 'start' : 'end'}
        side={nho ? 'top' : 'bottom'}
        sideOffset={nho ? 0 : 4}
        className={cdKhung}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          khung.current?.querySelector<HTMLElement>('[data-trang]')?.focus()
        }}
      >
        {trang === '' && (
          <>
            <div className={cdTieuDe}>
              Cài đặt hiển thị
              <PopoverPrimitive.Close asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Đóng">
                  <X aria-hidden="true" />
                </Button>
              </PopoverPrimitive.Close>
            </div>
            <MucCd I={IXem} ten="Bố cục" gt={tenXem} mui trang="bocuc" onClick={() => vao('bocuc')} />
            {dangXem === 'bang' && cot.length > 0 && (
              <MucCd I={Eye} ten="Cột hiển thị" gt={hien.length} mui trang="cot" onClick={() => vao('cot')} />
            )}
            {loc && <MucCd I={Funnel} ten="Lọc" gt={loc.so || undefined} mui trang="loc" onClick={() => vao('loc')} />}
            {onSapXep && cotSap.length > 0 && (
              <MucCd
                I={SortAscending}
                ten="Sắp xếp"
                gt={cot.find((c) => c.id === sapXep?.cot)?.ten}
                mui
                trang="sap"
                onClick={() => vao('sap')}
              />
            )}
            {nhom && dangXem !== 'kanban' && (
              <MucCd
                I={Rows}
                ten="Nhóm theo"
                gt={nhom.tuyChon.find((x) => x.giaTri === nhom.giaTri)?.nhan}
                mui
                trang="nhom"
                onClick={() => vao('nhom')}
              />
            )}
            {onSaoChepLink && <MucCd I={LinkSimple} ten="Sao chép link view" onClick={lam(onSaoChepLink)} />}
            {(onLuuView || onXuatExcel) && <div className={menuSeparator} />}
            {onLuuView && <MucCd I={FloppyDisk} ten="Lưu thành view của tôi" onClick={lam(() => onLuuView(false))} />}
            {onLuuView && luuChung && (
              <MucCd I={FloppyDisk} ten="Lưu view chung" gt="quản lý" onClick={lam(() => onLuuView(true))} />
            )}
            {onXuatExcel && <MucCd I={Export} ten="Xuất Excel theo bộ lọc" onClick={lam(onXuatExcel)} />}
          </>
        )}
        {trang === 'bocuc' && (
          <>
            {dau('Bố cục')}
            {DANG_XEM.map(({ id, ten }) => {
              const I = ICON_XEM[id]
              return (
                <MucChon
                  key={id}
                  chon={dangXem === id}
                  dau={<I aria-hidden="true" />}
                  onClick={() => {
                    onDoiXem(id)
                    ve()
                  }}
                >
                  {ten}
                </MucChon>
              )
            })}
          </>
        )}
        {trang === 'cot' && (
          <>
            {dau('Cột hiển thị')}
            <div className={menuLabel}>Kéo tiêu đề cột trên bảng để đổi chỗ</div>
            {cot.map((c) => (
              <label key={c.id} className={cn(cdMuc, 'has-disabled:cursor-not-allowed')}>
                <Checkbox
                  checked={!cotAn.includes(c.id)}
                  disabled={c.khoa}
                  onCheckedChange={() =>
                    onCotAn?.(cotAn.includes(c.id) ? cotAn.filter((x) => x !== c.id) : [...cotAn, c.id])
                  }
                />
                {c.ten}
              </label>
            ))}
          </>
        )}
        {trang === 'loc' && loc && (
          <>
            {dau('Lọc')}
            {loc.noiDung}
          </>
        )}
        {trang === 'sap' && (
          <>
            {dau('Sắp xếp')}
            {/* Như menu TieuDeCot: mỗi cột có thứ tự hai lựa chọn nói NGHĨA (`nghia.tang` / `nghia.giam`) — spec §5.3, không
                ghi "Tăng dần/Giảm dần". Tên cột là nhãn nhóm. */}
            {cotSap.map((c) => (
              <div key={c.id} role="group" aria-label={c.ten} className="border-none border-current">
                <div aria-hidden="true" className={menuLabel}>
                  {c.ten}
                </div>
                {(['tang', 'giam'] as const).map((ch) => (
                  <MucChon
                    key={ch}
                    chon={sapXep?.cot === c.id && sapXep.tang === (ch === 'tang')}
                    onClick={() => onSapXep?.({ cot: c.id, tang: ch === 'tang' })}
                  >
                    {c.nghia[ch]}
                  </MucChon>
                ))}
              </div>
            ))}
          </>
        )}
        {trang === 'nhom' && nhom && (
          <>
            {dau('Nhóm theo')}
            {[{ giaTri: '', nhan: 'Không nhóm' }, ...nhom.tuyChon].map((x) => (
              <MucChon
                key={x.giaTri || 'khong'}
                chon={nhom.giaTri === x.giaTri}
                onClick={() => {
                  nhom.onDoi(x.giaTri)
                  ve()
                }}
              >
                {x.nhan}
              </MucChon>
            ))}
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
