'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { phanLoaiLai } from '@/app/ticket/loi-actions'
import { apDungPhanLoai, chayThuPhanLoai } from '@/lib/loi/giaoDienDanhMuc'

export function PhanLoaiLai() {
  const router = useRouter()
  const [baoCao, setBaoCao] = useState<{ nhan: string; gia: string }[] | null>(null)
  const [loi, setLoi] = useState('')
  const [xong, setXong] = useState('')
  const [ban, chay] = useTransition()

  const thu = () => chay(async () => {
    setLoi(''); setXong('')
    const r = await chayThuPhanLoai(phanLoaiLai)
    if ('loi' in r) { setBaoCao(null); setLoi(r.loi ?? '') } else setBaoCao(r.baoCao)
  })
  const apDung = () => chay(async () => {
    const r = await apDungPhanLoai(baoCao !== null, (m) => window.confirm(m), phanLoaiLai)
    if ('loi' in r) return setLoi(r.loi ?? '')
    if ('huy' in r) return
    setXong(r.thongBao ?? ''); setBaoCao(null); setLoi(''); router.refresh()
  })

  return (
    <div className="space-y-2">
      <Button type="button" disabled={ban} onClick={thu} variant="outline" size="sm">Chạy thử phân loại lại</Button>
      {loi && <p className="text-sm text-destructive">{loi}</p>}
      {xong && <p className="text-sm text-(--color-text-success)">{xong}</p>}
      {baoCao && (
        <Card className="space-y-2">
          <p className="text-sm font-medium">Kết quả chạy thử (chưa ghi gì)</p>
          <ul className="text-sm">{baoCao.map((d) => <li key={d.nhan}>{d.nhan}: <strong>{d.gia}</strong></li>)}</ul>
          <Button type="button" disabled={ban} onClick={apDung} size="sm">Áp dụng</Button>
        </Card>
      )}
    </div>
  )
}
