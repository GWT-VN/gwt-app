'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ganKenh, type Kenh } from '@/app/actions'
import { ChonKenh } from '@/components/ChonKenh'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
      <div className="flex items-center gap-1.5">
        <ChonKenh kenh={kenh} value={channelId != null ? String(channelId) : ''} onChange={doi} />
        <Button type="button" variant="link" size="sm" onClick={() => setMo(false)} disabled={busy}>huỷ</Button>
        {msg && <span className="text-xs text-(--color-text-danger)">{msg}</span>}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className={kenhHienTai ? undefined : 'text-muted-foreground'}>{kenhHienTai ?? 'chưa có'}</span>
      {tuDong && <Badge variant="soft" color="warning">máy điền</Badge>}
      <Button type="button" variant="link" size="sm" onClick={() => setMo(true)}>đổi</Button>
      {/* Chỉ nhóm "máy điền" mới cần nút này — nó hạ cờ tự-động chứ không đổi giá trị. */}
      {tuDong && (
        <Button type="button" variant="link" size="sm" onClick={dungRoi} disabled={busy}>đúng rồi</Button>
      )}
      {msg && <span className="text-xs text-(--color-text-danger)">{msg}</span>}
    </div>
  )
}
