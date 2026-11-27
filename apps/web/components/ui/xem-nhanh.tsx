'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowsInSimple, ArrowsOutSimple, CaretDoubleRight, CaretDown, CaretUp } from '@phosphor-icons/react/ssr'
import { cn } from '@/lib/utils'
import { Button } from './button'
import {
  xnChan,
  xnCuon,
  xnCuonCa,
  xnCuonRong,
  xnDau,
  xnHangTab,
  xnHangTabDinh,
  xnKhung,
  xnMa,
  xnNoiDungNhuong,
  xnNoiDungNhuongCoDinh,
  xnNoiDungTab,
  xnTabs,
  xnThan,
  xnThe,
  xnThuocTinh,
  xnTheCoDinh,
  xnTheRong,
  xnTieuDe,
} from './data-view-styles'
import { useDsPortal } from './ds-root'
import { Separator } from './separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import { TooltipNhanh } from './tooltip'

/** Một tab của thẻ (`the.tab.ds`): `icon` Phosphor `aria-hidden` đứng trước nhãn. */
export type TabXemNhanh = { gt: string; nhan: string; icon?: ReactNode; noiDung: ReactNode }

/**
 * Phím thuộc ô gõ / menu / hộp đang mở — không lật bản ghi (prototype: input, textarea, [role=menu]). Ô chọn dòng
 * (checkbox / radio) KHÔNG tính là ô gõ: đang đứng ở ô chọn dòng vẫn Esc đóng thẻ được (cùng ngoại lệ với ThanhDaChon).
 */
const BO_QUA =
  'input:not([type=checkbox]):not([type=radio]), textarea, select, [contenteditable=""], [contenteditable="true"], [role="menu"], [role="listbox"], [role="dialog"]'
/** Nghe ở pha capture nên chạy TRƯỚC widget đang focus: ↑/↓ trong widget tự dùng mũi tên thì nhường cho widget. */
const BO_QUA_MUI =
  '[role="radiogroup"], [role="tablist"], [role="toolbar"], [role="grid"], [role="tree"], [role="slider"], [role="spinbutton"], [role="combobox"], [role="menubar"]'
/**
 * Lớp Radix đang mở trong ô portal của DsRoot (menu, Select, popover, hộp, sheet: `open`; tooltip: `delayed-open` /
 * `instant-open`). Nội dung lớp chỉ được mount khi mở → không đụng phần tử thường trực.
 */
const LOP_MO = '[data-state="open"], [data-state="delayed-open"], [data-state="instant-open"]'

/**
 * XemNhanh — khung "thẻ xem nhanh" bên phải màn dữ liệu (README DataViewToolbar: bật nút xem nhanh → bấm bản ghi mở thẻ
 * bên phải; prototype `XemNhanh`). Bọc nội dung màn (`children`); có `the` → thẻ nổi 440 bám phải khung chứa và nội
 * dung NHƯỜNG chỗ (≥ 768 lề phải 456) — thẻ không che bảng. < 768: thẻ phủ kín khung.
 * - Đầu thẻ (học HÀNH VI side peek của Notion — CEO 27/11 "các action để ở trên giống notion"): thao tác ở TRÁI — » đóng ·
 *   ⤢ mở toàn trang (`the.moTrang`, chỉ khi màn có trang chi tiết) | ↑ ↓ bản ghi trước / sau, mỗi nút có tooltip kèm phím —
 *   rồi mới tới mã · dòng phụ. Thân = `the.noiDung`; trống → chú "chưa chốt" (nội dung thẻ
 *   từng màn tự dựng từ DS: Alert · PropertyList · Timeline — chưa chốt chung).
 * - Phím khi thẻ mở: ↑/k trước, ↓/j sau, Esc đóng — nghe ở document pha capture và `preventDefault` phím đã dùng (Esc
 *   đóng thẻ không bỏ luôn lựa chọn dòng của ThanhDaChon). Bỏ qua khi đang gõ trong ô / trong menu / hộp, bộ gõ đang ghép
 *   chữ, có Ctrl/⌘/Alt (Ctrl+K…), hoặc phím đã bị xử lý trước (`defaultPrevented`). Esc nhường lớp trên: đang kéo
 *   (`data-dang-keo` trên body — Esc huỷ kéo) hoặc có lớp Radix đang mở (tooltip đang hiện, menu…) — listener này gắn
 *   TRƯỚC listener Esc của lớp (cùng document capture) nên phải tự nhường, không thì lớp kẹt mở.
 * - Không tự giữ state: bên gọi giữ bản ghi đang xem (thường là tham số URL) và truyền `the`.
 * - `the.tab` (học bố cục Twenty 26/11): hàng tab `line` có icon dưới đầu thẻ, đứng yên khi nội dung cuộn; tab không vừa
 *   KHÔNG gom "+N Thêm" — trải hết, thừa thì cuộn ngang (CEO 27/11). Bên gọi giữ tab đang chọn (`value` / `onDoi`). Không có `tab` → thân như cũ.
 * - `the.chan`: thanh thao tác dính đáy thẻ, dồn phải (⋮ menu + nút chính) — không cuộn theo nội dung.
 */
export function XemNhanh({
  the,
  onDong,
  onTruoc,
  onSau,
  coDinh,
  className,
  children,
}: {
  the: {
    ma: string
    phu?: ReactNode
    /** `phu` (tên) đứng TRƯỚC mã: "Công ty An Phát · DEMO-1001". */
    phuTruoc?: boolean
    /** Bản ghi khẩn: MÃ chữ đỏ (--color-text-danger) + "Khẩn: " cho trình đọc màn hình (danh sách ticket, CEO 26/11). */
    khan?: boolean
    /** Cờ ngay sau mã (icon Khẩn… — icon có tên đọc được). */
    co?: ReactNode
    noiDung?: ReactNode
    tab?: { value: string; onDoi: (v: string) => void; ds: TabXemNhanh[] }
    chan?: ReactNode
    /** Tiêu đề lớn dưới đầu thẻ, trên hàng tab (thường là tên bản ghi, có thể là ô sửa). Có `tieuDe` → đầu thẻ chỉ còn mã. */
    tieuDe?: ReactNode
    /**
     * Thuộc tính chính (thường = các cột của bảng) dưới tiêu đề, TRÊN hàng tab — cùng tiêu đề + tab cuộn chung một vùng,
     * hàng tab dính khi cuộn qua (học Notion, CEO 27/11). Cần `tab`.
     */
    thuocTinh?: ReactNode
    /** Đường dẫn trang chi tiết đầy đủ → nút ⤢ "Mở toàn trang" ở đầu thẻ. Không có = màn chưa có trang riêng. */
    moTrang?: string
  } | null
  onDong: () => void
  /** Không truyền = đang ở bản ghi đầu (nút ‹ tắt). */
  onTruoc?: () => void
  onSau?: () => void
  /**
   * Thẻ bám MÀN HÌNH (`fixed`) thay vì bám khung chứa: cao hết màn và đứng yên khi cuộn. Dùng ở màn app (khung cuộn =
   * vùng nội dung sát mép phải màn) — bám khung thì trang ít dòng làm thẻ cụt giữa màn, trang dài thì thẻ trôi theo cuộn.
   * Bỏ trống ở preview/demo (thẻ phải nằm trong khung demo).
   */
  coDinh?: boolean
  className?: string
  children: ReactNode
}) {
  const ham = useRef({ onDong, onTruoc, onSau })
  useEffect(() => {
    ham.current = { onDong, onTruoc, onSau }
  })
  const mo = the != null
  const portal = useDsPortal()
  // Mở toàn màn (chỉ thẻ `coDinh` KHÔNG có `moTrang`): giữ khi lướt bản ghi, đóng thẻ thì về lại thẻ hẹp.
  const [rong, setRong] = useState(false)
  if (!mo && rong) setRong(false)
  const toanMan = !!coDinh && !!the && !the.moTrang
  const rongThat = rong && toanMan
  useEffect(() => {
    if (!mo) return
    const k = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing) return
      if ((e.target as Element | null)?.closest?.(BO_QUA)) return
      // Ctrl/⌘+Enter = mở toàn trang (học Notion 27/11) — bấm chính link ⤢ để Next Link điều hướng như bấm chuột.
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key === 'Enter') {
        const a = document.querySelector<HTMLElement>('[data-slot="xem-nhanh"] [aria-keyshortcuts="Control+Enter"]')
        if (a) {
          e.preventDefault()
          a.click()
        }
        return
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const h = ham.current
      if (e.key === 'Escape') {
        if (document.body.hasAttribute('data-dang-keo') || portal?.querySelector(LOP_MO)) return
        // preventDefault: Esc này đã dùng để đóng thẻ — ThanhDaChon (escBoChon) bỏ qua phím đã xử lý, lựa chọn dòng còn.
        e.preventDefault()
        h.onDong()
      } else if ((e.target as Element | null)?.closest?.(BO_QUA_MUI)) return
      else if ((e.key === 'ArrowDown' || e.key === 'j') && h.onSau) {
        e.preventDefault()
        h.onSau()
      } else if ((e.key === 'ArrowUp' || e.key === 'k') && h.onTruoc) {
        e.preventDefault()
        h.onTruoc()
      }
    }
    // document pha CAPTURE: chạy trước ThanhDaChon (window, pha nổi) và trước handler của phần tử đang focus.
    document.addEventListener('keydown', k, true)
    return () => document.removeEventListener('keydown', k, true)
  }, [mo, portal])

  return (
    <div data-slot="xem-nhanh-khung" className={cn(xnKhung, className)}>
      <div className={cn('border-none border-current', mo && (coDinh ? xnNoiDungNhuongCoDinh : xnNoiDungNhuong))}>
        {children}
      </div>
      {the && (
        <aside
          data-slot="xem-nhanh"
          data-rong={rongThat || undefined}
          aria-label={`Xem nhanh ${the.ma}`}
          className={cn(xnThe, coDinh && xnTheCoDinh, rongThat && xnTheRong)}
        >
          <div className={xnDau}>
            <TooltipNhanh content="Đóng" phim="Esc">
              <Button variant="ghost" size="icon-sm" aria-label="Đóng xem nhanh (Esc)" onClick={onDong}>
                <CaretDoubleRight aria-hidden="true" />
              </Button>
            </TooltipNhanh>
            {the.moTrang && (
              <TooltipNhanh content="Mở toàn trang" phim="Ctrl+↵">
                <Button variant="ghost" size="icon-sm" asChild>
                  <Link href={the.moTrang} aria-label={`Mở toàn trang ${the.ma}`} aria-keyshortcuts="Control+Enter">
                    <ArrowsOutSimple aria-hidden="true" />
                  </Link>
                </Button>
              </TooltipNhanh>
            )}
            {toanMan && (
              // Màn chưa có trang riêng (Việc) → mở rộng NGAY thẻ ra toàn vùng nội dung (≥ 768; nhỏ hơn thẻ đã phủ kín).
              <TooltipNhanh content={rongThat ? 'Thu về' : 'Mở toàn màn'} phim="Ctrl+↵">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="max-md:hidden"
                  aria-label={rongThat ? `Thu ${the.ma} về thẻ` : `Mở toàn màn ${the.ma}`}
                  aria-pressed={rongThat}
                  aria-keyshortcuts="Control+Enter"
                  onClick={() => setRong((r) => !r)}
                >
                  {rongThat ? <ArrowsInSimple aria-hidden="true" /> : <ArrowsOutSimple aria-hidden="true" />}
                </Button>
              </TooltipNhanh>
            )}
            <Separator orientation="vertical" className="mx-1 h-4!" />
            <TooltipNhanh content="Bản ghi trước" phim="↑">
              <Button variant="ghost" size="icon-sm" aria-label="Bản ghi trước (↑)" disabled={!onTruoc} onClick={onTruoc}>
                <CaretUp aria-hidden="true" />
              </Button>
            </TooltipNhanh>
            <TooltipNhanh content="Bản ghi sau" phim="↓">
              <Button variant="ghost" size="icon-sm" aria-label="Bản ghi sau (↓)" disabled={!onSau} onClick={onSau}>
                <CaretDown aria-hidden="true" />
              </Button>
            </TooltipNhanh>
            <span aria-hidden="true" className="w-2 shrink-0 border-none border-current" />
            {the.tieuDe ? (
              <>
                <span className={cn(xnMa, the.khan && 'text-(--color-text-danger)')}>
                  {the.khan && <span className="sr-only">Khẩn: </span>}
                  {the.ma}
                </span>
                {the.co}
              </>
            ) : the.phuTruoc && the.phu ? (
              <>
                <span className={cn(xnMa, 'min-w-0 truncate')}>{the.phu}</span>
                <span className={xnMa}>· {the.ma}</span>
                {the.co}
              </>
            ) : (
              <>
                <span className={cn(xnMa, the.khan && 'text-(--color-text-danger)')}>
                  {the.khan && <span className="sr-only">Khẩn: </span>}
                  {the.ma}
                </span>
                {the.co}
                {the.phu && <span className={cn(xnMa, 'min-w-0 truncate')}>· {the.phu}</span>}
              </>
            )}
          </div>
          {the.tieuDe && !(the.tab && the.thuocTinh) && (
            <div data-slot="xem-nhanh-tieu-de" className={xnTieuDe}>
              {the.tieuDe}
            </div>
          )}
          {the.tab && the.thuocTinh ? (
            <Tabs value={the.tab.value} onValueChange={the.tab.onDoi} className={xnTabs}>
              <div className={cn(xnCuonCa, rongThat && xnCuonRong)}>
                {the.tieuDe && (
                  <div data-slot="xem-nhanh-tieu-de" className={xnTieuDe}>
                    {the.tieuDe}
                  </div>
                )}
                <div data-slot="xem-nhanh-thuoc-tinh" className={xnThuocTinh}>
                  {the.thuocTinh}
                </div>
                <div className={cn(xnHangTab, xnHangTabDinh)}>
                  <TabsList variant="line" aria-label={`Thông tin ${the.ma}`}>
                    {the.tab.ds.map((x) => (
                      <TabsTrigger key={x.gt} value={x.gt}>
                        {x.icon}
                        {x.nhan}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                <div className={xnNoiDungTab}>
                  {the.tab.ds.map((x) => (
                    <TabsContent key={x.gt} value={x.gt}>
                      {x.noiDung}
                    </TabsContent>
                  ))}
                </div>
              </div>
            </Tabs>
          ) : the.tab ? (
            <Tabs value={the.tab.value} onValueChange={the.tab.onDoi} className={xnTabs}>
              <div className={xnHangTab}>
                <TabsList variant="line" aria-label={`Thông tin ${the.ma}`}>
                  {the.tab.ds.map((x) => (
                    <TabsTrigger key={x.gt} value={x.gt}>
                      {x.icon}
                      {x.nhan}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              <div className={cn(xnCuon, rongThat && xnCuonRong)}>
                {the.tab.ds.map((x) => (
                  <TabsContent key={x.gt} value={x.gt}>
                    {x.noiDung}
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          ) : (
            <div className={xnThan}>
              {the.noiDung ?? (
                <p className="m-0 border-none border-current text-[12px] leading-[18px] text-muted-foreground">
                  Nội dung thẻ xem nhanh chưa chốt — màn tự dựng từ DS (Alert · PropertyList · Timeline).
                </p>
              )}
            </div>
          )}
          {the.chan && (
            <div data-slot="xem-nhanh-chan" className={xnChan}>
              {the.chan}
            </div>
          )}
        </aside>
      )}
    </div>
  )
}
