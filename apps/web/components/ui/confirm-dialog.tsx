'use client'

import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
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
 *   nhận. Phần tử con mang `data-autofocus` (hoặc `autoFocus`) — vd ô gõ mã để mở khoá — thắng cả hai.
 * - `onXacNhan` trả **Promise** cho việc bất đồng bộ (khuyên dùng): khoá NGAY từ lần bấm đầu (ref đồng bộ, trước cả
 *   lần vẽ lại) tới khi Promise xong → bấm hai lần chỉ gọi một lần. Resolve → hộp tự đóng (`onOpenChange(false)`),
 *   focus về nút đã mở. Reject (hoặc ném lỗi đồng bộ) → mở khoá, hộp ở lại, Alert `loi ?? 'Không thực hiện được — thử
 *   lại.'`; lỗi đã được bắt (không thành unhandled rejection). Kiểm hợp lệ: `khoaXacNhan` hoặc throw/reject.
 *   Mỗi lần mở là một LƯỢT mới: khoá/lỗi được xoá; Promise của lượt trước (người gọi ép `open=false` khi đang chờ rồi
 *   mở lại cho dòng khác) xong muộn thì bị bỏ qua — không đóng, không hiện lỗi, không mở khoá hộp mới.
 *   `onXacNhan` đồng bộ (void): không khoá lâu — đóng/mở vẫn do người gọi.
 * - Khi khoá (đang chờ Promise hoặc prop `dangChay`): nút xác nhận spinner, Huỷ disabled, Esc/Huỷ không đóng, ô con
 *   (lý do…) disabled qua `<fieldset>`; nút đang focus bị disabled → focus lên khung hộp (không rơi ra body); mở khoá mà
 *   focus đang ở khung → trả về nút xác nhận.
 * - `loi`: chỉ để HIỆN (Alert danger trong thân), không điều khiển khoá; ReactNode thoải mái.
 * - `khoaXacNhan`: nút xác nhận disabled (chưa nhập đủ — vd chưa gõ đúng mã, chưa nhập lý do bắt buộc).
 * - `color="danger"`: icon tròn nền/màu danger-soft (tên `color` như Alert/Badge — luật đặt tên prop ở ds/NGUON.md).
 * - aria-describedby: mô tả; không có mô tả thì danh sách hậu quả.
 * - Đóng xong focus về phần tử đã mở hộp — AlertDialogContent lo qua use-nut-mo.ts (mở từ mục menu → về nút/dòng đã
 *   mở menu; mount sẵn `open` cũng đúng).
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  tieuDe,
  moTa,
  hauQua,
  icon: bieuTuong,
  color,
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
  color?: 'danger'
  nutXacNhan: string
  nutHuy?: string
  pha?: boolean
  dangChay?: boolean
  loi?: ReactNode
  khoaXacNhan?: boolean
  onXacNhan(): void | Promise<unknown>
  children?: ReactNode
}) {
  const khung = useRef<HTMLDivElement>(null)
  const nutXn = useRef<HTMLButtonElement>(null)
  const idHauQua = useId()
  // chan: chặn đồng bộ lần bấm thứ hai (trước khi React kịp vẽ lại nút disabled).
  const chan = useRef(false)
  const [cho, setCho] = useState(false) // đang chờ Promise của onXacNhan
  const [thatBai, setThatBai] = useState(false)
  // Lượt mở: tăng mỗi lần mở; Promise mang số lượt lúc bấm, lệch lượt hiện tại = của hộp cũ → bỏ qua.
  const luot = useRef(0)
  // Cạnh open false→true: xoá khoá/lỗi của lượt trước NGAY trong render (state dẫn xuất, không setState trong effect).
  const [moTruoc, setMoTruoc] = useState(open)
  if (open !== moTruoc) {
    setMoTruoc(open)
    if (open) {
      setCho(false)
      setThatBai(false)
    }
  }
  useLayoutEffect(() => {
    if (!open) return
    luot.current++
    chan.current = false
  }, [open])
  const khoa = dangChay || cho

  // Khoá: nút đang focus vừa bị disabled → trình duyệt thả focus ra body (FocusScope của Radix không bắt lại) → đưa
  // lên khung. Mở khoá mà focus còn ở khung → trả về nút xác nhận (bấm lại được ngay bằng Enter).
  useLayoutEffect(() => {
    const k = khung.current
    const a = document.activeElement
    if (!k) return
    if (khoa && (!k.contains(a) || a?.matches(':disabled'))) k.focus({ preventScroll: true })
    else if (!khoa && a === k) nutXn.current?.focus({ preventScroll: true })
  }, [khoa])

  const bam = () => {
    if (khoa || chan.current) return
    chan.current = true
    setThatBai(false)
    const lan = luot.current
    const loiRoi = () => {
      if (lan !== luot.current) return
      chan.current = false
      setCho(false)
      setThatBai(true)
    }
    let r: unknown
    try {
      r = onXacNhan()
    } catch {
      loiRoi()
      return
    }
    if (r && typeof (r as PromiseLike<unknown>).then === 'function') {
      setCho(true)
      ;(r as PromiseLike<unknown>).then(() => {
        if (lan !== luot.current) return
        chan.current = false
        setCho(false)
        onOpenChange(false)
      }, loiRoi)
    } else {
      // Đồng bộ: không khoá lâu; thả chặn sau tác vụ này (lần bấm thứ hai CÙNG tác vụ vẫn bị chặn).
      setTimeout(() => (chan.current = false))
    }
  }
  const loiHien = loi ?? (thatBai ? 'Không thực hiện được — thử lại.' : null)

  return (
    <AlertDialog open={open} onOpenChange={(o) => (o || !khoa) && onOpenChange(o)}>
      <AlertDialogContent
        ref={khung}
        aria-describedby={!moTa && hauQua?.length ? idHauQua : undefined}
        onOpenAutoFocus={(e) => {
          const dich =
            khung.current?.querySelector<HTMLElement>('[data-autofocus]') ?? (pha || khoaXacNhan || khoa ? null : nutXn.current)
          if (dich) {
            e.preventDefault()
            dich.focus({ preventScroll: true })
          } // không → Radix focus nút Huỷ
        }}
      >
        {bieuTuong && (
          <div
            data-slot="confirm-dialog-icon"
            data-color={color}
            aria-hidden="true"
            className={cn(icon, color === 'danger' && iconDanger)}
          >
            {bieuTuong}
          </div>
        )}
        <AlertDialogTitle>{tieuDe}</AlertDialogTitle>
        {moTa && <AlertDialogDescription>{moTa}</AlertDialogDescription>}
        {(hauQua?.length || children || loiHien) && (
          <AlertDialogBody>
            {hauQua?.length ? (
              <ul id={idHauQua} data-slot="confirm-dialog-list" className={list}>
                {hauQua.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            ) : null}
            {children && (
              // contents: không thêm hộp; disabled khoá mọi ô con khi đang chạy. Khoảng 16 sau danh sách đặt lên con đầu
              // (margin trên phần tử display:contents không có tác dụng).
              <fieldset disabled={khoa} className="contents [ul+&>:first-child]:mt-4">
                {children}
              </fieldset>
            )}
            {loiHien && (
              <Alert color="danger" className="[*+&]:mt-4">
                <AlertDescription>{loiHien}</AlertDescription>
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
            onClick={bam}
          >
            {nutXacNhan}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
