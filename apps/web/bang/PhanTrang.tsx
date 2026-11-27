'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'
import { BocGoiY, useCauHinh } from './CauHinh'

/**
 * Nút "Trước"/"Sau" + "Trang X / Y". Giữ nguyên mọi tham số khác trên URL
 * (q, state, tt, bh…), chỉ đổi `trang`. Ẩn hẳn khi chỉ có 1 trang. Nút đầu/cuối
 * TẮT (disabled) chứ không ẩn — giữ vị trí, không nhảy.
 *
 * `tong` (tuỳ chọn): hiện thêm "1–50 trên 472 <nhan>" ở đầu (`moiTrang` mặc định 50,
 * khớp hàm liệt kê; truyền đúng số mỗi trang nếu trang dùng số khác).
 *
 * `luonHien`: vẫn hiện khi chỉ 1 trang (nút tắt) — màn bỏ số đếm ở tiêu đề/tab, lấy "1–7 trên 7" ở đây làm bộ đếm
 * duy nhất (CEO 27/11 Ticket "Nên cho hiển thị bằng pagination ở dưới ấy").
 *
 * Dùng useSearchParams -> component gọi PhanTrang phải nằm trong <Suspense>.
 */
export function PhanTrang({
  trang,
  soTrang,
  tong,
  moiTrang = 50,
  nhan = 'dòng',
  luonHien = false,
}: {
  trang: number
  soTrang: number
  tong?: number
  moiTrang?: number
  nhan?: string
  luonHien?: boolean
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { giaoDien: gd, bieuTuong } = useCauHinh()

  if (soTrang <= 1 && !(luonHien && tong)) return null

  function hrefTrang(t: number) {
    const sp = new URLSearchParams(searchParams.toString())
    if (t <= 1) sp.delete('trang')
    else sp.set('trang', String(t))
    const qs = sp.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  function nut(den: number, co: boolean, ten: string, chu: ReactNode) {
    if (!co) {
      return (
        <button type="button" disabled aria-label={ten} className={gd.phanTrang_nutTat}>
          {chu}
        </button>
      )
    }
    return (
      <BocGoiY noiDung={`Tới trang ${den}`}>
        <Link href={hrefTrang(den)} aria-label={ten} className={gd.phanTrang_nut}>
          {chu}
        </Link>
      </BocGoiY>
    )
  }

  const dau = (trang - 1) * moiTrang + 1
  const cuoi = tong == null ? 0 : Math.min(trang * moiTrang, tong)

  return (
    <nav className={gd.phanTrang_khung} aria-label="Phân trang">
      {tong != null && (
        <span className={gd.phanTrang_khoang}>
          {dau}–{cuoi} trên {tong} {nhan}
        </span>
      )}
      <span className={gd.phanTrang_cum}>
        {nut(trang - 1, trang > 1, 'Trang trước', bieuTuong.truoc ?? '← Trước')}
        <span className={gd.phanTrang_chuSo} aria-current="page">
          Trang {trang} / {soTrang}
        </span>
        {nut(trang + 1, trang < soTrang, 'Trang sau', bieuTuong.sau ?? 'Sau →')}
      </span>
    </nav>
  )
}
