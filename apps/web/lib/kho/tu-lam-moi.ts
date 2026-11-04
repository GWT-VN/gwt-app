/** Có nên tự làm mới trang Kho lúc này không — thuần (test). Tab ẩn / đang gõ / đang mở hộp sửa → không (tránh mất chữ đang gõ). */
export function nenLamMoi({ hien, dangGo, coHop }: { hien: boolean; dangGo: boolean; coHop: boolean }): boolean {
  return hien && !dangGo && !coHop
}
