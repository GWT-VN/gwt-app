'use client'

import { useId, useRef, useState, type KeyboardEvent, type RefObject } from 'react'
import { BookmarkSimple } from '@phosphor-icons/react/ssr'
import { Popover as PopoverPrimitive } from 'radix-ui'
import { Button } from './button'
import { Checkbox, ChoiceLabel } from './checkbox'
import { svChan, svChip, svKhung, svTieuDe, svTomTat } from './data-view-styles'
import { Field, FieldError, FieldLabel } from './field'
import { Input } from './input'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { thongBao } from './toast'

const TOI_DA = 40
const LOI = 'Đặt tên để tìm lại trong sidebar.'

type GiaTriLuu = { ten: string; chiaSe: boolean; query: string }

/**
 * SavedView — nút "Lưu bộ lọc" (cắm vào khe `phai` của `ThanhDangLoc`) + popover lưu tổ hợp lọc / sắp / dạng xem thành
 * một mục "Bộ lọc đã lưu" (README SavedView, mới 18/11).
 * - Tóm tắt = chip (không ×) các điều kiện sẽ lưu. Tên bắt buộc, tối đa 40, focus sẵn khi mở; trống → câu lỗi
 *   `.ui-error` đúng chữ README, ô `aria-invalid` + `aria-describedby`, focus về ô. Chia sẻ cho cả khu (tắt = chỉ mình).
 * - Enter trong ô = Lưu (submit), TRỪ khi bộ gõ tiếng Việt đang ghép chữ (`isComposing` / keyCode 229 — Enter thuộc bộ gõ).
 * - Lưu → `onLuu({ ten, chiaSe, query })` + toast "Đã lưu “…” vào Bộ lọc đã lưu", đóng. Chỉ lưu CHUỖI query URL, không
 *   lưu dữ liệu; không đụng DB (bảng `saved_views` để sau — migration theo luật DB khi làm thật).
 * - Neo mép phải nút; Esc / Huỷ / bấm ngoài đóng, focus về nút (Radix). Nội dung chỉ mount khi mở → mở lại là form mới.
 */
export function SavedView({
  dieuKien,
  query,
  khu,
  onLuu,
}: {
  dieuKien: { nhan: string; giaTri: string }[]
  /** Chuỗi query URL của view đang xem (`q`, `cot`, `chieu`, lọc cột, `bo-cuc`…). */
  query: string
  /** Tên khu cho dòng chia sẻ ("Chia sẻ cho cả khu CSKH"). */
  khu: string
  onLuu: (v: GiaTriLuu) => void
}) {
  const [mo, setMo] = useState(false)
  const o = useRef<HTMLInputElement>(null)
  const idTieuDe = useId()
  return (
    <Popover open={mo} onOpenChange={setMo}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <BookmarkSimple aria-hidden="true" />
          Lưu bộ lọc
        </Button>
      </PopoverTrigger>
      <PopoverContent
        data-slot="saved-view"
        align="end"
        aria-labelledby={idTieuDe}
        className={svKhung}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          o.current?.focus()
        }}
      >
        <NoiDung
          o={o}
          idTieuDe={idTieuDe}
          dieuKien={dieuKien}
          khu={khu}
          luu={(ten, chiaSe) => {
            onLuu({ ten, chiaSe, query })
            thongBao.xong(`Đã lưu “${ten}” vào Bộ lọc đã lưu`)
            setMo(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

function NoiDung({
  o,
  idTieuDe,
  dieuKien,
  khu,
  luu,
}: {
  o: RefObject<HTMLInputElement | null>
  idTieuDe: string
  dieuKien: { nhan: string; giaTri: string }[]
  khu: string
  luu: (ten: string, chiaSe: boolean) => void
}) {
  const [ten, setTen] = useState('')
  const [chiaSe, setChiaSe] = useState(false)
  const [loi, setLoi] = useState(false)
  const id = useId()
  const chanGhepChu = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
  }
  return (
    <form
      noValidate
      className="contents"
      onSubmit={(e) => {
        e.preventDefault()
        const t = ten.trim()
        if (!t) {
          setLoi(true)
          o.current?.focus()
          return
        }
        luu(t, chiaSe)
      }}
    >
      <h2 id={idTieuDe} className={svTieuDe}>
        Lưu bộ lọc
      </h2>
      {dieuKien.length > 0 && (
        <div className={svTomTat}>
          {dieuKien.map((d) => (
            <span key={d.nhan} className={svChip}>
              {d.nhan}: <strong>{d.giaTri}</strong>
            </span>
          ))}
        </div>
      )}
      <Field>
        <FieldLabel htmlFor={`${id}-ten`}>Tên bộ lọc</FieldLabel>
        <Input
          ref={o}
          id={`${id}-ten`}
          placeholder="VD: P1 rò rỉ chưa xử lý"
          maxLength={TOI_DA}
          required
          value={ten}
          onChange={(e) => {
            setTen(e.target.value)
            setLoi(false)
          }}
          onKeyDown={chanGhepChu}
          aria-invalid={loi || undefined}
          aria-describedby={loi ? `${id}-loi` : undefined}
        />
        {loi && <FieldError id={`${id}-loi`}>{LOI}</FieldError>}
      </Field>
      <ChoiceLabel nhan={`Chia sẻ cho cả khu ${khu}`} moTa="Tắt thì chỉ mình bạn thấy.">
        <Checkbox checked={chiaSe} onCheckedChange={(v) => setChiaSe(v === true)} />
      </ChoiceLabel>
      <div className={svChan}>
        <PopoverPrimitive.Close asChild>
          <Button variant="outline" size="sm">
            Huỷ
          </Button>
        </PopoverPrimitive.Close>
        <Button type="submit" size="sm">
          Lưu
        </Button>
      </div>
    </form>
  )
}
