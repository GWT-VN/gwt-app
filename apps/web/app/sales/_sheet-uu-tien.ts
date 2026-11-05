/**
 * Đơn tạo trên app ĐÃ lên Google Sheet Sales (bot gwt-discord-bot admin/sales/ghi-sheet.mjs ghi về, Apps Script đồng bộ lại
 * vào `sales_order_lines`) → Sheet là NGUỒN CHUẨN (chốt 04/11/2026): trang xem + form sửa lấy theo bản Sheet cho những ô
 * Sheet có; ô Sheet không đồng bộ về (SĐT, địa chỉ, tiền cọc, ô POE…) vẫn theo bản app.
 * Sửa trên app → bot chỉ ghi lên Sheet các ô VỪA đổi, nên ô người khác sửa trên Sheet không bị ghi đè.
 */

/** Mã sản phẩm thật (không phải câu mô tả quà kiểu "01 lõi CFNC voucher (5.000.000) · …"). Giống bot. */
export const laMaSp = (s: string | null | undefined) => /^[A-Za-z0-9][A-Za-z0-9._/+-]{0,39}$/.test((s ?? '').trim())

/** Bỏ dấu bot gắn vào Ghi chú trên Sheet ("[App] nhập bởi …", "[App] Đã xoá trên app …") — lưu lại không bị nhân đôi. */
export function boDauApp(note: string | null | undefined): string | null {
  if (!note) return null
  const t = note
    .split(' · ')
    .filter((p) => !/^\[App\] (nhập bởi|Đã xoá trên app)/.test(p.trim()))
    .join(' · ')
    .trim()
  return t || null
}

/** Phần đầu đơn theo dòng đầu của Sheet (mirror). */
export function dauTheoSheet(f: Record<string, unknown>) {
  const s = (k: string) => ((f[k] as string | null | undefined) ?? null)
  return {
    order_date: s('order_date'),
    customer_name: s('customer_name'),
    province: s('province'),
    channel: s('channel'),
    channel_detail: s('channel_detail'),
    status: s('fulfillment_status'),
    payment_status: s('payment_status'),
    partner_order_code: s('partner_order_code'),
    note: boDauApp(s('note')),
  }
}

type CoMa = { internal_code: string | null; is_gift: boolean }

/**
 * Sản phẩm theo Sheet. Sheet không có cờ quà → mã nào bên app là quà thì giữ là quà. Dòng quà GHI BẰNG CHỮ của app (bot
 * đưa vào cột "Quà tặng", không thành dòng trên Sheet) → giữ nguyên ở cuối, để lưu lại không làm mất quà.
 */
export function dongTheoSheet<A extends CoMa>(
  sheet: Array<Record<string, unknown>>,
  app: A[],
  chuyen: (s: Record<string, unknown>, laQua: boolean) => A,
): A[] {
  const quaMa = new Set(app.filter((a) => a.is_gift && laMaSp(a.internal_code)).map((a) => a.internal_code))
  return [
    ...sheet.map((s) => chuyen(s, quaMa.has((s.internal_code as string | null) ?? null))),
    ...app.filter((a) => a.is_gift && !laMaSp(a.internal_code)),
  ]
}

/** Ô đầu đơn mà bảng bổ sung (Sheet) mang theo ngoài các ô của `DON_MAC_DINH`. */
export const O_DAU_BO_SUNG = ['phone', 'address', 'payment_method', 'shipping_code', 'install_date'] as const

/**
 * Ghép ô bổ sung từ Sheet (bảng `sales_order_sheet_bo_sung`, Apps Script DongBoBoSung.gs) lên một bản đơn: chỉ ô Sheet CÓ
 * cột (khoá có mặt trong `data`) mới đè — tab không có cột đó (vd DON_TANG không có "Mã vận đơn") thì giữ bản app.
 */
export function phuBoSung<T extends Record<string, unknown>>(goc: T, data: Record<string, unknown> | null | undefined, khoa: readonly string[]): T {
  if (!data) return goc
  const out: Record<string, unknown> = { ...goc }
  for (const k of khoa) if (Object.prototype.hasOwnProperty.call(data, k)) out[k] = data[k]
  return out as T
}
