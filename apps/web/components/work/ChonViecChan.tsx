'use client'

/**
 * Ô chọn "việc phải xong trước" — gõ để tìm, chọn một việc.
 *
 * work_16 làm xong RPC thêm/bỏ phụ thuộc và panel HIỆN được danh sách, nhưng
 * quên mất cái ô để CHỌN. Kết quả: tính năng chỉ dùng được bằng SQL, CEO mở
 * panel ra không thấy gì để bấm. Đây là cái ô còn thiếu.
 *
 * Theo docs/CHUAN-FILTER.md: danh sách quá 10 mục thì phải cho GÕ ĐỂ TÌM, không
 * để <select> trần. Việc thì luôn quá 10, và người ta nhớ tiêu đề chứ không nhớ
 * mã, nên tìm theo cả tiêu đề lẫn mã, khớp cả khi gõ không dấu.
 */
import { useEffect, useRef, useState } from 'react'
import { timViec, type ViecGoiY } from '@/app/work/actions'
import { oNhap } from './ui'

export function ChonViecChan({
  taskId, dangCo, onChon, disabled,
}: {
  taskId: number
  /** id đã là việc chặn rồi — lọc khỏi gợi ý cho khỏi chọn trùng. */
  dangCo: number[]
  onChon: (id: number) => void
  disabled?: boolean
}) {
  const [mo, setMo] = useState(false)
  const [q, setQ] = useState('')
  const [goiY, setGoiY] = useState<ViecGoiY[]>([])
  const [dangTim, setDangTim] = useState(false)
  const boc = useRef<HTMLDivElement>(null)

  // Gõ xong nghỉ tay 250ms mới gọi server — gõ 12 ký tự mà bắn 12 lượt là phí.
  useEffect(() => {
    if (q.trim().length < 2) { setGoiY([]); return }
    let huy = false
    setDangTim(true)
    const h = setTimeout(async () => {
      const kq = await timViec(q, taskId)
      if (huy) return
      setDangTim(false)
      setGoiY(kq.ok ? kq.duLieu.filter((v) => !dangCo.includes(v.id)) : [])
    }, 250)
    return () => { huy = true; clearTimeout(h) }
  }, [q, taskId, dangCo])

  // Bấm ra ngoài thì đóng — không có thì cái danh sách treo lơ lửng.
  useEffect(() => {
    if (!mo) return
    const ngoai = (e: MouseEvent) => {
      if (boc.current && !boc.current.contains(e.target as Node)) { setMo(false); setQ('') }
    }
    document.addEventListener('mousedown', ngoai)
    return () => document.removeEventListener('mousedown', ngoai)
  }, [mo])

  if (!mo) {
    return (
      <button
        onClick={() => setMo(true)} disabled={disabled}
        style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--accent-ink)', textAlign: 'left' }}
      >+ Việc phải xong trước</button>
    )
  }

  return (
    <div ref={boc} className="relative">
      <input
        autoFocus value={q} onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Escape') { setMo(false); setQ('') } }}
        placeholder="Gõ ≥2 ký tự — tiêu đề hoặc mã việc"
        disabled={disabled}
        style={{ ...oNhap, width: '100%', fontSize: 13 }}
      />
      {q.trim().length >= 2 && (
        <ul
          className="absolute left-0 right-0 z-20 mt-1 list-none p-1 m-0 overflow-auto"
          style={{
            background: 'var(--surface)', border: '1px solid var(--border-strong)',
            borderRadius: 9, boxShadow: '0 12px 32px -12px rgba(14,28,31,.4)', maxHeight: 240,
          }}
        >
          {dangTim && (
            <li style={{ fontSize: 12, color: 'var(--faint)', padding: '6px 8px' }}>Đang tìm…</li>
          )}
          {!dangTim && goiY.length === 0 && (
            <li style={{ fontSize: 12, color: 'var(--faint)', padding: '6px 8px' }}>
              Không thấy việc nào khớp. (Việc đã xong hoặc đã huỷ không hiện ở đây —
              chúng không chặn được gì.)
            </li>
          )}
          {goiY.map((v) => (
            <li key={v.id}>
              <button
                className="w-full text-left flex gap-2 items-center"
                style={{ fontSize: 13, padding: '6px 8px', borderRadius: 7 }}
                onClick={() => { onChon(v.id); setMo(false); setQ('') }}
              >
                <span className="mono" style={{ fontSize: 11, color: 'var(--faint)' }}>{v.ref}</span>
                <span className="flex-1 truncate">{v.title}</span>
                {v.team_name && (
                  <span style={{ fontSize: 11, color: 'var(--faint)' }}>{v.team_name}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
