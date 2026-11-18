'use server'

// Duyệt PHƯƠNG ÁN XỬ LÝ qua chuyên gia (chị Trang 18/11): xuất file → chuyên gia duyệt / sửa → nhập lại.
// "Hướng xử lý đề xuất" trên ticket chỉ hiện phương án đã duyệt (loi_danh_muc.huong_duyet).
// Quyền cs.nhom_loi.cau_hinh (QUANLY) như "Nhập từ Sheet".

import { revalidatePath } from 'next/cache'
import * as XLSX from 'xlsx'
import { dataClient } from '@/lib/nen-tang/db'
import { layNhanVien, requireStaff } from '@/lib/nen-tang/phien'
import { coQuyen } from '@/lib/nen-tang/kiem-quyen'
import { KHONG_DU_QUYEN } from '@/lib/nen-tang/nhan-su-luat'
import { ghiAudit } from '@/lib/nen-tang/nhat-ky'
import { GIOI_HAN, thongBaoLoiDb } from '@/lib/loi/kiemDauVao'
import { ngayVNHomNay } from '@/lib/loi/ngayTicket'
import { docFileDuyet, taoFileChuyenGia, TRANG_PA, type DongTicketXuat } from '@/lib/loi/xuatChuyenGia'
import type { LoiDanhMuc } from '@/lib/loi/kieu'

const TOI_DA = 5000

async function quanLy() {
  await requireStaff()
  return coQuyen('cs.nhom_loi.cau_hinh', 'QUANLY')
}

export async function xuatFileChuyenGia(): Promise<{ ok: true; base64: string; tenFile: string } | { ok: false; error: string }> {
  if (!(await quanLy())) return { ok: false, error: KHONG_DU_QUYEN }
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
  return { ok: true, base64: buf.toString('base64'), tenFile: `Duyet-phuong-an-xu-ly-loi_${ngay}.xlsx` }
}

export type XemTruocDuyet = {
  duyet: { code: string; truoc: string | null; sau: string; doi: boolean }[]
  boDuyet: string[]
  chuaDanhDau: number
  loi: string[]
}

/**
 * Nhập file chuyên gia. `ghi = false` → chỉ xem trước (không ghi gì). `ghi = true` → ghi, mỗi mã một lần duyệt
 * (huong_duyet + người + lúc cùng lúc, để trigger DB không coi là "sửa phương án chưa duyệt").
 */
export async function nhapPhuongAnDuyet(fd: FormData, ghi: boolean):
  Promise<{ ok: true; xemTruoc: XemTruocDuyet; daGhi: boolean } | { ok: false; error: string }> {
  if (!(await quanLy())) return { ok: false, error: KHONG_DU_QUYEN }
  const f = fd.get('file')
  if (!(f instanceof File) || f.size === 0) return { ok: false, error: 'Chưa chọn file .xlsx.' }
  if (!/\.xlsx$/i.test(f.name)) return { ok: false, error: 'Chỉ nhận file .xlsx đã xuất từ "Xuất cho chuyên gia".' }
  if (f.size > GIOI_HAN.byteFile) return { ok: false, error: 'File quá lớn (tối đa 5 MB).' }
  let rows: Record<string, unknown>[]
  try {
    const wb = XLSX.read(Buffer.from(await f.arrayBuffer()), { type: 'buffer' })
    const ws = wb.Sheets[TRANG_PA]
    if (!ws) return { ok: false, error: `File không có trang "${TRANG_PA}" — dùng đúng file xuất từ nút "Xuất cho chuyên gia".` }
    rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })
  } catch {
    return { ok: false, error: 'Không đọc được file.' }
  }
  if (rows.length > GIOI_HAN.soHangSheet) return { ok: false, error: `Tối đa ${GIOI_HAN.soHangSheet} dòng.` }

  const db = dataClient()
  const { data: dm, error } = await db.from('loi_danh_muc').select('code, huong_xu_ly, huong_duyet')
  if (error) return { ok: false, error: thongBaoLoiDb(error, 'nhapPhuongAnDuyet') }
  const coSan = new Map(((dm ?? []) as { code: string; huong_xu_ly: string | null; huong_duyet?: boolean }[]).map((x) => [x.code, x]))
  const r = docFileDuyet(rows, coSan)
  const xemTruoc: XemTruocDuyet = {
    duyet: r.duyet.map((d) => {
      const truoc = coSan.get(d.code)?.huong_xu_ly ?? null
      return { code: d.code, truoc, sau: d.huong_xu_ly, doi: (truoc ?? '').trim() !== d.huong_xu_ly }
    }),
    boDuyet: r.boDuyet.map((b) => b.code),
    chuaDanhDau: r.chuaDanhDau,
    loi: r.loi.slice(0, 15).map((l) => `Dòng ${l.dong}: ${l.loi}`),
  }
  if (!ghi || r.loi.length || (!r.duyet.length && !r.boDuyet.length)) return { ok: true, xemTruoc, daGhi: false }

  const nv = await layNhanVien()
  const luc = new Date().toISOString()
  const nguoi = nv?.email ?? null
  for (const d of r.duyet) {
    const { error: e } = await db.from('loi_danh_muc').update({
      huong_xu_ly: d.huong_xu_ly, huong_duyet: true, huong_duyet_boi: nguoi, huong_duyet_luc: luc, huong_y_kien: d.y_kien,
    }).eq('code', d.code)
    if (e) return { ok: false, error: `${d.code}: ${thongBaoLoiDb(e, 'nhapPhuongAnDuyet duyet')}` }
  }
  for (const b of r.boDuyet) {
    const { error: e } = await db.from('loi_danh_muc').update({
      huong_duyet: false, huong_duyet_boi: nguoi, huong_duyet_luc: luc, huong_y_kien: b.y_kien,
    }).eq('code', b.code)
    if (e) return { ok: false, error: `${b.code}: ${thongBaoLoiDb(e, 'nhapPhuongAnDuyet bo')}` }
  }
  await ghiAudit('nhap_phuong_an_duyet', 'loi_danh_muc', {
    duyet: r.duyet.map((d) => d.code), bo_duyet: r.boDuyet.map((b) => b.code),
  })
  revalidatePath('/danh-muc-loi'); revalidatePath('/ticket'); revalidatePath('/ticket/[code]', 'page')
  return { ok: true, xemTruoc, daGhi: true }
}
