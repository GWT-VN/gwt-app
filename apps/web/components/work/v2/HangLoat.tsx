'use client'

/**
 * Thao tác hàng loạt của các màn Việc v2 — cắm vào `ThanhDaChon` của bang/ (BulkActionBar DS, `CauHinhBangDs
 * thanhHangLoat="surface"`), đọc lựa chọn qua `useDaChon` nên phải nằm trong `KhungChon`.
 *
 * - Mỗi nút gọi đúng MỘT lượt RPC cho cả mớ (`hangLoat`), không lặp n lần — rớt mạng giữa chừng thì không dở dang.
 * - Bỏ qua vì QUYỀN (`bo_qua`) và vì PHỤ THUỘC (`bi_chan`) báo tách hai câu: gộp chung thì người ta đi xin quyền, trong
 *   khi thứ cần làm là xong việc chặn.
 * - Xoá hai nhịp: `xemTruocXoa` đếm thứ SẼ mất (gồm việc con xoá lây theo cascade `parent_id`) → ConfirmDialog → bấm
 *   xoá mới nộp lại `dau_van` cho `xoaHangLoat` (danh sách đổi giữa hai nhịp là server từ chối). Việc tự sinh mà luật
 *   còn bật thì cron 15 phút dựng lại — hộp phải nói ra, không thì xoá xong 15 phút sau thấy y nguyên.
 */
import { createContext, useContext, useRef, useState, type ReactNode } from 'react'
import {
  ArrowsClockwise,
  CalendarBlank,
  CheckCircle,
  DotsThree,
  Flag,
  SidebarSimple,
  Trash,
  UserMinus,
  UsersThree,
  UserSwitch,
} from '@phosphor-icons/react/ssr'
import { boDau, isoNgay, useDaChon } from '@/bang'
import { hienNgay } from '@/bang/ngay'
import type { MucChon } from '@/bang/OChonGoiY'
import {
  hangLoat,
  xemTruocXoa,
  xoaHangLoat,
  type KQ,
  type KetQuaHangLoat,
  type NenTang,
  type XemTruocXoa,
} from '@/app/work/actions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { ComboboxPanel } from '@/components/ui/combobox'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu'
import { calendarFoot, calendarFootClear, calendarPop } from '@/components/ui/date-picker'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  MenuTimKiem,
} from '@/components/ui/dropdown-menu'
import { TuFocusMenuCon } from '@/components/ui/menu-them'
import { menuContent } from '@/components/ui/menu-styles'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { thongBao } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import { hanLuu, TT, UU, VAI } from './chung'

type Input = Parameters<typeof hangLoat>[1]

/** Kết quả hàng loạt → một câu toast. */
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

/** Pop chọn một mục (Popover + ComboboxPanel — > 10 mục bắt buộc gõ để tìm, CHUAN-FILTER luật 2). */
export function ChonMuc({
  nut,
  nhan,
  options,
  onChon,
  goiY = 'Gõ tên hoặc email…',
  side = 'top',
}: {
  nut: ReactNode
  nhan: string
  options: MucChon[]
  onChon: (m: MucChon) => void
  goiY?: string
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
          searchPlaceholder={goiY}
          onSelect={(m) => {
            setMo(false)
            onChon(m)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

/** Đổi hạn: lịch DS trong pop (mặt như DatePicker). Chỉ ngày → 17:00 ngày đó (`hanLuu`); "Xoá hạn" → bỏ hạn. */
function DoiHan({ dang, chay }: { dang: boolean; chay: (input: Input, moTa: string) => void }) {
  const [mo, setMo] = useState(false)
  const homNay = isoNgay(new Date())
  const dat = (ngay: string) => {
    setMo(false)
    chay({ due: hanLuu(ngay) }, `Đã đặt hạn ${hienNgay(ngay)}`)
  }
  return (
    <Popover open={mo} onOpenChange={setMo}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" disabled={dang}>
          <CalendarBlank aria-hidden="true" />
          Đổi hạn
        </Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Chọn hạn mới" side="top" className={calendarPop}>
        <Calendar mode="single" autoFocus onSelect={(d) => d && dat(isoNgay(d))} />
        <div className={calendarFoot}>
          <Button
            variant="ghost"
            size="sm"
            className={calendarFootClear}
            onClick={() => {
              setMo(false)
              chay({ xoa_due: true }, 'Đã xoá hạn')
            }}
          >
            Xoá hạn
          </Button>
          <Button variant="outline" size="sm" onClick={() => dat(homNay)}>
            Hôm nay
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** Menu con có ô gõ để tìm khi quá 10 mục (CHUAN-FILTER luật 2). */
function MenuCon({
  nhan,
  icon,
  muc,
  goiY,
  chon,
}: {
  nhan: string
  icon?: ReactNode
  muc: { khoa: string; nhan: ReactNode; tim: string; onChon: () => void }[]
  goiY: string
  chon?: ReactNode
}) {
  const [q, setQ] = useState('')
  const tim = boDau(q.trim())
  const ds = muc.filter((m) => !tim || boDau(m.tim).includes(tim))
  return (
    <DropdownMenuSub onOpenChange={(m) => !m && setQ('')}>
      <DropdownMenuSubTrigger>
        {icon}
        {nhan}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {muc.length > 10 && <MenuTimKiem value={q} onValueChange={setQ} placeholder={goiY} />}
        {ds.map((m) => (
          <DropdownMenuItem key={m.khoa} onSelect={m.onChon}>
            {m.nhan}
          </DropdownMenuItem>
        ))}
        {chon}
        <TuFocusMenuCon />
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}

/**
 * "Thêm" — thao tác ít dùng gom vào một menu để thanh không vượt vùng nội dung (thanh nổi giữa màn, 10 nút ở 1440 đã
 * đè sang cột menu trái): Đổi ưu tiên · Đổi team · Bỏ người.
 */
function ThemThaoTac({
  nenTang,
  dang,
  chay,
}: {
  nenTang: NenTang
  dang: boolean
  chay: (input: Input, moTa: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={dang}>
          <DotsThree aria-hidden="true" />
          Thêm
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start">
        <MenuCon
          nhan="Đổi ưu tiên"
          icon={<Flag aria-hidden="true" />}
          goiY="Tìm mức…"
          muc={UU.map((u) => ({
            khoa: u.gt,
            nhan: u.nhan,
            tim: u.chu ?? u.gt,
            onChon: () => chay({ priority: Number(u.gt) }, `Đã đổi ưu tiên sang ${u.chu}`),
          }))}
        />
        <MenuCon
          nhan="Đổi team"
          icon={<UsersThree aria-hidden="true" />}
          goiY="Tìm team…"
          muc={nenTang.teams.map((t) => ({
            khoa: String(t.id),
            nhan: t.name,
            tim: `${t.key} ${t.name}`,
            onChon: () => chay({ team_id: t.id }, `Đã chuyển sang team ${t.name}`),
          }))}
          chon={
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => chay({ xoa_team: true }, 'Đã bỏ team')}>Bỏ team</DropdownMenuItem>
            </>
          }
        />
        <MenuCon
          nhan="Bỏ người"
          icon={<UserMinus aria-hidden="true" />}
          goiY="Gõ tên hoặc email…"
          muc={nenTang.nhan_su.map((n) => ({
            khoa: n.id,
            nhan: n.ten,
            tim: `${n.ten} ${n.email}`,
            onChon: () => chay({ bo_ai: n.id }, `Đã bỏ ${n.ten}`),
          }))}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Xoá hai nhịp. `moHoi(ids, sau)` → hộp mở ngay, con số điền vào khi `xemTruocXoa` về. Danh sách id chốt lúc đếm — nộp
 * đúng danh sách đó kèm `dau_van`. Xoá xong: toast, hộp đóng rồi mới gọi `sau` (thanh hàng loạt: bỏ chọn + làm mới).
 * Trả `hop` để bên gọi đặt ở chỗ SỐNG LÂU hơn nút mở (menu chuột phải đóng là gỡ mục — hộp không được nằm trong menu).
 */
function useXoaViec() {
  const [mo, setMo] = useState(false)
  const [xt, setXt] = useState<XemTruocXoa | null>(null)
  const [idsXoa, setIdsXoa] = useState<number[]>([])
  const [loi, setLoi] = useState<string | null>(null)
  const luot = useRef(0)
  const daXoa = useRef(false)
  const sauRef = useRef<() => void>(() => {})

  async function moHoi(ids: number[], sau: () => void) {
    const lan = ++luot.current
    sauRef.current = sau
    setIdsXoa(ids)
    setXt(null)
    setLoi(null)
    setMo(true)
    const kq = await xemTruocXoa(ids).catch((e: unknown) => ({
      ok: false as const,
      loi: e instanceof Error ? e.message : 'mất kết nối',
    }))
    if (lan !== luot.current) return
    if (!kq.ok) {
      setMo(false)
      thongBao.loi(`Chưa đếm được việc sẽ xoá — ${kq.loi}`)
      return
    }
    setXt(kq.duLieu)
  }
  async function xoa() {
    if (!xt?.dau_van) return
    setLoi(null)
    const kq = await xoaHangLoat(idsXoa, xt.dau_van)
    if (!kq.ok) {
      setLoi(`Chưa xoá được — ${kq.loi}`)
      throw new Error(kq.loi)
    }
    const { da_xoa, bo_qua } = kq.duLieu
    thongBao.xong(
      [`Đã xoá ${da_xoa} việc`, bo_qua > 0 && `bỏ qua ${bo_qua} việc bạn không có quyền xoá`]
        .filter(Boolean)
        .join(' · '),
    )
    daXoa.current = true
  }
  function doiMo(m: boolean) {
    if (m) return
    luot.current++
    setMo(false)
    if (daXoa.current) {
      daXoa.current = false
      sauRef.current()
    }
  }

  const khongQuyen = xt != null && xt.se_xoa === 0
  const mocLai = !!xt && xt.tu_sinh > 0 && xt.luat_dang_bat.length > 0
  const kem = xt
    ? [
        xt.binh_luan > 0 && `${xt.binh_luan} bình luận`,
        xt.nhat_ky > 0 && `${xt.nhat_ky} dòng nhật ký`,
        xt.chip > 0 && `${xt.chip} chip đã gắn`,
      ].filter(Boolean)
    : []
  const hauQua =
    xt && !khongQuyen
      ? [
          `Xoá vĩnh viễn ${xt.se_xoa} việc${
            xt.viec_con > 0 ? ` — trong đó ${xt.viec_con} việc con bị xoá lây theo mà bạn không chọn trực tiếp` : ''
          }.`,
          kem.length > 0 && `Mất kèm: ${kem.join(' · ')}.`,
          xt.bo_qua > 0 && `Bỏ qua ${xt.bo_qua} việc bạn không có quyền xoá.`,
        ].filter((x): x is string => !!x)
      : undefined

  const hop = (
    <ConfirmDialog
      open={mo}
      onOpenChange={doiMo}
      pha
      color="danger"
      icon={<Trash />}
      tieuDe={xt && !khongQuyen ? `Xoá ${xt.se_xoa} việc? Không khôi phục được` : 'Xoá việc đã chọn?'}
      moTa={
        !xt
          ? 'Đang đếm việc sẽ mất…'
          : khongQuyen
            ? `Bạn không có quyền xoá việc nào trong ${idsXoa.length} việc đã chọn.`
            : undefined
      }
      hauQua={hauQua}
      nutXacNhan={xt && !khongQuyen ? `Xoá ${xt.se_xoa} việc` : 'Xoá việc'}
      khoaXacNhan={!xt?.dau_van || khongQuyen}
      loi={loi}
      onXacNhan={xoa}
    >
      {mocLai && (
        <Alert color="warning">
          <AlertTitle>{xt.tu_sinh} việc trong đó là việc tự sinh — cron sẽ dựng lại sau tối đa 15 phút.</AlertTitle>
          <AlertDescription>
            Luật đang bật: {xt.luat_dang_bat.join(' · ')}. Muốn xoá cho hẳn thì tắt luật ở /work/tu-sinh trước, rồi mới
            xoá.
          </AlertDescription>
        </Alert>
      )}
    </ConfirmDialog>
  )
  return { moHoi, hop }
}

/** Nút "Xoá…" của thanh hàng loạt. */
function XoaViec({ ids, dang, xong }: { ids: number[]; dang: boolean; xong: () => void }) {
  const { moHoi, hop } = useXoaViec()
  return (
    <>
      <Button variant="destructive" size="sm" disabled={dang} onClick={() => void moHoi(ids, xong)}>
        <Trash aria-hidden="true" />
        Xoá…
      </Button>
      {hop}
    </>
  )
}

/** Chạy một lệnh hàng loạt trên `ids` + toast; xong (ok) → `sau`. */
function useChayHangLoat() {
  const [dang, setDang] = useState(false)
  async function chay(ids: number[], input: Input, moTa: string, sau: () => void) {
    setDang(true)
    try {
      const kq = await hangLoat(ids, input)
      bao(moTa, kq)
      if (kq.ok) sau()
    } catch (e) {
      // Action bị reject (mất mạng, phiên deploy lệch) — không để thanh khoá cứng tới khi tải lại.
      thongBao.loi(`${moTa}: chưa xong — ${e instanceof Error ? e.message : 'mất kết nối'}`)
    } finally {
      setDang(false)
    }
  }
  return { dang, chay }
}

/**
 * Thanh hàng loạt cho việc: Đánh dấu xong · Đổi trạng thái (kèm Huỷ việc) · Gán người · Đổi hạn · Thêm (Đổi ưu tiên ·
 * Đổi team · Bỏ người) · Xoá.
 * `xong` chạy sau khi ghi thành công (thường `router.refresh()`); lựa chọn được bỏ ở đây.
 */
export function ThanhHangLoatViec({ nenTang, xong }: { nenTang: NenTang; xong: () => void }) {
  const { daChon, soDong, boChonHet } = useDaChon()
  const ids = daChon.map(Number)
  const ketThuc = () => {
    boChonHet()
    xong()
  }
  const hl = useChayHangLoat()
  const dang = hl.dang
  const chay = (input: Input, moTa: string) => hl.chay(ids, input, moTa, ketThuc)
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
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void chay({ status: 'cancelled' }, 'Đã huỷ việc')}>Huỷ việc</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* RPC work_hang_loat chỉ THÊM người theo vai — không có vai Chính (nó không hạ người chính cũ → 2 người chính). */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={dang}>
            <UserSwitch aria-hidden="true" />
            Gán người
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" aria-label={`Gán người cho ${soDong} việc`}>
          {(['doer', 'reviewer', 'watcher'] as const).map((vai) => (
            <MenuCon
              key={vai}
              nhan={VAI[vai]}
              goiY="Gõ tên hoặc email…"
              muc={nenTang.nhan_su.map((n) => ({
                khoa: n.id,
                nhan: n.ten,
                tim: `${n.ten} ${n.email}`,
                onChon: () => void chay({ gan_ai: n.id, gan_vai: vai }, `Đã gán ${n.ten} (${VAI[vai]})`),
              }))}
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DoiHan dang={dang} chay={(i, m) => void chay(i, m)} />
      <ThemThaoTac nenTang={nenTang} dang={dang} chay={(i, m) => void chay(i, m)} />
      <XoaViec ids={ids} dang={dang} xong={ketThuc} />
    </>
  )
}

/* ---------- Menu chuột phải của dòng việc ---------- */

type ThaoTacViec = { nenTang: NenTang; xong: () => void; xoa: (ids: number[], sau: () => void) => void }
const ThaoTacCtx = createContext<ThaoTacViec | null>(null)

/**
 * Bọc quanh màn có danh sách việc (cùng chỗ `KhungChon`): cấp nền tảng + làm mới cho menu chuột phải của dòng, và giữ
 * HỘP XOÁ ở đây (menu đóng là gỡ mục — hộp phải sống ngoài menu).
 */
export function KhungThaoTacViec({ nenTang, xong, children }: { nenTang: NenTang; xong: () => void; children: ReactNode }) {
  const { moHoi, hop } = useXoaViec()
  return (
    <ThaoTacCtx.Provider value={{ nenTang, xong, xoa: (ids, sau) => void moHoi(ids, sau) }}>
      {children}
      {hop}
    </ThaoTacCtx.Provider>
  )
}

/** Menu con của menu chuột phải; > 10 mục thì có ô gõ để tìm (CHUAN-FILTER luật 2). */
function MenuConPhai({
  nhan,
  icon,
  muc,
  goiY,
  chon,
}: {
  nhan: string
  icon?: ReactNode
  muc: { khoa: string; nhan: ReactNode; tim: string; onChon: () => void }[]
  goiY: string
  chon?: ReactNode
}) {
  const [q, setQ] = useState('')
  const tim = boDau(q.trim())
  const ds = muc.filter((m) => !tim || boDau(m.tim).includes(tim))
  return (
    <ContextMenuSub onOpenChange={(m) => !m && setQ('')}>
      <ContextMenuSubTrigger>
        {icon}
        {nhan}
      </ContextMenuSubTrigger>
      <ContextMenuSubContent>
        {muc.length > 10 && <MenuTimKiem value={q} onValueChange={setQ} placeholder={goiY} />}
        {ds.map((m) => (
          <ContextMenuItem key={m.khoa} onSelect={m.onChon}>
            {m.nhan}
          </ContextMenuItem>
        ))}
        {chon}
        <TuFocusMenuCon />
      </ContextMenuSubContent>
    </ContextMenuSub>
  )
}

/**
 * Menu chuột phải của MỘT dòng việc (CEO 27/11 "menu trạng thái cho chuột phải là hiện ra hết ở đây" — đủ thao tác của
 * thanh hàng loạt; bỏ "Sao chép mã / đường dẫn"). Đối tượng: dòng đang bấm NẰM TRONG lựa chọn (≥ 2 dòng) → cả lựa chọn
 * (như Notion/Linear), không thì chỉ dòng đó. Ngoài `KhungThaoTacViec` → chỉ còn "Xem nhanh".
 */
export function MenuThaoTacViec({ id, moViec }: { id: number; moViec: (id: number) => void }) {
  const ctx = useContext(ThaoTacCtx)
  const { daChon, boChonHet } = useDaChon()
  const { chay } = useChayHangLoat()
  const xem = (
    <ContextMenuItem onSelect={() => moViec(id)}>
      <SidebarSimple aria-hidden="true" />
      Xem nhanh
    </ContextMenuItem>
  )
  if (!ctx) return xem
  const theoChon = daChon.includes(String(id)) && daChon.length > 1
  const ids = theoChon ? daChon.map(Number) : [id]
  const sau = () => {
    if (theoChon) boChonHet()
    ctx.xong()
  }
  const lam = (input: Input, moTa: string) => void chay(ids, input, moTa, sau)
  // Ngày tính LÚC BẤM (không lúc vẽ — hàm thuần): 0 = hôm nay, 1 = mai.
  const datHan = (them: number) => {
    const d = new Date()
    d.setDate(d.getDate() + them)
    const n = isoNgay(d)
    lam({ due: hanLuu(n) }, `Đã đặt hạn ${hienNgay(n)}`)
  }
  return (
    <>
      {xem}
      <ContextMenuSeparator />
      <ContextMenuItem onSelect={() => lam({ status: 'done' }, 'Đã đánh dấu xong')}>
        <CheckCircle aria-hidden="true" />
        {theoChon ? `Đánh dấu xong ${ids.length} việc` : 'Đánh dấu xong'}
      </ContextMenuItem>
      <MenuConPhai
        nhan="Đổi trạng thái"
        icon={<ArrowsClockwise aria-hidden="true" />}
        goiY="Tìm trạng thái…"
        muc={TT.map((t) => ({ khoa: t.gt, nhan: t.nhan, tim: t.nhan, onChon: () => lam({ status: t.gt }, `Đã chuyển sang ${t.nhan}`) }))}
        chon={
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={() => lam({ status: 'cancelled' }, 'Đã huỷ việc')}>Huỷ việc</ContextMenuItem>
          </>
        }
      />
      <MenuConPhai
        nhan="Gán người"
        icon={<UserSwitch aria-hidden="true" />}
        goiY="Gõ tên hoặc email…"
        muc={ctx.nenTang.nhan_su.map((n) => ({
          khoa: n.id,
          nhan: n.ten,
          tim: `${n.ten} ${n.email}`,
          onChon: () => lam({ gan_ai: n.id, gan_vai: 'doer' }, `Đã gán ${n.ten}`),
        }))}
      />
      <MenuConPhai
        nhan="Đổi hạn"
        icon={<CalendarBlank aria-hidden="true" />}
        goiY="Tìm…"
        muc={[
          { khoa: 'nay', nhan: 'Hôm nay', tim: 'hom nay', onChon: () => datHan(0) },
          { khoa: 'mai', nhan: 'Ngày mai', tim: 'ngay mai', onChon: () => datHan(1) },
        ]}
        chon={
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={() => lam({ xoa_due: true }, 'Đã xoá hạn')}>Xoá hạn</ContextMenuItem>
          </>
        }
      />
      <MenuConPhai
        nhan="Đổi ưu tiên"
        icon={<Flag aria-hidden="true" />}
        goiY="Tìm mức…"
        muc={UU.map((u) => ({
          khoa: u.gt,
          nhan: u.nhan,
          tim: u.chu ?? u.gt,
          onChon: () => lam({ priority: Number(u.gt) }, `Đã đổi ưu tiên sang ${u.chu}`),
        }))}
      />
      <MenuConPhai
        nhan="Đổi team"
        icon={<UsersThree aria-hidden="true" />}
        goiY="Tìm team…"
        muc={ctx.nenTang.teams.map((t) => ({
          khoa: String(t.id),
          nhan: t.name,
          tim: `${t.key} ${t.name}`,
          onChon: () => lam({ team_id: t.id }, `Đã chuyển sang team ${t.name}`),
        }))}
        chon={
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={() => lam({ xoa_team: true }, 'Đã bỏ team')}>Bỏ team</ContextMenuItem>
          </>
        }
      />
      <MenuConPhai
        nhan="Bỏ người"
        icon={<UserMinus aria-hidden="true" />}
        goiY="Gõ tên hoặc email…"
        muc={ctx.nenTang.nhan_su.map((n) => ({
          khoa: n.id,
          nhan: n.ten,
          tim: `${n.ten} ${n.email}`,
          onChon: () => lam({ bo_ai: n.id }, `Đã bỏ ${n.ten}`),
        }))}
      />
      <ContextMenuSeparator />
      <ContextMenuItem variant="destructive" onSelect={() => ctx.xoa(ids, sau)}>
        <Trash aria-hidden="true" />
        {theoChon ? `Xoá ${ids.length} việc…` : 'Xoá…'}
      </ContextMenuItem>
    </>
  )
}
