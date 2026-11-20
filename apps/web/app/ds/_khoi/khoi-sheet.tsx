'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox, ChoiceLabel } from '@/components/ui/checkbox'
import { DateRangePicker, type KhoangNgay } from '@/components/ui/date-range-picker'
import { Field, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { BienThe, KhoiHang } from '../_khung/tam'

const KENH = [
  ['tat-ca', 'Tất cả kênh'],
  ['cua-hang', 'Cửa hàng'],
  ['website', 'Website'],
  ['san', 'Sàn TMĐT'],
] as const
const TINH_TRANG = ['Chờ xử lý', 'Đang giao', 'Hoàn tất'] as const
const TT_DAU: Record<string, boolean> = { 'Chờ xử lý': true }

/**
 * Nút + sheet "Bộ lọc nâng cao" — dùng chung khối cũ và hàng biến thể. Control DS: Select (4 kênh, ≤ 10 mục),
 * DateRangePicker (Ngày tạo), Checkbox trong FieldSet. Giá trị giữ ở state (sheet đóng/mở lại vẫn còn); "Xoá lọc" là nút
 * reset của form (`form="sheet-loc"`) → `onReset` đặt lại state. Bộ lọc thật vẫn ghi tham số URL (docs/CHUAN-FILTER.md).
 */
function SheetLoc() {
  const [kenh, setKenh] = useState<string>('tat-ca')
  const [ngay, setNgay] = useState<KhoangNgay | null>(null)
  const [tt, setTt] = useState(TT_DAU)
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button data-so="mo" variant="outline">
          Bộ lọc nâng cao…
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Bộ lọc nâng cao</SheetTitle>
          <SheetDescription>Áp dụng cho danh sách đơn (dữ liệu demo).</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <form
            id="sheet-loc"
            className="contents"
            onReset={() => {
              setKenh('tat-ca')
              setNgay(null)
              setTt(TT_DAU)
            }}
          >
            <Field data-so="truong">
              <FieldLabel htmlFor="sheet-kenh">Kênh bán</FieldLabel>
              <Select value={kenh} onValueChange={setKenh}>
                <SelectTrigger id="sheet-kenh" data-so="kenh">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KENH.map(([v, ten]) => (
                    <SelectItem key={v} value={v}>
                      {ten}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="sheet-ngay">Ngày tạo</FieldLabel>
              <DateRangePicker id="sheet-ngay" value={ngay} onValueChange={setNgay} />
            </Field>
            <FieldSet>
              <FieldLegend>Tình trạng</FieldLegend>
              {TINH_TRANG.map((t) => (
                <ChoiceLabel key={t}>
                  <Checkbox checked={!!tt[t]} onCheckedChange={(b) => setTt((c) => ({ ...c, [t]: b === true }))} /> {t}
                </ChoiceLabel>
              ))}
            </FieldSet>
          </form>
        </SheetBody>
        <SheetFooter>
          <Button data-so="xoa-loc" variant="ghost" type="reset" form="sheet-loc">
            Xoá lọc
          </Button>
          <SheetClose asChild>
            <Button data-so="ap-dung">Áp dụng</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

/**
 * #sheet — tái tạo ds/nguon/components/Sheet/preview.html: "Bộ lọc nâng cao" cạnh phải, thân có Kênh bán (chọn), Ngày
 * tạo (preview: hai ô ngày gốc; DS: một DateRangePicker), Tình trạng (ba checkbox); footer Xoá lọc (ghost, đặt lại form)
 * + Áp dụng (đóng). Preview vẽ sheet tĩnh trong khung 408px; DS mở thật bám mép phải khung nhìn qua nút. `data-so` = khoá
 * so khớp (ds/so-khop/sheet.json).
 */
export function KhoiSheet() {
  return (
    <section id="sheet" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#sheet">Sheet</a>
      </h2>
      <div className="flex">
        <SheetLoc />
      </div>
    </section>
  )
}

/** /ds dạng hàng. */
export function KhoiSheetHang() {
  return (
    <KhoiHang neo="sheet">
      <BienThe ten="Bộ lọc nâng cao" moTa="Nhiều trường lọc, mở cạnh phải; ≤ 640 rộng hết màn">
        <SheetLoc />
      </BienThe>
    </KhoiHang>
  )
}
