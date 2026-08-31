'use client'

import type { DoNuoc } from '@/lib/nuoc'

/**
 * Hiện chỉ số nước ĐÃ ĐO của một lượt bảo trì, dạng gọn `trước → sau`.
 *
 * Vì sao có: trước 31/08 số đo **lưu được nhưng không màn nào đọc ra**. Mở lại form thì ô
 * trắng (form tự xoá lúc mở), bảng cũng không hiện gì — nên nhìn từ ngoài **không có cách
 * nào phân biệt "đã lưu" với "mất trắng"**. CEO báo *"kết quả đều ko lưu"*; đo DB thì dữ
 * liệu vẫn còn nguyên, kể cả số thập phân. Lỗi nằm ở chỗ HIỆN, không phải chỗ GHI.
 *
 * Chỉ hiện chỉ tiêu nào CÓ số — máy uống (POU) đo TDS/pH, lọc tổng (POE) đo độ cứng/Clo;
 * hiện đủ 4 dòng với 2 dòng gạch ngang thì rối mà không thêm thông tin.
 */
export function ChiSoNuoc({ d, gonMotDong = false }: { d: DoNuoc; gonMotDong?: boolean }) {
  const muc: [string, number | null, number | null][] = [
    ['TDS', d.tds_truoc, d.tds_sau],
    ['pH', d.ph_truoc, d.ph_sau],
    ['Độ cứng', d.do_cung_truoc, d.do_cung_sau],
    ['Clo', d.clo_truoc, d.clo_sau],
  ]
  const co = muc.filter(([, t, s]) => t !== null || s !== null)
  if (!co.length && !(d.ket_qua_ghi_chu ?? '').trim()) return null

  const so = (x: number | null) => (x === null ? '—' : String(x))

  if (gonMotDong) {
    return (
      <span className="text-[11px] text-slate-600">
        {co.map(([n, t, s]) => `${n} ${so(t)}→${so(s)}`).join(' · ')}
      </span>
    )
  }

  return (
    <div className="space-y-0.5">
      {co.map(([n, t, s]) => (
        <div key={n} className="flex items-baseline gap-1.5 text-[11px]">
          <span className="w-14 shrink-0 text-slate-400">{n}</span>
          <span className="text-slate-500">{so(t)}</span>
          <span className="text-slate-300">→</span>
          {/* Số SAU lọc là con số khách quan tâm — đậm hơn để mắt bắt trước. */}
          <span className="font-medium text-slate-900">{so(s)}</span>
        </div>
      ))}
      {(d.ket_qua_ghi_chu ?? '').trim() && (
        <p className="mt-1 line-clamp-3 text-[11px] text-slate-500">{d.ket_qua_ghi_chu}</p>
      )}
    </div>
  )
}
