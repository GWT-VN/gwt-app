'use server'

// Xuất file cho chuyên gia kiểm tra / sửa / duyệt phương án xử lý lỗi (chị Trang 18/11).
// Cùng quyền với "Nhập từ Sheet" (cs.nhom_loi.cau_hinh, QUANLY) vì file đi một vòng: xuất → chuyên gia sửa → nhập lại.

import { dataClient } from '@/lib/nen-tang/db'
import { requireStaff } from '@/lib/nen-tang/phien'
import { coQuyen } from '@/lib/nen-tang/kiem-quyen'
import { KHONG_DU_QUYEN } from '@/lib/nen-tang/nhan-su-luat'
import { ghiAudit } from '@/lib/nen-tang/nhat-ky'
import { thongBaoLoiDb } from '@/lib/loi/kiemDauVao'
import { ngayVNHomNay } from '@/lib/loi/ngayTicket'
import { taoFileChuyenGia, type DongTicketXuat } from '@/lib/loi/xuatChuyenGia'
import type { LoiDanhMuc } from '@/lib/loi/kieu'

const TOI_DA = 5000

export async function xuatFileChuyenGia(): Promise<{ ok: true; base64: string; tenFile: string } | { ok: false; error: string }> {
  await requireStaff()
  if (!(await coQuyen('cs.nhom_loi.cau_hinh', 'QUANLY'))) return { ok: false, error: KHONG_DU_QUYEN }
  const db = dataClient()
  const [dm, nhom, may, tk, lan] = await Promise.all([
    db.from('loi_danh_muc').select('*').neq('code', 'CHUA_PHAN_LOAI').order('thu_tu').order('code'),
    db.from('issue_group').select('code, ten'),
    db.from('ticket_may').select('ticket_code, thu_tu, loi_code, internal_code, trang_thai, mo_ta, huong_xu_ly, huong_xu_ly_nguon')
      .order('ticket_code').order('thu_tu').limit(TOI_DA),
    db.from('tickets').select('ticket_code, description').limit(TOI_DA),
    db.from('ticket_lan_loi').select('ticket_code, lan, mo_ta, xu_ly').order('lan').limit(TOI_DA),
  ])
  const loi = [dm, nhom, may, tk, lan].find((r) => r.error)?.error
  if (loi) return { ok: false, error: thongBaoLoiDb(loi, 'xuatFileChuyenGia') }

  const moTaTicket = new Map(((tk.data ?? []) as { ticket_code: string; description: string | null }[]).map((t) => [t.ticket_code, t.description]))
  const lanTheoTicket = new Map<string, DongTicketXuat['lan']>()
  for (const l of (lan.data ?? []) as { ticket_code: string; lan: number; mo_ta: string | null; xu_ly: string | null }[]) {
    lanTheoTicket.set(l.ticket_code, [...(lanTheoTicket.get(l.ticket_code) ?? []), { lan: l.lan, mo_ta: l.mo_ta, xu_ly: l.xu_ly }])
  }
  type Dong = Omit<DongTicketXuat, 'lan'>
  const dongTicket: DongTicketXuat[] = ((may.data ?? []) as Dong[]).map((m) => ({
    ...m, mo_ta: m.mo_ta?.trim() ? m.mo_ta : moTaTicket.get(m.ticket_code) ?? null, lan: lanTheoTicket.get(m.ticket_code) ?? [],
  }))

  const ngay = ngayVNHomNay()
  const buf = taoFileChuyenGia({
    danhMuc: (dm.data ?? []) as LoiDanhMuc[], nhom: (nhom.data ?? []) as { code: string; ten: string }[], dongTicket, ngayXuat: ngay,
  })
  await ghiAudit('xuat_file_chuyen_gia', 'loi_danh_muc', { so_ma: dm.data?.length ?? 0, so_dong_ticket: dongTicket.length })
  return { ok: true, base64: buf.toString('base64'), tenFile: `Kiem-tra-phuong-an-xu-ly-loi_${ngay}.xlsx` }
}
