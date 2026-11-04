'use server'

import { revalidatePath } from 'next/cache'
import { coQuyen } from '@/lib/nen-tang/kiem-quyen'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { daCauHinhKho } from '@/lib/kho/doc'
import { khoGhi, type KetQuaKiemKe } from '@/lib/kho/ghi'

/**
 * Server Action SỬA sổ kho (Đợt 3 — 04/11/2026). Mỗi action: requireNhanSu() → coQuyen('kho.so.sua', 'ADMIN') (cặp này phải
 * KHỚP hoiQuyen ở các trang kho) → gọi lớp ghi `lib/kho/ghi.ts` với nguoi = email người đang đăng nhập, nguon = 'app'.
 * Lỗi nghiệp vụ DB (raise exception tiếng Việt) trả nguyên văn để hiện cho người dùng.
 */
export type KetQua<T = object> = ({ ok: true } & T) | { ok: false; error: string }

const KHONG_DU_QUYEN = 'Bạn không có quyền sửa sổ kho.'

/** Trả email người sửa, hoặc câu lỗi. requireNhanSu() có thể redirect (NEXT_REDIRECT) → gọi NGOÀI try/catch. */
async function chanSua(): Promise<{ email: string } | { loi: string }> {
  const user = await requireNhanSu()
  if (!(await coQuyen('kho.so.sua', 'ADMIN'))) return { loi: KHONG_DU_QUYEN }
  if (!daCauHinhKho()) return { loi: 'Chưa cấu hình KHO_DB_URL — chưa ghi được sổ kho.' }
  const email = (user.email ?? '').trim().toLowerCase()
  return email ? { email } : { loi: 'Không xác định được email người sửa.' }
}

function lamMoi() {
  for (const p of ['/kho', '/kho/nhat-ky', '/kho/cho-duyet', '/kho/bao-cao', '/kho/kiem-ke', '/kho/lich-su-sua']) revalidatePath(p)
  revalidatePath('/kho/ma/[ma]', 'page')
}

const loiCua = (e: unknown) => String((e as Error)?.message ?? e)

/** Sửa một dòng sổ. `sua` chỉ chứa trường đổi (ngay, loai, internal_code, qty, purpose, note). */
export async function suaDongKho(id: number, sua: Record<string, unknown>, lyDo?: string): Promise<KetQua<{ doi: number }>> {
  const g = await chanSua()
  if ('loi' in g) return { ok: false, error: g.loi }
  try {
    const r = await khoGhi(g.email).suaDong(id, sua, lyDo)
    lamMoi()
    return { ok: true, doi: r.doi }
  } catch (e) { return { ok: false, error: loiCua(e) } }
}

/** Huỷ một dòng sổ (bắt buộc lý do). */
export async function huyDongKho(id: number, lyDo: string): Promise<KetQua> {
  const g = await chanSua()
  if ('loi' in g) return { ok: false, error: g.loi }
  try {
    await khoGhi(g.email).huyDong(id, lyDo)
    lamMoi()
    return { ok: true }
  } catch (e) { return { ok: false, error: loiCua(e) } }
}

/** Duyệt dòng chờ: gán mã; `rawNorm` có → bot nhớ tên cho lần sau. */
export async function duyetDongKho(id: number, ma: string, rawNorm?: string): Promise<KetQua<{ ma: string }>> {
  const g = await chanSua()
  if ('loi' in g) return { ok: false, error: g.loi }
  try {
    const r = await khoGhi(g.email).duyetDong(id, ma, rawNorm)
    lamMoi()
    return { ok: true, ma: r.ma }
  } catch (e) { return { ok: false, error: loiCua(e) } }
}

/** Bỏ qua dòng chờ (không phải hàng kho). */
export async function boQuaDongKho(id: number, lyDo?: string): Promise<KetQua> {
  const g = await chanSua()
  if ('loi' in g) return { ok: false, error: g.loi }
  try {
    await khoGhi(g.email).boQuaDong(id, lyDo)
    lamMoi()
    return { ok: true }
  } catch (e) { return { ok: false, error: loiCua(e) } }
}

/** Kiểm kê: gửi các mã đã điền SL đếm → DB ghi dòng Điều chỉnh cho phần chênh (có hiệu lực ngay). */
export async function kiemKeKho(items: { internal_code: string; so_dem: string | number }[], kho?: string): Promise<KetQua<{ ketQua: KetQuaKiemKe[] }>> {
  const g = await chanSua()
  if ('loi' in g) return { ok: false, error: g.loi }
  try {
    const ketQua = await khoGhi(g.email).kiemKe(items, kho === 'HCM' ? 'HCM' : 'NX')
    lamMoi()
    return { ok: true, ketQua }
  } catch (e) { return { ok: false, error: loiCua(e) } }
}
