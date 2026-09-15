'use server'

/**
 * Server actions khu Kế toán — gọi RPC public.ke_toan_* bọc schema `accounting` (không expose),
 * đúng khuôn khu Việc (xem app/work/actions.ts). Mọi action: chanKeToan() (nền tảng + vai trò
 * kế toán) → dataClient(). Email lấy từ session đã xác minh — KHÔNG nhận email từ client.
 */
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { dataClient } from '@/lib/nen-tang/db'
import { coTheVaoKeToan } from '@/lib/nen-tang/gac-cong'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { chuanHoaEmail } from '@/lib/nen-tang/vao-cua'
import { ghiAudit } from '@/lib/nen-tang/nhat-ky'
import { docNexia, docHoaDon, type DongTho } from '@/lib/ke-toan/doc-file/nexia'
import { ganKhoaDong } from '@/lib/ke-toan/nhap/khoa-dong'
import { taoEngineDauVao, tkNoCuaTinhChat } from '@/lib/ke-toan/engine/dau-vao'
import { taoEngineDauRa } from '@/lib/ke-toan/engine/dau-ra'
import type { Luat, MucCatalog, MucKenh, MucKmcp, KetQuaDauVao, KetQuaDauRa, ThongKeHoc } from '@/lib/ke-toan/engine/kieu'
import { norm } from '@/lib/ke-toan/chuan-hoa'
import type { MucChon } from '@/bang'

export type KyRow = { id: number; ky: string; status: 'dang_xu_ly' | 'da_gui'; sent_at: string | null; cap_nhat: string; so_dong_vao: number; so_dong_ra: number; so_canh_bao: number; edits_after_sent: number }
export type DongRow = {
  id: number; row_order: number; line_key: string; ky_hieu: string | null; so_hd: string | null; ngay_lap: string | null
  ten_ban: string | null; ten_mua: string | null; ten_hang: string | null; thanh_tien: number | null; tien_thue: number | null
  raw: (string | number | null)[]; engine_code: string | null; engine_conf: string | null; engine_reason: string | null; engine_kind: string | null
  code: string | null; code_name: string | null; tk_no: string | null; tk_co: string | null; vat_1331: string | null
  customer_code: string | null; product_group: string | null; channel_l1: string | null; channel_l2: string | null; dealer_name: string | null
  note_for_accountant: string | null; first_source_id: number | null; missing_in_last_upload: boolean
  /** Loại nguồn của dòng đầu tiên tạo dòng này — nexia|hdct_vao|hdct_ra|hdtq_vao|hdtq_ra (migration 10). */
  first_source_kind?: string | null
}

const TOI_DA_BYTE = 8 * 1024 * 1024
const LO = 200

/** Gác khu Kế toán: nền tảng (mọi nhân sự) + vai trò trong VAI_TRO_VAO_KE_TOAN. Trả email đã chuẩn hoá. */
async function chanKeToan(): Promise<string> {
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
 * `await chanKeToan()` NGAY TRƯỚC try, giống hệt uploadNexia().
 */
async function goi<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await dataClient().rpc(fn, { p_email: await chanKeToan(), ...args })
  if (error) throw new Error(error.message)
  return data as T
}

export async function danhSachKy(): Promise<KyRow[]> {
  return (await goi<KyRow[]>('ke_toan_ky_list', {})) ?? []
}

async function duLieuEngine(): Promise<{ luat: Luat[]; catalog: MucCatalog[]; kmcp: MucKmcp[]; kenh: MucKenh[]; thongKe: ThongKeHoc }> {
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

function dongSql(direction: 'vao' | 'ra', d: DongTho, lineKey: string, engine?: KetQuaDauVao, engineRa?: KetQuaDauRa) {
  const t = d.truong
  return {
    direction, line_key: lineKey, row_order: d.rowOrder,
    ky_hieu: t.kyHieu || null, so_hd: t.soHd || null, ngay_lap: t.ngayLap, mccqt: t.mccqt || null,
    ten_ban: t.tenBan || null, mst_ban: t.mstBan || null, ten_mua: t.tenMua || null, mst_mua: t.mstMua || null,
    ten_hang: t.tenHang || null, dvt: t.dvt || null, so_luong: t.soLuong, don_gia: t.donGia, thue_suat: t.thueSuat || null,
    thanh_tien: t.thanhTien, tien_thue: t.tienThue, tong_thanh_toan: t.tongThanhToan, trang_thai: t.trangThai || null, tinh_chat: t.tinhChat || null,
    raw: d.raw,
    engine_code: engine?.code ?? engineRa?.code ?? null, engine_conf: engine?.conf ?? engineRa?.conf ?? null,
    engine_reason: engine?.reason ?? engineRa?.reason ?? null, engine_kind: engine?.kind ?? (engineRa ? 'goods' : null),
    code: engine?.code || engineRa?.code || null, code_name: engine?.codeName || engineRa?.codeName || null,
    tk_no: engine?.tkNo || null, tk_co: engine?.tkCo || null, vat_1331: engine?.vat1331 || null,
    customer_code: engineRa?.customerCode ?? null, product_group: engineRa?.productGroup || null,
    channel_l1: engineRa?.channelL1 || null, channel_l2: engineRa?.channelL2 || null, dealer_name: engineRa?.dealerName || null,
  }
}

type KetQuaUpload = { ok: true; inserted: number; updated: number; kept: number; canhBao: number; thieu: number } | { ok: false; error: string }

/**
 * Upload file vào kỳ `ky` (tự tạo kỳ nếu chưa có) — NEXIA hoặc nguồn bổ sung HDCT/HDTQ (Task 10, form
 * `loai`, mặc định 'nexia' khi form chưa gửi trường này — FormUpload hiện tại chưa đổi). Form có
 * `vao_ky=1` (màn danh sách) thì xong chuyển vào màn kỳ; không có (đang ở màn kỳ) thì trả kết quả.
 */
export async function uploadNguon(_prev: unknown, form: FormData): Promise<KetQuaUpload> {
  const email = await chanKeToan()
  const kq = await nhapNguon(email, form)
  if (kq.ok && form.get('vao_ky')) redirect(`/ke-toan/hoa-don/${String(form.get('ky')).trim()}`) // ngoài try: redirect() ném NEXT_REDIRECT
  return kq
}
/** Alias tên cũ — FormUpload chưa đổi lời gọi, đổi tên hàm không được phá vỡ chỗ dùng hiện có. */
export const uploadNexia = uploadNguon

async function nhapNguon(email: string, form: FormData): Promise<KetQuaUpload> {
  await chanKeToan()
  const ky = String(form.get('ky') ?? '').trim()
  const file = form.get('file')
  const loai = String(form.get('loai') ?? 'nexia').trim() || 'nexia'
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(ky)) return { ok: false, error: 'Kỳ không hợp lệ.' }
  if (!(file instanceof File) || !file.name.toLowerCase().endsWith('.xlsx')) return { ok: false, error: 'Chọn file .xlsx (file NEXIA kế toán gửi).' }
  if (file.size > TOI_DA_BYTE) return { ok: false, error: 'File quá 8 MB.' }
  try {
    const buf = new Uint8Array(await file.arrayBuffer())
    // nexia: hai sheet, tự nhận diện hướng. hdct_*/hdtq_*: một sheet, hướng lấy từ hậu tố loai.
    const huong: 'vao' | 'ra' | null = loai === 'nexia' ? null : loai.endsWith('_vao') ? 'vao' : 'ra'
    const f = loai === 'nexia' ? await docNexia(buf) : null
    if (f && !f.vao) return { ok: false, error: 'File không có tab "HĐ đầu vào".' }
    const t = huong ? await docHoaDon(buf, { huong }) : null

    const { id: periodId } = await goi<{ id: number }>('ke_toan_ky_tao', { p_ky: ky })

    // Tính hết dữ liệu dòng (engine + line_key) TRƯỚC khi đụng Storage/DB — hỏng ở bước này thì
    // chưa tạo gì phải dọn.
    const dl = await duLieuEngine()
    const eng = taoEngineDauVao(dl)
    const engRa = taoEngineDauRa({ luat: dl.luat, catalog: dl.catalog, kenh: dl.kenh })

    let rows: ReturnType<typeof dongSql>[], headers: Record<string, string[]>
    if (f) {
      const khoaVao = ganKhoaDong(f.vao!.dong, 'vao')
      const khoaRa = f.ra ? ganKhoaDong(f.ra.dong, 'ra') : []
      rows = [
        ...f.vao!.dong.map((d, i) => dongSql('vao', d, khoaVao[i], eng.phanLoai(d.truong.tenBan, d.truong.tenHang, d.truong.tienThue))),
        ...(f.ra?.dong ?? []).map((d, i) => dongSql('ra', d, khoaRa[i], undefined, engRa.phanLoaiRa(d.truong.tenHang, d.truong.mstMua, d.truong.tenMua))),
      ]
      headers = { vao: f.vao!.headers, ra: f.ra?.headers ?? [] }
    } else {
      const khoa = ganKhoaDong(t!.dong, huong!)
      rows = t!.dong.map((d, i) => dongSql(huong!, d, khoa[i],
        huong === 'vao' ? eng.phanLoai(d.truong.tenBan, d.truong.tenHang, d.truong.tienThue) : undefined,
        huong === 'ra' ? engRa.phanLoaiRa(d.truong.tenHang, d.truong.mstMua, d.truong.tenMua) : undefined))
      headers = { [huong!]: t!.headers }
    }

    const db = dataClient()
    const path = `${ky}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, '_')}`
    const up = await db.storage.from('accounting').upload(path, buf, { contentType: file.type || 'application/octet-stream', upsert: false })
    if (up.error) return { ok: false, error: 'Không lưu được file gốc: ' + up.error.message }

    const { id: sourceId } = await goi<{ id: number }>('ke_toan_nguon_them', {
      p_period_id: periodId, p_kind: loai, p_file_name: file.name, p_storage_path: path,
      p_headers: headers, p_row_count: rows.length,
    })

    let inserted = 0, updated = 0, kept = 0, thieu = 0
    try {
      for (let i = 0; i < rows.length; i += LO) {
        const r = await goi<{ inserted: number; updated: number; kept: number }>('ke_toan_dong_nhap', { p_period_id: periodId, p_source_id: sourceId, p_rows: rows.slice(i, i + LO) })
        inserted += r.inserted; updated += r.updated; kept += r.kept
      }
      // Chốt lần upload: dòng của lần trước không còn trong file này → missing_in_last_upload (migration 07).
      thieu = (await goi<{ missing: number }>('ke_toan_nguon_chot', { p_source_id: sourceId })).missing
    } catch (e) {
      const loi = (e as Error).message
      // Dọn rác best-effort: file đã lên Storage + source đã tạo nhưng vòng nhập lỗi giữa chừng.
      // Mỗi bước bọc riêng, nuốt lỗi dọn dẹp — KHÔNG để lỗi dọn dẹp che mất lỗi gốc.
      try { await db.storage.from('accounting').remove([path]) } catch { /* best-effort */ }
      try { await goi('ke_toan_nguon_xoa', { p_source_id: sourceId }) } catch { /* best-effort */ }
      await ghiAudit('ke_toan.upload_nexia_loi', ky, { error: loi }, 'loi')
      return { ok: false, error: loi }
    }

    const canhBao = rows.filter((r) => (r.direction === 'vao' && (!r.code || r.engine_conf === 'can review' || r.engine_conf === 'khong ro')) || (r.direction === 'ra' && !r.code)).length
    await ghiAudit('ke_toan.upload_nexia', ky, { file: file.name, inserted, updated, kept, canhBao, thieu, by: email })
    revalidatePath('/ke-toan'); revalidatePath(`/ke-toan/hoa-don/${ky}`)
    return { ok: true, inserted, updated, kept, canhBao, thieu }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

type NguonRow = { id: number; kind: string; file_name: string; headers: Record<string, string[]>; row_count: number; uploaded_at: string; storage_path: string | null }

/**
 * File NEXIA mới nhất của kỳ + nội dung tải từ bucket `accounting` (riêng tư). MỘT action duy nhất:
 * đường dẫn Storage tra ở server từ DB, không nhận path từ client (review 08/09/2026 issue 5 — action
 * nhận path tuỳ ý = ai qua được chanKeToan() đọc được mọi file trong bucket). null khi kỳ chưa có file
 * hoặc file không còn → route xuất rơi về dựng từ đầu.
 */
export async function taiNguonNexiaMoiNhat(periodId: number): Promise<{ id: number; goc: Uint8Array } | null> {
  await chanKeToan()
  const r = await goi<NguonRow[]>('ke_toan_nguon_list', { p_period_id: periodId })
  const ds = (r ?? []).filter((s) => s.kind === 'nexia' && s.storage_path)
  const nguon = ds[ds.length - 1]
  if (!nguon?.storage_path) return null
  const { data, error } = await dataClient().storage.from('accounting').download(nguon.storage_path)
  if (error || !data) return null
  return { id: nguon.id, goc: new Uint8Array(await data.arrayBuffer()) }
}

export async function dongCuaKy(ky: string, direction: 'vao' | 'ra'): Promise<{ period: KyRow | null; dong: DongRow[] }> {
  const ds = await danhSachKy()
  const period = ds.find((k) => k.ky === ky) ?? null
  if (!period) return { period: null, dong: [] }
  const dong = await goi<DongRow[]>('ke_toan_dong_list', { p_period_id: period.id, p_direction: direction })
  return { period, dong: dong ?? [] }
}

/** Tra tên + TK Nợ của một mã: KMCP (expense_category) hoặc mã nội bộ (catalog_item). null = không có trong danh mục. */
async function tenVaTk(code: string): Promise<{ codeName: string; tkNo: string } | null> {
  const dl = await duLieuEngine()
  const k = dl.kmcp.find((x) => x.ma === code); if (k) return { codeName: k.ten, tkNo: k.tkNoDefault }
  const c = dl.catalog.find((x) => x.ma === code); if (c) return { codeName: c.ten, tkNo: tkNoCuaTinhChat(c.tinhChat) }
  return null
}

export type KetQuaSua = { ok: true; soSua: number; suaSauGui: number } | { ok: false; error: string }
/** Sửa mã / ghi chú một dòng. tenBan/tenHang chỉ để tính khoá học (norm), không ghi vào dòng. */
export async function suaDong(input: { lineId: number; code: string | null; note: string | null; tenBan: string | null; tenHang: string | null }): Promise<KetQuaSua> {
  await chanKeToan()
  try {
    const code = input.code?.trim() || null
    const tt = code ? await tenVaTk(code) : null
    if (code && !tt) return { ok: false, error: `Mã "${code}" không có trong danh mục KMCP/catalog.` }
    const r = await goi<{ so_sua: number; edits_after_sent: number }>('ke_toan_dong_sua', {
      p_line_id: input.lineId, p_code: code, p_code_name: tt?.codeName ?? null, p_tk_no: tt?.tkNo ?? null, p_tk_co: code ? '331' : null,
      p_note: input.note?.trim() || null, p_seller_norm: norm(input.tenBan), p_desc_norm: norm(input.tenHang),
    })
    return { ok: true, soSua: r.so_sua, suaSauGui: r.edits_after_sent }
  } catch (e) { return { ok: false, error: (e as Error).message } }
}

/**
 * Đặt thành luật (origin 'app') từ 1 dòng đã gán mã. Tự tính pattern ở server (không nhận pattern
 * thô từ client — component chọn mã không được import chuan-hoa.ts vì file đó dùng node:crypto):
 *   supplier → norm(tenBan) nguyên chuỗi; keyword → 3 từ đầu của norm(tenHang).
 */
export async function datThanhLuat(input: { kind: 'supplier' | 'keyword'; tenBan: string | null; tenHang: string | null; targetCode: string }): Promise<{ ok: true; id: number; moi: boolean; pattern: string } | { ok: false; error: string }> {
  await chanKeToan()
  try {
    const pattern = input.kind === 'supplier' ? norm(input.tenBan) : norm(input.tenHang).split(' ').slice(0, 3).join(' ')
    if (pattern.length < 3) return { ok: false, error: 'Không đủ dữ liệu để đặt luật' }
    const r = await goi<{ id: number; moi: boolean }>('ke_toan_luat_them', { p_kind: input.kind, p_pattern: pattern, p_target_code: input.targetCode, p_condition: '' })
    await ghiAudit('ke_toan.dat_luat', input.targetCode, { kind: input.kind, pattern, moi: r.moi })
    return { ok: true, ...r, pattern }
  } catch (e) { return { ok: false, error: (e as Error).message } }
}

export async function guiKeToan(periodId: number, ky: string): Promise<{ ok: false; error: string }> {
  await chanKeToan()
  try {
    const r = await goi<{ so_canh_bao: number }>('ke_toan_ky_gui', { p_period_id: periodId })
    await ghiAudit('ke_toan.da_gui', ky, { so_canh_bao: r.so_canh_bao })
    revalidatePath('/ke-toan'); revalidatePath(`/ke-toan/hoa-don/${ky}`)
  } catch (e) { return { ok: false, error: (e as Error).message } }
  redirect(`/ke-toan/hoa-don/${ky}`) // ngoài try: redirect() ném NEXT_REDIRECT
}

/** Danh sách mã cho ô chọn: KMCP trước, rồi catalog. gt = mã. */
export async function danhSachMa(): Promise<MucChon[]> {
  const dl = await duLieuEngine()
  return [
    ...dl.kmcp.map((k) => ({ gt: k.ma, nhan: `${k.ma} · ${k.ten}`, phu: `KMCP · TK ${k.tkNoDefault || '—'}` })),
    ...dl.catalog.map((c) => ({ gt: c.ma, nhan: `${c.ma} · ${c.ten}`, phu: c.tinhChat })),
  ]
}
