import { Checkbox, ChoiceLabel } from '@/components/ui/checkbox'
import { FieldError } from '@/components/ui/field'

/**
 * #checkbox — tái tạo ds/nguon/components/Checkbox/preview.html: hàng xuống dòng (`.ui-row`, gap 20 theo style inline,
 * căn đầu), 8 trạng thái: chưa chọn, đã chọn, một phần, hover, focus, tắt, tắt đã chọn, lỗi + câu lỗi. Preview ép
 * hover/focus bằng class; ở đây rê chuột / Tab thật mới thấy (so khớp đo bằng bước `tro`/`tab`). `data-so` đặt ở
 * nhãn; ô là button con.
 * Dữ liệu minh hoạ (demo). `data-so` = khoá so khớp (ds/so-khop/checkbox.json).
 */
export function KhoiCheckbox() {
  return (
    <section id="checkbox" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#checkbox">Checkbox</a>
      </h2>
      {/* border-none border-current: div/span ăn preflight `0 solid var(--border)` của app; preview không viền. */}
      <div data-so="hang" className="flex flex-wrap items-start gap-5 border-none border-current">
        <ChoiceLabel data-so="chua">
          <Checkbox /> Chưa chọn
        </ChoiceLabel>
        <ChoiceLabel data-so="chon">
          <Checkbox defaultChecked /> Đã chọn
        </ChoiceLabel>
        <ChoiceLabel data-so="mot-phan">
          <Checkbox defaultChecked="indeterminate" /> Chọn một phần
        </ChoiceLabel>
        <ChoiceLabel data-so="hover">
          <Checkbox /> Hover
        </ChoiceLabel>
        <ChoiceLabel data-so="focus">
          <Checkbox /> Focus
        </ChoiceLabel>
        <ChoiceLabel data-so="tat">
          <Checkbox disabled /> Disabled
        </ChoiceLabel>
        <ChoiceLabel data-so="tat-chon">
          <Checkbox disabled defaultChecked /> Disabled đã chọn
        </ChoiceLabel>
        <div data-so="loi-khoi" className="flex flex-col gap-1 border-none border-current">
          <ChoiceLabel data-so="loi">
            <Checkbox aria-invalid aria-describedby="ds-cb-loi" /> Tôi đã kiểm tra số serial
          </ChoiceLabel>
          {/* Lùi 26 = ô 18 + cách 8 (style inline của preview) → câu lỗi thẳng chữ nhãn. */}
          <FieldError data-so="loi-msg" id="ds-cb-loi" className="pl-[26px]">
            Cần xác nhận trước khi lưu.
          </FieldError>
        </div>
      </div>
    </section>
  )
}
