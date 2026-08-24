'use client'

/**
 * Hộp xác nhận trước khi xoá hàng loạt.
 *
 * CEO yêu cầu 24/08: "cho phép xoá nữa, cần xác nhận lại việc xoá trước khi
 * thực hiện."
 *
 * ── Vì sao KHÔNG dùng window.confirm() ─────────────────────────────────────
 * confirm() chỉ nói được một dòng, mà thứ cần nói ở đây có ba tầng và tầng nào
 * cũng đổi được quyết định:
 *
 *   1. SỐ THẬT sẽ mất. `work.task.parent_id` là FK ON DELETE CASCADE — chọn 3
 *      việc mà mất 20 là chuyện xảy ra được, và Postgres không hỏi ai cả. Nên
 *      hộp này in `se_xoa` (đã đệ quy xuống hết nhánh con), không in số đã chọn.
 *   2. THỨ ĐI KÈM: bình luận, nhật ký, chip. Xoá việc là mất luôn dấu vết ai
 *      từng làm gì trên đó, không khôi phục được.
 *   3. VIỆC TỰ SINH SẼ MỌC LẠI. Bẫy đã dính 20/08: dọn sạch việc tự sinh trên
 *      production, cron 15 phút dựng lại y như cũ, vì luật lọc trùng dựa trên
 *      `origin_ref` của bản ghi — xoá đi là hết dấu, lượt quét sau thấy "chưa
 *      có" nên tạo lại. Xoá mà không tắt luật trước là công cốc.
 *
 * Nút xoá cố ý KHÔNG được focus sẵn: hộp bật lên rồi gõ Enter theo quán tính
 * thì không được phép thành lệnh xoá.
 */
import { useEffect } from 'react'
import type { XemTruocXoa } from '@/app/work/actions'
import { Nut } from './ui'

export function HopXacNhanXoa({
  soDaChon, xemTruoc, dangXoa, onHuy, onXacNhan,
}: {
  soDaChon: number
  /** null = đang đếm. */
  xemTruoc: XemTruocXoa | null
  dangXoa: boolean
  onHuy: () => void
  onXacNhan: () => void
}) {
  // Esc để thoát. Con trỏ nằm ở nút HUỶ (autoFocus bên dưới), không ở nút xoá.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !dangXoa) onHuy() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onHuy, dangXoa])

  const x = xemTruoc
  const mocLai = (x?.tu_sinh ?? 0) > 0 && (x?.luat_dang_bat.length ?? 0) > 0
  const khongXoaDuoc = x != null && x.se_xoa === 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(14,28,31,.45)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tieu-de-xoa"
    >
      <div
        className="w-full max-w-md flex flex-col gap-3 p-5"
        style={{
          background: 'var(--surface)', border: '1px solid var(--border-strong)',
          borderRadius: 13, boxShadow: '0 24px 60px -20px rgba(14,28,31,.5)',
        }}
      >
        <h2 id="tieu-de-xoa" style={{ fontSize: 16, fontWeight: 680, margin: 0 }}>
          Xoá việc — không khôi phục được
        </h2>

        {x == null ? (
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Đang đếm…</p>
        ) : khongXoaDuoc ? (
          <p style={{ fontSize: 13.5, margin: 0 }}>
            Bạn không có quyền xoá việc nào trong <span className="so">{soDaChon}</span> việc đã chọn.
          </p>
        ) : (
          <>
            <p style={{ fontSize: 13.5, margin: 0, lineHeight: 1.5 }}>
              Sẽ xoá vĩnh viễn{' '}
              <b className="so" style={{ fontSize: 15 }}>{x.se_xoa}</b> việc
              {x.viec_con > 0 && (
                <>
                  {' '}— trong đó <b className="so">{x.viec_con}</b> việc con bị xoá lây theo
                  mà bạn không chọn trực tiếp
                </>
              )}.
            </p>

            {(x.binh_luan > 0 || x.nhat_ky > 0 || x.chip > 0) && (
              <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
                Mất kèm:{' '}
                {[
                  x.binh_luan > 0 && `${x.binh_luan} bình luận`,
                  x.nhat_ky > 0 && `${x.nhat_ky} dòng nhật ký`,
                  x.chip > 0 && `${x.chip} chip đã gắn`,
                ].filter(Boolean).join(' · ')}.
              </p>
            )}

            {mocLai && (
              // Tầng cảnh báo quan trọng nhất — không có nó thì CEO xoá xong 15
              // phút sau thấy y nguyên và không hiểu vì sao.
              <p
                className="flex flex-col gap-1 p-2.5"
                style={{
                  fontSize: 12.5, lineHeight: 1.5, margin: 0, borderRadius: 9,
                  background: 'var(--amber-wash)', color: 'var(--ink-2)',
                  border: '1px solid var(--amber)',
                }}
              >
                <b>
                  <span className="so">{x.tu_sinh}</span> việc trong đó là việc tự sinh — cron sẽ
                  dựng lại sau tối đa 15 phút.
                </b>
                <span>
                  Luật đang bật: {x.luat_dang_bat.join(' · ')}. Muốn xoá cho hẳn thì{' '}
                  <b>tắt luật ở /work/tu-sinh trước</b>, rồi mới xoá.
                </span>
              </p>
            )}

            {x.bo_qua > 0 && (
              <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: 0 }}>
                Bỏ qua <span className="so">{x.bo_qua}</span> việc bạn không có quyền xoá.
              </p>
            )}
          </>
        )}

        <div className="flex items-center gap-2 justify-end mt-1">
          <Nut autoFocus onClick={onHuy} disabled={dangXoa}>Huỷ</Nut>
          <Nut
            onClick={onXacNhan}
            disabled={dangXoa || x == null || khongXoaDuoc}
            style={{ background: 'var(--red)', border: '1px solid var(--red)', color: '#fff' }}
          >
            {dangXoa ? 'Đang xoá…' : `Xoá ${x?.se_xoa ?? ''} việc`}
          </Nut>
        </div>
      </div>
    </div>
  )
}
