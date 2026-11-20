'use client'

import { useEffect, useRef, useState } from 'react'
import { GitMerge, Trash } from '@phosphor-icons/react/ssr'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { BienThe, KhoiHang } from '../_khung/tam'

/**
 * #confirm-dialog — tái tạo ds/nguon/components/ConfirmDialog/preview.html (3 hộp vẽ tĩnh) bằng 3 nút mở thật:
 * Đóng ticket (thường, focus nút chính) · Xoá phiếu chi (icon, hậu quả, ô lý do BẮT BUỘC — nút đỏ khoá tới khi nhập,
 * focus "Quay lại"; lần bấm đầu giả lập LỖI để xem Alert trong hộp, lần sau xoá được) · Gộp khách (gõ đúng mã mới mở
 * khoá nút đỏ). `onXacNhan` trả Promise 1,2 giây: đang chờ → spinner, khoá Esc/Huỷ/ô nhập; resolve → hộp tự đóng.
 * Dữ liệu mẫu giả (prototype).
 * Ô lý do / ô gõ mã = Field + FieldLabel + Textarea / Input DS.
 * `data-so` = khoá so khớp (ds/so-khop/confirmdialog.json).
 */

/** Mở/đóng + `onXacNhan` trả Promise xong sau 1,2 giây; `thanhCong()` false → reject (giả lập lỗi). */
function useMau(thanhCong: () => boolean = () => true) {
  const [mo, setMo] = useState(false)
  const hen = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(hen.current), [])
  const hop = {
    open: mo,
    onOpenChange: setMo,
    onXacNhan: () =>
      new Promise<void>((ok, loi) => {
        hen.current = setTimeout(() => (thanhCong() ? ok() : loi(new Error('giả lập'))), 1200)
      }),
  }
  return { moHop: () => setMo(true), hop }
}

/** Đóng ticket — thường (không `pha`): focus nút chính. */
function MauDong() {
  const dong = useMau()
  return (
    <>
      <Button data-so="mo-dong" variant="outline" onClick={dong.moHop}>
        Đóng ticket…
      </Button>
      <ConfirmDialog
        {...dong.hop}
        tieuDe="Đóng ticket TK-2611-045?"
        moTa="Ticket chuyển sang “Đóng”. Khách báo lại trong 7 ngày thì ticket tự mở lại."
        nutXacNhan="Đóng ticket"
      />
    </>
  )
}

/** Xoá phiếu chi — `pha` + hậu quả + lý do BẮT BUỘC; lần bấm đầu giả lập lỗi. */
function MauXoa() {
  const daLoi = useRef(false)
  const xoa = useMau(() => {
    if (daLoi.current) return true
    daLoi.current = true
    return false
  })
  const [lyDo, setLyDo] = useState('')
  return (
    <>
      <Button data-so="mo-xoa" variant="destructive" onClick={xoa.moHop}>
        Xoá phiếu chi…
      </Button>
      <ConfirmDialog
        {...xoa.hop}
        onOpenChange={(m) => {
          xoa.hop.onOpenChange(m)
          if (!m) {
            setLyDo('')
            daLoi.current = false
          }
        }}
        khoaXacNhan={!lyDo.trim()}
        pha
        icon={<Trash />}
        color="danger"
        tieuDe="Xoá phiếu chi PC-2611-018?"
        moTa="Không hoàn tác được. Sẽ xảy ra:"
        hauQua={[
          'Phiếu biến mất khỏi Báo cáo thu chi tháng 11.',
          'Số dư quỹ tiền mặt tăng lại 1.250.000 ₫.',
          'Lịch sử phiếu vẫn giữ trong nhật ký kiểm toán.',
        ]}
        nutHuy="Quay lại"
        nutXacNhan="Xoá phiếu"
      >
        <Field data-so="truong">
          <FieldLabel htmlFor="cd-ly-do" required>
            Lý do xoá
          </FieldLabel>
          <Textarea
            id="cd-ly-do"
            rows={2}
            required
            value={lyDo}
            onChange={(e) => setLyDo(e.target.value)}
            placeholder="VD: nhập trùng với PC-2611-017"
          />
        </Field>
      </ConfirmDialog>
    </>
  )
}

/** Gộp khách — gõ đúng mã mới mở khoá nút đỏ. */
function MauGop() {
  const gop = useMau()
  const [ma, setMa] = useState('')
  return (
    <>
      <Button data-so="mo-gop" variant="outline" onClick={gop.moHop}>
        Gộp khách…
      </Button>
      <ConfirmDialog
        {...gop.hop}
        onOpenChange={(m) => {
          gop.hop.onOpenChange(m)
          if (!m) setMa('')
        }}
        pha
        icon={<GitMerge />}
        color="danger"
        tieuDe="Gộp “Nguyễn Văn An” vào khách KH-00198?"
        moTa="Ticket, máy, lịch bảo trì của KH-00231 chuyển sang KH-00198, rồi KH-00231 bị xoá. Không tách lại được."
        nutXacNhan="Gộp khách"
        khoaXacNhan={ma.trim() !== 'KH-00231'}
      >
        <Field>
          <FieldLabel htmlFor="cd-ma">
            Gõ <b>KH-00231</b> để xác nhận
          </FieldLabel>
          <Input
            id="cd-ma"
            data-autofocus
            autoComplete="off"
            spellCheck={false}
            value={ma}
            onChange={(e) => setMa(e.target.value)}
          />
        </Field>
      </ConfirmDialog>
    </>
  )
}

export function KhoiConfirmDialog() {
  return (
    <section id="confirm-dialog" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#confirm-dialog">ConfirmDialog</a>
      </h2>
      <div className="flex flex-wrap gap-2">
        <MauDong />
        <MauXoa />
        <MauGop />
      </div>
    </section>
  )
}

/** /ds dạng hàng: ba mẫu, mỗi mẫu một hàng; đang chạy (spinner, khoá Esc/Huỷ) + lỗi trong hộp xem ở hàng Xoá. */
export function KhoiConfirmDialogHang() {
  return (
    <KhoiHang neo="confirm-dialog">
      <BienThe ten="Thường" moTa="Việc hoàn tác được — focus nút xác nhận, chạy xong tự đóng">
        <MauDong />
      </BienThe>
      <BienThe ten="Phá + hậu quả" moTa="Không hoàn tác: kê hậu quả, bắt nhập lý do; lần đầu báo lỗi trong hộp">
        <MauXoa />
      </BienThe>
      <BienThe ten="Gõ mã để mở khoá" moTa="Việc rất nặng (gộp, xoá loạt) — gõ đúng mã mới bật nút">
        <MauGop />
      </BienThe>
    </KhoiHang>
  )
}
