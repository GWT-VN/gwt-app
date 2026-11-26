'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Kenh } from '@/app/actions'
import { CustomerForm } from './CustomerForm'
import type { NhanVienChon } from './actions'

/**
 * MỘT nút tạo khách. CEO chốt 22/08/2026 — làm giống CSKH:
 * không có cặp "tạo nhanh / nhập chi tiết", vì người dùng phải ĐOÁN TRƯỚC mình cần đường nào
 * trong khi chưa gõ SĐT thì chưa ai biết khách có công ty hay không. Đoán sai là gõ lại từ đầu.
 *
 * Nay: một nút → khung cơ bản → cần thêm thì bung ngay tại chỗ, không rời màn.
 *
 * `/sales/khach/moi` vẫn giữ cho ai mở thẳng bằng đường dẫn — dùng CHUNG `CustomerForm`.
 */
export function TaoKhachButton({ kenh, nhanVien }: { kenh: Kenh[]; nhanVien: NhanVienChon[] }) {
  const [mo, setMo] = useState(false)
  const router = useRouter()

  return (
    <Dialog open={mo} onOpenChange={setMo}>
      <DialogTrigger asChild><Button>＋ Tạo khách</Button></DialogTrigger>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} aria-describedby={undefined} className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>Tạo khách mới</DialogTitle></DialogHeader>
        <DialogBody>
          <CustomerForm mode="create" kenh={kenh} nhanVien={nhanVien} onXong={() => { setMo(false); router.refresh() }} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
