import { requireNhanSu } from '@/lib/nen-tang/phien'
import { chanNeuThieuQuyen } from '@/lib/nen-tang/kiem-quyen'

/**
 * Gác cổng khu Kho. Cặp (mã quyền, luật cũ) phải KHỚP mục menu ở components/TopNav.tsx (MUC_MENU) —
 * lệch cặp là menu hiện mà bấm vào bị đá ra, hoặc ngược lại.
 */
export async function chanKho() {
  await requireNhanSu()
  await chanNeuThieuQuyen('kho.ton.xem', 'NHANVIEN')
}
