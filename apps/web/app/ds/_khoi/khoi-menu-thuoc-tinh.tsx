'use client'

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { CalendarBlank, CellSignalHigh, CircleHalf, DotsThree, Tag, UserCircle } from '@phosphor-icons/react/ssr'
import { chonTheoBam } from '@/bang/ChonDong'
import { boDau } from '@/bang/timkiem'
import { Avatar, AvatarFallback, chuCaiDau } from '@/components/ui/avatar'
import { Badge, BadgeDot } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  MenuTimKiem,
} from '@/components/ui/dropdown-menu'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import { cotChon, ma as lopMa } from '@/components/ui/table-styles'
import { thongBao } from '@/components/ui/toast'
import { hienNgayGioGon } from '@/lib/gio'
import { laOGo, usePhimTat } from '@/lib/phim-tat'
import { BienThe, KhoiHang } from '../_khung/tam'
import {
  CHUA_GIAO,
  dichCua,
  HOM_NAY,
  NGUOI,
  NHAN,
  phimMuc,
  PHIM_SUB,
  tenDich,
  TICKET_DAU,
  TRANG_THAI,
  UU_TIEN,
  type Sub,
  type Ticket,
  type TrangThai,
  type UuTien,
} from './khoi-menu-thuoc-tinh-du-lieu'

/**
 * #menu-thuoc-tinh — MẪU GHÉP (không phải component mới): menu thuộc tính kiểu Linear trên bảng ticket, ghép hoàn toàn
 * từ component DS lát 7 (menu con + Kbd + ✓ một phần của DropdownMenu/ContextMenu, dòng đang trỏ của Table, `usePhimTat`,
 * `chonTheoBam`, DateTimePicker mở từ ngoài, toast Hoàn tác). Nguồn: prototype app/prototype/menu-thuoc-tinh (CEO duyệt
 * 20/11). Hướng dẫn ghép: ds/nguon/components/MenuThuocTinh/README.md.
 */

/**
 * Bộ component của MỘT họ menu. Cùng nội dung menu vẽ cho cả nút … (DropdownMenu) lẫn chuột phải (ContextMenu) — hai họ
 * cùng API nhưng context Radix riêng, nên chọn bộ theo nơi mở. Toàn component DS, không primitive.
 */
const KIT_NUT = {
  Label: DropdownMenuLabel,
  Separator: DropdownMenuSeparator,
  Item: DropdownMenuItem,
  RadioGroup: DropdownMenuRadioGroup,
  RadioItem: DropdownMenuRadioItem,
  CheckboxItem: DropdownMenuCheckboxItem,
  Shortcut: DropdownMenuShortcut,
  Sub: DropdownMenuSub,
  SubTrigger: DropdownMenuSubTrigger,
  SubContent: DropdownMenuSubContent,
}
type Kit = typeof KIT_NUT
const KIT: Record<'nut' | 'chuot', Kit> = {
  nut: KIT_NUT,
  chuot: {
    // Label/Separator/Item của ContextMenu khai kiểu theo primitive ContextMenu (props trùng Dropdown) → ép về Kit.
    Label: ContextMenuLabel as Kit['Label'],
    Separator: ContextMenuSeparator as Kit['Separator'],
    Item: ContextMenuItem as Kit['Item'],
    RadioGroup: ContextMenuRadioGroup,
    RadioItem: ContextMenuRadioItem,
    CheckboxItem: ContextMenuCheckboxItem,
    Shortcut: ContextMenuShortcut,
    Sub: ContextMenuSub,
    SubTrigger: ContextMenuSubTrigger,
    SubContent: ContextMenuSubContent,
  },
}

type Doi = {
  trangThai(v: TrangThai): void
  nguoiLam(v: string | null): void
  uuTien(v: UuTien): void
  nhan(id: string, them: boolean): void
  /** "Đặt hạn…": đóng menu, rồi mở ô chọn hạn neo vào ô Hạn của dòng. */
  han(): void
}

/**
 * Menu con mở bằng PHÍM (S/A/P/L trên dòng hoặc trong menu): DS chỉ tự focus mục ✓ khi focus đã nằm trong menu con —
 * Radix chỉ đưa focus vào menu con khi lần tương tác cuối là phím; chuột nhích giữa lúc bấm P và lúc menu con mở (mở qua
 * `open` từ ngoài, sau một rAF) là focus kẹt ở menu cha → tự đưa vào: ô tìm › mục đang ✓ › mục đầu.
 */
function TuFocus({ xong }: { xong(): void }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const m = ref.current?.closest<HTMLElement>('[role="menu"]')
      const dich =
        // Ô tìm (MenuTimKiem) — chọn theo thẻ input, không theo data-slot nội bộ của component.
        m?.querySelector<HTMLElement>('input') ??
        m?.querySelector<HTMLElement>('[aria-checked="true"]') ??
        m?.querySelector<HTMLElement>('[role^="menuitem"]')
      dich?.focus({ preventScroll: true })
      xong()
    })
    return () => cancelAnimationFrame(id)
  }, [xong])
  return <span ref={ref} hidden />
}

type Con = { K: Kit; sub: Sub | null; doiSub(id: Sub, mo: boolean): void; quaPhim: boolean; xongPhim(): void }

function MucCon({ K, id, sub, doiSub, quaPhim, xongPhim, icon, ten, children }: Con & { id: Sub; icon: ReactNode; ten: string; children: ReactNode }) {
  return (
    <K.Sub open={sub === id} onOpenChange={(o) => doiSub(id, o)}>
      <K.SubTrigger icon={icon} phim={[PHIM_SUB[id].toUpperCase()]}>
        {ten}
      </K.SubTrigger>
      <K.SubContent data-sub={id}>
        {children}
        {quaPhim && sub === id && <TuFocus xong={xongPhim} />}
      </K.SubContent>
    </K.Sub>
  )
}

/** Menu con Người làm: 13 mục (> 10) → ô gõ để tìm ở đầu (CHUAN-FILTER, `MenuTimKiem`). Đóng menu con = xoá chữ tìm. */
function ChonNguoi({ K, value, onChon }: { K: Kit; value: string; onChon(id: string): void }) {
  const [q, setQ] = useState('')
  const k = boDau(q).trim()
  const ds = [{ id: CHUA_GIAO, ten: 'Chưa giao' }, ...NGUOI].filter((n) => !k || boDau(n.ten).includes(k))
  return (
    <>
      <MenuTimKiem value={q} onValueChange={setQ} placeholder="Tìm người…" />
      {ds.length ? (
        <K.RadioGroup value={value} onValueChange={onChon}>
          {ds.map((n) => (
            <K.RadioItem key={n.id} value={n.id}>
              {n.id === CHUA_GIAO ? (
                <UserCircle aria-hidden="true" />
              ) : (
                <Avatar size="sm" aria-hidden="true">
                  <AvatarFallback>{chuCaiDau(n.ten)}</AvatarFallback>
                </Avatar>
              )}
              {n.ten}
            </K.RadioItem>
          ))}
        </K.RadioGroup>
      ) : (
        <K.Label>Không có ai khớp “{q}”</K.Label>
      )}
    </>
  )
}

function NoiDungMenu({ loai, dich, doi, ...con }: Omit<Con, 'K'> & { loai: 'nut' | 'chuot'; dich: Ticket[]; doi: Doi }) {
  const K = KIT[loai]
  const c = { K, ...con }
  /** Giá trị chung của các dòng đích; lệch nhau → '' (không ✓ mục nào). */
  const chung = (f: (t: Ticket) => string | null) => (dich.every((t) => f(t) === f(dich[0])) ? (f(dich[0]) ?? CHUA_GIAO) : '')
  return (
    <>
      <K.Label>{tenDich(dich.map((t) => t.ma))}</K.Label>
      <MucCon {...c} id="trang-thai" icon={<CircleHalf aria-hidden="true" />} ten="Trạng thái">
        <K.RadioGroup value={chung((t) => t.trangThai)} onValueChange={(v) => doi.trangThai(v as TrangThai)}>
          {TRANG_THAI.map((x) => (
            <K.RadioItem key={x.id} value={x.id}>
              <x.Icon aria-hidden="true" weight={x.dam} className={x.mau} />
              {x.ten}
            </K.RadioItem>
          ))}
        </K.RadioGroup>
      </MucCon>
      <MucCon {...c} id="nguoi-lam" icon={<UserCircle aria-hidden="true" />} ten="Người làm">
        <ChonNguoi K={K} value={chung((t) => t.nguoiLam)} onChon={(v) => doi.nguoiLam(v === CHUA_GIAO ? null : v)} />
      </MucCon>
      <MucCon {...c} id="uu-tien" icon={<CellSignalHigh aria-hidden="true" />} ten="Ưu tiên">
        <K.RadioGroup value={chung((t) => t.uuTien)} onValueChange={(v) => doi.uuTien(v as UuTien)}>
          {UU_TIEN.map((x) => (
            <K.RadioItem key={x.id} value={x.id}>
              <x.Icon aria-hidden="true" weight={x.dam} className={x.mau} />
              {x.ten}
            </K.RadioItem>
          ))}
        </K.RadioGroup>
      </MucCon>
      <MucCon {...c} id="nhan" icon={<Tag aria-hidden="true" />} ten="Nhãn">
        {NHAN.map((n) => {
          const co = dich.filter((t) => t.nhan.includes(n.id)).length
          return (
            <K.CheckboxItem
              key={n.id}
              checked={co === dich.length ? true : co ? 'indeterminate' : false}
              onCheckedChange={() => doi.nhan(n.id, co !== dich.length)}
              // Tick nhiều nhãn liền: giữ menu mở (luật menu NGUON).
              onSelect={(e) => e.preventDefault()}
            >
              {/* Chấm 6 đặt trong ô 16 = cột icon của các mục khác. */}
              <span className="grid size-4 shrink-0 place-content-center border-none border-current">
                <BadgeDot color={n.color} />
              </span>
              {n.ten}
            </K.CheckboxItem>
          )
        })}
      </MucCon>
      <K.Separator />
      <K.Item onSelect={doi.han}>
        <CalendarBlank aria-hidden="true" />
        Đặt hạn…
        <K.Shortcut phim={['⇧', 'D']} />
      </K.Item>
    </>
  )
}

/** Menu đang mở: dòng + nơi mở (nút … hay chuột phải); `quaPhim` = vừa mở/nhảy menu con bằng phím → tự focus menu con. */
type Mo = { ma: string; kieu: 'nut' | 'chuot'; quaPhim?: boolean }
/** Ô chọn hạn đang mở: neo ở ô Hạn của dòng `ma`, lưu cho `dich` (cả vùng chọn khi mở từ menu). */
type HanMo = { ma: string; dich: string[] }

const tenNguoi = (id: string | null) => NGUOI.find((n) => n.id === id)?.ten ?? 'Chưa giao'

function BangMenuThuocTinh() {
  const [ds, setDs] = useState(TICKET_DAU)
  const [conTro, setConTro] = useState(ds[0].ma)
  const [chon, setChon] = useState<string[]>([])
  const [neo, setNeo] = useState<string | null>(null)
  const [mo, setMo] = useState<Mo | null>(null)
  const [sub, setSub] = useState<Sub | null>(null)
  const [han, setHan] = useState<HanMo | null>(null)
  const than = useRef<HTMLTableSectionElement>(null)
  /** "Đặt hạn…" vừa chọn trong menu → mở ô chọn hạn SAU khi menu gỡ xong (onCloseAutoFocus), không giành focus với menu. */
  const diHan = useRef<HanMo | null>(null)

  const thuTu = ds.map((t) => t.ma)

  const focusDong = (ma: string) => {
    const d = than.current?.querySelector<HTMLTableRowElement>(`tr[data-ma="${ma}"]`)
    // Không cuộn cả <tr> (rộng hơn khung ở 390 → khung nhảy ngang); chỉ đưa ô đầu dòng vào tầm nhìn (khuôn khối Table).
    d?.focus({ preventScroll: true })
    d?.cells[0]?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }

  /**
   * Mở menu / pop bằng PHÍM: neo của nó (nút … hoặc ô Hạn) có thể đang nằm ngoài tầm nhìn của khung bảng cuộn ngang (390:
   * bảng 880 cuộn trong khung) → Radix bám neo nên menu ra ngoài màn (đo Chrome 390). Cuộn neo vào tầm nhìn trước.
   */
  const hienNeo = (ma: string, cot: 'menu' | 'han') =>
    than.current?.querySelector(`tr[data-ma="${ma}"] [data-cot="${cot}"]`)?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })

  /** Mở/đóng một menu. Đóng chỉ khi đúng menu đang mở (chuột phải dòng khác: dòng mới mở trước, dòng cũ báo đóng sau). */
  const doiMenu = (m: Mo, moRa: boolean) => {
    setMo((cu) => (moRa ? m : cu && cu.ma === m.ma && cu.kieu === m.kieu ? null : cu))
    if (moRa) {
      setSub(null)
      setConTro(m.ma)
    }
  }
  const doiSub = useCallback((id: Sub, moRa: boolean) => setSub((s) => (moRa ? id : s === id ? null : s)), [])
  const xongPhim = useCallback(() => setMo((m) => (m?.quaPhim ? { ...m, quaPhim: false } : m)), [])

  /** Đổi một trường cho các dòng đích + toast "Hoàn tác" khôi phục đúng giá trị cũ của TỪNG dòng. */
  function doiTruong<K extends 'trangThai' | 'nguoiLam' | 'uuTien' | 'nhan' | 'han'>(dich: string[], k: K, moi: (t: Ticket) => Ticket[K], chu: string) {
    const cu = Object.fromEntries(ds.filter((t) => dich.includes(t.ma)).map((t) => [t.ma, t[k]])) as Record<string, Ticket[K]>
    setDs((d) => d.map((t) => (dich.includes(t.ma) ? { ...t, [k]: moi(t) } : t)))
    thongBao.xong(chu, { hoanTac: () => setDs((d) => d.map((t) => (t.ma in cu ? { ...t, [k]: cu[t.ma] } : t))) })
  }

  function doiCho(dich: string[], ma: string): Doi {
    const ten = tenDich(dich)
    return {
      trangThai: (v) => doiTruong(dich, 'trangThai', () => v, `Đã đổi trạng thái ${ten} → ${TRANG_THAI.find((x) => x.id === v)?.ten}`),
      nguoiLam: (v) => doiTruong(dich, 'nguoiLam', () => v, `Đã đổi người làm ${ten} → ${tenNguoi(v)}`),
      uuTien: (v) => doiTruong(dich, 'uuTien', () => v, `Đã đổi ưu tiên ${ten} → ${UU_TIEN.find((x) => x.id === v)?.ten}`),
      nhan: (id, them) => {
        const n = NHAN.find((x) => x.id === id)?.ten
        doiTruong(
          dich,
          'nhan',
          (t) => (them ? [...new Set([...t.nhan, id])] : t.nhan.filter((x) => x !== id)),
          them ? `Đã thêm nhãn ${n} cho ${ten}` : `Đã gỡ nhãn ${n} khỏi ${ten}`,
        )
      },
      han: () => {
        diHan.current = { ma, dich }
      },
    }
  }

  function doiHan(dich: string[], v: string | null) {
    const ten = tenDich(dich)
    doiTruong(dich, 'han', () => v, v ? `Đã đặt hạn ${ten} → ${hienNgayGioGon(v)}` : `Đã xoá hạn ${ten}`)
  }

  /** Menu đóng: "Đặt hạn…" → mở ô chọn hạn; không thì focus về dòng (trừ khi người dùng đã focus chỗ khác). */
  function sauMenu(e: Event, ma: string) {
    e.preventDefault()
    const h = diHan.current
    diHan.current = null
    if (h) {
      hienNeo(h.ma, 'han')
      return setHan(h)
    }
    const a = document.activeElement
    if (!a || a === document.body || !a.isConnected || a.closest('[role="menu"]')) focusDong(ma)
  }

  /** Phím trong menu đang mở: S/A/P/L nhảy sang menu con, ⇧D = Đặt hạn. Ô tìm (Người làm) giữ phím để gõ. */
  function phimTrongMenu(e: KeyboardEvent, m: Mo) {
    const k = phimMuc({ ...e, isComposing: e.nativeEvent.isComposing, keyCode: e.nativeEvent.keyCode })
    if (!k || laOGo(e.target as Element)) return
    e.preventDefault()
    e.stopPropagation()
    if (k === 'han') {
      diHan.current = { ma: m.ma, dich: dichCua(m.ma, chon, thuTu) }
      setMo(null)
    } else {
      setSub(k)
      setMo((cu) => cu && { ...cu, quaPhim: true })
    }
  }

  /** Phím trên dòng đang trỏ: mở menu (neo nút … của dòng) thẳng vào menu con. */
  const moQuaPhim = (k: Sub) => {
    hienNeo(conTro, 'menu')
    setMo({ ma: conTro, kieu: 'nut', quaPhim: true })
    setSub(null)
    // Mở menu con SAU khi khung cha đã mount + tự focus (Radix không cho chặn cú focus đầu của khung cha; menu con mở
    // trước thì cú focus đó nằm ngoài menu con → nó đóng ngay) — đo ở prototype.
    requestAnimationFrame(() => setSub(k))
  }
  const doiDong = (buoc: 1 | -1) => {
    const den = thuTu[Math.min(thuTu.length - 1, Math.max(0, thuTu.indexOf(conTro) + buoc))]
    setConTro(den)
    focusDong(den)
  }

  // Phím tắt theo dòng — chỉ khi focus trong thân bảng; nhường ô gõ + IME (usePhimTat, R15). Menu/pop mở = focus ở portal
  // (ngoài vùng) → không bắn; Radix preventDefault Esc → Esc đóng menu không bỏ chọn.
  usePhimTat(
    {
      arrowdown: () => doiDong(1),
      arrowup: () => doiDong(-1),
      s: () => moQuaPhim('trang-thai'),
      a: () => moQuaPhim('nguoi-lam'),
      p: () => moQuaPhim('uu-tien'),
      l: () => moQuaPhim('nhan'),
      'shift+d': () => {
        hienNeo(conTro, 'han')
        setHan({ ma: conTro, dich: dichCua(conTro, chon, thuTu) })
      },
      escape: () => setChon([]),
    },
    { vung: than },
  )

  function bamDong(e: MouseEvent<HTMLTableRowElement>, ma: string) {
    // Sự kiện React nổi qua portal (menu, pop hạn là con React của dòng) — chỉ nhận cú bấm trong chính dòng.
    if (!e.currentTarget.contains(e.target as Node)) return
    setConTro(ma)
    if ((e.target as HTMLElement).closest('button, input, a')) return
    const kq = chonTheoBam(chon, neo, ma, thuTu, { mod: e.ctrlKey || e.metaKey, shift: e.shiftKey })
    setChon(kq.chon)
    setNeo(kq.neo)
    e.currentTarget.focus({ preventScroll: true })
  }

  const soChon = chon.length

  return (
    <TableWrap vien>
      <Table layout="fixed" className="min-w-[880px]" aria-label="Ticket demo — menu thuộc tính">
        <colgroup>
          <col className="w-9" />
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
                onCheckedChange={(c) => setChon(c === true ? thuTu : [])}
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
        <TableBody ref={than}>
          {ds.map((t) => {
            const tt = TRANG_THAI.find((x) => x.id === t.trangThai)!
            const ut = UU_TIEN.find((x) => x.id === t.uuTien)!
            const daChon = chon.includes(t.ma)
            const mNut: Mo = { ma: t.ma, kieu: 'nut' }
            const mChuot: Mo = { ma: t.ma, kieu: 'chuot' }
            const dangMo = mo?.ma === t.ma ? mo : null
            const dichMa = dichCua(t.ma, chon, thuTu)
            const dich = ds.filter((x) => dichMa.includes(x.ma))
            const nhanMenu = `Thuộc tính ${tenDich(dichMa)}`
            const menu = (loai: 'nut' | 'chuot') => (
              <NoiDungMenu
                loai={loai}
                dich={dich}
                sub={sub}
                doiSub={doiSub}
                quaPhim={!!dangMo?.quaPhim}
                xongPhim={xongPhim}
                doi={doiCho(dichMa, t.ma)}
              />
            )
            return (
              <ContextMenu key={t.ma} open={dangMo?.kieu === 'chuot'} onOpenChange={(o) => doiMenu(mChuot, o)}>
                <ContextMenuTrigger asChild>
                  <TableRow
                    data-ma={t.ma}
                    chon={daChon}
                    conTro={t.ma === conTro}
                    tabIndex={t.ma === conTro ? 0 : -1}
                    aria-keyshortcuts="S A P L Shift+D Shift+F10"
                    className="cursor-default"
                    onClick={(e) => bamDong(e, t.ma)}
                    // ⇧/Ctrl + bấm: chặn bôi đen chữ (mousedown mặc định) — focus dòng làm tay trong onClick.
                    onMouseDown={(e) => (e.shiftKey || e.metaKey || e.ctrlKey) && e.preventDefault()}
                    onFocus={(e) => e.currentTarget.contains(e.target) && setConTro(t.ma)}
                  >
                    <TableCell className={cotChon}>
                      <Checkbox
                        aria-label={`Chọn ${t.ma}`}
                        checked={daChon}
                        onCheckedChange={(c) => {
                          setChon((s) => (c === true ? [...s.filter((x) => x !== t.ma), t.ma] : s.filter((x) => x !== t.ma)))
                          setNeo(t.ma)
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <span className={lopMa}>{t.ma}</span>
                    </TableCell>
                    <TableCell>
                      <span className="flex min-w-0 items-center gap-2 border-none border-current">
                        <span className="truncate">{t.tieuDe}</span>
                        {t.nhan.map((id) => {
                          const n = NHAN.find((x) => x.id === id)!
                          return (
                            <Badge key={id} color={n.color} className="shrink-0">
                              {n.ten}
                            </Badge>
                          )
                        })}
                      </span>
                    </TableCell>
                    <TableCell cot="trang-thai">
                      <span className="flex items-center gap-1.5 border-none border-current [&>svg]:size-4 [&>svg]:shrink-0">
                        <tt.Icon aria-hidden="true" weight={tt.dam} className={tt.mau ?? 'text-muted-foreground'} />
                        <span className="truncate">{tt.ten}</span>
                      </span>
                    </TableCell>
                    <TableCell cot="nguoi-lam">
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
                    <TableCell cot="uu-tien">
                      <span className="flex items-center gap-1.5 border-none border-current [&>svg]:size-4 [&>svg]:shrink-0">
                        <ut.Icon aria-hidden="true" weight={ut.dam} className={ut.mau ?? 'text-muted-foreground'} />
                        <span className="truncate">{ut.ten}</span>
                      </span>
                    </TableCell>
                    <TableCell cot="han">
                      <DateTimePicker
                        gon
                        aria-label={`Hạn ${t.ma}`}
                        placeholder="Đặt hạn"
                        tuNgay={HOM_NAY}
                        value={t.han}
                        open={han?.ma === t.ma}
                        onOpenChange={(o) => setHan(o ? { ma: t.ma, dich: [t.ma] } : null)}
                        onValueChange={(v) => doiHan(han?.ma === t.ma ? han.dich : [t.ma], v)}
                      />
                    </TableCell>
                    <TableCell cot="menu">
                      <DropdownMenu open={dangMo?.kieu === 'nut'} onOpenChange={(o) => doiMenu(mNut, o)}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`Thao tác ${t.ma}`}>
                            <DotsThree weight="bold" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          aria-label={nhanMenu}
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
                  aria-label={nhanMenu}
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
  )
}

const HUONG_DAN = (
  <>
    Ba cách mở cùng một menu: chuột phải dòng (hoặc <Kbd>⇧</Kbd> <Kbd>F10</Kbd>), nút … cuối dòng, hoặc phím khi đang trỏ dòng —{' '}
    <Kbd>S</Kbd> trạng thái · <Kbd>A</Kbd> người làm · <Kbd>P</Kbd> ưu tiên · <Kbd>L</Kbd> nhãn (mở thẳng menu con) ·{' '}
    <KbdGroup>
      <Kbd>⇧</Kbd>
      <Kbd>D</Kbd>
    </KbdGroup>{' '}
    hạn. <Kbd>↑</Kbd> <Kbd>↓</Kbd> đổi dòng.
  </>
)
const HUONG_DAN_CHON = (
  <>
    Tick cột đầu, hoặc <Kbd>Ctrl</Kbd>/<Kbd>⌘</Kbd> + bấm (thêm/bớt), <Kbd>⇧</Kbd> + bấm (dải). Mở menu trên dòng trong vùng chọn → đầu
    menu “N ticket”, áp cả vùng; dòng ngoài vùng → chỉ dòng đó. <Kbd>Esc</Kbd> bỏ chọn. Mỗi lần đổi có toast “Hoàn tác”.
  </>
)

/** #menu-thuoc-tinh trần (/ds/tron). Mẫu ghép chưa có trong artifact → không có cổng so khớp riêng. */
export function KhoiMenuThuocTinh() {
  return (
    <section id="menu-thuoc-tinh" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#menu-thuoc-tinh">Menu thuộc tính</a>
      </h2>
      <div className="flex flex-col gap-3 border-none border-current">
        <p className="m-0 ds-text-sm text-muted-foreground">{HUONG_DAN}</p>
        <p className="m-0 ds-text-sm text-muted-foreground">{HUONG_DAN_CHON}</p>
        <BangMenuThuocTinh />
      </div>
    </section>
  )
}

/** #menu-thuoc-tinh dạng hàng (/ds). */
export function KhoiMenuThuocTinhHang() {
  return (
    <KhoiHang neo="menu-thuoc-tinh">
      <BienThe ten="Bấm thử" moTa={HUONG_DAN}>
        <BangMenuThuocTinh />
      </BienThe>
      <BienThe ten="Chọn nhiều" moTa={HUONG_DAN_CHON}>
        <p className="m-0 ds-text-sm text-muted-foreground">
          Dùng bảng ở hàng trên: chọn 3 dòng khác ưu tiên rồi bấm <Kbd>P</Kbd> — menu không ✓ mục nào (giá trị lệch nhau); đổi xong
          bấm “Hoàn tác” trả từng dòng về giá trị cũ của nó.
        </p>
      </BienThe>
    </KhoiHang>
  )
}
