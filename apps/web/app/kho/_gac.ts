import { requireNhanSu } from '@/lib/nen-tang/phien'
import { chanNeuThieuQuyen, coQuyenHienNut } from '@/lib/nen-tang/kiem-quyen'

/**
 * Gác cổng khu Kho. Cặp (mã quyền, luật cũ) phải KHỚP mục menu ở components/TopNav.tsx (MUC_MENU) —
 * lệch cặp là menu hiện mà bấm vào bị đá ra, hoặc ngược lại.
 */
export async function chanKho() {
  await requireNhanSu()
  await chanNeuThieuQuyen('kho.ton.xem', 'NHANVIEN')
}

/**
 * Người xem có được SỬA sổ kho không (vẽ nút Sửa / Huỷ / Duyệt, trang Kiểm kê). Cặp ('kho.so.sua', 'ADMIN') phải KHỚP
 * coQuyen() trong app/kho/actions.ts và mục menu Kiểm kê ở TopNav — lệch là nút hiện mà bấm bị chặn, hoặc ngược lại.
 */
export async function coTheSuaKho(): Promise<boolean> {
  return coQuyenHienNut('kho.so.sua', 'ADMIN')
}
