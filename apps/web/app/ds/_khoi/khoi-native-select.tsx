import type { ComponentProps } from 'react'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from '@/components/ui/native-select'
import { BienThe, KhoiHang } from '../_khung/tam'

/** Demo không PII. Khối server: `<select>` gốc không cần JS, không truyền hàm sang client component. */
function KenhBan({ id, ...props }: { id: string } & Omit<ComponentProps<typeof NativeSelect>, 'id'>) {
  return (
    <NativeSelect id={id} defaultValue="online" {...props}>
      <NativeSelectOption value="online">Online</NativeSelectOption>
      <NativeSelectOption value="showroom">Showroom</NativeSelectOption>
      <NativeSelectOption value="dai-ly">Đại lý</NativeSelectOption>
    </NativeSelect>
  )
}

function CacBienThe() {
  return (
    <>
      <BienThe ten="Mặc định" moTa="Danh sách gốc của hệ điều hành — dùng cho form đơn giản ≤ 10 mục, chạy cả khi chưa có JS.">
        <Field className="max-w-80" data-so="mac-dinh">
          <FieldLabel htmlFor="dsh-ns-kenh">Kênh bán</FieldLabel>
          <KenhBan id="dsh-ns-kenh" />
        </Field>
      </BienThe>
      <BienThe ten="Nhóm" moTa="optgroup chia nhóm (tiêu đề nhóm do hệ điều hành vẽ).">
        <Field className="max-w-80">
          <FieldLabel htmlFor="dsh-ns-kho">Kho xuất</FieldLabel>
          <NativeSelect id="dsh-ns-kho" defaultValue="hn-1">
            <NativeSelectOptGroup label="Hà Nội">
              <NativeSelectOption value="hn-1">Kho Long Biên</NativeSelectOption>
              <NativeSelectOption value="hn-2">Kho Thanh Xuân</NativeSelectOption>
            </NativeSelectOptGroup>
            <NativeSelectOptGroup label="TP. Hồ Chí Minh">
              <NativeSelectOption value="hcm-1">Kho Thủ Đức</NativeSelectOption>
            </NativeSelectOptGroup>
          </NativeSelect>
        </Field>
      </BienThe>
      <BienThe ten="sm" moTa="size sm: cao 28 — thanh công cụ, bộ lọc gọn.">
        <div className="max-w-48 border-none border-current">
          <KenhBan id="dsh-ns-sm" size="sm" aria-label="Kênh bán" />
        </div>
      </BienThe>
      <BienThe ten="Lỗi" moTa="aria-invalid + câu lỗi nối aria-describedby.">
        <Field className="max-w-80">
          <FieldLabel htmlFor="dsh-ns-loi" required>
            Loại phiếu
          </FieldLabel>
          <NativeSelect id="dsh-ns-loi" defaultValue="" required aria-invalid aria-describedby="dsh-ns-loi-msg">
            <NativeSelectOption value="" disabled>
              Chọn loại phiếu
            </NativeSelectOption>
            <NativeSelectOption value="thu">Phiếu thu</NativeSelectOption>
            <NativeSelectOption value="chi">Phiếu chi</NativeSelectOption>
          </NativeSelect>
          <FieldError id="dsh-ns-loi-msg">Chọn loại phiếu.</FieldError>
        </Field>
      </BienThe>
      <BienThe ten="Tắt" moTa="Không đổi được (đã chốt, thiếu quyền) — vẫn đọc được giá trị.">
        <Field className="max-w-80">
          <FieldLabel htmlFor="dsh-ns-tat">Kênh bán</FieldLabel>
          <KenhBan id="dsh-ns-tat" disabled aria-describedby="dsh-ns-tat-mo" />
          <FieldDescription id="dsh-ns-tat-mo">Đơn đã xuất kho, không đổi kênh.</FieldDescription>
        </Field>
      </BienThe>
    </>
  )
}

/** #native-select trần (/ds/tron). Chưa có trong artifact → không có cổng so khớp riêng. */
export function KhoiNativeSelect() {
  return (
    <section id="native-select" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#native-select">NativeSelect</a>
      </h2>
      <div className="divide-y divide-(--border) border-none border-current">
        <CacBienThe />
      </div>
    </section>
  )
}

/** #native-select dạng hàng (/ds). */
export function KhoiNativeSelectHang() {
  return (
    <KhoiHang neo="native-select">
      <CacBienThe />
    </KhoiHang>
  )
}
