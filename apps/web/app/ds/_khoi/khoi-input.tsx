import { MagnifyingGlass } from '@phosphor-icons/react/ssr'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { BienThe, KhoiHang } from '../_khung/tam'

/* Ô demo dùng chung cho KhoiInput (so khớp, /ds/tron) và KhoiInputHang (/ds). `id` truyền vào để mỗi trang một id. */

function TruongTen({ id, giaTri, goiY = true }: { id: string; giaTri?: string; goiY?: boolean }) {
  return (
    <Field data-so="field">
      <FieldLabel data-so="label" htmlFor={id} required>
        Tên khách hàng
      </FieldLabel>
      <Input
        data-so="ten"
        id={id}
        placeholder="VD: Công ty Demo A"
        defaultValue={giaTri}
        aria-required
        aria-describedby={goiY ? `${id}-h` : undefined}
      />
      {goiY && (
        <FieldDescription data-so="help" id={`${id}-h`}>
          Dữ liệu minh hoạ (demo).
        </FieldDescription>
      )}
    </Field>
  )
}

function TruongTim({ id }: { id: string }) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>Tìm kiếm</FieldLabel>
      <Input data-so="tim" id={id} type="search" placeholder="Mã hoặc tên, không cần dấu" icon={<MagnifyingGlass />} />
    </Field>
  )
}

function TruongHover({ id }: { id: string }) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>Hover / Focus</FieldLabel>
      <Input data-so="hover" id={id} defaultValue="Viền hover (alpha-25)" />
      <Input data-so="focus" defaultValue="Viền focus (alpha-50)" aria-label="Focus" />
    </Field>
  )
}

function TruongSdt({ id }: { id: string }) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>Số điện thoại</FieldLabel>
      <Input data-so="loi" id={id} defaultValue="09x" aria-invalid aria-describedby={`${id}-e`} />
      <FieldError data-so="loi-msg" id={`${id}-e`}>
        Số điện thoại phải có 10 chữ số.
      </FieldError>
    </Field>
  )
}

function TruongMa({ id }: { id: string }) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>Mã đơn</FieldLabel>
      <Input data-so="tat" id={id} defaultValue="DH-DEMO-0001" disabled aria-describedby={`${id}-h`} />
      <FieldDescription data-so="tat-help" id={`${id}-h`}>
        Tự sinh, không sửa được.
      </FieldDescription>
    </Field>
  )
}

function TruongGhiChu({ id }: { id: string }) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>Ghi chú</FieldLabel>
      <Textarea data-so="ghi-chu" id={id} placeholder="Nội dung trao đổi với khách…" />
    </Field>
  )
}

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
        <TruongTen id="ds-input-ten" />
        <TruongTim id="ds-input-tim" />
        <TruongHover id="ds-input-hover" />
        <TruongSdt id="ds-input-sdt" />
        <TruongMa id="ds-input-ma" />
        <TruongGhiChu id="ds-input-gc" />
      </div>
    </section>
  )
}

/** #input dạng hàng (/ds): mỗi trạng thái một hàng; ô rộng tối đa `max-w-sm` để không kéo hết cột demo. */
export function KhoiInputHang() {
  return (
    <KhoiHang neo="input">
      <BienThe ten="Mặc định" moTa="Ô trống, placeholder gợi ý định dạng; dấu * = bắt buộc.">
        <div className="max-w-sm">
          <TruongTen id="ds-ih-mac-dinh" goiY={false} />
        </div>
      </BienThe>
      <BienThe ten="Có giá trị" moTa="Đã nhập hoặc nạp sẵn từ dữ liệu.">
        <div className="max-w-sm">
          <TruongTen id="ds-ih-gia-tri" giaTri="Công ty Demo A" goiY={false} />
        </div>
      </BienThe>
      <BienThe ten="Có icon" moTa="Ô tìm kiếm: icon kính lúp bên trái.">
        <div className="max-w-sm">
          <TruongTim id="ds-ih-tim" />
        </div>
      </BienThe>
      <BienThe ten="Gợi ý" moTa="Dòng mô tả dưới ô, nối bằng aria-describedby.">
        <div className="max-w-sm">
          <TruongTen id="ds-ih-goi-y" />
        </div>
      </BienThe>
      <BienThe ten="Hover / Focus" moTa="Rê chuột / Tab để thấy viền đậm dần.">
        <div className="max-w-sm">
          <TruongHover id="ds-ih-hover" />
        </div>
      </BienThe>
      <BienThe ten="Lỗi" moTa="Viền đỏ + câu lỗi nói cách sửa.">
        <div className="max-w-sm">
          <TruongSdt id="ds-ih-sdt" />
        </div>
      </BienThe>
      <BienThe ten="Tắt" moTa="Hệ thống tự sinh, không sửa được — kèm lý do.">
        <div className="max-w-sm">
          <TruongMa id="ds-ih-ma" />
        </div>
      </BienThe>
      <BienThe ten="Textarea" moTa="Nội dung nhiều dòng (ghi chú, mô tả).">
        <div className="max-w-sm">
          <TruongGhiChu id="ds-ih-gc" />
        </div>
      </BienThe>
    </KhoiHang>
  )
}
