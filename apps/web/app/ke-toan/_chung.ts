/**
 * Helper dùng chung giữa các file server action của khu Kế toán (`actions.ts`, `sao-ke/actions.ts`).
 * KHÔNG đánh dấu 'use server': file đó chỉ được export hàm async (server action) — nhưng chỗ này
 * cần export cả const/type (TOI_DA_BYTE, LO, KyRow). Tách riêng để cả hai file action import chung,
 * tránh chép lại chanKeToan()/goi()/duLieuEngine().
 */
import { redirect } from 'next/navigation'
import { dataClient } from '@/lib/nen-tang/db'
import { coTheVaoKeToan } from '@/lib/nen-tang/gac-cong'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { chuanHoaEmail } from '@/lib/nen-tang/vao-cua'
import type { Luat, MucCatalog, MucKmcp, MucKenh, ThongKeHoc } from '@/lib/ke-toan/engine/kieu'

export type KyRow = { id: number; ky: string; status: 'dang_xu_ly' | 'da_gui'; sent_at: string | null; cap_nhat: string; so_dong_vao: number; so_dong_ra: number; so_canh_bao: number; edits_after_sent: number }

export const TOI_DA_BYTE = 8 * 1024 * 1024
export const LO = 200

/** Gác khu Kế toán: nền tảng (mọi nhân sự) + vai trò trong VAI_TRO_VAO_KE_TOAN. Trả email đã chuẩn hoá. */
export async function chanKeToan(): Promise<string> {
  const u = await requireNhanSu()
  if (!(await coTheVaoKeToan())) redirect('/?loi=khong_du_quyen')
  return chuanHoaEmail(u.email)
}

/**
 * Gọi RPC + ném lỗi kèm thông điệp gốc (tiếng Việt từ Postgres).
 *
 * LƯU Ý: goi() tự gọi chanKeToan() để lấy p_email — nhưng nếu người gọi bọc lời gọi goi() bên
 * trong try/catch thì redirect() ném ra từ chanKeToan() (qua requireNhanSu()/coTheVaoKeToan())
 * sẽ bị try/catch NUỐT MẤT, biến một cú đá "không đủ quyền" thành lỗi thường (xem cảnh báo
 * trong lib/nen-tang/phien.ts). requireNhanSu()/layNhanVien() dùng cache() của React trong CÙNG
 * request, nên chanKeToan() gọi lại bên trong goi() sau khi đã gọi ở ngoài chỉ là đọc cache —
 * không redirect lần hai, không tốn thêm mạng. VÌ VẬY: hàm nào có `try {` phải tự
 * `await chanKeToan()` NGAY TRƯỚC try, giống hệt uploadNguon().
 */
export async function goi<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await dataClient().rpc(fn, { p_email: await chanKeToan(), ...args })
  if (error) throw new Error(error.message)
  return data as T
}

export async function duLieuEngine(): Promise<{ luat: Luat[]; catalog: MucCatalog[]; kmcp: MucKmcp[]; kenh: MucKenh[]; thongKe: ThongKeHoc }> {
  await chanKeToan()
  const db = dataClient()
  const [luat, cat, km, kenh, thongKe] = await Promise.all([
    goi<{ id: number; kind: Luat['kind']; pattern: string; target_code: string; condition: string | null; priority: number; origin: Luat['origin']; active: boolean }[]>('ke_toan_luat_list', {}),
    db.from('catalog_item').select('"Mã nội bộ", "Tên ngắn gọn (đề xuất)", "Tính chất", "Danh mục cấp 2", "Danh mục cấp 3"'),
    db.from('expense_category').select('ma, ten, tk_no_default'),
    db.from('dim_channel').select('mst, company_name, channel_l1, channel_l2'),
    goi<ThongKeHoc>('ke_toan_thong_ke_hoc', {}),
  ])
  if (cat.error) throw new Error(cat.error.message)
  if (km.error) throw new Error(km.error.message)
  if (kenh.error) throw new Error(kenh.error.message)
  return {
    luat: (luat ?? []).map((l) => ({ id: l.id, kind: l.kind, pattern: l.pattern, targetCode: l.target_code, condition: l.condition, priority: l.priority, origin: l.origin, active: l.active })),
    catalog: (cat.data as Record<string, string | null>[]).map((c) => ({ ma: c['Mã nội bộ'] ?? '', ten: c['Tên ngắn gọn (đề xuất)'] ?? '', tinhChat: c['Tính chất'] ?? '', capHai: c['Danh mục cấp 2'] ?? undefined, capBa: c['Danh mục cấp 3'] ?? undefined })).filter((c) => c.ma && c.ten),
    kmcp: (km.data as { ma: string; ten: string | null; tk_no_default: string | null }[]).map((k) => ({ ma: k.ma, ten: k.ten ?? '', tkNoDefault: k.tk_no_default ?? '' })),
    kenh: (kenh.data as { mst: string | null; company_name: string | null; channel_l1: string; channel_l2: string }[]).map((k) => ({ mst: k.mst, companyName: k.company_name, channelL1: k.channel_l1, channelL2: k.channel_l2 })),
    thongKe: thongKe ?? { ncc: {}, prefix: {} },
  }
}
