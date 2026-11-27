'use client'

import { useId, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from 'react'
import { BookmarkSimple } from '@phosphor-icons/react/ssr'
import { Popover as PopoverPrimitive } from 'radix-ui'
import { Button } from './button'
import { Checkbox, ChoiceLabel } from './checkbox'
import { svChan, svChip, svKhung, svTieuDe, svTomTat } from './data-view-styles'
import { Field, FieldError, FieldLabel } from './field'
import { Input } from './input'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { thongBao } from './sonner'

const TOI_DA = 40
const LOI = 'Đặt tên để tìm lại trong sidebar.'

type GiaTriLuu = { ten: string; chiaSe: boolean; query: string }

/** Chữ của popover — mặc định là "Lưu bộ lọc". Danh sách ticket dùng lại cho "Thêm tab" / "Lưu thành tab mới". */
type ChuSavedView = {
  tieuDe: string
  nhanTen: string
  placeholder: string
  loiTrong: string
  /** Nhãn ô "chia sẻ"; `false` = không hiện ô (người không có quyền lưu chung). */
  chiaSe: string | false
  moTaChiaSe: string
  /** Toast sau khi lưu; `false` = người gọi tự báo (lưu qua server action, có thể lỗi). */
  xong: ((ten: string) => string) | false
}

/**
 * SavedView — nút "Lưu bộ lọc" (cắm vào khe `phai` của `ThanhDangLoc`) + popover lưu tổ hợp lọc / sắp / dạng xem thành
 * một mục "Bộ lọc đã lưu" (README SavedView, mới 18/11).
 * - Tóm tắt = chip (không ×) các điều kiện sẽ lưu. Tên bắt buộc, tối đa 40, focus sẵn khi mở; trống → câu lỗi
 *   `.ui-error` đúng chữ README, ô `aria-invalid` + `aria-describedby`, focus về ô. Chia sẻ cho cả khu (tắt = chỉ mình).
 * - Enter trong ô = Lưu (submit), TRỪ khi bộ gõ tiếng Việt đang ghép chữ (`isComposing` / keyCode 229 — Enter thuộc bộ gõ).
 * - Lưu → `onLuu({ ten, chiaSe, query })` + toast "Đã lưu “…” vào Bộ lọc đã lưu", đóng. Chỉ lưu CHUỖI query URL, không
 *   lưu dữ liệu; không đụng DB (bảng `saved_views` để sau — migration theo luật DB khi làm thật).
 * - `trigger` (nút mở khác) + `chu` (chữ tiêu đề / nhãn / lỗi / ô chia sẻ, `chiaSe: false` ẩn ô; `xong: false` người gọi tự
 *   báo) — danh sách ticket dùng cho "Thêm tab" / "Lưu thành tab mới" (CEO 26/11).
 * - Neo mép phải nút; Esc / Huỷ / bấm ngoài đóng, focus về nút (Radix). Nội dung chỉ mount khi mở → mở lại là form mới.
 */
export function SavedView({
  dieuKien,
  query,
  khu,
  onLuu,
  trigger,
  chu: chuRieng,
}: {
  dieuKien: { nhan: string; giaTri: string }[]
  /** Chuỗi query URL của view đang xem (`q`, `cot`, `chieu`, lọc cột, `bo-cuc`…). */
  query: string
  /** Tên khu cho dòng chia sẻ ("Chia sẻ cho cả khu CSKH"). */
  khu: string
  onLuu: (v: GiaTriLuu) => void | Promise<void | { loi: string }>
  /** Nút mở (PopoverTrigger asChild); mặc định nút ghost "Lưu bộ lọc". */
  trigger?: ReactNode
  chu?: Partial<ChuSavedView>
}) {
  const chu: ChuSavedView = {
    tieuDe: 'Lưu bộ lọc',
    nhanTen: 'Tên bộ lọc',
    placeholder: 'VD: P1 rò rỉ chưa xử lý',
    loiTrong: LOI,
    chiaSe: `Chia sẻ cho cả khu ${khu}`,
    moTaChiaSe: 'Tắt thì chỉ mình bạn thấy.',
    xong: (ten) => `Đã lưu “${ten}” vào Bộ lọc đã lưu`,
    ...chuRieng,
  }
  const [mo, setMo] = useState(false)
  const [dangLuu, setDangLuu] = useState(false)
  const [loiLuu, setLoiLuu] = useState<string>()
  const khoa = useRef(false)
  const o = useRef<HTMLInputElement>(null)
  const idTieuDe = useId()
  return (
    <Popover open={mo} onOpenChange={(moi) => {
      if (khoa.current) return
      setLoiLuu(undefined)
      setMo(moi)
    }}>
      <PopoverTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm">
            <BookmarkSimple aria-hidden="true" />
            Lưu bộ lọc
          </Button>
        )}
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
          chu={chu}
          dangLuu={dangLuu}
          loiLuu={loiLuu}
          luu={async (ten, chiaSe) => {
            if (khoa.current) return
            khoa.current = true
            setDangLuu(true)
            setLoiLuu(undefined)
            try {
              const ketQua = await onLuu({ ten, chiaSe, query })
              if (ketQua?.loi) {
                setLoiLuu(ketQua.loi)
                return
              }
              if (chu.xong) thongBao.xong(chu.xong(ten))
              setMo(false)
            } catch {
              setLoiLuu('Không lưu được. Thử lại.')
            } finally {
              khoa.current = false
              setDangLuu(false)
            }
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
  chu,
  dangLuu,
  loiLuu,
  luu,
}: {
  o: RefObject<HTMLInputElement | null>
  idTieuDe: string
  dieuKien: { nhan: string; giaTri: string }[]
  chu: ChuSavedView
  dangLuu: boolean
  loiLuu?: string
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
        {chu.tieuDe}
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
        <FieldLabel htmlFor={`${id}-ten`}>{chu.nhanTen}</FieldLabel>
        <Input
          ref={o}
          id={`${id}-ten`}
          placeholder={chu.placeholder}
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
        {loi && <FieldError id={`${id}-loi`}>{chu.loiTrong}</FieldError>}
      </Field>
      {chu.chiaSe && (
        <ChoiceLabel nhan={chu.chiaSe} moTa={chu.moTaChiaSe}>
          <Checkbox checked={chiaSe} onCheckedChange={(v) => setChiaSe(v === true)} />
        </ChoiceLabel>
      )}
      {loiLuu && <FieldError role="alert">{loiLuu}</FieldError>}
      <div className={svChan}>
        <PopoverPrimitive.Close asChild>
          <Button variant="outline" size="sm" disabled={dangLuu}>
            Huỷ
          </Button>
        </PopoverPrimitive.Close>
        <Button type="submit" size="sm" loading={dangLuu}>
          Lưu
        </Button>
      </div>
    </form>
  )
}
