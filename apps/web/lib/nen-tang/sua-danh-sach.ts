import { chuanHoaVaiTro } from './vai-tro'

// Ai được THÊM / XOÁ người trong các danh sách dùng trên ticket (CS theo dõi, kỹ thuật) — hàm thuần, dùng được ở client.
// Hiệp 19/11/2026: người giữ vai trò `sua_ds_nguoi` ("DS người › Sửa" ở bánh răng › Nhân viên). Ban đầu gán cho admin@ và
// ai@ (migration 20261119120000); muốn cho ai thì tích ô đó cho người đó — không cần sửa code.
// (Trước đó là danh sách email cố định admin@ + ai@ trong file này.)

export const VAI_TRO_SUA_DANH_SACH = 'sua_ds_nguoi'

export function duocSuaDanhSach(vaiTro: string | string[] | null | undefined): boolean {
  return chuanHoaVaiTro(vaiTro).includes(VAI_TRO_SUA_DANH_SACH)
}
