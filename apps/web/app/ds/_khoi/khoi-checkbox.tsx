import { Checkbox, ChoiceLabel } from '@/components/ui/checkbox'
import { FieldError } from '@/components/ui/field'
import { BienThe, KhoiHang } from '../_khung/tam'

/* Ô demo dùng chung cho KhoiCheckbox (so khớp, /ds/tron) và KhoiCheckboxHang (/ds). */
const O = {
  chua: (
    <ChoiceLabel data-so="chua">
      <Checkbox /> Chưa chọn
    </ChoiceLabel>
  ),
  chon: (
    <ChoiceLabel data-so="chon">
      <Checkbox defaultChecked /> Đã chọn
    </ChoiceLabel>
  ),
  motPhan: (
    <ChoiceLabel data-so="mot-phan">
      <Checkbox defaultChecked="indeterminate" /> Chọn một phần
    </ChoiceLabel>
  ),
  hover: (
    <ChoiceLabel data-so="hover">
      <Checkbox /> Hover
    </ChoiceLabel>
  ),
  focus: (
    <ChoiceLabel data-so="focus">
      <Checkbox /> Focus
    </ChoiceLabel>
  ),
  tat: (
    <ChoiceLabel data-so="tat">
      <Checkbox disabled /> Disabled
    </ChoiceLabel>
  ),
  tatChon: (
    <ChoiceLabel data-so="tat-chon">
      <Checkbox disabled defaultChecked /> Disabled đã chọn
    </ChoiceLabel>
  ),
}

function Loi({ id }: { id: string }) {
  return (
    <div data-so="loi-khoi" className="flex flex-col gap-1 border-none border-current">
      <ChoiceLabel data-so="loi">
        <Checkbox aria-invalid aria-describedby={id} /> Tôi đã kiểm tra số serial
      </ChoiceLabel>
      {/* Lùi 26 = ô 18 + cách 8 (style inline của preview) → câu lỗi thẳng chữ nhãn. */}
      <FieldError data-so="loi-msg" id={id} className="pl-[26px]">
        Cần xác nhận trước khi lưu.
      </FieldError>
    </div>
  )
}

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
        {O.chua}
        {O.chon}
        {O.motPhan}
        {O.hover}
        {O.focus}
        {O.tat}
        {O.tatChon}
        <Loi id="ds-cb-loi" />
      </div>
    </section>
  )
}

/** #checkbox dạng hàng (/ds): mỗi trạng thái một hàng. Bấm chữ nhãn = bấm ô. */
export function KhoiCheckboxHang() {
  return (
    <KhoiHang neo="checkbox">
      <BienThe ten="Chưa chọn" moTa="Bật/tắt một tuỳ chọn độc lập; bấm cả chữ nhãn.">
        {O.chua}
      </BienThe>
      <BienThe ten="Đã chọn">{O.chon}</BienThe>
      <BienThe ten="Một phần" moTa="Ô cha khi chỉ một số ô con được chọn (chọn tất cả trong bảng).">
        {O.motPhan}
      </BienThe>
      <BienThe ten="Hover / Focus" moTa="Rê chuột / Tab để thấy.">
        <div className="flex flex-wrap gap-5">
          {O.hover}
          {O.focus}
        </div>
      </BienThe>
      <BienThe ten="Tắt" moTa="Không đổi được (thiếu quyền, phụ thuộc ô khác).">
        <div className="flex flex-wrap gap-5">
          {O.tat}
          {O.tatChon}
        </div>
      </BienThe>
      <BienThe ten="Lỗi" moTa="Bắt buộc tick trước khi lưu; câu lỗi thẳng chữ nhãn.">
        <Loi id="ds-cbh-loi" />
      </BienThe>
    </KhoiHang>
  )
}
