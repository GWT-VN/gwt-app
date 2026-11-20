'use client'

import { useState } from 'react'
import type { KhoangNgay } from '@/bang/ngay'
import { calendarPop } from '@/components/ui/calendar-styles'
import { DateRangePanel, DateRangePicker } from '@/components/ui/date-range-picker'
import { Field, FieldLabel } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { BienThe, KhoiHang } from '../_khung/tam'

/** Nhãn nhóm của preview (`.ds-nhan`, khung trình bày — không phải component): 12/16 500 muted, cách dưới 8. */
function Nhan({ children }: { children: string }) {
  return <p className="mb-2 border-none border-current text-[12px] leading-[16px] font-medium text-muted-foreground">{children}</p>
}

/** Ngày cố định của bảng mẫu (demo) — y preview: "hôm nay" 18/11/2026, mốc "Tháng này" 01/11 → 18/11. */
const HOM_NAY_MAU = '2026-11-18'
const THANG_NAY_MAU: KhoangNgay = { tu: '2026-11-01', den: '2026-11-18' }

/**
 * Bảng mở sẵn (DateRangePanel, cùng mặt `calendarPop`) — dùng chung khối cũ và bản hàng. Bấm được (nháp cục bộ): Áp dụng
 * giữ khoảng mới, Huỷ dựng lại từ khoảng đã áp. ≤ 640 mặt rộng 100vw − 16 → người gọi chỉnh qua `className`.
 */
function BangMau({ className }: { className?: string }) {
  const [mau, setMau] = useState<KhoangNgay | null>(THANG_NAY_MAU)
  const [lan, setLan] = useState(0)
  return (
    <div
      data-so="bang"
      role="group"
      aria-label="Bảng khoảng ngày mẫu (demo)"
      className={cn(calendarPop, className)}
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
  )
}

/**
 * #date-range-picker — tái tạo ds/nguon/components/DateRangePicker/preview.html.
 * - Cột 1 (rộng 320 như preview): DateRangePicker thật (bấm mở bảng nổi, hôm nay = ngày máy) + dòng "Giá trị".
 * - Cột 2: bảng mở sẵn (DateRangePanel, cùng mặt `calendarPop`), ngày cố định để đo ổn định: hôm nay 18/11, mốc
 *   "Tháng này" đang khớp. Bấm được (nháp cục bộ): Áp dụng giữ khoảng mới, Huỷ dựng lại từ khoảng đã áp.
 * Dữ liệu demo. Khoá so khớp: id trigger + `data-so` (ds/so-khop/daterangepicker.json).
 */
export function KhoiDateRangePicker() {
  const [khoang, setKhoang] = useState<KhoangNgay | null>(THANG_NAY_MAU)
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
          <BangMau className="max-[640px]:-mx-2" />
        </div>
      </div>
    </section>
  )
}

/** #date-range-picker dạng hàng (/ds): mỗi trạng thái một hàng. Ô rộng tối đa 320 như cột preview. */
export function KhoiDateRangePickerHang() {
  const [trong, setTrong] = useState<KhoangNgay | null>(null)
  const [coKhoang, setCoKhoang] = useState<KhoangNgay | null>(THANG_NAY_MAU)
  return (
    <KhoiHang neo="date-range-picker">
      <BienThe ten="Trống" moTa="Lọc báo cáo / danh sách theo khoảng ngày — chưa chọn = không lọc.">
        <Field className="max-w-80">
          <FieldLabel htmlFor="dsh-drp-trong">Khoảng ngày</FieldLabel>
          <DateRangePicker id="dsh-drp-trong" value={trong} onValueChange={setTrong} />
        </Field>
      </BienThe>
      <BienThe ten="Có khoảng" moTa="Đã chọn từ → đến; giá trị chỉ đổi khi bấm Áp dụng.">
        <Field className="max-w-80">
          <FieldLabel htmlFor="dsh-drp-co">Kỳ báo cáo</FieldLabel>
          <DateRangePicker id="dsh-drp-co" value={coKhoang} onValueChange={setCoKhoang} />
        </Field>
      </BienThe>
      <BienThe ten="Mốc nhanh (bảng mở sẵn)" moTa="Mặt pop vẽ tĩnh (demo, hôm nay 18/11/2026): mốc Tháng này đang khớp.">
        <BangMau className="max-[640px]:w-full max-[640px]:max-w-full" />
      </BienThe>
      <BienThe ten="Tắt" moTa="Kỳ đã khoá / thiếu quyền — vẫn đọc được khoảng.">
        <Field className="max-w-80">
          <FieldLabel htmlFor="dsh-drp-tat">Kỳ đã khoá</FieldLabel>
          <DateRangePicker id="dsh-drp-tat" value={THANG_NAY_MAU} onValueChange={() => {}} disabled />
        </Field>
      </BienThe>
    </KhoiHang>
  )
}
