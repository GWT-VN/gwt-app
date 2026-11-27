'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Kenh } from '@/app/actions'
import { TaoKhachForm } from '@/components/TaoKhachForm'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

/**
 * MỘT nút tạo khách duy nhất.
 *
 * CEO chốt 22/08/2026, nguyên văn: *"không muốn có 2 button riêng Tạo nhanh vs Nhập chi tiết
 * (chỉ có Tạo, luôn mở ra khung tạo nhanh, sau khi điền xong 4 thông tin cơ bản cho phép click
 * để điền thêm chi tiết thì mở ra bảng chi tiết) ⇒ luôn thiết kế để UX tốt nhất, ít step."*
 *
 * Vì sao bỏ hai nút: người dùng phải ĐOÁN TRƯỚC mình cần đường nào, mà lúc chưa gõ SĐT thì chưa
 * ai biết khách này có công ty hay không. Đoán sai là phải nhập lại từ đầu ở màn kia — đúng thứ
 * CEO gọi là "nhiều step".
 *
 * Nay: một nút → khung 4 ô cơ bản → cần thêm thì **bung ngay tại chỗ**, không rời màn, không
 * mất chữ đã gõ.
 *
 * `/khach/moi` vẫn giữ cho ai mở thẳng bằng đường dẫn — dùng CHUNG `TaoKhachForm`, nên hai chỗ
 * không bao giờ lệch bộ ô (đúng chỗ CEO bắt được là màn tạo và màn sửa đang lệch nhau).
 */
export function TaoKhachButton({ kenh }: { kenh: Kenh[] }) {
  const [mo, setMo] = useState(false)
  // Form đã có chữ → bấm ngoài / Esc / ✕ không đóng ngay mà hỏi lại (đóng nhầm là mất hết chữ đã gõ).
  const [coDuLieu, setCoDuLieu] = useState(false)
  const [hoiBo, setHoiBo] = useState(false)
  const router = useRouter()

  const dong = () => {
    setMo(false)
    setCoDuLieu(false)
  }

  return (
    <>
      <Dialog
        open={mo}
        onOpenChange={(m) => {
          if (m) setMo(true)
          else if (coDuLieu) setHoiBo(true)
          else dong()
        }}
      >
        <DialogTrigger asChild>
          <Button>Tạo khách</Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Tạo khách mới</DialogTitle></DialogHeader>
          <DialogBody>
            <TaoKhachForm kenh={kenh} onCoDuLieu={setCoDuLieu} onXong={() => { dong(); router.refresh() }} />
          </DialogBody>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={hoiBo}
        onOpenChange={setHoiBo}
        tieuDe="Bỏ thông tin đang nhập?"
        moTa="Khách chưa được tạo. Đóng hộp này thì những gì đã gõ sẽ mất."
        nutXacNhan="Bỏ thông tin"
        nutHuy="Nhập tiếp"
        pha
        onXacNhan={() => {
          setHoiBo(false)
          dong()
        }}
      />
    </>
  )
}
