'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import { BienThe, KhoiHang } from '../_khung/tam'

/**
 * Demo cố định: coi 20/11/2026 là mốc "từ ngày" (`tuNgay`) để trạng thái "hạn đã qua" luôn đúng dù xem ngày nào, và
 * không tính ngày lúc render (server UTC ≠ máy VN → lệch hydrate). Dữ liệu demo, không PII.
 */
const TU = '2026-11-20'

const VIEC = [
  { ma: 'TK-101', viec: 'Lắp máy lọc tầng 3', han: '2026-11-25T14:30:00+07:00' },
  { ma: 'TK-102', viec: 'Thay lõi định kỳ', han: null },
  { ma: 'TK-105', viec: 'Gọi lại khách hỏi giá', han: '2026-11-27' },
  { ma: 'TK-103', viec: 'Kiểm tra rò nước', han: '2026-11-18T09:00:00+07:00' },
]

function BangHan() {
  const [han, setHan] = useState<Record<string, string | null>>(() => Object.fromEntries(VIEC.map((v) => [v.ma, v.han])))
  return (
    <TableWrap vien className="max-w-[480px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã</TableHead>
            <TableHead>Việc</TableHead>
            <TableHead>Hạn</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {VIEC.map((v) => (
            <TableRow key={v.ma}>
              <TableCell className="tabular-nums">{v.ma}</TableCell>
              <TableCell>{v.viec}</TableCell>
              <TableCell>
                <DateTimePicker
                  gon
                  aria-label={`Hạn ${v.ma}`}
                  placeholder="Đặt hạn"
                  tuNgay={TU}
                  value={han[v.ma]}
                  onValueChange={(x) => setHan((h) => ({ ...h, [v.ma]: x }))}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableWrap>
  )
}

/** Pop mở từ chỗ khác (mục menu "Đặt hạn…", phím tắt) qua `open`/`onOpenChange`, vẫn neo tại ô Hạn. */
function MoTuNgoai() {
  const [mo, setMo] = useState(false)
  const [v, setV] = useState<string | null>(null)
  return (
    <div className="flex flex-wrap items-center gap-3 border-none border-current">
      <Button variant="outline" size="sm" onClick={() => setMo(true)}>
        Đặt hạn…
      </Button>
      <DateTimePicker gon aria-label="Hạn TK-104" placeholder="Đặt hạn" tuNgay={TU} value={v} onValueChange={setV} open={mo} onOpenChange={setMo} />
    </div>
  )
}

function CacBienThe() {
  const [trong, setTrong] = useState<string | null>(null)
  const [co, setCo] = useState<string | null>('2026-11-25T14:30:00+07:00')
  const [chiNgay, setChiNgay] = useState<string | null>('2026-11-27')
  const [qua, setQua] = useState<string | null>('2026-11-18T09:00:00+07:00')
  const [loi, setLoi] = useState<string | null>(null)
  return (
    <>
      <BienThe
        ten="Trống"
        moTa="Bấm mở: chọn ngày ở lịch (hoặc gõ 25/11 ở ô ngày dưới lịch), muốn có giờ thì Tab gõ 1430; Enter hoặc Xong là lưu. Huỷ / Esc / bấm ra ngoài = không lưu."
      >
        <Field className="max-w-80">
          <FieldLabel htmlFor="dsh-dtp-trong">Hạn xử lý</FieldLabel>
          <DateTimePicker id="dsh-dtp-trong" aria-describedby="dsh-dtp-trong-mo" tuNgay={TU} value={trong} onValueChange={setTrong} />
          <FieldDescription id="dsh-dtp-trong-mo">Giờ không bắt buộc — chỉ chọn ngày thì chỉ lưu ngày.</FieldDescription>
        </Field>
      </BienThe>
      <BienThe ten="Chỉ ngày" moTa="Lưu “2026-11-27”, hiện “27/11/2026” — không tự gán giờ. Mở ra ô giờ trống; gõ giờ rồi Xong là thêm giờ.">
        <Field className="max-w-80">
          <FieldLabel htmlFor="dsh-dtp-chi-ngay">Hạn xử lý</FieldLabel>
          <DateTimePicker id="dsh-dtp-chi-ngay" tuNgay={TU} value={chiNgay} onValueChange={setChiNgay} />
        </Field>
      </BienThe>
      <BienThe ten="Có ngày + giờ" moTa="Mở lại thấy đúng ngày giờ đang lưu; đổi xong phải bấm Xong mới lưu. ✕ ở ô giờ = bỏ giờ, về chỉ ngày. Xoá (trái chân pop) xoá cả hạn ngay.">
        <Field className="max-w-80">
          <FieldLabel htmlFor="dsh-dtp-co">Hạn xử lý</FieldLabel>
          <DateTimePicker id="dsh-dtp-co" tuNgay={TU} value={co} onValueChange={setCo} />
        </Field>
      </BienThe>
      <BienThe ten="Hạn đã qua" moTa="Ngày đã qua bị gạch, không chọn được — trừ ngày của hạn đang có (18/11), vẫn chọn lại được.">
        <Field className="max-w-80">
          <FieldLabel htmlFor="dsh-dtp-qua">Hạn xử lý</FieldLabel>
          <DateTimePicker id="dsh-dtp-qua" tuNgay={TU} value={qua} onValueChange={setQua} />
        </Field>
      </BienThe>
      <BienThe ten="Lỗi" moTa="Bắt buộc mà còn trống khi lưu — viền đỏ + câu lỗi đọc cùng ô.">
        <Field className="max-w-80">
          <FieldLabel htmlFor="dsh-dtp-loi" required>
            Hạn xử lý
          </FieldLabel>
          <DateTimePicker
            id="dsh-dtp-loi"
            required
            tuNgay={TU}
            value={loi}
            onValueChange={setLoi}
            aria-invalid={!loi}
            aria-describedby={loi ? undefined : 'dsh-dtp-loi-msg'}
          />
          {!loi && <FieldError id="dsh-dtp-loi-msg">Chọn hạn xử lý.</FieldError>}
        </Field>
      </BienThe>
      <BienThe ten="Tắt" moTa="Không được sửa (đã chốt, thiếu quyền) — vẫn đọc được ngày giờ.">
        <Field className="max-w-80">
          <FieldLabel htmlFor="dsh-dtp-tat">Hạn xử lý</FieldLabel>
          <DateTimePicker id="dsh-dtp-tat" disabled value="2026-11-25T14:30:00+07:00" onValueChange={() => {}} />
        </Field>
      </BienThe>
      <BienThe ten="Gọn trong bảng" moTa="Ô Hạn của dòng: hiện “25/11 14:30”, chỉ ngày “27/11”, trống hiện “Đặt hạn”; ▾ khi rê / focus. Pop y như ô form.">
        <BangHan />
      </BienThe>
      <BienThe ten="Mở từ ngoài" moTa="Mục menu “Đặt hạn…” mở pop ngay tại ô Hạn (open / onOpenChange).">
        <MoTuNgoai />
      </BienThe>
    </>
  )
}

/** #date-time-picker trần (/ds/tron). Chưa có trong artifact → không có cổng so khớp riêng. */
export function KhoiDateTimePicker() {
  return (
    <section id="date-time-picker" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#date-time-picker">DateTimePicker</a>
      </h2>
      <div className="divide-y divide-(--border) border-none border-current">
        <CacBienThe />
      </div>
    </section>
  )
}

/** #date-time-picker dạng hàng (/ds). */
export function KhoiDateTimePickerHang() {
  return (
    <KhoiHang neo="date-time-picker">
      <CacBienThe />
    </KhoiHang>
  )
}
