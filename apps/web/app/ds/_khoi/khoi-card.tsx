'use client'

import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { BienThe, KhoiHang } from '../_khung/tam'

/* Demo dùng chung cho `KhoiCard` (/ds/tron) và `KhoiCardHang` (/ds) — dữ liệu demo. `data-so` = khoá so khớp. */

/** Tiêu đề thẻ là một mục của trang → heading cấp 3 (dưới tiêu đề trang / tấm). */
const tieuDe = (chu: string) => (
  <CardTitle data-so="tieu-de" role="heading" aria-level={3}>
    {chu}
  </CardTitle>
)

const CO_BAN = (
  <Card data-so="the-1">
    <CardHeader data-so="dau">
      {tieuDe('Hợp đồng bảo trì')}
      <CardDescription data-so="mo-ta">Hiệu lực tới 31/12/2026</CardDescription>
    </CardHeader>
    <CardContent data-so="than">Bảo dưỡng 3 tháng một lần, gồm thay lọc và kiểm tra áp suất.</CardContent>
  </Card>
)

const HANH_DONG = (
  <Card data-so="the-2">
    <CardHeader data-so="dau">
      {tieuDe('Máy nén khí GA-37')}
      <CardDescription data-so="mo-ta">Lắp đặt 03/2025 · Kho Bình Dương</CardDescription>
      <CardAction data-so="hanh-dong">
        <Button data-so="sua" variant="outline" size="sm" aria-label="Sửa máy nén khí GA-37">
          Sửa
        </Button>
      </CardAction>
    </CardHeader>
    <CardContent data-so="than">Lần bảo dưỡng gần nhất: 12/11/2026.</CardContent>
  </Card>
)

const CHAN = (
  <Card data-so="the-3">
    <CardHeader data-so="dau">
      {tieuDe('Báo cáo thu chi tháng 11')}
      <CardDescription data-so="mo-ta">Chốt số ngày 30/11/2026</CardDescription>
    </CardHeader>
    <CardContent data-so="than">42 khoản chi · 18 khoản thu, chưa đối chiếu sao kê.</CardContent>
    <CardFooter data-so="chan">
      <Button data-so="phu" variant="outline">
        Xem trước
      </Button>
      <Button data-so="chinh">Xuất Excel</Button>
    </CardFooter>
  </Card>
)

/** Thẻ bọc form ngắn: `<form>` nằm trong `Card`, các phần của thẻ là con của form (cách nhau như con trực tiếp). */
function TrongForm({ p }: { p: string }) {
  return (
    <Card data-so="the-4">
      <form noValidate className="border-none border-current" onSubmit={(e) => e.preventDefault()}>
        <CardHeader data-so="dau">
          {tieuDe('Liên hệ nhận báo giá')}
          <CardDescription data-so="mo-ta">Trường có dấu * là bắt buộc.</CardDescription>
        </CardHeader>
        <CardContent data-so="than" className="flex flex-col gap-4">
          <Field data-so="o-1">
            <FieldLabel htmlFor={`${p}-cty`} required>
              Tên công ty
            </FieldLabel>
            <Input id={`${p}-cty`} placeholder="VD: Công ty TNHH ABC" aria-required />
          </Field>
          <Field data-so="o-2">
            <FieldLabel htmlFor={`${p}-email`}>Email nhận báo giá</FieldLabel>
            <Input id={`${p}-email`} type="email" placeholder="ten@congty.vn" />
          </Field>
        </CardContent>
        <CardFooter data-so="chan">
          <Button data-so="phu" variant="outline">
            Huỷ
          </Button>
          <Button data-so="chinh" type="submit">
            Gửi
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

/**
 * #card — tái tạo ds/nguon/components/Card/preview.html: cột rộng tối đa 560, bốn thẻ cách 16 (cơ bản · có hành động ở
 * header · có chân nút · bọc form). `data-so` = khoá so khớp (ds/so-khop/card.json nhắm `#card > div`).
 */
export function KhoiCard() {
  return (
    <section id="card" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#card">Card</a>
      </h2>
      <div className="flex max-w-140 flex-col gap-4 border-none border-current">
        {CO_BAN}
        {HANH_DONG}
        {CHAN}
        <TrongForm p="ds-card" />
      </div>
    </section>
  )
}

/** #card dạng hàng cho /ds. */
export function KhoiCardHang() {
  return (
    <KhoiHang neo="card">
      <BienThe ten="Cơ bản" moTa="Tiêu đề + mô tả + nội dung. Viền tách khỏi trang, không bóng.">
        <div className="max-w-140 border-none border-current">{CO_BAN}</div>
      </BienThe>
      <BienThe ten="Có hành động" moTa="Nút ở góc phải phần đầu thẻ, ngang hàng tiêu đề + mô tả.">
        <div className="max-w-140 border-none border-current">{HANH_DONG}</div>
      </BienThe>
      <BienThe ten="Có chân nút" moTa="Chân thẻ: nút dồn phải, nút phụ (viền) đứng trước, nút chính sau.">
        <div className="max-w-140 border-none border-current">{CHAN}</div>
      </BienThe>
      <BienThe ten="Bọc form" moTa="Form ngắn trong thẻ. Form dài nhiều khối: xem FormLayout.">
        <div className="max-w-140 border-none border-current">
          <TrongForm p="ds-card-h" />
        </div>
      </BienThe>
    </KhoiHang>
  )
}
