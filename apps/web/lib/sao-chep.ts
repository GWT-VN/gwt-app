import { thongBao } from '@/components/ui/sonner'

/**
 * Sao chép chữ vào bộ nhớ tạm + toast kết quả (menu chuột phải dòng, nút sao chép). Không có quyền clipboard (trang mở
 * qua http không phải localhost, trình duyệt chặn) → toast lỗi thay vì im lặng.
 */
export async function saoChep(chu: string) {
  try {
    if (!navigator.clipboard) throw new Error('clipboard')
    await navigator.clipboard.writeText(chu)
    thongBao.xong('Đã sao chép')
  } catch {
    thongBao.loi('Không sao chép được — trình duyệt chặn bộ nhớ tạm')
  }
}
