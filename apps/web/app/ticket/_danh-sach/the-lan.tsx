'use client'

/**
 * Các lần lỗi = THẺ gập/mở (`TheGap`, CEO 27/11): đầu thẻ MỘT dòng căn giữa `Lần N · khách báo dd/MM · [trạng thái sửa
 * được]` + mũi tên; gập chỉ còn đầu thẻ (bỏ dòng tóm tắt). Trong thẻ: Khách báo +
 * Xử lý là ô chữ TRƠN gõ thẳng (như Mô tả bên Work — không nút "+ Ghi xử lý", không hộp), dưới Xử lý là "ai · lúc".
 * Thứ tự CŨ → MỚI, "+ Thêm lần lỗi" ngay DƯỚI thẻ cuối (CEO 27/11) → thẻ mới mở sẵn ở cuối, con trỏ ở ô Khách báo; lần
 * mới nhất mở sẵn.
 *
 * Lưu: có `luu` (nguồn MD, CSKH_NGUON=md) → đổi chip trạng thái / rời ô chữ có thay đổi là ghi `customer_care.issue_reports`
 * (thẻ chưa có `id` — thẻ mới, lần 1 chưa sang MD — được TẠO ở lần ghi đầu). Không `luu` (ST, Demo) → chỉ giữ trên màn như cũ.
 */
import { useRef, useState } from 'react'
import { Plus } from '@phosphor-icons/react/ssr'
import type { Lan } from '@/app/ticket/[code]/_prototype/chung'
import type { TrangThaiLanMd } from '@/app/ticket/lan-loi-md-actions'
import { Button } from '@/components/ui/button'
import { OSuaTrangThai, type MucTrangThai } from '@/components/ui/inline-edit'
import { PropertyList, PropertyRow } from '@/components/ui/property-list'
import { thongBao } from '@/components/ui/sonner'
import { Textarea } from '@/components/ui/textarea'
import { TheGap } from '@/components/ui/the-gap'
import type { KQ } from '@/lib/loi/ganDongMayServer'
import { ngayVNHomNay } from '@/lib/loi/ngayTicket'
import { ngayNgan } from './chung'

/** Một lần trên thẻ: `id` + `tt` có khi đọc từ MD. */
export type LanThe = Lan & { id?: string; tt?: TrangThaiLanMd }
type SuaThe = { customer_said?: string; handling?: string; status?: TrangThaiLanMd }
/** Ghi thật (đã gắn mã ticket ở bên gọi). */
export type LuuLan = {
  them: (input: { customer_said: string; reported_on?: string | null }) => Promise<KQ<{ id: string; report_no: number }>>
  sua: (id: string, patch: SuaThe) => Promise<KQ>
}

const homNay = () => ngayVNHomNay()
/** Ô gõ trong PropertyRow: đệm 6 trên/dưới = dòng chữ 20 nằm giữa hàng 32 như nhãn → chữ ô thẳng chữ nhãn. */
const O_GO = 'py-1.5'

/** `ds` cũ → mới. `nguoi` = người xử lý hiện dưới ô Xử lý. */
export function DsTheLan({ ds: goc, nguoi, luu }: { ds: LanThe[]; nguoi: string; luu?: LuuLan }) {
  const [moi, setMoi] = useState<LanThe[]>([])
  const ds = [...goc, ...moi]
  const them = () => {
    const so = Math.max(0, ...ds.map((l) => l.so)) + 1
    setMoi((x) => [...x, { so, ngay: homNay(), khach: null, xuLy: null, vatTu: [] }])
  }
  return (
    <div className="flex flex-col gap-3 border-none border-current">
      {ds.map((lan, i) => (
        <TheLan key={lan.so} lan={lan} nguoi={nguoi} luu={luu} moSan={i === ds.length - 1} vuaThem={moi.some((m) => m.so === lan.so)} />
      ))}
      <div className="border-none border-current">
        <Button variant="ghost" size="sm" className="-ml-2.5" onClick={them}>
          <Plus aria-hidden="true" />
          Thêm lần lỗi
        </Button>
      </div>
    </div>
  )
}

/** Trạng thái MỘT lần lỗi — chỉnh ở chip đầu thẻ (CEO 27/11 "trạng thái phải được chỉnh chứ"). */
const TT_LAN: MucTrangThai[] = [
  { gt: 'cho_xu_ly', nhan: 'Chờ xử lý', color: 'warning' },
  { gt: 'dang_xu_ly', nhan: 'Đang xử lý', color: 'info' },
  { gt: 'da_xu_ly', nhan: 'Đã xử lý', color: 'success' },
  { gt: 'khong_loi', nhan: 'Không lỗi', color: 'secondary' },
]

function TheLan({ lan, nguoi, luu, moSan, vuaThem }: { lan: LanThe; nguoi: string; luu?: LuuLan; moSan: boolean; vuaThem: boolean }) {
  const [khach, setKhach] = useState(lan.khach ?? '')
  const [xuLy, setXuLy] = useState(lan.xuLy ?? '')
  // Không có trạng thái từ DB (ST) → suy từ có/không ghi xử lý như nhãn cũ.
  const [tt, setTt] = useState<TrangThaiLanMd>(lan.tt ?? (lan.xuLy ? 'da_xu_ly' : 'cho_xu_ly'))
  const [so, setSo] = useState(lan.so)
  const id = useRef(lan.id)
  const tao = useRef<Promise<void> | null>(null)
  const daLuu = useRef({ customer_said: lan.khach ?? '', handling: lan.xuLy ?? '' })

  /** Ghi `patch`; thẻ chưa có id → tạo trước (một lần dù bấm dồn), rồi gửi nốt phần lần tạo không mang. Lỗi → ném. */
  async function ghi(patch: SuaThe) {
    if (!luu) return
    if (!id.current) {
      tao.current ??= luu.them({ customer_said: khach, reported_on: lan.ngay }).then((r) => {
        if (!r.ok) {
          tao.current = null
          throw new Error(r.error)
        }
        id.current = r.id
        daLuu.current.customer_said = khach
        setSo(r.report_no)
      })
      await tao.current
      const con: SuaThe = { ...patch }
      delete con.customer_said
      if (con.handling === undefined && xuLy) con.handling = xuLy
      if (con.status === undefined && tt !== 'cho_xu_ly') con.status = tt
      if (!Object.keys(con).length) return
      patch = con
    }
    const r = await luu.sua(id.current!, patch)
    if (!r.ok) throw new Error(r.error)
  }
  const roi = (k: 'customer_said' | 'handling', v: string) => {
    if (!luu || v.trim() === daLuu.current[k].trim()) return
    ghi({ [k]: v }).then(
      () => {
        daLuu.current[k] = v
      },
      (e: unknown) => thongBao.loi(`Lần ${so}: chưa lưu được ${k === 'handling' ? 'xử lý' : 'khách báo'} — ${e instanceof Error ? e.message : 'lỗi không rõ'}`),
    )
  }
  return (
    <TheGap
      data-lan={lan.so}
      moSan={moSan}
      tieuDe={
        <>
          Lần {so}
          <span className="font-normal tabular-nums text-muted-foreground">· khách báo {ngayNgan(lan.ngay ?? homNay())}</span>
        </>
      }
      thaoTac={
        <OSuaTrangThai
          ma={`Lần ${so}`}
          value={{ tt }}
          muc={TT_LAN}
          onLuu={async (v) => {
            await ghi({ status: v.tt as TrangThaiLanMd })
            setTt(v.tt as TrangThaiLanMd)
          }}
        />
      }
    >
      {/* Dòng cách dòng ~40 (CEO 27/11, nhãn→nhãn): hàng 32 + khe 8; khách báo nhiều dòng thì khoảng trắng chữ→chữ = 20. */}
      <PropertyList className="gap-y-2">
        <PropertyRow nhan="Khách báo">
          <Textarea
            variant="tran"
            className={O_GO}
            aria-label={`Khách báo lần ${so}`}
            placeholder="Khách báo gì…"
            value={khach}
            autoFocus={vuaThem}
            onChange={(e) => setKhach(e.target.value)}
            onBlur={(e) => roi('customer_said', e.target.value)}
          />
        </PropertyRow>
        <PropertyRow nhan="Xử lý">
          <span className="flex w-full flex-col border-none border-current">
            <Textarea
              variant="tran"
              className={O_GO}
              aria-label={`Xử lý lần ${so}`}
              placeholder="Ghi cách xử lý…"
              value={xuLy}
              onChange={(e) => setXuLy(e.target.value)}
              onBlur={(e) => roi('handling', e.target.value)}
            />
            {xuLy && <span className="-mt-1 pb-1.5 ds-text-xs text-muted-foreground">{nguoi}</span>}
          </span>
        </PropertyRow>
        {lan.thaoTu && <PropertyRow nhan="Tháo từ máy khác">{lan.thaoTu}</PropertyRow>}
      </PropertyList>
    </TheGap>
  )
}
