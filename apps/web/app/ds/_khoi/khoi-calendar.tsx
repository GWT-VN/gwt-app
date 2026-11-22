'use client'

import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { Calendar } from '@/components/ui/calendar'
import { calendarPop } from '@/components/ui/calendar-styles'
import { hienNgay, isoNgay, ngayTuIso } from '@/bang/ngay'
import { cn } from '@/lib/utils'
import { BienThe, KhoiHang } from '../_khung/tam'

/** Ngày cố định của lịch mẫu (demo): tháng 11/2026, "hôm nay" 18 — như khối DatePicker. */
const HOM_NAY = ngayTuIso('2026-11-18')
/** Mặt lịch nằm tĩnh trên trang (không nổi): mặt `calendarPop` bỏ z của lớp menu. */
const mat = cn(calendarPop, 'z-auto max-[640px]:w-full max-[640px]:max-w-full')

function Dong({ children }: { children: string }) {
  return <p className="mt-2 text-[12px] leading-[18px] text-muted-foreground tabular-nums">{children}</p>
}

function MotNgay() {
  const [ngay, setNgay] = useState<Date | undefined>(ngayTuIso('2026-11-21'))
  return (
    <div>
      <div data-so="mot-ngay" role="group" aria-label="Lịch chọn một ngày (demo)" className={mat}>
        <Calendar mode="single" defaultMonth={HOM_NAY} today={HOM_NAY} selected={ngay} onSelect={setNgay} />
      </div>
      <Dong>{ngay ? `Đã chọn: ${hienNgay(isoNgay(ngay))}` : 'Chưa chọn ngày'}</Dong>
    </div>
  )
}

function ThaXuong() {
  const [ngay, setNgay] = useState<Date | undefined>()
  return (
    <div>
      <div data-so="tha-xuong" role="group" aria-label="Lịch có tháng/năm thả xuống (demo)" className={mat}>
        <Calendar
          mode="single"
          captionLayout="dropdown"
          showWeekNumber
          defaultMonth={HOM_NAY}
          today={HOM_NAY}
          startMonth={ngayTuIso('2020-01-01')}
          endMonth={ngayTuIso('2030-12-01')}
          selected={ngay}
          onSelect={setNgay}
        />
      </div>
      <Dong>{ngay ? `Đã chọn: ${hienNgay(isoNgay(ngay))}` : 'Chưa chọn ngày'}</Dong>
    </div>
  )
}

function Khoang() {
  const [k, setK] = useState<DateRange | undefined>({ from: ngayTuIso('2026-11-09'), to: ngayTuIso('2026-11-13') })
  return (
    <div>
      <div data-so="khoang" role="group" aria-label="Lịch chọn khoảng (demo)" className={mat}>
        <Calendar mode="range" defaultMonth={HOM_NAY} today={HOM_NAY} selected={k} onSelect={setK} />
      </div>
      <Dong>
        {k?.from ? `Từ ${hienNgay(isoNgay(k.from))}${k.to ? ` đến ${hienNgay(isoNgay(k.to))}` : ' — chọn ngày cuối'}` : 'Chưa chọn'}
      </Dong>
    </div>
  )
}

const BIEN_THE = [
  { ten: 'Một ngày', moTa: 'mode="single". Hôm nay = chấm dưới số; ngày chọn = tròn đặc. Phím: ←→ ngày, ↑↓ tuần, PageUp/PageDown tháng.', Demo: MotNgay },
  {
    ten: 'Tháng/năm thả xuống + số tuần',
    moTa: 'captionLayout="dropdown" (shadcn): chọn tháng/năm bằng ô thả xuống của trình duyệt; showWeekNumber thêm cột số tuần.',
    Demo: ThaXuong,
  },
  {
    ten: 'Khoảng ngày',
    moTa: 'mode="range": hai đầu tròn đặc, dải giữa nền nhạt. Xem trước khi rê, hai tháng, nút Áp dụng nằm ở DateRangePicker — màn nghiệp vụ dùng DateRangePicker.',
    Demo: Khoang,
  },
]

/**
 * #calendar trần (/ds/tron). Artifact không có Calendar riêng (lịch nằm trong DatePicker/DateRangePicker — cổng so khớp đo
 * lịch qua hai khối đó) → không có cổng so khớp riêng.
 */
export function KhoiCalendar() {
  return (
    <section id="calendar" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#calendar">Calendar</a>
      </h2>
      <div className="flex flex-wrap items-start gap-6">
        {BIEN_THE.map(({ ten, Demo }) => (
          <Demo key={ten} />
        ))}
      </div>
    </section>
  )
}

/** #calendar dạng hàng (/ds). */
export function KhoiCalendarHang() {
  return (
    <KhoiHang neo="calendar">
      {BIEN_THE.map(({ ten, moTa, Demo }) => (
        <BienThe key={ten} ten={ten} moTa={moTa}>
          <Demo />
        </BienThe>
      ))}
    </KhoiHang>
  )
}
