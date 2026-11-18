// Huỷ bộ / máy vừa lắp + sửa ngày bảo hành cả bộ — hàm thuần (18/11/2026).

const LY_DO_TOI_THIEU = 5
const LY_DO_TOI_DA = 300

/** Lý do huỷ: bắt buộc, gọn khoảng trắng, 5–300 ký tự. */
export function kiemLyDoHuy(s: unknown): { ok: true; lyDo: string } | { ok: false; error: string } {
  const t = typeof s === 'string' ? s.replace(/\s+/g, ' ').trim() : ''
  if (t.length < LY_DO_TOI_THIEU) return { ok: false, error: 'Ghi lý do huỷ (ít nhất 5 ký tự), vd: "nhập nhầm khách".' }
  if (t.length > LY_DO_TOI_DA) return { ok: false, error: `Lý do tối đa ${LY_DO_TOI_DA} ký tự.` }
  return { ok: true, lyDo: t }
}

/** Ngày bắt đầu bảo hành mới cho cả bộ: 'YYYY-MM-DD' có thật, không ở tương lai (giờ VN), không trước 2015. */
export function kiemNgayBo(s: unknown, now: Date = new Date()): { ok: true; ngay: string } | { ok: false; error: string } {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return { ok: false, error: 'Ngày không hợp lệ.' }
  const d = new Date(`${s}T00:00:00Z`)
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) return { ok: false, error: 'Ngày không có thật.' }
  const homNay = new Date(now.getTime() + 7 * 3600_000).toISOString().slice(0, 10)
  if (s > homNay) return { ok: false, error: 'Ngày bắt đầu bảo hành không được ở tương lai.' }
  if (s < '2015-01-01') return { ok: false, error: 'Ngày quá xa.' }
  return { ok: true, ngay: s }
}
