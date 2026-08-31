'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ganKenh, type Kenh } from '@/app/actions'
import { ChonKenh } from '@/components/ChonKenh'

/**
 * Sửa kênh NGAY TRÊN DÒNG ở màn soát kênh.
 *
 * Khác `GanKenh` (dùng ở hồ sơ khách) ở chỗ nó phải gọn theo chiều cao một dòng bảng, và
 * mặc định chỉ HIỆN kênh — chỉ mở ô chọn khi bấm "đổi". Soát 113 dòng mà mỗi dòng là một ô
 * chọn mở sẵn thì trang nặng và mắt không lướt được.
 */
export function SuaKenhNhanh({
  customerId, channelId, kenhHienTai, tuDong, kenh,
}: {
  customerId: string; channelId: number | null; kenhHienTai: string | null
  tuDong: boolean; kenh: Kenh[]
}) {
  const router = useRouter()
  const [mo, setMo] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function doi(v: string) {
    setBusy(true); setMsg(null)
    const r = await ganKenh(customerId, v ? Number(v) : null)
    setBusy(false)
    if (!r.ok) { setMsg(r.error); return }
    setMo(false); router.refresh()
  }

  /**
   * "Đúng rồi" — ghi lại CHÍNH giá trị đang có, chỉ để hạ cờ `channel_tu_dong`.
   * `ganKenh` luôn đặt `channel_tu_dong = false`, nên gọi lại với đúng kênh cũ là đủ;
   * không cần hàm riêng. (Cùng cách `GanKenh` ở hồ sơ khách đang làm.)
   */
  async function dungRoi() {
    setBusy(true); setMsg(null)
    const r = await ganKenh(customerId, channelId)
    setBusy(false)
    if (!r.ok) { setMsg(r.error); return }
    router.refresh()
  }

  if (mo) {
    return (
      <div className="min-w-[260px] space-y-1">
        <ChonKenh kenh={kenh} value={channelId != null ? String(channelId) : ''} onChange={doi} />
        <button type="button" onClick={() => setMo(false)} disabled={busy}
          className="text-[11px] text-slate-500 underline">huỷ</button>
        {msg && <p className="text-[11px] text-red-600">{msg}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={kenhHienTai ? 'text-slate-800' : 'text-slate-300'}>{kenhHienTai ?? 'chưa có'}</span>
      {tuDong && <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800">máy điền</span>}
      <button type="button" onClick={() => setMo(true)} className="text-[11px] text-sky-600 underline">đổi</button>
      {/* Chỉ nhóm "máy điền" mới cần nút này — nó hạ cờ tự-động chứ không đổi giá trị. */}
      {tuDong && (
        <button type="button" onClick={dungRoi} disabled={busy}
          className="text-[11px] text-emerald-700 underline disabled:opacity-50">đúng rồi</button>
      )}
      {msg && <span className="text-[11px] text-red-600">{msg}</span>}
    </div>
  )
}
