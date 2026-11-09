/** Cảnh báo sau khi tạo ticket đi qua URL bằng MÃ cố định; trang chỉ hiện câu tiếng Việt đã định sẵn. */
export const CANH_BAO = {
  dong_may_chua_luu: 'Đã tạo ticket nhưng chưa lưu đủ dòng máy — kiểm tra mục "Máy & lỗi" bên dưới và thêm lại nếu thiếu.',
  dong_may_tam_tat: 'Đã tạo ticket với serial chính; chức năng dòng máy / danh mục lỗi chưa bật nên các dòng máy chưa được lưu.',
} as const
export type MaCanhBao = keyof typeof CANH_BAO

export function canhBaoTuQuery(v: string | string[] | undefined): string | null {
  const ma = Array.isArray(v) ? v[0] : v
  if (typeof ma !== 'string' || !Object.hasOwn(CANH_BAO, ma)) return null
  return CANH_BAO[ma as MaCanhBao]
}
