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
  DropdownMenuTrigger,
  MenuTimKiem,
} from '@/components/ui/dropdown-menu'
import { TuFocusMenuCon } from '@/components/ui/menu-them'
import { menuContent } from '@/components/ui/menu-styles'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { thongBao } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import { hanLuu, TT, UU } from './chung'
import { chonNhanSu } from './DangXemViec'

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

/** Đổi team: menu các team (> 10 thì có ô gõ để tìm) + "Bỏ team". */
function DoiTeam({
  teams,
  dang,
  chay,
}: {
  teams: NenTang['teams']
  dang: boolean
  chay: (input: Input, moTa: string) => void
}) {
  const [q, setQ] = useState('')
  const tim = boDau(q.trim())
  const ds = teams.filter((t) => !tim || boDau(`${t.key} ${t.name}`).includes(tim))
  return (
    <DropdownMenu onOpenChange={(m) => !m && setQ('')}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={dang}>
          <UsersThree aria-hidden="true" />
          Đổi team
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start">
        {teams.length > 10 && <MenuTimKiem value={q} onValueChange={setQ} placeholder="Tìm team…" />}
        {ds.map((t) => (
          <DropdownMenuItem key={t.id} onSelect={() => chay({ team_id: t.id }, `Đã chuyển sang team ${t.name}`)}>
            {t.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => chay({ xoa_team: true }, 'Đã bỏ team')}>Bỏ team</DropdownMenuItem>
        {teams.length > 10 && <TuFocusMenuCon />}
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
    const kq = await xemTruocXoa(ids)
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
 * Thanh hàng loạt cho việc: Đánh dấu xong · Đổi trạng thái (kèm Huỷ việc) · Gán người · Bỏ người · Đổi ưu tiên · Đổi hạn ·
 * Đổi team · Xoá.
 * `xong` chạy sau khi ghi thành công (thường `router.refresh()`); lựa chọn được bỏ ở đây.
 */
export function ThanhHangLoatViec({ nenTang, xong }: { nenTang: NenTang; xong: () => void }) {
  const { daChon, soDong, boChonHet } = useDaChon()
  const [dang, setDang] = useState(false)
  const ns = chonNhanSu(nenTang.nhan_su)
  const ids = daChon.map(Number)
  const ketThuc = () => {
    boChonHet()
    xong()
  }
  async function chay(input: Input, moTa: string) {
    setDang(true)
    const kq = await hangLoat(ids, input)
    setDang(false)
    bao(moTa, kq)
    if (kq.ok) ketThuc()
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
      {/* ponytail: RPC work_hang_loat chỉ THÊM người (vai Làm cùng), không thay người chính — nhãn nói đúng việc. */}
      <ChonMuc
        nhan={`Thêm người làm cho ${soDong} việc`}
        options={ns.options}
        onChon={(m) => {
          const id = ns.idCua(m.gt)
          if (id) void chay({ gan_ai: id, gan_vai: 'doer' }, `Đã gán ${m.nhan}`)
        }}
        nut={
          <Button variant="ghost" size="sm" disabled={dang}>
            <UserSwitch aria-hidden="true" />
            Gán người
          </Button>
        }
      />
      <ChonMuc
        nhan={`Bỏ người khỏi ${soDong} việc`}
        options={ns.options}
        onChon={(m) => {
          const id = ns.idCua(m.gt)
          if (id) void chay({ bo_ai: id }, `Đã bỏ ${m.nhan}`)
        }}
        nut={
          <Button variant="ghost" size="sm" disabled={dang}>
            <UserMinus aria-hidden="true" />
            Bỏ người
          </Button>
        }
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={dang}>
            <Flag aria-hidden="true" />
            Đổi ưu tiên
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start">
          {UU.map((u) => (
            <DropdownMenuItem
              key={u.gt}
              onSelect={() => void chay({ priority: Number(u.gt) }, `Đã đổi ưu tiên sang ${u.chu}`)}
            >
              {u.nhan}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DoiHan dang={dang} chay={(i, m) => void chay(i, m)} />
      <DoiTeam teams={nenTang.teams} dang={dang} chay={(i, m) => void chay(i, m)} />
      <XoaViec ids={ids} dang={dang} xong={ketThuc} />
    </>
  )
}
