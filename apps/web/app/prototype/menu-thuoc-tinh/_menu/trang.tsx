'use client'

// PROTOTYPE vứt đi — bảng ticket + menu thuộc tính kiểu Linear: chuột phải (ContextMenu) · nút … (DropdownMenu) · phím S/A/P/L/⇧D.
import { useCallback, useEffect, useRef, useState, type KeyboardEvent as KeyboardEventReact, type MouseEvent, type SyntheticEvent } from 'react'
import { DotsThree } from '@phosphor-icons/react/ssr'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, chuCaiDau } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@/components/ui/context-menu'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import { cotChon, ma as lopMa } from '@/components/ui/table-styles'
import { thongBao } from '@/components/ui/toast'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ChonHanA2 } from '../../chon-gio/_chon-gio/bien-the-a2'
import { ChonHanA4 } from '../../chon-gio/_chon-gio/bien-the-a4'
import { ChonHanA5 } from '../../chon-gio/_chon-gio/bien-the-a5'

type BienThe = 'A4' | 'A2' | 'A5'
import { hienGon } from '../../chon-gio/_chon-gio/gio'
import { dichCua, NGUOI, NHAN, phimMuc, ticketDau, TRANG_THAI, UU_TIEN, type Sub, type Ticket } from './du-lieu'
import { NoiDungMenu, type Doi } from './menu'

type Mo = { ma: string; kieu: 'nut' | 'chuot'; quaPhim?: boolean }
type PhienHan = { dich: string[]; cu: Record<string, string | null> }

const tenNguoi = (id: string | null) => NGUOI.find((n) => n.id === id)?.ten ?? 'Chưa giao'
const tenDich = (dich: string[]) => (dich.length > 1 ? `${dich.length} ticket` : dich[0])
/** Chọn ô nhập/menu/hộp: phím tắt bảng nhường. */
const O_NHAP = 'input, textarea, select, [contenteditable=""], [contenteditable=true]'

export function TrangMenuThuocTinh() {
  const [ds, setDs] = useState(ticketDau)
  const [conTro, setConTro] = useState(ds[0].ma)
  const [chon, setChon] = useState<Set<string>>(() => new Set())
  const [neo, setNeo] = useState<string | null>(null)
  const [mo, setMo] = useState<Mo | null>(null)
  const [sub, setSub] = useState<Sub | null>(null)
  const [bienThe, setBienThe] = useState<BienThe>('A4') // CEO chốt A4 + chỉ lưu khi Xong (20/11)
  const bang = useRef<HTMLTableSectionElement>(null)
  /** "Đặt hạn…" vừa bấm trong menu → mở ô chọn hạn SAU khi menu gỡ xong (onCloseAutoFocus). */
  const diHan = useRef<{ dich: string[]; ma: string } | null>(null)
  /** Lượt sửa hạn đang mở: đích + giá trị trước khi mở (Hoàn tác về đúng giá trị này dù đổi ngày/giờ nhiều lần). */
  const phienHan = useRef<PhienHan | null>(null)

  const thuTu = ds.map((t) => t.ma)
  const ChonHan = { A4: ChonHanA4, A2: ChonHanA2, A5: ChonHanA5 }[bienThe]

  const focusDong = (ma: string) => bang.current?.querySelector<HTMLElement>(`tr[data-ma="${ma}"]`)?.focus()

  /** Mở/đóng một menu. Đóng chỉ khi đúng menu đang mở (chuột phải dòng khác: dòng mới mở trước, dòng cũ báo đóng sau). */
  const doiMenu = (m: Mo, moRa: boolean) => {
    setMo((cu) => (moRa ? m : cu && cu.ma === m.ma && cu.kieu === m.kieu ? null : cu))
    if (moRa) {
      setSub(null)
      setConTro(m.ma)
    }
  }
  const doiSub = (id: Sub, moRa: boolean) => setSub((s) => (moRa ? id : s === id ? null : s))
  const xongPhim = useCallback(() => setMo((m) => (m?.quaPhim ? { ...m, quaPhim: false } : m)), [])

  /** Đổi một trường cho các dòng đích + toast "Hoàn tác" khôi phục đúng giá trị cũ của TỪNG dòng. */
  function doiTruong<K extends 'trangThai' | 'nguoiLam' | 'uuTien' | 'nhan' | 'han'>(
    dich: string[],
    k: K,
    moi: (t: Ticket) => Ticket[K],
    chu: string,
    o: { cu?: Record<string, Ticket[K]>; id?: string } = {},
  ) {
    const cu = o.cu ?? (Object.fromEntries(ds.filter((t) => dich.includes(t.ma)).map((t) => [t.ma, t[k]])) as Record<string, Ticket[K]>)
    setDs((d) => d.map((t) => (dich.includes(t.ma) ? { ...t, [k]: moi(t) } : t)))
    thongBao.xong(chu, {
      id: o.id,
      hoanTac: () => setDs((d) => d.map((t) => (t.ma in cu ? { ...t, [k]: cu[t.ma] } : t))),
    })
  }

  function doiCho(dich: string[], ma: string): Doi {
    return {
      trangThai: (v) => doiTruong(dich, 'trangThai', () => v, `Đã đổi trạng thái ${tenDich(dich)} → ${TRANG_THAI.find((x) => x.id === v)?.ten}`),
      nguoiLam: (v) => doiTruong(dich, 'nguoiLam', () => v, `Đã đổi người làm ${tenDich(dich)} → ${tenNguoi(v)}`),
      uuTien: (v) => doiTruong(dich, 'uuTien', () => v, `Đã đổi ưu tiên ${tenDich(dich)} → ${UU_TIEN.find((x) => x.id === v)?.ten}`),
      nhan: (id, them) => {
        const ten = NHAN.find((n) => n.id === id)?.ten
        doiTruong(
          dich,
          'nhan',
          (t) => (them ? [...new Set([...t.nhan, id])] : t.nhan.filter((x) => x !== id)),
          them ? `Đã thêm nhãn ${ten} cho ${tenDich(dich)}` : `Đã gỡ nhãn ${ten} khỏi ${tenDich(dich)}`,
        )
      },
      han: () => {
        diHan.current = { dich, ma }
      },
    }
  }

  /** Mở ô chọn hạn của dòng `ma` (pop neo vào ô Hạn) cho `dich`. Component chon-gio tự giữ trạng thái mở → bấm nút của nó. */
  function moHan(dich: string[], ma: string) {
    phienHan.current = { dich, cu: Object.fromEntries(ds.filter((t) => dich.includes(t.ma)).map((t) => [t.ma, t.han])) }
    // ponytail: luôn có ô Hạn trên dòng (bảng không ẩn cột) → không làm nhánh "neo vào vị trí menu".
    bang.current?.querySelector<HTMLButtonElement>(`[data-o-han="${ma}"] button`)?.click()
  }

  function doiHan(ma: string, han: string | null) {
    let p = phienHan.current
    if (!p || !p.dich.includes(ma)) p = phienHan.current = { dich: [ma], cu: { [ma]: ds.find((t) => t.ma === ma)?.han ?? null } }
    const chu = han ? `Đã đặt hạn ${tenDich(p.dich)} → ${hienGon(han)}` : `Đã xoá hạn ${tenDich(p.dich)}`
    // Cùng id: A5 đổi ngày rồi gõ giờ = một toast cập nhật tại chỗ, Hoàn tác về giá trị trước khi mở pop.
    doiTruong(p.dich, 'han', () => han, chu, { cu: p.cu, id: `han-${p.dich.join()}` })
  }

  /** Menu đóng: "Đặt hạn…" → mở pop hạn; không thì focus về dòng (trừ khi người dùng đã bấm sang chỗ khác). */
  function sauMenu(e: Event, ma: string) {
    e.preventDefault()
    const h = diHan.current
    diHan.current = null
    if (h) return moHan(h.dich, h.ma)
    const a = document.activeElement
    if (!a || a === document.body) focusDong(ma)
  }

  /** Phím trong menu đang mở: S/A/P/L nhảy sang menu con, ⇧D = Đặt hạn. Ô tìm (Người làm) giữ phím để gõ. */
  function phimTrongMenu(e: KeyboardEventReact, m: Mo) {
    const k = phimMuc(e)
    if (!k || (e.target as HTMLElement).closest(O_NHAP)) return
    e.preventDefault()
    e.stopPropagation()
    if (k === 'han') {
      diHan.current = { dich: dichCua(m.ma, chon, thuTu), ma: m.ma }
      setMo(null)
    } else {
      setSub(k)
      setMo((cu) => cu && { ...cu, quaPhim: true })
    }
  }

  // Phím tắt bảng (ở window, như trang chon-gio): ↑/↓ đổi dòng, S/A/P/L mở menu thẳng vào menu con, ⇧D mở ô hạn, Esc bỏ chọn.
  useEffect(() => {
    const nghe = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (!t || t.closest(O_NHAP) || !(t === document.body || bang.current?.contains(t))) return
      const i = thuTu.indexOf(conTro)
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !e.shiftKey) {
        e.preventDefault()
        const den = thuTu[Math.min(thuTu.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)))]
        setConTro(den)
        focusDong(den)
        return
      }
      if (e.key === 'Escape') {
        if (chon.size) {
          e.preventDefault()
          setChon(new Set())
        }
        return
      }
      const k = phimMuc(e)
      if (!k) return
      e.preventDefault()
      if (k === 'han') return moHan(dichCua(conTro, chon, thuTu), conTro)
      setMo({ ma: conTro, kieu: 'nut', quaPhim: true })
      // Mở menu con SAU khi khung cha đã mount + tự focus (Radix DropdownMenu không cho chặn focus đầu của khung cha;
      // menu con mở trước thì cú focus đó nằm ngoài menu con → nó đóng ngay).
      requestAnimationFrame(() => setSub(k))
    }
    window.addEventListener('keydown', nghe)
    return () => window.removeEventListener('keydown', nghe)
  })

  function bamDong(e: MouseEvent<HTMLTableRowElement>, ma: string) {
    // Sự kiện React nổi qua portal (menu, pop hạn là con React của dòng) — chỉ nhận cú bấm trong chính dòng.
    if (!e.currentTarget.contains(e.target as Node)) return
    setConTro(ma)
    if ((e.target as HTMLElement).closest('button, input, a')) return
    if (e.shiftKey && neo) {
      const [a, b] = [thuTu.indexOf(neo), thuTu.indexOf(ma)].sort((x, y) => x - y)
      setChon(new Set(thuTu.slice(a, b + 1)))
    } else if (e.metaKey || e.ctrlKey) {
      setChon((c) => {
        const moi = new Set(c)
        if (!moi.delete(ma)) moi.add(ma)
        return moi
      })
      setNeo(ma)
    } else setNeo(ma)
    e.currentTarget.focus()
  }

  /** Bấm/gõ thẳng vào nút ô Hạn (không phải qua menu) → lượt sửa mới chỉ cho dòng đó. */
  const batDauHan = (e: SyntheticEvent<HTMLElement>) => {
    if (e.currentTarget.contains(e.target as Node)) phienHan.current = null
  }

  const soChon = chon.size

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-6 pb-32 md:px-6 md:pt-8">
      <header className="flex flex-col gap-3 border-none border-current">
        <div className="flex flex-wrap items-center gap-2 border-none border-current">
          <Badge variant="soft" color="warning">Prototype vứt đi</Badge>
          <Badge variant="soft" color="info">Menu thuộc tính kiểu Linear</Badge>
        </div>
        <h1 className="m-0 ds-heading-lg">Menu thuộc tính trên bảng ticket</h1>
        <Card className="flex flex-col gap-2">
          <div className="ds-heading-xs">Bấm gì để thấy — ba cách mở, cùng một menu</div>
          <ol className="m-0 flex list-decimal flex-col gap-1.5 pl-5 ds-text-sm text-muted-foreground">
            <li>
              <span className="text-foreground">Chuột phải</span> vào một dòng (hoặc <Kbd>⇧</Kbd> <Kbd>F10</Kbd> khi dòng đang focus).
            </li>
            <li>
              Bấm nút <span className="text-foreground">…</span> cuối dòng.
            </li>
            <li>
              <span className="text-foreground">Bàn phím:</span> bấm một dòng để chọn, <Kbd>↑</Kbd> <Kbd>↓</Kbd> đổi dòng, rồi <Kbd>S</Kbd> trạng thái ·{' '}
              <Kbd>A</Kbd> người làm · <Kbd>P</Kbd> ưu tiên · <Kbd>L</Kbd> nhãn (menu mở thẳng vào menu con) ·{' '}
              <KbdGroup>
                <Kbd>⇧</Kbd>
                <Kbd>D</Kbd>
              </KbdGroup>{' '}
              ô chọn hạn. Trong menu đang mở cũng bấm được các phím này.
            </li>
          </ol>
          <p className="m-0 ds-text-sm text-muted-foreground">
            Chọn nhiều: tick cột đầu, hoặc <Kbd>⇧</Kbd>/<Kbd>Ctrl</Kbd>/<Kbd>⌘</Kbd> + bấm dòng. Mở menu trên dòng thuộc vùng chọn → đầu menu ghi
            “3 ticket” và áp cho cả vùng; dòng ngoài vùng → chỉ dòng đó. <Kbd>Esc</Kbd> bỏ chọn. Mỗi lần đổi có toast “Hoàn tác”.
          </p>
          <p className="m-0 ds-text-sm">
            <a href="#bang" className="text-inherit underline">
              Tới bảng #bang
            </a>
          </p>
          <p className="m-0 ds-text-sm font-medium text-(--color-text-warning)">
            DS còn thiếu, prototype đang tạm dựng từ primitive radix-ui + class menu-styles: menu con (Sub/SubTrigger/SubContent) · Radio/Checkbox
            của ContextMenu · CheckboxItem “một phần” · Kbd trong mục menu · dòng đang trỏ (cursor) của Table.
          </p>
        </Card>
        <div className="flex flex-wrap items-center gap-3 border-none border-current">
          <span className="ds-text-sm text-muted-foreground">Ô chọn hạn</span>
          <ToggleGroup type="single" aria-label="Ô chọn hạn" value={bienThe} onValueChange={(v) => v && setBienThe(v as BienThe)}>
            <ToggleGroupItem value="A4" size="sm">
              A4 · gõ ngày + giờ (đã chốt)
            </ToggleGroupItem>
            <ToggleGroupItem value="A2" size="sm">
              A2 · lịch + cột giờ
            </ToggleGroupItem>
            <ToggleGroupItem value="A5" size="sm">
              A5 · mốc nhanh + lịch
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </header>

      <section id="bang" className="scroll-mt-6 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="p-0 overflow-hidden">
          <TableWrap>
            <Table layout="fixed" className="min-w-4xl" aria-label="Ticket demo">
              <colgroup>
                <col className="w-10" />
                <col className="w-20" />
                <col />
                <col className="w-32" />
                <col className="w-40" />
                <col className="w-24" />
                <col className="w-28" />
                <col className="w-12" />
              </colgroup>
              <TableHeader>
                <TableRow>
                  <TableHead className={cotChon}>
                    <Checkbox
                      aria-label="Chọn mọi ticket"
                      checked={soChon === ds.length ? true : soChon ? 'indeterminate' : false}
                      onCheckedChange={(c) => setChon(new Set(c === true ? thuTu : []))}
                    />
                  </TableHead>
                  <TableHead>Mã</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Người làm</TableHead>
                  <TableHead>Ưu tiên</TableHead>
                  <TableHead>Hạn</TableHead>
                  <TableHead>
                    <span className="sr-only">Thao tác</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody ref={bang}>
                {ds.map((t) => {
                  const tt = TRANG_THAI.find((x) => x.id === t.trangThai)!
                  const ut = UU_TIEN.find((x) => x.id === t.uuTien)!
                  const daChon = chon.has(t.ma)
                  const mNut: Mo = { ma: t.ma, kieu: 'nut' }
                  const mChuot: Mo = { ma: t.ma, kieu: 'chuot' }
                  const dangMo = mo?.ma === t.ma ? mo : null
                  const dich = ds.filter((x) => dichCua(t.ma, chon, thuTu).includes(x.ma))
                  const menu = (loai: 'nut' | 'chuot') => (
                    <NoiDungMenu
                      loai={loai}
                      dich={dich}
                      sub={sub}
                      doiSub={doiSub}
                      quaPhim={!!dangMo?.quaPhim}
                      xongPhim={xongPhim}
                      doi={doiCho(
                        dich.map((x) => x.ma),
                        t.ma,
                      )}
                    />
                  )
                  return (
                    <ContextMenu key={t.ma} open={dangMo?.kieu === 'chuot'} onOpenChange={(o) => doiMenu(mChuot, o)}>
                      <ContextMenuTrigger asChild>
                        <TableRow
                          chon={daChon}
                          // ContextMenuTrigger asChild gắn data-state open/closed lên dòng → đè "selected" của TableRow; trả lại ở đây.
                          data-state={daChon ? 'selected' : undefined}
                          data-ma={t.ma}
                          data-con-tro={t.ma === conTro ? '' : undefined}
                          tabIndex={t.ma === conTro ? 0 : -1}
                          aria-keyshortcuts="S A P L Shift+D Shift+F10"
                          onClick={(e) => bamDong(e, t.ma)}
                          onMouseDown={(e) => (e.shiftKey || e.metaKey || e.ctrlKey) && e.preventDefault()}
                          onFocus={(e) => e.currentTarget.contains(e.target as Node) && setConTro(t.ma)}
                          className={cn(
                            'cursor-default [outline:none] focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-2 focus-visible:outline-(--ring)',
                            'not-data-[state=selected]:data-con-tro:[&>td]:bg-(--alpha-04)',
                          )}
                        >
                          <TableCell className={cotChon}>
                            <Checkbox
                              aria-label={`Chọn ${t.ma}`}
                              checked={daChon}
                              onCheckedChange={(c) => {
                                setChon((s) => {
                                  const moi = new Set(s)
                                  if (c === true) moi.add(t.ma)
                                  else moi.delete(t.ma)
                                  return moi
                                })
                                setNeo(t.ma)
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {/* .b-ma trên span, không trên td: nó mang border-none border-current → đè kẻ dưới của ô. */}
                            <span className={lopMa}>{t.ma}</span>
                          </TableCell>
                          <TableCell>
                            <span className="flex min-w-0 items-center gap-2 border-none border-current">
                              <span className="truncate">{t.tieuDe}</span>
                              {t.nhan.map((id) => {
                                const n = NHAN.find((x) => x.id === id)!
                                return (
                                  <Badge variant="soft" key={id} color={n.color} className="shrink-0">
                                    {n.ten}
                                  </Badge>
                                )
                              })}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1.5 border-none border-current [&>svg]:size-4 [&>svg]:shrink-0">
                              <tt.Icon aria-hidden="true" weight={tt.dam} className={tt.mau ?? 'text-muted-foreground'} />
                              <span className="truncate">{tt.ten}</span>
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1.5 border-none border-current">
                              {t.nguoiLam ? (
                                <>
                                  <Avatar size="sm" aria-hidden="true">
                                    <AvatarFallback>{chuCaiDau(tenNguoi(t.nguoiLam))}</AvatarFallback>
                                  </Avatar>
                                  <span className="truncate">{tenNguoi(t.nguoiLam)}</span>
                                </>
                              ) : (
                                <span className="text-(--color-text-tertiary)">Chưa giao</span>
                              )}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1.5 border-none border-current [&>svg]:size-4 [&>svg]:shrink-0">
                              <ut.Icon aria-hidden="true" weight={ut.dam} className={ut.mau ?? 'text-muted-foreground'} />
                              <span className="truncate">{ut.ten}</span>
                            </span>
                          </TableCell>
                          <TableCell data-o-han={t.ma} onPointerDownCapture={batDauHan} onKeyDownCapture={batDauHan}>
                            <ChonHan key={bienThe} gon ma={t.ma} value={t.han} onValueChange={(han) => doiHan(t.ma, han)} />
                          </TableCell>
                          <TableCell>
                            <DropdownMenu open={dangMo?.kieu === 'nut'} onOpenChange={(o) => doiMenu(mNut, o)}>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm" aria-label={`Thao tác ${t.ma}`}>
                                  <DotsThree weight="bold" aria-hidden="true" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                aria-label={`Thuộc tính ${tenDich(dich.map((x) => x.ma))}`}
                                onCloseAutoFocus={(e) => sauMenu(e, t.ma)}
                                onKeyDownCapture={(e) => phimTrongMenu(e, mNut)}
                              >
                                {menu('nut')}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      </ContextMenuTrigger>
                      <ContextMenuContent
                        aria-label={`Thuộc tính ${tenDich(dich.map((x) => x.ma))}`}
                        onCloseAutoFocus={(e) => sauMenu(e, t.ma)}
                        onKeyDownCapture={(e) => phimTrongMenu(e, mChuot)}
                      >
                        {menu('chuot')}
                      </ContextMenuContent>
                    </ContextMenu>
                  )
                })}
              </TableBody>
            </Table>
          </TableWrap>
        </Card>

        <Card className="flex flex-col gap-3 self-start bg-(--sidebar)">
          <div className="ds-heading-xs">Đang lưu</div>
          <div className="ds-text-xs text-muted-foreground">
            Con trỏ: {conTro} · Đã chọn: {soChon ? [...chon].join(', ') : 'không'}
          </div>
          <pre data-dang-luu className="m-0 overflow-x-auto ds-text-xs font-mono text-foreground whitespace-pre-wrap break-all">
            {ds.map((t) => JSON.stringify(t)).join('\n')}
          </pre>
        </Card>
      </section>
    </div>
  )
}
