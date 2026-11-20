'use client'

import { useState } from 'react'
import { Check, Copy } from '@phosphor-icons/react/ssr'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'

/**
 * Nút chép tên biến (vd `--primary`) vào clipboard. Tooltip là mô tả thêm, không lặp aria-label (luật NGUON.md).
 * Kết quả đọc qua vùng aria-live riêng — có sẵn từ đầu, chỉ đổi chữ.
 */
export function NutChep({ bien }: { bien: string }) {
  const [ketQua, setKetQua] = useState('')
  async function chep() {
    let duoc = true
    try {
      await navigator.clipboard.writeText(bien)
    } catch {
      // Khung nhúng/không có quyền clipboard (đo: khung Browser của app Claude chặn writeText) → cách cũ execCommand.
      const nut = document.activeElement as HTMLElement | null
      const o = Object.assign(document.createElement('textarea'), { value: bien })
      document.body.append(o)
      o.select()
      duoc = document.execCommand('copy')
      o.remove()
      nut?.focus() // select() kéo focus đi — trả về nút để bàn phím không lạc

    }
    setKetQua(duoc ? `Đã chép ${bien}` : 'Trình duyệt chặn clipboard — chọn chữ để chép tay')
    setTimeout(() => setKetQua(''), 1500)
  }
  return (
    <>
      <Tooltip content={ketQua || 'Vào clipboard'}>
        <Button variant="ghost" size="icon-sm" aria-label={`Chép ${bien}`} onClick={chep}>
          {ketQua.startsWith('Đã') ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        </Button>
      </Tooltip>
      <span className="sr-only" aria-live="polite">
        {ketQua}
      </span>
    </>
  )
}
