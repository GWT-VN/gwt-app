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
        {/* `.ui-dialog-body.ui-field`: cột, gap 6 */}
        <DialogBody className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor="dialog-ly-do" className="text-[14px] leading-[20px] font-medium text-foreground">
            Lý do xoá
          </label>
          <input
            id="dialog-ly-do"
            placeholder="VD: tạo trùng"
            className={[
              'h-(--control-size-md) w-full rounded-(--radius-md) border-0 bg-transparent px-(--control-gutter-md)',
              'text-[14px] leading-[20px] font-normal text-(--color-text) outline-none',
              '[box-shadow:inset_0_0_0_1px_var(--input)] placeholder:text-(--color-text-tertiary)',
              'transition-[box-shadow,background-color,color] duration-150 ease-[ease]',
              'hover:[box-shadow:inset_0_0_0_1px_var(--alpha-25)] in-data-[theme=dark]:hover:[box-shadow:inset_0_0_0_1px_var(--alpha-30)]',
              'focus:[box-shadow:inset_0_0_0_1px_var(--alpha-50)] in-data-[theme=dark]:focus:[box-shadow:inset_0_0_0_1px_var(--alpha-50)]',
            ].join(' ')}
          />
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
 * Ô nhập: CHƯA có Input DS (lát 3) → `<label>`/`<input>` gốc mang giá trị `.ui-label` / `.ui-input` / `.ui-field` của
 * bundle.css CHỈ trong khối demo này — đừng chép sang màn thật. `data-so` = khoá so khớp (ds/so-khop/dialog.json).
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
      <BienThe ten="Hộp nhập ngắn" moTa="Một câu hỏi + một ô nhập; focus mở vào nút an toàn Huỷ">
        <HopXoaDon tieuDe="Xoá đơn DH-DEMO-0001?" />
      </BienThe>
      <BienThe ten="Tiêu đề dài" moTa="Tiêu đề xuống dòng, chừa lề phải cho nút ✕">
        <HopXoaDon tieuDe="Xoá đơn DH-DEMO-0001 của Công ty TNHH Thiết bị Y tế Hoàng Gia — chi nhánh Đà Nẵng?" />
      </BienThe>
    </KhoiHang>
  )
}
