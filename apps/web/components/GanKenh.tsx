'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ganKenh, type Kenh } from '@/app/actions'
import { ChonKenh } from '@/components/ChonKenh'

/**
 * Gắn khách vào 1 kênh/đối tác (đại lý/KTS/KOL…). Danh mục `dim_channel` do Sales quản,
 * CSKH chỉ chọn.
 *
 * Ô chọn dùng CHUNG `ChonKenh` — cùng một component với màn tạo khách và màn tạo đơn của Sales.
 * CEO chốt 22/08/2026: *"thống nhất app global, các chỗ cho chọn kênh đều chia 2 cấp giống nhau
 * hết, sửa 1 chỗ apply all các chỗ khác logic như nhau"*.
 */
export function GanKenh({
  customerId, channelId, kenh, tuDong = false,
}: {
  customerId: string; channelId: number | null; kenh: Kenh[]
  /** Kênh đang là do MÁY điền (mig 54) -> hiện thêm nút xác nhận để gỡ nhãn. */
  tuDong?: boolean
}) {
  const router = useRouter()
  const [val, setVal] = useState(channelId != null ? String(channelId) : '')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)


  async function doi(v: string) {
    setVal(v); setBusy(true); setMsg(null)
    const r = await ganKenh(customerId, v ? Number(v) : null)
    setBusy(false)
    if (!r.ok) setMsg(r.error)
    else { setMsg('Đã lưu.'); router.refresh() }
  }

  /**
   * "Đúng rồi" — ghi lại CHÍNH giá trị đang có, chỉ để hạ cờ `channel_tu_dong`.
   *
   * Cần nút riêng vì chọn lại đúng mục đang chọn thì ô chọn KHÔNG bắn sự kiện đổi, nên
   * không có đường nào khác để nói "tôi đã soát, kênh này đúng". Thiếu nút này thì hồ sơ
   * nào máy đoán ĐÚNG sẽ nằm mãi trong danh sách cần soát — soát xong vẫn không hết.
   */
  async function xacNhanDung() {
    setBusy(true); setMsg(null)
    const r = await ganKenh(customerId, val ? Number(val) : null)
    setBusy(false)
    if (!r.ok) setMsg(r.error)
    else { setMsg('Đã xác nhận.'); router.refresh() }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Dùng CHUNG `ChonKenh` với màn tạo khách và màn tạo đơn. CEO chốt 22/08: "thống nhất app
          global, các chỗ cho chọn kênh đều chia 2 cấp giống nhau hết, sửa 1 chỗ apply all".
          Trước đây chỗ này là một `<select>` phẳng 26 mục — vừa lệch với màn khác, vừa vi phạm
          luật ">10 mục phải gõ để tìm". */}
      <div className="min-w-[320px] flex-1">
        <ChonKenh kenh={kenh} value={val} onChange={doi} />
      </div>
      {tuDong && (
        <button onClick={xacNhanDung} disabled={busy}
          className="rounded-lg border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-800 hover:bg-sky-100 disabled:opacity-50">
          ✓ Đúng rồi, bỏ nhãn
        </button>
      )}
      {busy && <span className="text-xs text-slate-400">Đang lưu…</span>}
      {msg && <span className="text-xs text-slate-500">{msg}</span>}
    </div>
  )
}
