'use client'

import { useEffect, useRef, useState } from 'react'
import { GitMerge, Trash } from '@phosphor-icons/react/ssr'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

/**
 * #confirm-dialog — tái tạo ds/nguon/components/ConfirmDialog/preview.html (3 hộp vẽ tĩnh) bằng 3 nút mở thật:
 * Đóng ticket (thường, focus nút chính) · Xoá phiếu chi (icon, hậu quả, ô lý do, focus "Quay lại", nút đỏ — lần bấm
 * đầu giả lập LỖI để xem Alert trong hộp, lần sau xoá được) · Gộp khách (gõ đúng mã mới mở khoá nút đỏ).
 * Bấm xác nhận → spinner 1,2 giây (khoá Esc/Huỷ) rồi đóng. Dữ liệu mẫu giả (prototype).
 * Ô nhập: CHƯA có Input/Textarea DS (lát 3) → `<label>`/`<textarea>`/`<input>` gốc mang giá trị `.ui-field` /
 * `.ui-label` / `.ui-textarea` / `.ui-input` của bundle.css CHỈ trong khối demo này — đừng chép sang màn thật.
 * `data-so` = khoá so khớp (ds/so-khop/confirmdialog.json).
 */
const o = [
  'w-full rounded-(--radius-md) border-0 bg-transparent px-(--control-gutter-md)',
  'text-[14px] leading-[20px] font-normal text-(--color-text) outline-none',
  '[box-shadow:inset_0_0_0_1px_var(--input)] placeholder:text-(--color-text-tertiary)',
  'transition-[box-shadow,background-color,color] duration-150 ease-[ease]',
  'hover:[box-shadow:inset_0_0_0_1px_var(--alpha-25)] in-data-[theme=dark]:hover:[box-shadow:inset_0_0_0_1px_var(--alpha-30)]',
  'focus:[box-shadow:inset_0_0_0_1px_var(--alpha-50)] in-data-[theme=dark]:focus:[box-shadow:inset_0_0_0_1px_var(--alpha-50)]',
].join(' ')
const truong = 'flex min-w-0 flex-col gap-1.5 border-none border-current'
const nhan = 'text-[14px] leading-[20px] font-medium text-foreground'

/** Mở/đóng + "đang chạy" 1,2 giây; `xong()` trả true → đóng, false → giữ hộp (đã đặt lỗi). */
function useMau(xong: () => boolean = () => true) {
  const [mo, setMo] = useState(false)
  const [chay, setChay] = useState(false)
  const hen = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(hen.current), [])
  const hop = {
    open: mo,
    dangChay: chay,
    onOpenChange: setMo,
    onXacNhan: () => {
      setChay(true)
      hen.current = setTimeout(() => {
        setChay(false)
        if (xong()) setMo(false)
      }, 1200)
    },
  }
  return { moHop: () => setMo(true), hop }
}

export function KhoiConfirmDialog() {
  const dong = useMau()
  const [loiXoa, setLoiXoa] = useState<string>()
  const daLoi = useRef(false)
  const xoa = useMau(() => {
    if (daLoi.current) return true
    daLoi.current = true
    setLoiXoa('Không xoá được — máy chủ không phản hồi (lỗi giả lập). Bấm "Xoá phiếu" lần nữa.')
    return false
  })
  const gop = useMau()
  const [ma, setMa] = useState('')

  return (
    <section id="confirm-dialog" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#confirm-dialog">ConfirmDialog</a>
      </h2>
      <div className="flex flex-wrap gap-2">
        <Button data-so="mo-dong" variant="outline" onClick={dong.moHop}>
          Đóng ticket…
        </Button>
        <Button data-so="mo-xoa" variant="destructive" onClick={xoa.moHop}>
          Xoá phiếu chi…
        </Button>
        <Button data-so="mo-gop" variant="outline" onClick={gop.moHop}>
          Gộp khách…
        </Button>
      </div>

      <ConfirmDialog
        {...dong.hop}
        tieuDe="Đóng ticket TK-2611-045?"
        moTa="Ticket chuyển sang “Đóng”. Khách báo lại trong 7 ngày thì ticket tự mở lại."
        nutXacNhan="Đóng ticket"
      />

      <ConfirmDialog
        {...xoa.hop}
        onOpenChange={(m) => {
          xoa.hop.onOpenChange(m)
          if (!m) {
            setLoiXoa(undefined)
            daLoi.current = false
          }
        }}
        onXacNhan={() => {
          setLoiXoa(undefined)
          xoa.hop.onXacNhan()
        }}
        loi={loiXoa}
        pha
        icon={<Trash />}
        mau="danger"
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
        <div data-so="truong" className={truong}>
          <label htmlFor="cd-ly-do" className={nhan}>
            Lý do xoá{' '}
            <span className="text-(--color-text-danger)" aria-hidden="true">
              *
            </span>
          </label>
          {/* `.ui-textarea`: cao tối thiểu 80, padding 6 dọc, kéo giãn dọc */}
          <textarea
            id="cd-ly-do"
            rows={2}
            required
            placeholder="VD: nhập trùng với PC-2611-017"
            className={`${o} min-h-20 resize-y py-1.5`}
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        {...gop.hop}
        onOpenChange={(m) => {
          gop.hop.onOpenChange(m)
          if (!m) setMa('')
        }}
        pha
        icon={<GitMerge />}
        mau="danger"
        tieuDe="Gộp “Nguyễn Văn An” vào khách KH-00198?"
        moTa="Ticket, máy, lịch bảo trì của KH-00231 chuyển sang KH-00198, rồi KH-00231 bị xoá. Không tách lại được."
        nutXacNhan="Gộp khách"
        khoaXacNhan={ma.trim() !== 'KH-00231'}
      >
        <div className={truong}>
          <label htmlFor="cd-ma" className={nhan}>
            Gõ <b>KH-00231</b> để xác nhận
          </label>
          <input
            id="cd-ma"
            data-autofocus
            autoComplete="off"
            spellCheck={false}
            value={ma}
            onChange={(e) => setMa(e.target.value)}
            className={`${o} h-(--control-size-md)`}
          />
        </div>
      </ConfirmDialog>
    </section>
  )
}
