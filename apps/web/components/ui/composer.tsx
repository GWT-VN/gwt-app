'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { ArrowUp, Paperclip, X } from '@phosphor-icons/react/ssr'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { chip, chipX, composer, composerBar, composerFiles, composerHint, composerInput, composerSend } from './detail-styles'
import { FieldError } from './field'
import { Tooltip } from './tooltip'

/** Trình duyệt chưa có `field-sizing: content` (Firefox) → tự đặt cao theo nội dung; trần 240 vẫn do CSS chặn. */
const tuCao = (el: HTMLTextAreaElement | null) => {
  if (!el || typeof CSS === 'undefined' || !CSS.supports || CSS.supports('field-sizing', 'content')) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

/**
 * Composer — ô viết bình luận/ghi chú cuối `Timeline`, giá trị từ `.ui-composer*` + `.ui-chip*` của ds/nguon/bundle.css
 * (README Composer).
 * - Ô chữ tự cao 44–240 (`field-sizing: content`, có dự phòng). `<textarea>` trần trong khung tự vẽ (như ô trong
 *   InputAffix): `Textarea` của DS mang viền riêng, ở đây viền thuộc khung.
 * - Phím: Enter xuống dòng; Ctrl/⌘+Enter gửi. Bộ gõ tiếng Việt đang ghép chữ (`isComposing`, keyCode 229) → phím thuộc
 *   bộ gõ, không gửi. Trống (chỉ dấu cách, không tệp) → nút Gửi tắt, phím gửi không làm gì.
 * - `onGui(noiDung, tep)`: nội dung đã bỏ khoảng trắng hai đầu. Trả Promise → chờ (nút `aria-busy`, ô chỉ đọc);
 *   resolve → xoá ô + tệp; reject → GIỮ nguyên để gửi lại. Trả thường → xoá ngay (lỗi gửi kiểu đồng bộ: ném lỗi).
 * - `dangGui`: màn tự quản lúc gửi — khoá ô (readOnly, vẫn giữ focus) và nút (Button loading).
 * - `loi`: câu lỗi gửi → viền đỏ, ô `aria-invalid` + mô tả bằng câu lỗi, nút thành "Gửi lại". Câu lỗi nằm trong vùng
 *   `aria-live` có sẵn (lỗi đến sau khi gửi, focus vẫn ở ô → phải được đọc).
 * - `tep` (mặc định bật): nút 📎 + chip tệp có ×; bỏ tệp → focus về ô chữ. `accept` truyền cho hộp chọn tệp.
 * - `disabled`: khoá cả khung (mờ 50%), placeholder nói vì sao ("Ticket đã đóng — mở lại để ghi tiếp").
 * - Tooltip nút là mô tả thêm (phím tắt / việc làm), không lặp tên nút (luật NGUON).
 */
export function Composer({
  onGui,
  dangGui = false,
  loi,
  disabled = false,
  tep: choTep = true,
  accept,
  placeholder = 'Ghi lại việc vừa làm, khách nói gì…',
  defaultValue = '',
  defaultTep = [],
  'aria-label': nhan = 'Viết ghi chú',
  className,
}: {
  onGui(noiDung: string, tep: File[]): void | Promise<unknown>
  dangGui?: boolean
  loi?: ReactNode
  disabled?: boolean
  tep?: boolean
  accept?: string
  placeholder?: string
  defaultValue?: string
  defaultTep?: File[]
  'aria-label'?: string
  className?: string
}) {
  const [chu, setChu] = useState(defaultValue)
  const [tep, setTep] = useState<File[]>(defaultTep)
  const [cho, setCho] = useState(false)
  const o = useRef<HTMLTextAreaElement>(null)
  const chonTep = useRef<HTMLInputElement>(null)
  const idLoi = useId()
  const ban = dangGui || cho
  const rong = !chu.trim() && tep.length === 0
  useEffect(() => tuCao(o.current), [chu])

  const xoa = () => {
    setChu('')
    setTep([])
  }
  const gui = () => {
    if (rong || ban || disabled) return
    let kq: void | Promise<unknown>
    try {
      kq = onGui(chu.trim(), tep)
    } catch {
      return
    }
    if (!kq || typeof kq.then !== 'function') return xoa()
    setCho(true)
    kq.then(xoa, () => {}).finally(() => setCho(false))
  }
  const phim = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || !(e.ctrlKey || e.metaKey)) return
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    e.preventDefault()
    gui()
  }

  return (
    <div className={cn('flex min-w-0 flex-col border-none border-current', className)}>
      <div data-slot="composer" data-invalid={loi ? '' : undefined} data-disabled={disabled ? '' : undefined} className={composer}>
        <textarea
          ref={o}
          rows={1}
          aria-label={nhan}
          aria-invalid={loi ? true : undefined}
          aria-describedby={loi ? idLoi : undefined}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={ban}
          value={chu}
          onChange={(e) => setChu(e.target.value)}
          onKeyDown={phim}
          className={composerInput}
        />
        {tep.length > 0 && (
          <div className={composerFiles}>
            {tep.map((f, i) => (
              <span key={`${i}-${f.name}`} className={chip}>
                <Paperclip aria-hidden="true" />
                <span>{f.name}</span>
                <button
                  type="button"
                  data-slot="chip-x"
                  aria-label={`Bỏ tệp ${f.name}`}
                  disabled={ban || disabled}
                  className={chipX}
                  onClick={() => {
                    setTep(tep.filter((_, k) => k !== i))
                    o.current?.focus()
                  }}
                >
                  <X aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className={composerBar}>
          {choTep && (
            <>
              <Tooltip content="Chọn tệp từ máy">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Đính kèm tệp"
                  disabled={disabled || ban}
                  onClick={() => chonTep.current?.click()}
                >
                  <Paperclip aria-hidden="true" />
                </Button>
              </Tooltip>
              <input
                ref={chonTep}
                type="file"
                multiple
                accept={accept}
                hidden
                onChange={(e) => {
                  const moi = Array.from(e.target.files ?? [])
                  e.target.value = '' // chọn lại đúng tệp vừa bỏ vẫn bắn change
                  if (moi.length) setTep((cu) => [...cu, ...moi])
                }}
              />
            </>
          )}
          <span className={composerHint}>Ctrl + Enter để gửi</span>
          <Tooltip content={loi ? 'Gửi lại nội dung đang giữ' : 'Ctrl + Enter'}>
            <Button
              size="icon-sm"
              aria-label={loi ? 'Gửi lại' : 'Gửi'}
              loading={ban}
              disabled={disabled || rong}
              className={composerSend}
              onClick={gui}
            >
              <ArrowUp weight="bold" aria-hidden="true" />
            </Button>
          </Tooltip>
        </div>
      </div>
      {/* Vùng live luôn có sẵn (rỗng = cao 0) để câu lỗi đến sau được đọc; cách khung 6 như `.ui-field`. */}
      <div aria-live="polite" className="border-none border-current">
        {loi && (
          <FieldError id={idLoi} className="mt-1.5">
            {loi}
          </FieldError>
        )}
      </div>
    </div>
  )
}
