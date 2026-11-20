'use client'

import { useId, useState, type ComponentProps, type DragEvent, type ReactNode } from 'react'
import { FileText, Image as ImageIcon, UploadSimple, X } from '@phosphor-icons/react/ssr'
import { kichThuocDoc, kiemTep } from '@/lib/tep'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Tooltip } from './tooltip'

export { kichThuocDoc, kiemTep }

/**
 * FileUpload — giá trị chép từ `.ui-drop*`, `.ui-file*`, `.ui-progress` của ds/nguon/bundle.css; hành vi theo README
 * FileUpload của artifact (kiểm loại + dung lượng TRƯỚC khi tải, báo lỗi ngay trên dòng). Không thư viện: drag events gốc
 * + `<input type="file">` thật. Ba mảnh rời để màn tự giữ danh sách tệp + tiến độ tải (Supabase Storage):
 * - `FileDrop`: vùng thả (`<label>` bọc input ẩn nhìn, vẫn Tab được; Enter/Space mở hộp chọn). Trả MỌI tệp qua
 *   `onChonTep` — không lọc ngầm; màn gọi `kiemTep` cho từng tệp rồi hiện lỗi trên dòng.
 * - `kiemTep` (`lib/tep.ts`, file thường — gọi được ở server action): câu lỗi nói cách sửa, hoặc `null`.
 * - `FileList` + `FileItem`: dòng tệp gồm ô 32, tên/phụ, nút. (`FileList` trùng tên kiểu DOM toàn cục — file nào import
 *   nó mà cần kiểu DOM thì viết `globalThis.FileList`.)
 */

/** div/span/ul/li ăn preflight `0 solid var(--border)` của app; artifact không viền (kiểu none, màu currentColor). */
const khongVien = 'border-none border-current'

/**
 * Vùng thả `.ui-drop`: viền đứt alpha-25, padding 20/16, bo radius-lg, cột căn giữa gap 4.
 * Trạng thái (thứ tự biến thể Tailwind 4 không theo thứ tự cascade bundle.css → chặn bằng `not-*`, luật NGUON):
 * hover nền alpha-02 viền alpha-35 · đang kéo vào (`data-over`) viền liền ring + nền info-soft-alpha · focus phím trên
 * input → outline 2px ring quanh cả vùng · tắt (`aria-disabled`) viền alpha-15, chữ color-text-disabled, not-allowed.
 * `goiY` (loại + dung lượng tối đa, vd "Ảnh, PDF · tối đa 10 MB mỗi tệp") hiện kiểu `.ui-help`. Dung lượng tối đa do
 * màn truyền cho `kiemTep`, không phải prop của vùng thả.
 * Nối với form (a11y):
 * - Tên input = `aria-labelledby` (nhãn ngoài, vd FieldLabel "Biên bản bàn giao" có id) + tiêu đề vùng — KHÔNG gồm gợi ý
 *   (label bọc input thì tên mặc định là cả chữ trong label → gợi ý bị đọc hai lần, hai vùng thả cùng tên).
 * - Mô tả = id gợi ý + `aria-describedby` của người gọi (id FieldError).
 * - `aria-invalid` → input mang aria-invalid, vùng viền red-500 (khối aria-invalid của .ui-drop; đặt qua `data-invalid`
 *   vì aria-invalid trên label vô nghĩa với trình đọc). Tắt thắng lỗi; lỗi thắng viền hover và viền lúc kéo vào (y cascade).
 * - `required` → input `required`.
 * - `multiple={false}` mà thả nhiều tệp → chỉ trả tệp đầu (hộp chọn tự giới hạn). Tắt → dropEffect none (con trỏ cấm).
 */
export function FileDrop({
  onChonTep,
  accept,
  multiple = true,
  goiY,
  disabled,
  id,
  required,
  'aria-labelledby': nhanNgoai,
  'aria-describedby': moTaNgoai,
  'aria-invalid': ariaInvalid,
}: {
  onChonTep(tep: File[]): void
  accept?: string
  multiple?: boolean
  goiY: ReactNode
  disabled?: boolean
  id?: string
  required?: boolean
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: ComponentProps<'input'>['aria-invalid']
}) {
  const tuSinh = useId()
  const idInput = id ?? tuSinh
  const [qua, setQua] = useState(false)
  const loi = ariaInvalid === true || ariaInvalid === 'true'
  // Luôn preventDefault (kể cả khi tắt): bỏ qua thì trình duyệt mở tệp thả vào → rời trang. Tắt → con trỏ "cấm".
  const keoQua = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    if (disabled) e.dataTransfer.dropEffect = 'none'
    else setQua(true)
  }
  const chon = (ds: File[]) => {
    if (ds.length) onChonTep(multiple ? ds : ds.slice(0, 1))
  }
  return (
    <label
      htmlFor={idInput}
      data-slot="file-drop"
      data-over={qua || undefined}
      data-invalid={loi || undefined}
      aria-disabled={disabled || undefined}
      onDragOver={keoQua}
      onDragEnter={keoQua}
      // Rời sang phần tử con (icon, chữ) cũng bắn dragleave → chỉ tắt khi con trỏ ra hẳn khỏi vùng.
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setQua(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setQua(false)
        if (!disabled) chon(Array.from(e.dataTransfer.files))
      }}
      className={cn(
        'relative flex flex-col items-center gap-1 px-4 py-5 rounded-(--radius-lg) text-center cursor-pointer',
        'border border-dashed border-(--alpha-25) transition-[background-color,border-color] duration-150 ease-[ease]',
        'not-data-over:not-aria-disabled:hover:bg-(--alpha-02)',
        'not-data-over:not-data-invalid:not-aria-disabled:hover:border-(--alpha-35)',
        'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring',
        'data-over:border-solid data-over:bg-(--color-background-info-soft-alpha) not-data-invalid:data-over:border-(--ring)',
        'not-aria-disabled:data-invalid:border-(--red-500)',
        'aria-disabled:cursor-not-allowed aria-disabled:text-(--color-text-disabled) aria-disabled:bg-transparent',
        'aria-disabled:border-(--alpha-15)',
      )}
    >
      <input
        id={idInput}
        type="file"
        multiple={multiple}
        accept={accept}
        disabled={disabled}
        required={required}
        aria-invalid={ariaInvalid}
        aria-labelledby={[nhanNgoai, `${idInput}-tieu-de`].filter(Boolean).join(' ')}
        aria-describedby={[`${idInput}-goi-y`, moTaNgoai].filter(Boolean).join(' ')}
        // input file của .ui-drop: ẩn nhìn nhưng vẫn nhận Tab (không display:none / sr-only).
        className="absolute size-px opacity-0"
        onChange={(e) => {
          const ds = Array.from(e.target.files ?? [])
          e.target.value = '' // chọn lại đúng tệp vừa bỏ vẫn bắn change
          chon(ds)
        }}
      />
      <UploadSimple
        aria-hidden="true"
        className="mb-1 size-(--control-icon-size-lg) shrink-0 text-muted-foreground"
      />
      <span id={`${idInput}-tieu-de`} className={cn(khongVien, 'text-[14px] leading-[20px] font-medium')}>
        {qua ? (
          'Thả tệp vào đây'
        ) : (
          <>
            Kéo thả tệp hoặc <u className="underline-offset-[0.15em]">chọn từ máy</u>
          </>
        )}
      </span>
      {/* `.ui-help` dạng span: <p> (FieldDescription) không hợp lệ trong <label>. */}
      <span id={`${idInput}-goi-y`} className={cn(khongVien, 'text-[12px] leading-[18px] text-muted-foreground')}>
        {goiY}
      </span>
    </label>
  )
}

/**
 * `.ui-file-list`: cột gap 8, không lề/padding/dấu đầu dòng. Đọc là "Tệp đã chọn".
 * Live region polite, chỉ đọc PHẦN THÊM VÀO: dòng tệp mới (tên + câu lỗi "Quá 10 MB" nếu lỗi) và câu lỗi mới của dòng chuyển
 * sang lỗi (FileItem dựng lại phần tử phụ khi đổi trạng thái); % tiến độ đổi chữ tại chỗ nên không bị đọc liên tục.
 * Màn nên render FileList sẵn (kể cả rỗng) để vùng live có trước tệp đầu tiên.
 */
export function FileList({ className, ...props }: ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="file-list"
      aria-label="Tệp đã chọn"
      aria-live="polite"
      aria-relevant="additions"
      className={cn(khongVien, 'm-0 flex list-none flex-col gap-2 p-0', className)}
      {...props}
    />
  )
}

const LA_ANH = /\.(jpe?g|png|gif|webp|avif|heic|heif|bmp|svg)$/i
const DATA_STATE = { 'dang-tai': 'uploading', xong: 'done', loi: 'error' } as const

/**
 * Dòng tệp `.ui-file`: lưới 3 cột (ô 32, tên/phụ, nút) gap 12, padding 8, bo radius-lg, viền inset alpha-08 (lỗi red-500).
 * - Ô xem trước 32 nền muted: `anh` (URL xem trước) → ảnh cover; tên đuôi ảnh → icon Image; khác → FileText.
 * - Tên 14/20 cắt dấu ba chấm; phụ 12/18 color-text-tertiary tabular-nums ("2,3 MB · đang tải 60%"), lỗi → câu `loi` màu danger.
 * - Đang tải: thanh tiến độ cao 4 (`role=progressbar`), rãnh alpha-08, thanh primary-solid.
 * - Nút Bỏ ghost icon-sm, `aria-label="Bỏ <ten>"`, tooltip "Bỏ tệp" (mô tả thêm, không lặp nguyên aria-label — luật NGUON).
 * - `onThuLai` (lỗi mạng) → thêm nút "Thử lại" trước nút Bỏ.
 */
export function FileItem({
  ten,
  kichThuoc,
  trangThai,
  tienDo = 0,
  loi,
  anh,
  onBo,
  onThuLai,
}: {
  ten: string
  kichThuoc: number
  trangThai: 'dang-tai' | 'xong' | 'loi'
  tienDo?: number
  loi?: string
  anh?: string
  onBo(): void
  onThuLai?(): void
}) {
  const co = kichThuocDoc(kichThuoc)
  const phu = trangThai === 'loi' ? loi : trangThai === 'dang-tai' ? `${co} · đang tải ${tienDo}%` : `${co} · đã tải lên`
  const nutBo = (
    <Tooltip content="Bỏ tệp">
      <Button variant="ghost" size="icon-sm" aria-label={`Bỏ ${ten}`} onClick={onBo}>
        <X aria-hidden="true" />
      </Button>
    </Tooltip>
  )
  return (
    <li
      data-slot="file-item"
      data-state={DATA_STATE[trangThai]}
      className={cn(
        khongVien,
        'grid grid-cols-[var(--control-size-md)_minmax(0,1fr)_auto] items-center gap-3 p-2 rounded-(--radius-lg)',
        '[box-shadow:inset_0_0_0_1px_var(--alpha-08)] data-[state=error]:[box-shadow:inset_0_0_0_1px_var(--red-500)]',
      )}
    >
      <span
        data-slot="file-thumb"
        className={cn(
          khongVien,
          'grid size-(--control-size-md) place-content-center overflow-hidden rounded-(--radius-md) bg-muted text-muted-foreground',
        )}
      >
        {anh ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL xem trước (blob:) của tệp vừa chọn, không qua next/image
          <img src={anh} alt="" className="size-full object-cover" />
        ) : LA_ANH.test(ten) ? (
          <ImageIcon aria-hidden="true" className="size-4 shrink-0" />
        ) : (
          <FileText aria-hidden="true" className="size-4 shrink-0" />
        )}
      </span>
      <span className={cn(khongVien, 'min-w-0')}>
        <span
          data-slot="file-name"
          className={cn(khongVien, 'block truncate text-[14px] leading-[20px]')}
        >
          {ten}
        </span>
        <span
          // key theo trạng thái: chuyển sang lỗi → phần tử mới → live region của FileList đọc câu lỗi.
          key={trangThai === 'loi' ? 'loi' : 'phu'}
          data-slot="file-meta"
          className={cn(
            khongVien,
            'text-[12px] leading-[18px] text-(--color-text-tertiary) tabular-nums',
            trangThai === 'loi' && 'text-(--color-text-danger)',
          )}
        >
          {phu}
        </span>
        {trangThai === 'dang-tai' && (
          <span
            data-slot="file-progress"
            role="progressbar"
            aria-label={`Đang tải ${ten}`}
            aria-valuenow={tienDo}
            aria-valuemin={0}
            aria-valuemax={100}
            className={cn(khongVien, 'mt-1.5 block h-1 overflow-hidden rounded-(--radius-full) bg-(--alpha-08)')}
          >
            <span
              className={cn(
                khongVien,
                'block h-full rounded-[inherit] bg-(--color-background-primary-solid) transition-[width] duration-200 ease-[ease]',
              )}
              style={{ width: `${tienDo}%` }}
            />
          </span>
        )}
      </span>
      {onThuLai ? (
        <span className={cn(khongVien, 'flex items-center gap-1')}>
          <Button variant="ghost" size="sm" onClick={onThuLai}>
            Thử lại
          </Button>
          {nutBo}
        </span>
      ) : (
        nutBo
      )}
    </li>
  )
}
