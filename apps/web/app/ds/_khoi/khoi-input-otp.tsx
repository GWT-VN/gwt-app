'use client'

import { useState } from 'react'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { BienThe, KhoiHang } from '../_khung/tam'

/** 6 ô liền (một nhóm) hoặc 3 – 3. Demo không PII. */
function Nhom({ tach }: { tach?: boolean }) {
  if (!tach)
    return (
      <InputOTPGroup>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <InputOTPSlot key={i} index={i} />
        ))}
      </InputOTPGroup>
    )
  return (
    <>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </>
  )
}

function CacBienThe() {
  const [ma, setMa] = useState('')
  const [maLoi, setMaLoi] = useState('482913')
  return (
    <>
      <BienThe ten="Mặc định" moTa="6 chữ số; gõ, dán cả mã, hoặc điện thoại tự điền mã SMS (one-time-code).">
        <Field className="w-fit" data-so="mac-dinh">
          <FieldLabel htmlFor="dsh-otp">Mã xác nhận</FieldLabel>
          <InputOTP
            id="dsh-otp"
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            value={ma}
            onChange={setMa}
            aria-describedby="dsh-otp-mo"
          >
            <Nhom />
          </InputOTP>
          <FieldDescription id="dsh-otp-mo">Mã gửi tới số •••• 4821, hết hạn sau 5 phút.</FieldDescription>
        </Field>
      </BienThe>
      <BienThe ten="Tách 3 – 3" moTa="InputOTPSeparator giữa hai nhóm — dễ đọc lại mã dài.">
        <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} aria-label="Mã xác nhận (tách nhóm)">
          <Nhom tach />
        </InputOTP>
      </BienThe>
      <BienThe ten="Lỗi" moTa="Mã sai: aria-invalid trên ô + câu lỗi.">
        <Field className="w-fit">
          <FieldLabel htmlFor="dsh-otp-loi">Mã xác nhận</FieldLabel>
          <InputOTP
            id="dsh-otp-loi"
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            value={maLoi}
            onChange={setMaLoi}
            aria-invalid
            aria-describedby="dsh-otp-loi-msg"
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} aria-invalid />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <FieldError id="dsh-otp-loi-msg">Mã không đúng. Kiểm tra lại tin nhắn mới nhất.</FieldError>
        </Field>
      </BienThe>
      <BienThe ten="Tắt" moTa="Đang gửi lại mã — chưa nhập được.">
        <InputOTP maxLength={6} disabled aria-label="Mã xác nhận (tắt)">
          <Nhom />
        </InputOTP>
      </BienThe>
    </>
  )
}

/** #input-otp trần (/ds/tron). Chưa có trong artifact → không có cổng so khớp riêng. */
export function KhoiInputOTP() {
  return (
    <section id="input-otp" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#input-otp">InputOTP</a>
      </h2>
      <div className="divide-y divide-(--border) border-none border-current">
        <CacBienThe />
      </div>
    </section>
  )
}

/** #input-otp dạng hàng (/ds). */
export function KhoiInputOTPHang() {
  return (
    <KhoiHang neo="input-otp">
      <CacBienThe />
    </KhoiHang>
  )
}
