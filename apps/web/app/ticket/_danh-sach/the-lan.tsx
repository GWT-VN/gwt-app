'use client'

/**
 * Các lần lỗi = THẺ gập/mở (`TheGap`, CEO 27/11): đầu thẻ MỘT dòng căn giữa `Lần N · khách báo dd/MM · [trạng thái sửa
 * được]` + mũi tên; gập chỉ còn đầu thẻ (bỏ dòng tóm tắt). Trong thẻ: Khách báo +
 * Xử lý là ô chữ TRƠN gõ thẳng (như Mô tả bên Work — không nút "+ Ghi xử lý", không hộp), dưới Xử lý là "ai · lúc".
 * Thứ tự CŨ → MỚI, "+ Thêm lần lỗi" ngay DƯỚI thẻ cuối (CEO 27/11) → thẻ mới mở sẵn ở cuối, con trỏ ở ô Khách báo; lần
 * mới nhất mở sẵn.
 *
 * ponytail: BẢN DỰNG BỐ CỤC — chữ gõ chỉ giữ trên màn, chưa lưu DB (chờ CEO chốt chỗ lưu "xử lý lần 1" + vật tư theo lần).
 * Nối thật: lần 2+ → `themLanLoi` / `suaLanLoi` (app/ticket/lan-loi-actions.ts).
 */
import { useState } from 'react'
import { Plus } from '@phosphor-icons/react/ssr'
import type { Lan } from '@/app/ticket/[code]/_prototype/chung'
import { Button } from '@/components/ui/button'
import { OSuaTrangThai, type MucTrangThai } from '@/components/ui/inline-edit'
import { PropertyList, PropertyRow } from '@/components/ui/property-list'
import { Textarea } from '@/components/ui/textarea'
import { TheGap } from '@/components/ui/the-gap'
import { ngayNgan } from './chung'

const homNay = () => new Date().toISOString().slice(0, 10)
/** Ô gõ trong PropertyRow: đệm 6 trên/dưới = dòng chữ 20 nằm giữa hàng 32 như nhãn → chữ ô thẳng chữ nhãn. */
const O_GO = 'py-1.5'

/** `ds` cũ → mới. `nguoi` = người xử lý hiện dưới ô Xử lý. */
export function DsTheLan({ ds: goc, nguoi }: { ds: Lan[]; nguoi: string }) {
  const [moi, setMoi] = useState<Lan[]>([])
  const ds = [...goc, ...moi]
  const them = () => {
    const so = Math.max(0, ...ds.map((l) => l.so)) + 1
    setMoi((x) => [...x, { so, ngay: homNay(), khach: null, xuLy: null, vatTu: [] }])
  }
  return (
    <div className="flex flex-col gap-3 border-none border-current">
      {ds.map((lan, i) => (
        <TheLan key={lan.so} lan={lan} nguoi={nguoi} moSan={i === ds.length - 1} vuaThem={moi.some((m) => m.so === lan.so)} />
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
  { gt: 'cho', nhan: 'Chờ xử lý', color: 'warning' },
  { gt: 'dang', nhan: 'Đang xử lý', color: 'info' },
  { gt: 'xong', nhan: 'Đã xử lý', color: 'success' },
]

function TheLan({ lan, nguoi, moSan, vuaThem }: { lan: Lan; nguoi: string; moSan: boolean; vuaThem: boolean }) {
  const [khach, setKhach] = useState(lan.khach ?? '')
  const [xuLy, setXuLy] = useState(lan.xuLy ?? '')
  // ponytail: DB chưa có cột trạng thái theo lần — giữ trên màn; mặc định suy từ có/không ghi xử lý như nhãn cũ.
  const [tt, setTt] = useState(lan.xuLy ? 'xong' : 'cho')
  return (
    <TheGap
      data-lan={lan.so}
      moSan={moSan}
      tieuDe={
        <>
          Lần {lan.so}
          <span className="font-normal tabular-nums text-muted-foreground">· khách báo {ngayNgan(lan.ngay ?? homNay())}</span>
        </>
      }
      thaoTac={
        <OSuaTrangThai
          ma={`Lần ${lan.so}`}
          value={{ tt }}
          muc={TT_LAN}
          onLuu={async (v) => {
            setTt(v.tt)
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
            aria-label={`Khách báo lần ${lan.so}`}
            placeholder="Khách báo gì…"
            value={khach}
            autoFocus={vuaThem}
            onChange={(e) => setKhach(e.target.value)}
          />
        </PropertyRow>
        <PropertyRow nhan="Xử lý">
          <span className="flex w-full flex-col border-none border-current">
            <Textarea
              variant="tran"
              className={O_GO}
              aria-label={`Xử lý lần ${lan.so}`}
              placeholder="Ghi cách xử lý…"
              value={xuLy}
              onChange={(e) => setXuLy(e.target.value)}
            />
            {xuLy && <span className="-mt-1 pb-1.5 ds-text-xs text-muted-foreground">{nguoi}</span>}
          </span>
        </PropertyRow>
        {lan.thaoTu && <PropertyRow nhan="Tháo từ máy khác">{lan.thaoTu}</PropertyRow>}
      </PropertyList>
    </TheGap>
  )
}
