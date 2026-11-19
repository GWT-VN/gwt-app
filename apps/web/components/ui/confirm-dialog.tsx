'use client'

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from './alert'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from './alert-dialog'
import { Button } from './button'

/** `.ui-dialog-icon`: tròn 40, cách tiêu đề 16, nền alpha-05, icon 20 muted; `[data-color=danger]` nền/màu danger-soft. */
const icon = [
  'grid size-10 place-content-center mb-4 rounded-(--radius-full) border-none border-current',
  'bg-(--alpha-05) text-muted-foreground [&>svg]:size-5',
].join(' ')
const iconDanger = 'bg-(--color-background-danger-soft-alpha) text-(--color-text-danger-soft)'

/**
 * `.ui-dialog-list`: margin 0, thụt 18, chữ foreground 14/20, mục cách 4; `.ui-dialog-list + .ui-field` cách 16 → phần tử
 * ngay sau danh sách (ô lý do) cách 16. `list-disc` = mặc định trình duyệt của artifact (preflight app tắt chấm).
 */
const list = [
  'm-0 list-disc pl-[18px] border-none border-current text-foreground text-[14px] leading-[20px]',
  '[&>li+li]:mt-1 [&+*]:mt-4',
].join(' ')

/**
 * ConfirmDialog — hỏi trước việc KHÔNG LÙI ĐƯỢC (đóng ticket, xoá, gộp). Dựng trên AlertDialog (Radix): role
 * alertdialog, labelledby tiêu đề, describedby mô tả, bẫy Tab, bấm overlay không đóng.
 * - `tieuDe`: câu hỏi gọi tên đối tượng ("Xoá phiếu chi PC-…?"). `nutXacNhan`: đúng động từ ("Xoá phiếu"), không "OK".
 * - `hauQua`: gạch đầu dòng những gì sẽ xảy ra; `children` (ô lý do…) cách danh sách 16.
 * - `pha` (phá dữ liệu): nút xác nhận destructive + focus mặc định vào nút Huỷ (an toàn); không `pha` → focus nút xác
 *   nhận. Phần tử con mang `data-autofocus` (vd ô gõ mã để mở khoá) thắng cả hai — dùng `data-autofocus`, KHÔNG
 *   `autoFocus` (React focus trước khi hộp kịp ghi nhớ nút đã mở → đóng xong focus không về được nút đó).
 * - Đang chạy: khoá NGAY từ lần bấm xác nhận đầu (không chờ prop `dangChay`) → bấm hai lần chỉ gọi `onXacNhan` một lần;
 *   khi khoá: nút xác nhận spinner, Huỷ disabled, Esc/Huỷ không đóng; nút đang focus bị disabled → focus chuyển lên
 *   khung hộp (không rơi ra body). Mở khoá khi `dangChay` / `loi` / `open` đổi mà `dangChay` không bật.
 *   → `onXacNhan` phải: tự đóng hộp (`open=false`), HOẶC bật `dangChay` rồi tắt khi xong / lỗi, HOẶC đặt `loi` —
 *   không làm gì cả thì hộp đứng khoá.
 * - `loi`: Alert danger trong thân, hộp không tự đóng; sửa xong bấm lại được. Truyền chuỗi (hoặc giá trị giữ nguyên
 *   giữa các lần render): `loi` đổi = mở khoá, nên JSX mới mỗi lần render sẽ mở khoá sớm.
 * - `khoaXacNhan`: nút xác nhận disabled (chưa nhập đủ — vd chưa gõ đúng mã).
 * - Đóng xong focus về phần tử đã mở hộp (hộp điều khiển bằng `open`, không có Trigger của Radix).
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  tieuDe,
  moTa,
  hauQua,
  icon: bieuTuong,
  mau,
  nutXacNhan,
  nutHuy = 'Huỷ',
  pha = false,
  dangChay = false,
  loi,
  khoaXacNhan = false,
  onXacNhan,
  children,
}: {
  open: boolean
  onOpenChange(open: boolean): void
  tieuDe: string
  moTa?: ReactNode
  hauQua?: ReactNode[]
  icon?: ReactNode
  mau?: 'danger'
  nutXacNhan: string
  nutHuy?: string
  pha?: boolean
  dangChay?: boolean
  loi?: ReactNode
  khoaXacNhan?: boolean
  onXacNhan(): void
  children?: ReactNode
}) {
  const khung = useRef<HTMLDivElement>(null)
  const nutXn = useRef<HTMLButtonElement>(null)
  const nutMo = useRef<HTMLElement | null>(null)
  // chan: chặn đồng bộ lần bấm thứ hai trong cùng tác vụ (trước khi React kịp vẽ lại nút disabled).
  const chan = useRef(false)
  const [daBam, setDaBam] = useState(false)
  // Mở khoá khi dangChay / loi / open đổi mà không còn chạy (state dẫn xuất trong render, không setState trong effect).
  const [moc, setMoc] = useState({ dangChay, loi, open })
  if (moc.dangChay !== dangChay || moc.loi !== loi || moc.open !== open) {
    setMoc({ dangChay, loi, open })
    if (!dangChay) setDaBam(false)
  }
  const khoa = dangChay || daBam

  useEffect(() => {
    if (!khoa) chan.current = false
  })
  // Nút đang focus vừa bị disabled → trình duyệt thả focus ra body (FocusScope của Radix không bắt lại) → đưa lên khung.
  useLayoutEffect(() => {
    const k = khung.current
    const a = document.activeElement
    if (khoa && k && (!k.contains(a) || a?.matches(':disabled'))) k.focus({ preventScroll: true })
  }, [khoa])

  return (
    <AlertDialog open={open} onOpenChange={(o) => (o || !khoa) && onOpenChange(o)}>
      <AlertDialogContent
        ref={khung}
        onOpenAutoFocus={(e) => {
          nutMo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
          const dich =
            khung.current?.querySelector<HTMLElement>('[data-autofocus]') ?? (pha || khoaXacNhan || khoa ? null : nutXn.current)
          if (dich) {
            e.preventDefault()
            dich.focus({ preventScroll: true })
          } // không → Radix focus nút Huỷ
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          nutMo.current?.focus({ preventScroll: true })
        }}
      >
        {bieuTuong && (
          <div
            data-slot="confirm-dialog-icon"
            data-color={mau}
            aria-hidden="true"
            className={cn(icon, mau === 'danger' && iconDanger)}
          >
            {bieuTuong}
          </div>
        )}
        <AlertDialogTitle>{tieuDe}</AlertDialogTitle>
        {moTa && <AlertDialogDescription>{moTa}</AlertDialogDescription>}
        {(hauQua?.length || children || loi) && (
          <AlertDialogBody>
            {hauQua?.length ? (
              <ul data-slot="confirm-dialog-list" className={list}>
                {hauQua.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            ) : null}
            {children}
            {loi && (
              <Alert color="danger" className="[*+&]:mt-4">
                <AlertDescription>{loi}</AlertDescription>
              </Alert>
            )}
          </AlertDialogBody>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={khoa}>
              {nutHuy}
            </Button>
          </AlertDialogCancel>
          <Button
            ref={nutXn}
            variant={pha ? 'destructive' : 'default'}
            loading={khoa}
            disabled={khoaXacNhan}
            onClick={() => {
              if (khoa || chan.current) return
              chan.current = true
              setDaBam(true)
              onXacNhan()
            }}
          >
            {nutXacNhan}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
