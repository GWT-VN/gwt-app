'use client'

import { useEffect, useRef, useState } from 'react'
import type { MucChon } from './OChonGoiY'

/** Dưới ngần này ký tự thì không gọi server — phải khớp với RPC phía dưới. */
export const TOI_THIEU_KY_TU = 2

/**
 * Tìm XA (gọi server) theo chữ người dùng gõ — logic dùng chung của `OChonTimXa` và `Combobox` (DS).
 *
 * Hai cái bẫy của tìm-xa mà hook này đã xử:
 *  1. Câu trả lời về TRỄ ghi đè câu mới hơn — gõ "ngu" rồi "nguyen", kết quả của
 *     "ngu" về sau thì màn hình hiện sai. Mỗi lượt tìm mang một số thứ tự, về
 *     muộn thì bỏ.
 *  2. Gõ tới đâu gọi tới đó là spam server. Chờ 250ms im phím mới gọi.
 *
 * `tim` phải GIỮ NGUYÊN tham chiếu giữa các lần render (hàm cấp module hoặc `useCallback`) — đổi tham chiếu là tìm lại.
 * `thieuKyTu` = chữ (đã trim) ngắn hơn `TOI_THIEU_KY_TU` → không gọi `tim`, ô nên nhắc gõ thêm.
 */
export function useTimXa<T = MucChon>(
  tim: (tuKhoa: string) => Promise<T[]>,
  q: string
): { ds: T[]; dangTim: boolean; loi: string | null; thieuKyTu: boolean } {
  const [ds, setDs] = useState<T[]>([])
  const [dangTim, setDangTim] = useState(false)
  const [loi, setLoi] = useState<string | null>(null)
  const luot = useRef(0)

  useEffect(() => {
    const s = q.trim()
    if (s.length < TOI_THIEU_KY_TU) {
      // Huỷ lượt đang bay: không tăng `luot` thì câu trả lời của lượt trước về sau vẫn ghi đè ds/loi đã xoá.
      luot.current++
      // eslint-disable-next-line react-hooks/set-state-in-effect -- xoá kết quả khi ô tìm quá ngắn; giữ nguyên hành vi cũ
      setDs([]); setDangTim(false); setLoi(null); return
    }

    const cua = ++luot.current
    setDangTim(true)
    const hen = setTimeout(async () => {
      try {
        const kq = await tim(s)
        if (cua !== luot.current) return   // câu trả lời cũ về muộn — bỏ
        setDs(kq); setLoi(null)
      } catch (e) {
        if (cua !== luot.current) return
        setDs([]); setLoi(e instanceof Error ? e.message : 'Không tìm được')
      } finally {
        if (cua === luot.current) setDangTim(false)
      }
    }, 250)
    return () => clearTimeout(hen)
  }, [q, tim])

  return { ds, dangTim, loi, thieuKyTu: q.trim().length < TOI_THIEU_KY_TU }
}
