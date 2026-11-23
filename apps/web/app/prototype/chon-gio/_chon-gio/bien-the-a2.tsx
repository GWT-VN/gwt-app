'use client'

// PROTOTYPE vứt đi — A2: lịch tháng trái + cột giờ cuộn phải (kiểu Google Calendar/Outlook). Bấm giờ = lưu + đóng.
import { useState } from 'react'
import { isoNgay, ngayTuIso } from '@/bang/ngay'
import { Calendar } from '@/components/ui/calendar'
import { calendarFoot } from '@/components/ui/calendar-styles'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { chanQua, ghepIso, GIO_COT, GIO_MAC_DINH, gioCua, homNay, ngayCua, type PropsHan } from './gio'
import { OGio } from './o-gio'
import { NutXoa, useDongSau, VoHan } from './vo-han'

/**
 * Gắn lúc cột giờ xuất hiện (mở pop) → cuộn giờ đang bật (không có thì 17:30) vào giữa cột. Hàm ngoài component = ref
 * ổn định, không giật khi chọn ngày. (useLayoutEffect theo `mo` không được: Portal Radix gắn nội dung ở lượt render sau.)
 */
function cuonToiGio(l: HTMLDivElement | null) {
  const el = l?.querySelector<HTMLElement>('[data-state=on]') ?? l?.querySelector<HTMLElement>(`[data-gio="${GIO_MAC_DINH}"]`)
  if (l && el) l.scrollTop = el.offsetTop - (l.clientHeight - el.offsetHeight) / 2
}

export function ChonHanA2({ value, onValueChange, id, gon, ma }: PropsHan) {
  const [mo, setMo] = useState(false)
  const nay = homNay()
  const ngay = value ? ngayCua(value) : null
  const gio = value ? gioCua(value) : null
  const dat = (n: string, g = gio ?? GIO_MAC_DINH) => onValueChange(ghepIso(n, g))
  const chonGio = (g: string) => {
    dat(ngay ?? nay, g)
    setMo(false)
  }
  const enter = useDongSau(() => setMo(false))
  return (
    <VoHan value={value} id={id} gon={gon} ma={ma} mo={mo} setMo={setMo}>
      <div className="flex gap-4 border-none border-current max-[480px]:flex-col">
        <Calendar
          mode="single"
          required
          autoFocus
          selected={ngay ? ngayTuIso(ngay) : undefined}
          defaultMonth={ngayTuIso(ngay ?? nay)}
          disabled={chanQua(nay, ngay)}
          onSelect={(d) => dat(isoNgay(d))}
        />
        <div className="flex w-28 shrink-0 flex-col gap-2 border-none border-current max-[480px]:w-full" {...enter.vo}>
          <OGio
            goiY={false}
            aria-label="Giờ (gõ được phút lẻ)"
            value={gio}
            onValueChange={(g) => {
              dat(ngay ?? nay, g)
              enter.sau()
            }}
          />
          <div className="relative min-h-0 flex-1 border-none border-current max-[480px]:h-36">
            <div
              ref={cuonToiGio}
              className="absolute inset-0 overflow-y-auto border-none border-current [scrollbar-color:var(--alpha-30)_transparent]"
            >
              <ToggleGroup
                type="single"
                orientation="vertical"
                aria-label="Giờ"
                value={gio ?? ''}
                spacing={0.5}
                className="w-full flex-col items-stretch"
              >
                {GIO_COT.map((g) => (
                  <ToggleGroupItem
                    key={g}
                    value={g}
                    data-gio={g}
                    size="sm"
                    className="shrink-0 justify-start tabular-nums"
                    onClick={() => chonGio(g)}
                  >
                    {g}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>
        </div>
      </div>
      {value && (
        <div className={calendarFoot}>
          <NutXoa
            onClick={() => {
              onValueChange(null)
              setMo(false)
            }}
          />
        </div>
      )}
    </VoHan>
  )
}
