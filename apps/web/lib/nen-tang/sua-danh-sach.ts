// Ai được THÊM / XOÁ người trong các danh sách dùng trên ticket (CS theo dõi, kỹ thuật) — hàm thuần, dùng được ở client.
// Hiệp 19/11/2026: trong GIAI ĐOẠN HOÀN THIỆN chỉ 2 tài khoản admin@ và ai@. Quyền app tính theo vai trò, mà không vai
// trò nào khớp đúng 2 tài khoản này (admin = ai@ + bella@; cs_manager = admin@ + tk@) → tạm dùng danh sách email.
// Xong giai đoạn: chuyển sang một mã quyền trong ma trận quyền và xoá file này.

export const EMAIL_SUA_DANH_SACH = ['admin@gwt.vn', 'ai@gwt.vn'] as const

export function duocSuaDanhSach(email: string | null | undefined): boolean {
  const e = email?.trim().toLowerCase()
  return !!e && (EMAIL_SUA_DANH_SACH as readonly string[]).includes(e)
}
