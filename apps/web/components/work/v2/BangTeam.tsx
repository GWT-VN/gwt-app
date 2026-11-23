'use client'

/**
 * "Bảng team" v2 — ghép Data view DS theo canvas WorkBangTeam (CEO duyệt 23/11): DataViewToolbar (tìm bo tròn, Tạo việc, tab
 * Mọi người · Gấp, ⚙ + dạng xem) · FilterBar (chip điều kiện + "Thêm người") · Table / ListView / KanbanBoard · thanh hàng
 * loạt mặt nổi. Lọc / sắp / tab ở URL (docs/CHUAN-FILTER.md): `tab`, `q`, `nguoi` (staff id, phẩy), `tt` (trạng thái,
 * phẩy), `cot`/`chieu`. Dữ liệu + quyền qua server action cũ (app/work/actions.ts); lọc chạy trên các việc RPC đã cho xem.
 *
 * ponytail: tab "Lâu không đụng" + cột "Cập nhật" chưa làm — `work_bang_team` chưa trả `updated_at`.
 */
import { KhungXemViec, useXemViec } from './KhungXemViec'
import { Suspense, useState, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowsClockwise, CheckCircle, Plus, UserPlus, UserSwitch } from '@phosphor-icons/react/ssr'
import {
  boDau,
  hrefBoLoc,
  KhungChon,
  OChonDong,
  OChonTatCa,
  OTimKiem,
  ThanhDaChon,
  ThanhDangLoc,
  useDaChon,
} from '@/bang'
import type { MucChon } from '@/bang/OChonGoiY'
import {
  doiTrangThai,
  ganNguoi,
  hangLoat,
  keoTha,
  suaViec,
  type KQ,
  type KetQuaHangLoat,
  type NenTang,
  type ViecTeamRow,
} from '@/app/work/actions'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { Button } from '@/components/ui/button'
import { ComboboxPanel } from '@/components/ui/combobox'
import { CaiDatHienThi, DataViewToolbar, TrangDuLieu, type DangXem } from '@/components/ui/data-view-toolbar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { OSuaChu, OSuaHan, OSuaNguoi, OSuaNhan, OSuaTrangThai } from '@/components/ui/inline-edit'
import { KanbanBoard, NoiDungThe, type TheKanban } from '@/components/ui/kanban-board'
import { ListView, NhanDau, NutMoMa, type CotDanhSach } from '@/components/ui/list-view'
import { menuContent } from '@/components/ui/menu-styles'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { thongBao } from '@/components/ui/sonner'
import { BangTrangThai, Table, TableBody, TableCell, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import { CHON_BANG } from '@/components/ui/table-styles'
import { Tabs, TabsCount, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TieuDeCot, type MucLoc } from '@/components/ui/tieu-de-cot'
import { useCotBang, type CotBang } from '@/components/ui/use-cot-bang'
import { cn } from '@/lib/utils'
import { nhanChip, nhanHan, soNgayToiHan } from '@/lib/work'
import { chac, HanChu, hanLuu, hanO, NguoiChinh, TT, UU, type Uu } from './chung'

type Tab = 'moi' | 'gap'
const TAB: { v: Tab; ten: string }[] = [
  { v: 'moi', ten: 'Mọi người' },
  { v: 'gap', ten: 'Gấp' },
]
const XONG = new Set(['done', 'cancelled'])
/** Gấp = chưa xong và (P1 hoặc quá hạn / hạn hôm nay) — chip FilterBar của canvas. */
const laGap = (v: ViecTeamRow) =>
  !XONG.has(v.status) && (v.priority === 1 || (!!v.due_at && soNgayToiHan(v.due_at) <= 0))

const COT: CotBang[] = [
  {
    id: 'uu',
    ten: 'Ưu tiên',
    rong: 76,
    kieu: 'sap',
    nghia: { tang: 'Gấp trước', giam: 'Thấp trước' },
  },
  {
    id: 'ma',
    ten: 'Mã',
    rong: 104,
    kieu: 'sap',
    nghia: { tang: 'Cũ nhất trước', giam: 'Mới tạo trước' },
  },
  { id: 'viec', ten: 'Việc', rong: 280, kieu: 'thuong', khoa: true },
  { id: 'tt', ten: 'Trạng thái', rong: 124, kieu: 'loc' },
  { id: 'nguoi', ten: 'Người', rong: 160, kieu: 'thuong' },
  {
    id: 'han',
    ten: 'Hạn',
    rong: 116,
    kieu: 'sap',
    phai: true,
    nghia: { tang: 'Gần hạn nhất trước', giam: 'Xa hạn nhất trước' },
  },
]
const TEN_COT = { uu: 'Ưu tiên', ma: 'Mã', han: 'Hạn' }
const NGHIA = {
  uu: { asc: 'gấp trước', desc: 'thấp trước' },
  ma: { asc: 'cũ nhất trước', desc: 'mới tạo trước' },
  han: { asc: 'gần hạn nhất trước', desc: 'xa hạn nhất trước' },
}
type Sap = { cot: string; tang: boolean }
/** So sánh theo cột; việc không hạn luôn cuối; khoá phụ id (CHUAN-FILTER luật 2). */
function soSanh(s: Sap) {
  const huong = s.tang ? 1 : -1
  return (a: ViecTeamRow, b: ViecTeamRow) => {
    if (s.cot === 'han' && !a.due_at !== !b.due_at) return a.due_at ? -1 : 1
    const c =
      s.cot === 'uu'
        ? a.priority - b.priority
        : s.cot === 'han' && a.due_at && b.due_at
          ? Date.parse(a.due_at) - Date.parse(b.due_at)
          : s.cot === 'ma'
            ? a.id - b.id
            : 0
    return c * huong || a.id - b.id
  }
}

const chinhCua = (v: ViecTeamRow) => v.assignees.find((a) => a.role === 'owner') ?? v.assignees[0]
const ganVoi = (v: ViecTeamRow) =>
  [v.team_name, v.links?.[0] ? nhanChip(v.links[0]).ten : v.sub_n ? `${v.sub_n} việc con` : '']
    .filter(Boolean)
    .join(' · ')
const chuoiTim = (v: ViecTeamRow) =>
  boDau(
    [
      v.ref,
      v.title,
      v.creator_ten,
      ...(v.links ?? []).map((l) => nhanChip(l).ten),
      ...v.assignees.map((a) => a.ten),
    ].join(' '),
  )
const dsUrl = (s: string | null) => (s ? s.split(',').filter(Boolean) : [])

/** Kết quả hàng loạt → một câu toast (bỏ qua vì QUYỀN khác bỏ qua vì PHỤ THUỘC — giữ như bản cũ). */
function bao(moTa: string, kq: KQ<KetQuaHangLoat>) {
  if (!kq.ok) return thongBao.loi(`${moTa}: chưa xong — ${kq.loi}`)
  const { da_sua, bo_qua, bi_chan } = kq.duLieu
  thongBao.xong(
    [
      `${moTa}: ${da_sua} việc`,
      bo_qua > 0 && `bỏ qua ${bo_qua} việc bạn không có quyền sửa`,
      (bi_chan ?? 0) > 0 && `${bi_chan} việc còn việc khác chặn`,
    ]
      .filter(Boolean)
      .join(' · '),
  )
}

/** Pop chọn người (Popover + ComboboxPanel — > 10 người bắt buộc gõ để tìm, CHUAN-FILTER luật 2). */
function ChonNguoi({
  nut,
  nhan,
  options,
  onChon,
  side = 'top',
}: {
  nut: ReactNode
  nhan: string
  options: MucChon[]
  onChon: (m: MucChon) => void
  side?: 'top' | 'bottom'
}) {
  const [mo, setMo] = useState(false)
  return (
    <Popover open={mo} onOpenChange={setMo}>
      <PopoverTrigger asChild>{nut}</PopoverTrigger>
      <PopoverContent
        aria-label={nhan}
        side={side}
        align="start"
        className={cn(
          menuContent,
          'w-auto min-w-[240px] max-w-[calc(100vw-16px)] max-h-(--radix-popover-content-available-height)',
        )}
      >
        <ComboboxPanel
          value={null}
          options={options}
          searchPlaceholder="Gõ tên hoặc email…"
          onSelect={(m) => {
            setMo(false)
            onChon(m)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

/** Thao tác hàng loạt (canvas): Đánh dấu xong · Đổi trạng thái · Gán người. Một lượt RPC cho cả mớ. */
function HangLoat({
  nguoi,
  idCua,
  xong,
}: {
  nguoi: MucChon[]
  idCua: (gt: string) => string | undefined
  xong: () => void
}) {
  const { daChon, soDong, boChonHet } = useDaChon()
  const [dang, setDang] = useState(false)
  async function chay(input: Parameters<typeof hangLoat>[1], moTa: string) {
    setDang(true)
    const kq = await hangLoat(daChon.map(Number), input)
    setDang(false)
    bao(moTa, kq)
    if (kq.ok) {
      boChonHet()
      xong()
    }
  }
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        disabled={dang}
        onClick={() => void chay({ status: 'done' }, 'Đã đánh dấu xong')}
      >
        <CheckCircle aria-hidden="true" />
        Đánh dấu xong
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={dang}>
            <ArrowsClockwise aria-hidden="true" />
            Đổi trạng thái
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start">
          {TT.map((t) => (
            <DropdownMenuItem key={t.gt} onSelect={() => void chay({ status: t.gt }, `Đã chuyển sang ${t.nhan}`)}>
              {t.nhan}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {/* ponytail: RPC work_hang_loat chỉ THÊM người (vai Làm cùng), không thay người chính — nhãn nói đúng việc nó làm. */}
      <ChonNguoi
        nhan={`Thêm người làm cho ${soDong} việc`}
        options={nguoi}
        onChon={(m) => {
          const id = idCua(m.gt)
          if (id) void chay({ gan_ai: id, gan_vai: 'doer' }, `Đã gán ${m.nhan}`)
        }}
        nut={
          <Button variant="ghost" size="sm" disabled={dang}>
            <UserSwitch aria-hidden="true" />
            Gán người
          </Button>
        }
      />
    </>
  )
}

/** Dòng bảng: ô chọn của bang/ + nền chọn. */
function DongBang({ v, children }: { v: ViecTeamRow; children: ReactNode }) {
  const { daChon } = useDaChon()
  return (
    <TableRow chon={daChon.includes(String(v.id))}>
      <OChonDong khoa={String(v.id)} moTa={`việc ${v.ref}`} />
      {children}
    </TableRow>
  )
}

export function BangTeam({
  rows,
  nenTang,
  onMo,
  nutTao,
}: {
  rows: ViecTeamRow[]
  nenTang: NenTang
  /** Mở thẻ xem nhanh / chi tiết (màn nối). */
  onMo?: (id: number) => void
  /** Nút "Tạo việc" (màn nối dialog). Không truyền → nút trơn. */
  nutTao?: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const spRo = useSearchParams()
  const sp = new URLSearchParams(spRo.toString())
  const [dangXem, setDangXem] = useState<DangXem>('bang')
  const xemViec = useXemViec()
  const c = useCotBang(COT, { url: true })

  // ── URL → điều kiện ──
  const tab: Tab = sp.get('tab') === 'gap' ? 'gap' : 'moi'
  const q = sp.get('q') ?? ''
  const nguoiLoc = dsUrl(sp.get('nguoi'))
  const ttLoc = dsUrl(sp.get('tt')).filter((t) => TT.some((x) => x.gt === t))
  const cotUrl = ['uu', 'ma', 'han'].includes(sp.get('cot') ?? '') ? sp.get('cot')! : null
  const sap: Sap = cotUrl
    ? { cot: cotUrl, tang: sp.get('chieu') !== 'desc' }
    : { cot: tab === 'gap' ? 'han' : 'uu', tang: true }

  const datUrl = (sua: Record<string, string | null>) => {
    const p = new URLSearchParams(sp)
    for (const [k, gt] of Object.entries(sua)) {
      if (gt) p.set(k, gt)
      else p.delete(k)
    }
    p.delete('trang')
    router.replace(`${pathname}${p.size ? `?${p}` : ''}`, { scroll: false })
  }
  const datSap = (s: Sap | null) =>
    datUrl({
      cot: s?.cot ?? null,
      chieu: s ? (s.tang ? 'asc' : 'desc') : null,
    })

  // ── Nhân sự: ComboboxPanel hiện `gt` như mã → dùng email (đọc được, phân biệt trùng tên), map về staff id. ──
  const nhanSu = nenTang.nhan_su
  const gtCua = (s: { id: string; email: string }) => s.email || s.id
  const options: MucChon[] = nhanSu.map((s) => ({ gt: gtCua(s), nhan: s.ten }))
  const idCua = (gt: string) => nhanSu.find((s) => gtCua(s) === gt)?.id
  const tenCua = (id: string) => nhanSu.find((s) => s.id === id)?.ten ?? id

  // ── Lọc + sắp ──
  const tim = boDau(q.trim())
  const nguon = { moi: rows, gap: rows.filter(laGap) }
  const dong = nguon[tab]
    .filter(
      (v) =>
        (!tim || chuoiTim(v).includes(tim)) &&
        (!nguoiLoc.length || v.assignees.some((a) => nguoiLoc.includes(a.staff_id))) &&
        (!ttLoc.length || ttLoc.includes(v.status)),
    )
    .sort(soSanh(sap))
  const thamSo = {
    tab,
    q: q || undefined,
    nguoi: nguoiLoc.join(',') || undefined,
    tt: ttLoc.join(',') || undefined,
    cot: cotUrl ?? undefined,
    chieu: cotUrl ? (sap.tang ? 'asc' : 'desc') : undefined,
  }

  const dieuKien = [
    tab === 'gap' && {
      nhan: 'Gấp',
      giaTri: 'quá hạn + hạn hôm nay + P1',
      href: hrefBoLoc(pathname, sp, 'tab'),
    },
    q && { nhan: 'Tìm', giaTri: q, href: hrefBoLoc(pathname, sp, 'q') },
    nguoiLoc.length > 0 && {
      nhan: 'Người làm',
      giaTri: nguoiLoc.map(tenCua).join(', '),
      href: hrefBoLoc(pathname, sp, 'nguoi'),
    },
    ttLoc.length > 0 && {
      nhan: 'Trạng thái',
      giaTri: ttLoc.map((t) => TT.find((x) => x.gt === t)!.nhan).join(', '),
      href: hrefBoLoc(pathname, sp, 'tt'),
    },
  ].filter((d): d is { nhan: string; giaTri: string; href: string } => !!d)

  // ── Ghi ──
  const lamMoi = () => router.refresh()
  const luu = async (p: Parameters<typeof chac>[0]) => {
    await chac(p)
    lamMoi()
  }
  /** Đổi người chính: gán người mới vai owner, hạ người chính cũ về Làm cùng (hai lệnh — xem đề xuất RPC). */
  async function doiChinh(v: ViecTeamRow, gt: string | null) {
    const id = gt && idCua(gt)
    if (!id) return
    const cu = v.assignees.find((a) => a.role === 'owner')
    await chac(ganNguoi(v.id, id, 'owner'))
    if (cu && cu.staff_id !== id) await chac(ganNguoi(v.id, cu.staff_id, 'doer'))
    lamMoi()
  }
  /** Kéo sang cột khác → nối cuối cột đích (KanbanBoard chưa có thứ tự trong cột). */
  async function chuyen(id: string, cot: string) {
    const cuoi = rows
      .filter((v) => v.status === cot)
      .reduce<number | undefined>((m, v) => (m === undefined ? v.sort_order : Math.max(m, v.sort_order)), undefined)
    await chac(keoTha(Number(id), cot, cuoi === undefined ? 0 : cuoi + 1))
    lamMoi()
  }

  const moViec = (id: number) => {
    xemViec.mo(id)
    onMo?.(id)
  }
  const oMa = (v: ViecTeamRow) => (
    // NutMoMa chỉ nổi cú bấm lên — ở Table không có onMo của ListView nên bắt tại đây.
    <span className="inline-flex" onClick={() => moViec(v.id)}>
      <NutMoMa ma={v.ref} luonHien />
    </span>
  )
  const o = (v: ViecTeamRow, id: string): ReactNode => {
    switch (id) {
      case 'uu':
        return (
          <OSuaNhan
            ma={v.ref}
            truong="ưu tiên"
            value={String(v.priority) as Uu}
            muc={UU}
            onLuu={(u) => luu(suaViec(v.id, { priority: Number(u) }))}
          />
        )
      case 'ma':
        return oMa(v)
      case 'viec':
        return <OSuaChu ma={v.ref} truong="tiêu đề" value={v.title} onLuu={(title) => luu(suaViec(v.id, { title }))} />
      case 'tt':
        return (
          <OSuaTrangThai ma={v.ref} value={{ tt: v.status }} muc={TT} onLuu={(g) => luu(doiTrangThai(v.id, g.tt))} />
        )
      case 'nguoi': {
        const n = chinhCua(v)
        const gt = n
          ? gtCua(
              nhanSu.find((s) => s.id === n.staff_id) ?? {
                id: n.staff_id,
                email: n.email,
              },
            )
          : null
        return (
          <OSuaNguoi
            ma={v.ref}
            truong="người chính"
            value={gt}
            options={options}
            mucDangChon={n && gt ? { gt, nhan: n.ten } : undefined}
            gon={(c.doRong.nguoi ?? 160) < 112}
            onLuu={(moi) => doiChinh(v, moi)}
          />
        )
      }
      case 'han':
        return (
          <OSuaHan
            ma={v.ref}
            value={hanO(v.due_at)}
            onLuu={(h) => luu(suaViec(v.id, { due: hanLuu(h) }))}
            hien={() => <HanChu due={v.due_at} />}
          />
        )
    }
  }

  const tuyChonTt = TT.filter((t) => rows.some((v) => v.status === t.gt)).map((t) => ({
    giaTri: t.gt,
    nhan: t.nhan,
    color: t.color as MucLoc['color'],
  }))
  const tongRong = 36 + c.hien.reduce((t, x) => t + c.doRong[x.id], 0)

  const bang = (
    <TableWrap>
      <Table layout="fixed" style={{ minWidth: tongRong }}>
        <colgroup>
          <col style={{ width: 36 }} />
          {c.hien.map((x) => (
            // Cột Việc ăn phần dư (canvas `<col>` không rộng).
            <col key={x.id} style={x.id === 'viec' ? undefined : { width: c.doRong[x.id] }} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow>
            <OChonTatCa nhan="việc" />
            {c.hien.map((x, i) => (
              <TieuDeCot
                key={x.id}
                cot={x}
                viTri={i}
                menuPhai={i === c.hien.length - 1}
                coDan={x.id === 'viec' ? undefined : { rong: c.doRong[x.id], onDoi: (px) => c.coDan(x.id, px) }}
                sap={
                  x.kieu === 'sap'
                    ? {
                        chieu: sap.cot === x.id ? (sap.tang ? 'tang' : 'giam') : null,
                        onDoi: (ch) => datSap(ch ? { cot: x.id, tang: ch === 'tang' } : null),
                      }
                    : undefined
                }
                loc={
                  x.kieu === 'loc'
                    ? {
                        tuyChon: tuyChonTt,
                        daChon: ttLoc,
                        onDoi: (gt) => datUrl({ tt: gt.join(',') || null }),
                      }
                    : undefined
                }
              />
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {dong.map((v) => (
            <DongBang key={v.id} v={v}>
              {c.hien.map((x) => (
                <TableCell key={x.id} cot={x.id} phai={x.phai}>
                  {o(v, x.id)}
                </TableCell>
              ))}
            </DongBang>
          ))}
        </TableBody>
      </Table>
    </TableWrap>
  )

  const cotDs: CotDanhSach<ViecTeamRow>[] = [
    {
      id: 'viec',
      ten: 'Việc',
      rong: 'minmax(0,2.4fr)',
      dienThoai: 'tren',
      o: (v) => (
        <>
          <NhanDau gon>{o(v, 'uu')}</NhanDau>
          <NutMoMa ma={v.ref} />
          {o(v, 'viec')}
        </>
      ),
    },
    {
      id: 'gan',
      ten: 'Team · gắn với',
      rong: 'minmax(0,1fr)',
      anKhiHep: true,
      dienThoai: 'duoi',
      o: (v) => <span className="min-w-0 truncate text-muted-foreground">{ganVoi(v)}</span>,
    },
    {
      id: 'tt',
      ten: 'Trạng thái',
      rong: '120px',
      dienThoai: 'duoiPhai',
      o: (v) => o(v, 'tt'),
    },
    {
      id: 'han',
      ten: 'Hạn',
      rong: '104px',
      phai: true,
      dienThoai: 'trenPhai',
      o: (v) => o(v, 'han'),
    },
    {
      id: 'chinh',
      ten: 'Chính',
      rong: '40px',
      anKhiHep: true,
      o: (v) => <NguoiChinh nguoi={v.assignees} />,
    },
  ]

  const the: TheKanban[] = dong
    .filter((v) => TT.some((t) => t.gt === v.status))
    .sort((a, b) => a.sort_order - b.sort_order || a.priority - b.priority || a.id - b.id)
    .map((v) => {
      const n = v.due_at ? soNgayToiHan(v.due_at) : null
      return {
        id: String(v.id),
        cot: v.status,
        ten: v.ref,
        noiDung: (
          <NoiDungThe
            nhan={UU.find((u) => u.gt === String(v.priority))?.nhan}
            khach={v.title}
            viec={ganVoi(v) || undefined}
            ma={v.ref}
            han={
              v.due_at
                ? {
                    chu: nhanHan(v.due_at),
                    kieu: n! < 0 ? 'tre' : n === 0 ? 'homNay' : undefined,
                  }
                : undefined
            }
            chu={chinhCua(v)?.ten}
          />
        ),
      }
    })

  const xem =
    rows.length === 0 ? (
      <BangTrangThai
        trangThai="rongThat"
        tieuDe="Chưa có việc nào"
        moTa="Việc bạn được xem sẽ hiện ở đây. Tạo việc đầu tiên cho team."
        hanhDong={nutTao}
      />
    ) : dong.length === 0 ? (
      <BangTrangThai
        trangThai="rongLoc"
        tieuDe="Không có việc nào khớp bộ lọc"
        moTa="Thử bỏ bớt điều kiện ở thanh lọc."
        onXoaLoc={() => router.replace(pathname, { scroll: false })}
      />
    ) : dangXem === 'kanban' ? (
      <KanbanBoard
        cot={TT.map((t) => ({ id: t.gt, nhan: t.nhan, color: t.color }))}
        the={the}
        onChuyen={chuyen}
        onMo={(id) => moViec(Number(id))}
      />
    ) : dangXem === 'danh-sach' ? (
      <ListView aria-label="Bảng team" cot={cotDs} dong={dong} khoa={(v) => String(v.id)} onMo={(v) => moViec(v.id)} />
    ) : (
      bang
    )

  return (
    <KhungXemViec ds={dong} nenTang={nenTang}>
      <TrangDuLieu>
        <CauHinhBangDs
          giaoDien={{ ...O_TIM_PILL, ...CHON_BANG }}
          thanhHangLoat="surface"
          tenCot={TEN_COT}
          nghiaSapXep={NGHIA}
        >
          <DataViewToolbar
            tieuDe="Bảng team"
            dem={{ thay: dong.length, tong: rows.length }}
            timKiem={
              <Suspense>
                <OTimKiem placeholder="Tìm tiêu đề, mã việc, khách…" aria-label="Tìm việc" />
              </Suspense>
            }
            nutChinh={
              nutTao ?? (
                <Button>
                  <Plus aria-hidden="true" />
                  Tạo việc
                </Button>
              )
            }
            tabs={
              <Tabs value={tab} onValueChange={(t) => datUrl({ tab: t === 'moi' ? null : t })}>
                <TabsList variant="pill" aria-label="Nhóm việc">
                  {TAB.map((t) => (
                    <TabsTrigger key={t.v} value={t.v}>
                      {t.ten}{' '}
                      <TabsCount color={t.v === 'gap' && nguon.gap.length ? 'danger' : undefined}>
                        {nguon[t.v].length}
                      </TabsCount>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            }
            caiDat={
              <CaiDatHienThi
                dangXem={dangXem}
                onDoiXem={setDangXem}
                cot={COT}
                cotAn={c.an}
                onCotAn={(an) => COT.forEach((x) => c.anHien(x.id, !an.includes(x.id)))}
                sapXep={sap}
                onSapXep={datSap}
              />
            }
            dangXem={dangXem}
            onDoiXem={setDangXem}
            xemNhanh={xemViec.id != null}
            onXemNhanh={(bat) => (bat ? dong[0] && xemViec.mo(dong[0].id) : xemViec.dong())}
          />

          <ThanhDangLoc
            dieuKien={dieuKien}
            hienThi={dong.length}
            tong={rows.length}
            nhan="việc"
            sapXep={cotUrl ? { ...sap, macDinh: false } : undefined}
            phai={
              <ChonNguoi
                nhan="Lọc theo người làm"
                side="bottom"
                options={options.filter((m) => !nguoiLoc.includes(idCua(m.gt) ?? ''))}
                onChon={(m) => {
                  const id = idCua(m.gt)
                  if (id) datUrl({ nguoi: [...nguoiLoc, id].join(',') })
                }}
                nut={
                  <Button variant="outline" size="sm">
                    <UserPlus aria-hidden="true" />
                    Thêm người
                  </Button>
                }
              />
            }
          />

          <KhungChon
            khoaTrang={dong.map((v) => String(v.id))}
            tong={dong.length}
            bat={dangXem === 'bang'}
            thamSo={thamSo}
          >
            {xem}
            <ThanhDaChon nhan="việc">
              <HangLoat nguoi={options} idCua={idCua} xong={lamMoi} />
            </ThanhDaChon>
          </KhungChon>
        </CauHinhBangDs>
      </TrangDuLieu>
    </KhungXemViec>
  )
}
