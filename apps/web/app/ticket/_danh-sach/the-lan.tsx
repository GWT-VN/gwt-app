'use client'

/**
 * Các lần lỗi = THẺ gập/mở (CEO 27/11 "biến thành thẻ có thể collapse được"): mỗi lần một `Card` (viền, bo xl), đầu thẻ là
 * nút gập — `Lần N · khách báo dd/MM · trạng thái` + mũi tên; gập vẫn hiện một dòng tóm tắt khách báo. Trong thẻ: Khách báo +
 * Xử lý là ô chữ TRƠN gõ thẳng (như Mô tả bên Work — không nút "+ Ghi xử lý", không hộp), dưới Xử lý là "ai · lúc".
 * "+ Thêm lần lỗi" ở đầu danh sách → thẻ mới mở sẵn trên cùng, con trỏ ở ô Khách báo. Mới nhất trên cùng, mở sẵn.
 *
 * ponytail: BẢN DỰNG BỐ CỤC — chữ gõ chỉ giữ trên màn, chưa lưu DB (chờ CEO chốt chỗ lưu "xử lý lần 1" + vật tư theo lần).
 * Nối thật: lần 2+ → `themLanLoi` / `suaLanLoi` (app/ticket/lan-loi-actions.ts).
 */
import { useState } from 'react'
import { CaretDown, Plus } from '@phosphor-icons/react/ssr'
import type { Lan } from '@/app/ticket/[code]/_prototype/chung'
import { NhanKetQua } from '@/app/ticket/[code]/_prototype/ct-gon'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { PropertyList, PropertyRow } from '@/components/ui/property-list'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { ngayNgan } from './chung'

const homNay = () => new Date().toISOString().slice(0, 10)
/** Ô gõ trong PropertyRow: đệm 6 trên/dưới = dòng chữ 20 nằm giữa hàng 32 như nhãn → chữ ô thẳng chữ nhãn. */
const O_GO = 'py-1.5'

/** `ds` mới nhất trên cùng. `nguoi` = người xử lý hiện dưới ô Xử lý. */
export function DsTheLan({ ds: goc, nguoi }: { ds: Lan[]; nguoi: string }) {
  const [moi, setMoi] = useState<Lan[]>([])
  const ds = [...moi, ...goc]
  const them = () => {
    const so = Math.max(0, ...ds.map((l) => l.so)) + 1
    setMoi((x) => [{ so, ngay: homNay(), khach: null, xuLy: null, vatTu: [] }, ...x])
  }
  return (
    <div className="flex flex-col gap-3 border-none border-current">
      <div className="border-none border-current">
        <Button variant="ghost" size="sm" className="-ml-2.5" onClick={them}>
          <Plus aria-hidden="true" />
          Thêm lần lỗi
        </Button>
      </div>
      {ds.map((lan, i) => (
        <TheLan key={lan.so} lan={lan} nguoi={nguoi} moSan={i === 0} vuaThem={moi.some((m) => m.so === lan.so)} />
      ))}
    </div>
  )
}

function TheLan({ lan, nguoi, moSan, vuaThem }: { lan: Lan; nguoi: string; moSan: boolean; vuaThem: boolean }) {
  const [mo, setMo] = useState(moSan)
  const [khach, setKhach] = useState(lan.khach ?? '')
  const [xuLy, setXuLy] = useState(lan.xuLy ?? '')
  const id = `lan-${lan.so}`
  return (
    <Collapsible open={mo} onOpenChange={setMo} asChild>
      <Card data-lan={lan.so} className="overflow-hidden p-0">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={cn(
              'flex w-full cursor-pointer items-start gap-2 border-none bg-transparent px-4 py-3 text-left [font:inherit] text-inherit',
              'hover:bg-(--alpha-03) [outline:none] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-(--ring)',
            )}
          >
            <span className="flex min-w-0 flex-1 flex-col gap-0.5 border-none border-current">
              <span id={id} className="flex flex-wrap items-center gap-2 border-none border-current font-semibold">
                Lần {lan.so}
                <span className="font-normal tabular-nums text-muted-foreground">· khách báo {ngayNgan(lan.ngay ?? homNay())}</span>
                <NhanKetQua lan={{ ...lan, xuLy: xuLy || null }} />
              </span>
              {!mo && (
                <span className="truncate text-muted-foreground">{khach || <span className="text-(--color-text-tertiary)">Chưa ghi khách báo</span>}</span>
              )}
            </span>
            <CaretDown
              aria-hidden="true"
              className={cn('mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform', mo && 'rotate-180')}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-0 border-t border-solid border-(--border) px-4 pt-3 pb-4">
            <PropertyList>
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
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
