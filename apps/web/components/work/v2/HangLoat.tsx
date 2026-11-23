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
import { useRef, useState, type ReactNode } from 'react'
import {
  ArrowsClockwise,
  CalendarBlank,
  CheckCircle,
  DotsThree,
  Flag,
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
 * Xoá hai nhịp. Bấm "Xoá…" → hộp mở ngay, con số điền vào khi `xemTruocXoa` về. Danh sách id chốt lúc đếm — nộp đúng
 * danh sách đó kèm `dau_van`. Xoá xong: toast, hộp đóng rồi mới bỏ chọn (thanh — và hộp trong nó — biến mất sau cùng).
 */
function XoaViec({ ids, dang, xong }: { ids: number[]; dang: boolean; xong: () => void }) {
  const [mo, setMo] = useState(false)
  const [xt, setXt] = useState<XemTruocXoa | null>(null)
  const [idsXoa, setIdsXoa] = useState<number[]>([])
  const [loi, setLoi] = useState<string | null>(null)
  const luot = useRef(0)
  const daXoa = useRef(false)

  async function moHoi() {
    const lan = ++luot.current
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
      xong()
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

  return (
    <>
      <Button variant="destructive" size="sm" disabled={dang} onClick={() => void moHoi()}>
        <Trash aria-hidden="true" />
        Xoá…
      </Button>
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
            <AlertTitle>
              {xt.tu_sinh} việc trong đó là việc tự sinh — cron sẽ dựng lại sau tối đa 15 phút.
            </AlertTitle>
            <AlertDescription>
              Luật đang bật: {xt.luat_dang_bat.join(' · ')}. Muốn xoá cho hẳn thì tắt luật ở /work/tu-sinh trước,
              rồi mới xoá.
            </AlertDescription>
          </Alert>
        )}
      </ConfirmDialog>
    </>
  )
}

/**
 * Thanh hàng loạt cho việc: Đánh dấu xong · Đổi trạng thái (kèm Huỷ việc) · Gán người · Đổi hạn · Thêm (Đổi ưu tiên ·
 * Đổi team · Bỏ người) · Xoá.
 * `xong` chạy sau khi ghi thành công (thường `router.refresh()`); lựa chọn được bỏ ở đây.
 */
export function ThanhHangLoatViec({ nenTang, xong }: { nenTang: NenTang; xong: () => void }) {
  const { daChon, soDong, boChonHet } = useDaChon()
  const [dang, setDang] = useState(false)
  const ids = daChon.map(Number)
  const ketThuc = () => {
    boChonHet()
    xong()
  }
  async function chay(input: Input, moTa: string) {
    setDang(true)
    try {
      const kq = await hangLoat(ids, input)
      bao(moTa, kq)
      if (kq.ok) ketThuc()
    } catch (e) {
      // Action bị reject (mất mạng, phiên deploy lệch) — không để thanh khoá cứng tới khi tải lại.
      thongBao.loi(`${moTa}: chưa xong — ${e instanceof Error ? e.message : 'mất kết nối'}`)
    } finally {
      setDang(false)
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
