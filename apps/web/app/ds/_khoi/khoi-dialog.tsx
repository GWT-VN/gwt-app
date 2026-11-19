'use client'

import { useEffect, useRef, useState } from 'react'
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

/**
 * #dialog — tái tạo ds/nguon/components/Dialog/preview.html: "Xoá đơn DH-DEMO-0001?" + ô "Lý do xoá", footer Huỷ
 * (outline, nhận focus khi mở — nút an toàn) + Xoá đơn (destructive; bấm → spinner, khoá cả hai nút, 1,2 giây sau đóng
 * như preview). Preview vẽ hộp tĩnh trong một khung 328px; DS mở thật giữa khung nhìn qua nút.
 * Ô nhập: CHƯA có Input DS (lát 3) → `<label>`/`<input>` gốc mang giá trị `.ui-label` / `.ui-input` / `.ui-field` của
 * bundle.css CHỈ trong khối demo này — đừng chép sang màn thật. `data-so` = khoá so khớp (ds/so-khop/dialog.json).
 */
export function KhoiDialog() {
  const [mo, setMo] = useState(false)
  const [dangXoa, setDangXoa] = useState(false)
  const hen = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(hen.current), [])
  return (
    <section id="dialog" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#dialog">Dialog</a>
      </h2>
      <div className="flex">
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
            <Button data-so="mo" variant="destructive">
              Xoá đơn…
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Xoá đơn DH-DEMO-0001?</DialogTitle>
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
                <Button data-so="huy" variant="outline" autoFocus disabled={dangXoa}>
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
      </div>
    </section>
  )
}
