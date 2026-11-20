'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { BienThe, KhoiHang } from '../_khung/tam'

/** Nút + hộp "Xoá đơn" — dùng chung khối cũ và hàng biến thể. `so` = khoá so khớp của nút (chỉ khối cũ). */
function HopXoaDon({ so, tieuDe }: { so?: string; tieuDe: ReactNode }) {
  const [mo, setMo] = useState(false)
  const [dangXoa, setDangXoa] = useState(false)
  const hen = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(hen.current), [])
  return (
    <Dialog
      open={mo}
      onOpenChange={(o) => {
        setMo(o)
        if (!o) {
          clearTimeout(hen.current)
          setDangXoa(false)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button data-so={so} variant="destructive">
          Xoá đơn…
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{tieuDe}</DialogTitle>
        <DialogDescription>
          Đơn và lịch sử xử lý sẽ bị xoá vĩnh viễn. Thao tác này không hoàn tác được.
        </DialogDescription>
        {/* `.ui-dialog-body.ui-field` (preview gắn cả hai class lên một thẻ): thân chính là khung trường — cột, gap 6 */}
        <DialogBody className="flex min-w-0 flex-col gap-1.5">
          <FieldLabel htmlFor="dialog-ly-do">Lý do xoá</FieldLabel>
          <Input id="dialog-ly-do" placeholder="VD: tạo trùng" />
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button data-so="huy" variant="outline" data-autofocus disabled={dangXoa}>
              Huỷ
            </Button>
          </DialogClose>
          <Button
            data-so="xoa"
            variant="destructive"
            loading={dangXoa}
            onClick={() => {
              setDangXoa(true)
              hen.current = setTimeout(() => {
                setMo(false)
                setDangXoa(false)
              }, 1200)
            }}
          >
            Xoá đơn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * #dialog — tái tạo ds/nguon/components/Dialog/preview.html: "Xoá đơn DH-DEMO-0001?" + ô "Lý do xoá", footer Huỷ
 * (outline, `data-autofocus` → nhận focus khi mở — nút an toàn) + Xoá đơn (destructive; bấm → spinner, khoá cả hai nút,
 * 1,2 giây sau đóng như preview). Preview vẽ hộp tĩnh trong một khung 328px; DS mở thật giữa khung nhìn qua nút.
 * Màn thật: việc đang chạy / có thể lỗi (xoá, gọi máy chủ) → dùng ConfirmDialog (khoá theo Promise, Esc không đóng khi
 * đang chạy, lỗi ngay trong hộp). Spinner + hẹn giờ ở đây chỉ để tái tạo preview.
 * Ô "Lý do xoá" = FieldLabel + Input DS. `data-so` = khoá so khớp (ds/so-khop/dialog.json).
 */
export function KhoiDialog() {
  return (
    <section id="dialog" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#dialog">Dialog</a>
      </h2>
      <div className="flex">
        <HopXoaDon so="mo" tieuDe="Xoá đơn DH-DEMO-0001?" />
      </div>
    </section>
  )
}

/** /ds dạng hàng. */
export function KhoiDialogHang() {
  return (
    <KhoiHang neo="dialog">
      <BienThe ten="Hộp nhập ngắn" moTa="Một câu hỏi + một ô nhập; mở ra con trỏ đứng sẵn ở nút an toàn Huỷ">
        <HopXoaDon tieuDe="Xoá đơn DH-DEMO-0001?" />
      </BienThe>
      <BienThe ten="Tiêu đề dài" moTa="Tiêu đề xuống dòng, chừa lề phải cho nút ✕">
        <HopXoaDon tieuDe="Xoá đơn DH-DEMO-0001 của Công ty TNHH Thiết bị Y tế Hoàng Gia — chi nhánh Đà Nẵng?" />
      </BienThe>
    </KhoiHang>
  )
}
