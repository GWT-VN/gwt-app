import { MagnifyingGlass } from '@phosphor-icons/react/ssr'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

/**
 * #input — tái tạo ds/nguon/components/Input/preview.html: lưới tự xếp cột tối thiểu 220 (style inline của preview),
 * gap 16; 6 ô: tên KH + gợi ý, tìm có icon, hover/focus, SĐT lỗi, mã đơn tắt, ghi chú. Preview ép hover/focus bằng
 * class `.is-hover`/`.is-focus`; ở đây rê chuột / Tab thật mới thấy (so khớp đo bằng bước `tro`/`tab`).
 * Dữ liệu minh hoạ (demo). `data-so` = khoá so khớp (ds/so-khop/input.json).
 */
export function KhoiInput() {
  return (
    <section id="input" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#input">Input · Label · Textarea</a>
      </h2>
      {/* border-none border-current: div ăn preflight `0 solid var(--border)` của app; div preview không viền. */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 border-none border-current">
        <Field data-so="field">
          <FieldLabel data-so="label" htmlFor="ds-input-ten" required>
            Tên khách hàng
          </FieldLabel>
          <Input data-so="ten" id="ds-input-ten" placeholder="VD: Công ty Demo A" aria-describedby="ds-input-ten-h" />
          <FieldDescription data-so="help" id="ds-input-ten-h">
            Dữ liệu minh hoạ (demo).
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="ds-input-tim">Tìm kiếm</FieldLabel>
          <Input
            data-so="tim"
            id="ds-input-tim"
            type="search"
            placeholder="Mã hoặc tên, không cần dấu"
            icon={<MagnifyingGlass />}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="ds-input-hover">Hover / Focus</FieldLabel>
          <Input data-so="hover" id="ds-input-hover" defaultValue="Viền hover (alpha-25)" />
          <Input data-so="focus" defaultValue="Viền focus (alpha-50)" aria-label="Focus" />
        </Field>
        <Field>
          <FieldLabel htmlFor="ds-input-sdt">Số điện thoại</FieldLabel>
          <Input data-so="loi" id="ds-input-sdt" defaultValue="09x" aria-invalid aria-describedby="ds-input-sdt-e" />
          <FieldError data-so="loi-msg" id="ds-input-sdt-e">
            Số điện thoại phải có 10 chữ số.
          </FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="ds-input-ma">Mã đơn</FieldLabel>
          <Input data-so="tat" id="ds-input-ma" defaultValue="DH-DEMO-0001" disabled aria-describedby="ds-input-ma-h" />
          <FieldDescription data-so="tat-help" id="ds-input-ma-h">
            Tự sinh, không sửa được.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="ds-input-gc">Ghi chú</FieldLabel>
          <Textarea data-so="ghi-chu" id="ds-input-gc" placeholder="Nội dung trao đổi với khách…" />
        </Field>
      </div>
    </section>
  )
}
