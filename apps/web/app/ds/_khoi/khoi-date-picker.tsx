'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { calendarFoot, calendarFootClear, calendarPop } from '@/components/ui/calendar-styles'
import { DatePicker } from '@/components/ui/date-picker'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { isoNgay, ngayTuIso } from '@/bang/ngay'
import { cn } from '@/lib/utils'

/** Nhãn nhóm của preview (`.ds-nhan`, khung trình bày — không phải component): 12/16 500 muted, cách dưới 8. */
function Nhan({ children }: { children: string }) {
  return <p className="mb-2 border-none border-current text-[12px] leading-[16px] font-medium text-muted-foreground">{children}</p>
}

/** Ngày cố định của lịch mẫu (demo) — y preview: tháng 11/2026, "hôm nay" 18, đã chọn 21. */
const HOM_NAY_MAU = '2026-11-18'

/**
 * #date-picker — tái tạo ds/nguon/components/DatePicker/preview.html.
 * - Cột 1 (rộng 320 như preview): 4 ô chọn trống · đã chọn · lỗi · tắt — DatePicker thật, bấm mở lịch (Radix Popover).
 * - Cột 2: lịch mẫu mở sẵn (Calendar + chân, cùng mặt `calendarPop`), ngày cố định 11/2026 để đo ổn định: hôm nay 18,
 *   đã chọn 21 (preview lịch 1), 1–3 bị chặn gạch ngang (preview lịch 2 chặn trước hôm nay). Bấm được (state cục bộ).
 *   Preview lịch 2 vẽ vòng focus tĩnh (`.is-focus`) — ở đây Tab thật vào lưới mới thấy.
 * Dữ liệu demo. Khoá so khớp: id trigger + `data-so` (ds/so-khop/datepicker.json).
 */
export function KhoiDatePicker() {
  const [trong, setTrong] = useState<string | null>(null)
  const [daChon, setDaChon] = useState<string | null>('2026-11-21')
  const [loi, setLoi] = useState<string | null>(null)
  const [mau, setMau] = useState<string | null>('2026-11-21')
  return (
    <section id="date-picker" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#date-picker">DatePicker</a>
      </h2>
      {/* border-none border-current: div ăn preflight `0 solid var(--border)` của app; div preview không viền. */}
      <div className="flex flex-wrap items-start gap-x-10 gap-y-7 border-none border-current">
        <div className="w-[320px] max-w-full border-none border-current">
          <Nhan>Ô chọn: trống · đã chọn · lỗi · tắt</Nhan>
          <div className="flex flex-col gap-4 border-none border-current">
            <Field>
              <FieldLabel htmlFor="ds-dp-trong">Trống</FieldLabel>
              <DatePicker id="ds-dp-trong" value={trong} onValueChange={setTrong} />
            </Field>
            <Field>
              <FieldLabel htmlFor="ds-dp-chon">Đã chọn</FieldLabel>
              <DatePicker id="ds-dp-chon" value={daChon} onValueChange={setDaChon} />
            </Field>
            <Field>
              <FieldLabel htmlFor="ds-dp-loi">Lỗi</FieldLabel>
              <DatePicker
                id="ds-dp-loi"
                value={loi}
                onValueChange={setLoi}
                aria-invalid={!loi}
                aria-describedby={loi ? undefined : 'ds-dp-loi-msg'}
              />
              {!loi && (
                <FieldError data-so="loi-msg" id="ds-dp-loi-msg">
                  Chọn ngày giao.
                </FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="ds-dp-tat">Tắt</FieldLabel>
              <DatePicker id="ds-dp-tat" value="2026-11-18" onValueChange={() => {}} disabled />
            </Field>
          </div>
        </div>
        <div className="min-w-0 border-none border-current">
          <Nhan>Lịch mở sẵn (demo): đã chọn 21/11, chấm dưới = hôm nay, 1–3 bị chặn</Nhan>
          {/* ≤ 640: lịch rộng 100vw − 16 như pop thật → lùi 8 mỗi bên (trang /ds lề 16) để cách mép màn 8, không tràn ngang. */}
          <div data-so="lich" role="group" aria-label="Lịch mẫu (demo)" className={cn(calendarPop, 'max-[640px]:-mx-2')}>
            <Calendar
              mode="single"
              required
              defaultMonth={ngayTuIso(HOM_NAY_MAU)}
              today={ngayTuIso(HOM_NAY_MAU)}
              selected={mau ? ngayTuIso(mau) : undefined}
              disabled={{ before: ngayTuIso('2026-11-04') }}
              onSelect={(d) => setMau(isoNgay(d))}
            />
            <div data-so="chan-mau" className={calendarFoot}>
              {mau ? (
                <Button variant="ghost" size="sm" className={calendarFootClear} onClick={() => setMau(null)}>
                  Xoá ngày
                </Button>
              ) : (
                <span />
              )}
              <Button variant="outline" size="sm" onClick={() => setMau(HOM_NAY_MAU)}>
                Hôm nay
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
