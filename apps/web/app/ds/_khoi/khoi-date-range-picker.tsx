'use client'

import { useState } from 'react'
import { calendarPop } from '@/components/ui/date-picker'
import { DateRangePanel, DateRangePicker, type KhoangNgay } from '@/components/ui/date-range-picker'
import { Field, FieldLabel } from '@/components/ui/field'
import { cn } from '@/lib/utils'

/** Nhãn nhóm của preview (`.ds-nhan`, khung trình bày — không phải component): 12/16 500 muted, cách dưới 8. */
function Nhan({ children }: { children: string }) {
  return <p className="mb-2 border-none border-current text-[12px] leading-[16px] font-medium text-muted-foreground">{children}</p>
}

/** Ngày cố định của bảng mẫu (demo) — y preview: "hôm nay" 18/11/2026, mốc "Tháng này" 01/11 → 18/11. */
const HOM_NAY_MAU = '2026-11-18'
const THANG_NAY_MAU: KhoangNgay = { tu: '2026-11-01', den: '2026-11-18' }

/**
 * #date-range-picker — tái tạo ds/nguon/components/DateRangePicker/preview.html.
 * - Cột 1 (rộng 320 như preview): DateRangePicker thật (bấm mở bảng nổi, hôm nay = ngày máy) + dòng "Giá trị".
 * - Cột 2: bảng mở sẵn (DateRangePanel, cùng mặt `calendarPop`), ngày cố định để đo ổn định: hôm nay 18/11, mốc
 *   "Tháng này" đang khớp. Bấm được (nháp cục bộ): Áp dụng giữ khoảng mới, Huỷ dựng lại từ khoảng đã áp.
 * Dữ liệu demo. Khoá so khớp: id trigger + `data-so` (ds/so-khop/daterangepicker.json).
 */
export function KhoiDateRangePicker() {
  const [khoang, setKhoang] = useState<KhoangNgay | null>(THANG_NAY_MAU)
  const [mau, setMau] = useState<KhoangNgay | null>(THANG_NAY_MAU)
  const [lan, setLan] = useState(0)
  return (
    <section id="date-range-picker" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#date-range-picker">DateRangePicker</a>
      </h2>
      {/* border-none border-current: div ăn preflight `0 solid var(--border)` của app; div preview không viền. */}
      <div className="flex flex-wrap items-start gap-x-10 gap-y-7 border-none border-current">
        <div className="w-[320px] max-w-full border-none border-current">
          <Nhan>Trigger</Nhan>
          <Field>
            <FieldLabel htmlFor="ds-drp">Khoảng ngày</FieldLabel>
            <DateRangePicker id="ds-drp" value={khoang} onValueChange={setKhoang} />
          </Field>
          <p data-so="gia-tri" className="mt-3 mb-0 border-none border-current text-[12px] leading-[18px] text-muted-foreground tabular-nums">
            Giá trị: {khoang ? `${khoang.tu} → ${khoang.den}` : 'trống'}
          </p>
        </div>
        <div className="min-w-0 border-none border-current">
          <Nhan>Bảng mở sẵn (demo): mốc &quot;Tháng này&quot; 01/11 → hôm nay 18/11</Nhan>
          {/* ≤ 640: bảng rộng 100vw − 16 như pop thật → lùi 8 mỗi bên (trang /ds lề 16) để cách mép màn 8. */}
          <div
            data-so="bang"
            role="group"
            aria-label="Bảng khoảng ngày mẫu (demo)"
            className={cn(calendarPop, 'max-[640px]:-mx-2')}
          >
            <DateRangePanel
              key={lan}
              value={mau}
              today={HOM_NAY_MAU}
              onCancel={() => setLan((n) => n + 1)}
              onApply={(v) => {
                setMau(v)
                setLan((n) => n + 1)
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
