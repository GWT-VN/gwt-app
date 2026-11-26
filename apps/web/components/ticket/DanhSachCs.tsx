'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { themNguoi, xoaNguoi, type NguoiQuanTri } from '@/app/ticket/nguoi-actions'
import { chuanTenNguoi, DAI_TOI_DA_TEN } from '@/lib/loi/nguoiTicket'
import { XacNhanXoa } from './XacNhanXoa'

/**
 * Tab CS theo dõi của /danh-sach-nguoi (Hiệp 19/11/2026): thêm + xoá (hỏi lại trong khung, nêu số ticket đang gán).
 * Không đổi tên. Tab Kỹ thuật dùng `RosterKyThuat` (hồ sơ thợ đầy đủ).
 * `ds` gồm cả người đã xoá (hoat_dong false) để gõ lại đúng tên thì KHÔI PHỤC thay vì tạo trùng.
 */
export function DanhSachCs({ ds }: { ds: NguoiQuanTri[] }) {
  const loai = 'cs' as const
  const router = useRouter()
  const [ten, setTen] = useState('')
  const [dangXoa, setDangXoa] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const dangDung = ds.filter((x) => x.hoat_dong)
  const kiem = ten ? chuanTenNguoi(ten, ds) : null
  const trung = kiem?.ok ? kiem.trung : null
  const khoiPhuc = !!trung && !trung.hoat_dong

  async function them() {
    setBusy(true); setErr(null)
    const r = await themNguoi(loai, ten)
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    setTen(''); router.refresh()
  }
  async function xoa(id: string, chuyenSang: string | null) {
    setBusy(true); setErr(null)
    const r = await xoaNguoi(loai, id, chuyenSang)
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    setDangXoa(null); router.refresh()
  }

  return (
    <Card className="space-y-3">
      <ul className="divide-y rounded-lg border text-sm">
        {dangDung.length === 0 && <li className="px-3 py-2 text-muted-foreground">Chưa có ai.</li>}
        {dangDung.map((x) => (
          <li key={x.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
            {dangXoa === x.id ? (
              <XacNhanXoa ten={x.ten} soTicket={x.so_ticket} nguoiNhan={dangDung.filter((y) => y.id !== x.id)} busy={busy}
                onXoa={(nhan) => xoa(x.id, nhan)} onHuy={() => setDangXoa(null)} />
            ) : (
              <>
                <span className="flex-1 text-foreground">{x.ten}</span>
                <span className="text-xs text-muted-foreground">{x.so_ticket} ticket đang mở</span>
                <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => { setErr(null); setDangXoa(x.id) }}>Xoá</Button>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-2">
        <Input aria-label="Tên CS mới" value={ten} onChange={(e) => setTen(e.target.value)} maxLength={DAI_TOI_DA_TEN + 10} disabled={busy}
          onKeyDown={(e) => { if (e.key === 'Enter' && kiem?.ok && (!trung || khoiPhuc)) them() }}
          placeholder="Tên CS mới, vd: Thanh Hiền"
          className="flex-1 min-w-48" />
        <Button type="button" disabled={busy || !kiem?.ok || (!!trung && !khoiPhuc)} onClick={them}>{khoiPhuc ? 'Khôi phục' : '+ Thêm'}</Button>
      </div>
      {kiem && !kiem.ok && <p className="text-xs text-(--color-text-danger)">{kiem.error}</p>}
      {trung && !khoiPhuc && <p className="text-xs text-(--color-text-warning)">Đã có <strong>{trung.ten}</strong> trong danh sách.</p>}
      {khoiPhuc && <p className="text-xs text-muted-foreground"><strong>{trung.ten}</strong> đã xoá trước đây. Bấm Khôi phục để đưa lại vào danh sách.</p>}
      {err && <Alert color="danger"><AlertDescription>{err}</AlertDescription></Alert>}
    </Card>
  )
}
