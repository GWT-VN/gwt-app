'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { banHanh, ketThucSom, nhanBan, xoaNhap } from './actions'

/** Tháng kế tiếp so với hôm nay, dạng YYYY-MM. Tính theo giờ máy, không dùng UTC. */
function thangSau(): string {
  const d = new Date()
  const t = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`
}

export function CtkmActions({
  id,
  ten,
  trangThai,
  quyen,
}: {
  id: string
  ten: string
  trangThai: string
  quyen: { soan: boolean; duyet: boolean }
}) {
  const router = useRouter()
  const [dangChay, batDau] = useTransition()
  const [loi, setLoi] = useState<string | null>(null)
  const [moXoa, setMoXoa] = useState(false)

  function chay(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setLoi(null)
    batDau(async () => {
      const r = await fn()
      if (!r.ok) setLoi(r.error ?? 'Không thực hiện được.')
      else router.refresh()
    })
  }

  async function xoaBanNhap() {
    setLoi(null)
    const r = await xoaNhap(id)
    if (!r.ok) {
      const thongBao = r.error ?? 'Không thực hiện được.'
      setLoi(thongBao)
      throw new Error(thongBao)
    }
    router.refresh()
  }

  return (
    <div className="border-t border-border bg-muted px-4 py-2.5">
      {loi && !moXoa && <Alert color="danger" className="mb-2"><AlertDescription>{loi}</AlertDescription></Alert>}
      <div className="flex flex-wrap items-center gap-2">
        {quyen.soan && (
          <>
            <Button asChild size="sm" variant="outline">
              <Link href={`/sales/ctkm/${id}`}>{trangThai === 'nhap' ? 'Sửa' : 'Xem chi tiết'}</Link>
            </Button>
            <Button size="sm" variant="outline" disabled={dangChay}
              onClick={() => chay(() => nhanBan(id, thangSau()))}
              title={`Chép "${ten}" thành bản nháp cho tháng sau`}>
              ⧉ Nhân bản sang tháng sau
            </Button>
          </>
        )}

        <span className="flex-1" />

        {trangThai === 'nhap' && (
          quyen.duyet ? (
            <Button size="sm" disabled={dangChay} onClick={() => chay(() => banHanh(id))}>
              ✓ Ban hành
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground" title="Chỉ người có quyền duyệt mới ban hành được">Chờ duyệt</span>
          )
        )}

        {trangThai === 'nhap' && quyen.soan && (
          <>
            <Button size="sm" variant="outline" disabled={dangChay} onClick={() => { setLoi(null); setMoXoa(true) }}>
              Xoá nháp
            </Button>
            <ConfirmDialog
              open={moXoa}
              onOpenChange={setMoXoa}
              color="danger"
              pha
              tieuDe={`Xoá hẳn bản nháp "${ten}"?`}
              moTa="Kênh, sản phẩm và quà của chương trình cũng mất theo. Không khôi phục được."
              nutXacNhan="Xoá nháp"
              loi={loi}
              onXacNhan={xoaBanNhap}
            />
          </>
        )}

        {trangThai === 'ban_hanh' && quyen.duyet && (
          <Button size="sm" variant="outline" disabled={dangChay}
            onClick={() => chay(() => ketThucSom(id))}
            title="Dừng từ hôm nay. Không xoá — đơn cũ vẫn tra lại được.">
            Kết thúc sớm
          </Button>
        )}
      </div>
    </div>
  )
}
