'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DotsThree } from '@phosphor-icons/react/ssr'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { thongBao } from '@/components/ui/sonner'
import { banHanh, ketThucSom, nhanBan, xoaNhap } from './actions'

/** Tháng kế tiếp so với hôm nay, dạng YYYY-MM. Tính theo giờ máy, không dùng UTC. */
function thangSau(): string {
  const d = new Date()
  const t = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Thao tác một chương trình — menu "…" ở ô cuối dòng bảng (khuôn Ticket F). Cùng các việc như thanh nút cũ dưới thẻ:
 * Sửa/Xem chi tiết · Nhân bản sang tháng sau · Ban hành (người duyệt) · Kết thúc sớm (người duyệt) · Xoá nháp.
 */
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

  function chay(fn: () => Promise<{ ok: boolean; error?: string }>, xong: string) {
    batDau(async () => {
      const r = await fn()
      if (!r.ok) thongBao.loi(r.error ?? 'Không thực hiện được.')
      else {
        thongBao.xong(xong)
        router.refresh()
      }
    })
  }

  async function xoaBanNhap() {
    setLoi(null)
    const r = await xoaNhap(id)
    if (!r.ok) {
      const tb = r.error ?? 'Không thực hiện được.'
      setLoi(tb)
      throw new Error(tb)
    }
    router.refresh()
  }

  const nhap = trangThai === 'nhap'
  if (!quyen.soan && !(quyen.duyet && (nhap || trangThai === 'ban_hanh'))) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Thao tác chương trình ${ten}`} disabled={dangChay}>
            <DotsThree aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {quyen.soan && (
            <>
              <DropdownMenuItem asChild>
                <Link href={`/sales/ctkm/${id}`}>{nhap ? 'Sửa' : 'Xem chi tiết'}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => chay(() => nhanBan(id, thangSau()), `Đã chép “${ten}” thành bản nháp tháng sau`)}>
                Nhân bản sang tháng sau
              </DropdownMenuItem>
            </>
          )}
          {nhap && quyen.duyet && (
            <DropdownMenuItem onSelect={() => chay(() => banHanh(id), `Đã ban hành “${ten}”`)}>Ban hành</DropdownMenuItem>
          )}
          {trangThai === 'ban_hanh' && quyen.duyet && (
            <DropdownMenuItem
              title="Dừng từ hôm nay. Không xoá — đơn cũ vẫn tra lại được."
              onSelect={() => chay(() => ketThucSom(id), `Đã kết thúc “${ten}”`)}
            >
              Kết thúc sớm
            </DropdownMenuItem>
          )}
          {nhap && quyen.soan && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => { setLoi(null); setMoXoa(true) }}>
                Xoá nháp
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
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
  )
}
