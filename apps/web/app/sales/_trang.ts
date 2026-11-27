// Sắp + cắt trang trong bộ nhớ cho danh sách khu Sales gộp nhiều nguồn (đơn, giá, CTKM) — khuôn F phân trang 50 dòng.
export const MOI_TRANG = 50

/** So hai dòng theo một giá trị (chuỗi theo tiếng Việt, số theo trị); trống luôn xuống cuối. */
export function soSanh<T>(lay: (r: T) => string | number | null | undefined, tang: boolean) {
  return (a: T, b: T) => {
    const x = lay(a)
    const y = lay(b)
    if (x == null || x === '') return y == null || y === '' ? 0 : 1
    if (y == null || y === '') return -1
    const k = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'vi')
    return tang ? k : -k
  }
}

/** Trang `trang` (từ 1) của `ds` đã sắp. */
export function catTrang<T>(ds: T[], trang = 1) {
  const soTrang = Math.max(1, Math.ceil(ds.length / MOI_TRANG))
  const t = Math.min(Math.max(1, trang), soTrang)
  return { rows: ds.slice((t - 1) * MOI_TRANG, t * MOI_TRANG), tong: ds.length, soTrang }
}
