'use client'

import { CaretDown } from '@phosphor-icons/react/ssr'
import { Button } from '@/components/ui/button'
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

/**
 * Ô nhập/chọn/checkbox: CHƯA có Select/Input/Checkbox DS (lát 3) → control GỐC mang giá trị `.ui-input` /
 * `.ui-select-trigger` / `.ui-checkbox` / `.ui-label` / `.ui-field` của bundle.css CHỈ trong khối demo này — đừng chép
 * sang màn thật. Bộ lọc thật trong sheet vẫn ghi tham số URL (docs/CHUAN-FILTER.md).
 */
const oNhap = [
  'h-(--control-size-md) w-full min-w-0 rounded-(--radius-md) border-0 bg-transparent px-(--control-gutter-md)',
  'text-[14px] leading-[20px] font-normal text-(--color-text) outline-none [box-shadow:inset_0_0_0_1px_var(--input)]',
  'transition-[box-shadow,background-color,color] duration-150 ease-[ease]',
  'hover:[box-shadow:inset_0_0_0_1px_var(--alpha-25)] in-data-[theme=dark]:hover:[box-shadow:inset_0_0_0_1px_var(--alpha-30)]',
  'focus:[box-shadow:inset_0_0_0_1px_var(--alpha-50)] in-data-[theme=dark]:focus:[box-shadow:inset_0_0_0_1px_var(--alpha-50)]',
].join(' ')
const nhan = 'text-[14px] leading-[20px] font-medium text-foreground'
const oTick = [
  'relative top-px m-0 grid size-[18px] shrink-0 cursor-pointer appearance-none place-content-center',
  'rounded-(--radius-xs) border border-solid border-(--gray-200) bg-transparent in-data-[theme=dark]:border-(--gray-500)',
  'transition-[border-color,background-color] duration-150 ease-[ease] hover:border-(--gray-300)',
  'in-data-[theme=dark]:hover:border-(--gray-600) checked:border-(--gray-900) checked:bg-(--gray-900)',
  'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)',
  "after:h-[6px] after:w-[10px] after:-translate-y-px after:-rotate-45 after:border-0 after:border-b-2 after:border-l-2",
  "after:border-solid after:border-(--gray-0) after:opacity-0 after:content-[''] checked:after:opacity-100",
].join(' ')

/** Nút + sheet "Bộ lọc nâng cao" — dùng chung khối cũ và hàng biến thể. */
function SheetLoc() {
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
          <form id="sheet-loc" className="contents">
            {/* `.ui-field`: cột, gap 6 */}
            <div data-so="truong" className="flex min-w-0 flex-col gap-1.5 border-none border-current">
              <label htmlFor="sheet-kenh" className={nhan}>
                Kênh bán
              </label>
              <div className="relative flex items-center">
                <select id="sheet-kenh" className={`${oNhap} cursor-pointer appearance-none pr-10 font-medium`}>
                  <option>Tất cả kênh</option>
                  <option>Cửa hàng</option>
                  <option>Website</option>
                  <option>Sàn TMĐT</option>
                </select>
                <CaretDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-(--control-gutter-md) size-4 text-muted-foreground"
                />
              </div>
            </div>
            <div role="group" aria-labelledby="sheet-ngay" className="flex min-w-0 flex-col gap-1.5">
              <span id="sheet-ngay" className={nhan}>
                Ngày tạo
              </span>
              {/* `.ui-row` flex-wrap nowrap, gap 8 */}
              <div className="flex items-center gap-2">
                <input type="date" aria-label="Từ ngày" className={oNhap} />
                <input type="date" aria-label="Đến ngày" className={oNhap} />
              </div>
            </div>
            {/* `.ui-stack`: cột gap 8; `.ui-checkbox-label`: inline-flex, đầu dòng, gap 8, 14/20 */}
            <div role="group" aria-labelledby="sheet-tt" className="flex flex-col gap-2">
              <span id="sheet-tt" className={nhan}>
                Tình trạng
              </span>
              {['Chờ xử lý', 'Đang giao', 'Hoàn tất'].map((t, i) => (
                <label key={t} className="inline-flex cursor-pointer items-start gap-2 text-[14px] leading-[20px]">
                  <input type="checkbox" defaultChecked={i === 0} className={oTick} /> {t}
                </label>
              ))}
            </div>
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
 * tạo (hai ô ngày), Tình trạng (ba checkbox); footer Xoá lọc (ghost, đặt lại form) + Áp dụng (đóng). Preview vẽ sheet
 * tĩnh trong khung 408px; DS mở thật bám mép phải khung nhìn qua nút. `data-so` = khoá so khớp (ds/so-khop/sheet.json).
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
