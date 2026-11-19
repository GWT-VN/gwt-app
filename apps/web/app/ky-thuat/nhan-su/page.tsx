import { redirect } from 'next/navigation'

/**
 * Danh sách kỹ thuật đã gộp vào tab Kỹ thuật của /danh-sach-nguoi (Hiệp 19/11/2026: một chỗ thêm / sửa / xoá thợ).
 * Giữ địa chỉ cũ để link, bookmark cũ không gãy. Trang đích tự chặn người không đủ quyền.
 */
export default function NhanSuKyThuatPage() {
  redirect('/danh-sach-nguoi?tab=kt')
}
