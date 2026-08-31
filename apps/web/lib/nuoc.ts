/**
 * Chỉ số nước — KIỂU + hàm thuần. Để RIÊNG khỏi `app/actions.ts`.
 *
 * `actions.ts` mang `'use server'`, mà file đó **mọi export phải là hàm async** — đặt một
 * hàm thường vào là **build đổ**, dù `tsc` sạch và 623 test xanh. Đúng vệt bẫy đã trả giá
 * hồi 21/08 (client component import nhầm module chạm DB): có loại lỗi chỉ `npm run build`
 * mới bắt được.
 */

/** Bộ chỉ số nước trước/sau lọc của MỘT lượt bảo trì. */
export type DoNuoc = {
  tds_truoc: number | null; tds_sau: number | null
  ph_truoc: number | null; ph_sau: number | null
  do_cung_truoc: number | null; do_cung_sau: number | null
  clo_truoc: number | null; clo_sau: number | null
  ket_qua_ghi_chu: string | null
}

/** Có ít nhất một chỉ số (hoặc ghi chú) — dùng để khỏi hiện khối rỗng. */
export function coDoNuoc(d: DoNuoc | null | undefined): boolean {
  if (!d) return false
  return [d.tds_truoc, d.tds_sau, d.ph_truoc, d.ph_sau,
          d.do_cung_truoc, d.do_cung_sau, d.clo_truoc, d.clo_sau]
    .some((x) => x !== null && x !== undefined)
    || Boolean((d.ket_qua_ghi_chu ?? '').trim())
}
