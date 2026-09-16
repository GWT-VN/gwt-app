'use server'

/**
 * Server actions sao kê ngân hàng (lát 5) — cùng khuôn app/ke-toan/actions.ts (chanKeToan() →
 * dataClient(), p_email lấy từ session, KHÔNG nhận từ client). Đọc file (VCB .xls/.xlsx | TCB
 * .pdf) → khớp hoá đơn/khách/đơn Sales → phân loại (engine bank_keyword) → RPC accounting.bank_lines.
 */
import { revalidatePath } from 'next/cache'
import { dataClient } from '@/lib/nen-tang/db'
import { ghiAudit } from '@/lib/nen-tang/nhat-ky'
import { docVcb } from '@/lib/ke-toan/doc-file/vcb'
import { docTcbPdf } from '@/lib/ke-toan/doc-file/tcb-pdf'
import { rutGonNoiDung } from '@/lib/ke-toan/sao-ke/noi-dung'
import { ganKhoaSaoKe } from '@/lib/ke-toan/nhap/khoa-sao-ke'
import { gomHoaDon, khopSaoKe } from '@/lib/ke-toan/sao-ke/khop-sao-ke'
import { taoEngineSaoKe } from '@/lib/ke-toan/engine/sao-ke'
import type { TaiKhoan, SaoKe, HoaDonTom, KhachTom, DonHangTom, Khop } from '@/lib/ke-toan/sao-ke/kieu'
import { chanKeToan, goi, duLieuEngine, TOI_DA_BYTE, type KyRow } from '../_chung'
import { danhSachKy } from '../actions'

const TAI_KHOAN: readonly TaiKhoan[] = ['VCB21', 'VCB63', 'TCB']

export type KetQuaUploadSaoKe = { ok: true; taiKhoan: TaiKhoan; inserted: number; updated: number; chac: number; goiY: number; khongKhop: number } | { ok: false; error: string }
export type SaoKeRow = {
  id: number; account: TaiKhoan; row_order: number; txn_date: string; doc_no: string | null; debit: number; credit: number; balance: number | null
  description: string | null; counter_name: string | null; direction: 'thu' | 'chi'
  match_kind: 'pending' | 'invoice' | 'none'; match_id: number | null; match_conf: 'chac' | 'goi_y' | 'tay' | null; suggestions: Khop[] | null
  code: string | null; code_name: string | null; party_code: string | null; customer_code: string | null; has_invoice: boolean | null
  note: string | null; engine_reason: string | null; edited_at: string | null
}
export type TongTaiKhoan = { taiKhoan: TaiKhoan; soDuDau: number | null; soDuCuoi: number | null; tongNo: number; tongCo: number; tongNoHeader: number | null; tongCoHeader: number | null; soDong: number; fileName: string | null }

type NguonRow = { id: number; kind: string; file_name: string; headers: Record<string, unknown>; row_count: number; uploaded_at: string; storage_path: string | null }
// RPC ke_toan_dong_list trả nguyên dòng accounting.invoice_lines (+ first_source_kind) — chỉ cần
// đúng field gomHoaDon() dùng, lấy kiểu từ tham số của nó để khỏi chép lại.
type DongHoaDonRpc = Parameters<typeof gomHoaDon>[0][number]

function thangSau(ky: string): string {
  const [y, m] = ky.split('-').map(Number)
  return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`
}

function gomDonHang(rows: { order_code: string | null; customer_name: string | null; amount_vat: number | null; order_date: string | null }[]): DonHangTom[] {
  const nhom = new Map<string, DonHangTom>()
  for (const r of rows) {
    if (!r.order_code) continue
    const cur = nhom.get(r.order_code)
    if (cur) cur.tongTt += r.amount_vat ?? 0
    else nhom.set(r.order_code, { orderCode: r.order_code, tenKhach: r.customer_name ?? '', tongTt: r.amount_vat ?? 0, ngay: r.order_date ?? null })
  }
  return [...nhom.values()]
}

function tongRong(tk: TaiKhoan): TongTaiKhoan {
  return { taiKhoan: tk, soDuDau: null, soDuCuoi: null, tongNo: 0, tongCo: 0, tongNoHeader: null, tongCoHeader: null, soDong: 0, fileName: null }
}

/**
 * Upload sao kê ngân hàng (1 tài khoản/lần) vào kỳ `ky` — đọc file, assert tổng đối chiếu header
 * sao kê (khác file thì báo lỗi ngay, không nhập nửa vời), khớp hoá đơn/khách/đơn Sales, phân loại
 * bằng engine bank_keyword, rồi nạp accounting.bank_lines theo lô. Nạp lại đè kết quả engine
 * nhưng GIỮ chốt tay (ke_toan_sao_ke_nhap: match_kind/code/... chỉ đè khi edited_at null).
 */
export async function uploadSaoKe(_prev: unknown, form: FormData): Promise<KetQuaUploadSaoKe> {
  const email = await chanKeToan()
  const ky = String(form.get('ky') ?? '').trim()
  const taiKhoanRaw = String(form.get('tai_khoan') ?? '').trim()
  const file = form.get('file')
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(ky)) return { ok: false, error: 'Kỳ không hợp lệ.' }
  if (!(TAI_KHOAN as readonly string[]).includes(taiKhoanRaw)) return { ok: false, error: 'Tài khoản không hợp lệ.' }
  const tk = taiKhoanRaw as TaiKhoan
  if (!(file instanceof File)) return { ok: false, error: 'Chọn file sao kê.' }
  const ten = file.name.toLowerCase()
  const dungDuoi = tk === 'TCB' ? ten.endsWith('.pdf') : ten.endsWith('.xls') || ten.endsWith('.xlsx')
  if (!dungDuoi) return { ok: false, error: tk === 'TCB' ? 'Chọn file .pdf (sao kê TCB).' : 'Chọn file .xls/.xlsx (sao kê VCB).' }
  if (file.size > TOI_DA_BYTE) return { ok: false, error: 'File quá 8 MB.' }
  try {
    const buf = new Uint8Array(await file.arrayBuffer())
    const sk: SaoKe = tk === 'TCB' ? await docTcbPdf(buf) : docVcb(buf, tk as 'VCB21' | 'VCB63')
    if (!sk.dong.length) return { ok: false, error: 'File không có dòng giao dịch nào.' }

    // Chặn upload nhầm tài khoản (vd chọn VCB21 nhưng chọn file .xls của VCB63) — số TK đọc từ chính
    // file, null (khuôn lạ/PDF không bóc được) thì cho qua, để gate khuôn khác chặn.
    if (tk !== 'TCB' && sk.soTaiKhoan && !sk.soTaiKhoan.endsWith(tk.slice(-2)))
      return { ok: false, error: `File sao kê số TK …${sk.soTaiKhoan.slice(-4)} không phải ${tk}.` }

    const sumNo = sk.dong.reduce((s, d) => s + d.no, 0)
    const sumCo = sk.dong.reduce((s, d) => s + d.co, 0)
    if (tk === 'TCB') {
      if (sk.tongNo == null || sk.tongCo == null || sumNo !== sk.tongNo || sumCo !== sk.tongCo)
        return { ok: false, error: `Tổng nợ/có bóc được (${sumNo}/${sumCo}) ≠ header sao kê (${sk.tongNo ?? '?'}/${sk.tongCo ?? '?'}) — file PDF đổi khuôn, báo dev.` }
    } else {
      const soDuTinh = (sk.soDuDau ?? 0) + sumCo - sumNo
      if (sk.soDuCuoi == null || soDuTinh !== sk.soDuCuoi)
        return { ok: false, error: `Số dư tính được (${soDuTinh}) ≠ số dư cuối trên sao kê (${sk.soDuCuoi ?? '?'}) — kiểm tra lại file, báo dev.` }
    }

    // Kiểm kỳ file ↔ kỳ đang chọn — chặn upload nhầm tháng (vd còn mở kỳ trước, chọn nhầm file tháng
    // này) trước khi ghi bất cứ gì. sk.tu null (khuôn lạ) thì bỏ qua nhánh này, để gate khuôn khác chặn.
    if ((sk.tu && !sk.tu.startsWith(ky)) || sk.dong.some((d) => !d.ngay.startsWith(ky)))
      return { ok: false, error: `Sao kê kỳ ${sk.tu ?? '?'}…${sk.den ?? '?'} không phải kỳ ${ky} — chọn đúng file.` }

    const { id: periodId } = await goi<{ id: number }>('ke_toan_ky_tao', { p_ky: ky })

    const [dl, khachQ, donHangQ, vaoRaw, raRaw] = await Promise.all([
      duLieuEngine(),
      dataClient().from('customers').select('customer_code, name, phone_chuan').not('phone_chuan', 'is', null).limit(1000),
      dataClient().from('sales_order_lines').select('order_code, customer_name, amount_vat, order_date').gte('order_date', `${ky}-01`).lt('order_date', thangSau(ky)),
      goi<DongHoaDonRpc[]>('ke_toan_dong_list', { p_period_id: periodId, p_direction: 'vao' }),
      goi<DongHoaDonRpc[]>('ke_toan_dong_list', { p_period_id: periodId, p_direction: 'ra' }),
    ])
    if (khachQ.error) return { ok: false, error: 'Không tải được danh sách khách: ' + khachQ.error.message }
    if (donHangQ.error) return { ok: false, error: 'Không tải được đơn Sales: ' + donHangQ.error.message }

    const khach: KhachTom[] = (khachQ.data as { customer_code: string; name: string | null; phone_chuan: string | null }[]).map((k) => ({ customerCode: k.customer_code, ten: k.name ?? '', sdt: k.phone_chuan ?? null }))
    const donHang = gomDonHang(donHangQ.data as { order_code: string | null; customer_name: string | null; amount_vat: number | null; order_date: string | null }[])
    const hoaDon: HoaDonTom[] = gomHoaDon([...(vaoRaw ?? []), ...(raRaw ?? [])])
    const engine = taoEngineSaoKe({ luat: dl.luat, kmcp: dl.kmcp })
    const lineKeys = ganKhoaSaoKe(sk.dong, tk)

    const rows = sk.dong.map((d, i) => {
      const chieu: 'thu' | 'chi' = d.co > 0 ? 'thu' : 'chi'
      const soTien = chieu === 'thu' ? d.co : d.no
      const khop = khopSaoKe({ chieu, soTien, noiDung: d.noiDung, tenDoiUng: d.tenDoiUng }, hoaDon, khach, donHang)
      const kq = engine.phanLoai({ chieu, noiDung: d.noiDung, tenDoiUng: d.tenDoiUng, soTien }, khop)
      return {
        account: tk, line_key: lineKeys[i], row_order: d.rowOrder, txn_date: d.ngay, doc_no: d.soCt || null,
        debit: d.no, credit: d.co, balance: d.soDu, description: rutGonNoiDung(d.noiDung, tk), counter_name: d.tenDoiUng,
        direction: chieu, raw: [d.noiDung, ...d.raw],
        match_kind: (khop.chac ? 'invoice' : kq.code === 'NOI_BO' || kq.code === 'LAI_NH' ? 'none' : 'pending') as 'pending' | 'invoice' | 'none',
        match_id: khop.chac?.hoaDonId ?? null,
        match_conf: (khop.chac ? 'chac' : khop.goiY.length ? 'goi_y' : null) as 'chac' | 'goi_y' | null,
        suggestions: khop.goiY, code: kq.code, code_name: kq.codeName, party_code: kq.partyCode,
        customer_code: khop.khach?.customerCode ?? null, has_invoice: kq.hasInvoice, note: null, engine_reason: kq.reason,
      }
    })

    // ke_toan_sao_ke_nhap nhập MỘT LẦN (không chia lô như ke_toan_dong_nhap ở actions.ts): RPC chạy
    // trong 1 transaction nên toàn bộ dòng đậu hoặc không dòng nào — chia lô thì lô sau lỗi giữa
    // chừng bỏ lại bank_lines mồ côi (source_id đã bị xoá ở nhánh dọn rác dưới, nhưng dòng lô trước
    // đã insert/update vẫn còn) — R12 (review 16/09/2026). Chặn file quá lớn trước khi ghi gì.
    if (rows.length > 2000) return { ok: false, error: 'Sao kê quá 2000 dòng — tách file theo tháng.' }

    const db = dataClient()
    const path = `${ky}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, '_')}`
    const up = await db.storage.from('accounting').upload(path, buf, { contentType: file.type || 'application/octet-stream', upsert: false })
    if (up.error) return { ok: false, error: 'Không lưu được file gốc: ' + up.error.message }

    const { id: sourceId } = await goi<{ id: number }>('ke_toan_nguon_them', {
      p_period_id: periodId, p_kind: `bank_${tk.toLowerCase()}`, p_file_name: file.name, p_storage_path: path,
      p_headers: { tai_khoan: tk, tu: sk.tu, den: sk.den, so_du_dau: sk.soDuDau, so_du_cuoi: sk.soDuCuoi, tong_no: sk.tongNo ?? sumNo, tong_co: sk.tongCo ?? sumCo, headers: sk.headers },
      p_row_count: rows.length,
    })

    let inserted = 0, updated = 0
    try {
      const r = await goi<{ inserted: number; updated: number }>('ke_toan_sao_ke_nhap', { p_period_id: periodId, p_source_id: sourceId, p_rows: rows })
      inserted = r.inserted; updated = r.updated
    } catch (e) {
      const loi = (e as Error).message
      // Dọn rác best-effort — cùng khuôn nhapNguon() ở actions.ts: KHÔNG để lỗi dọn dẹp che lỗi gốc.
      try { await db.storage.from('accounting').remove([path]) } catch { /* best-effort */ }
      try { await goi('ke_toan_nguon_xoa', { p_source_id: sourceId }) } catch { /* best-effort */ }
      await ghiAudit('ke_toan.upload_sao_ke_loi', ky, { error: loi, taiKhoan: tk }, 'loi')
      return { ok: false, error: loi }
    }

    const chac = rows.filter((r) => r.match_conf === 'chac').length
    const goiY = rows.filter((r) => r.match_conf === 'goi_y').length
    const khongKhop = rows.length - chac - goiY
    await ghiAudit('ke_toan.upload_sao_ke', ky, { file: file.name, taiKhoan: tk, inserted, updated, chac, goiY, khongKhop, by: email })
    revalidatePath('/ke-toan'); revalidatePath(`/ke-toan/sao-ke/${ky}`)
    return { ok: true, taiKhoan: tk, inserted, updated, chac, goiY, khongKhop }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

/** Sao kê + hoá đơn của kỳ, cho màn khớp tay. Kỳ chưa có → tong mặc định 0/null cho cả 3 tài khoản. */
export async function saoKeCuaKy(ky: string): Promise<{ period: KyRow | null; dong: SaoKeRow[]; tong: TongTaiKhoan[]; hoaDon: HoaDonTom[] }> {
  await chanKeToan()
  const ds = await danhSachKy()
  const period = ds.find((k) => k.ky === ky) ?? null
  if (!period) return { period: null, dong: [], tong: TAI_KHOAN.map(tongRong), hoaDon: [] }

  const [dong, nguon, vao, ra] = await Promise.all([
    goi<SaoKeRow[]>('ke_toan_sao_ke_list', { p_period_id: period.id }),
    goi<NguonRow[]>('ke_toan_nguon_list', { p_period_id: period.id }),
    goi<DongHoaDonRpc[]>('ke_toan_dong_list', { p_period_id: period.id, p_direction: 'vao' }),
    goi<DongHoaDonRpc[]>('ke_toan_dong_list', { p_period_id: period.id, p_direction: 'ra' }),
  ])
  const dongList = dong ?? []
  const nguonList = nguon ?? []

  const tong: TongTaiKhoan[] = TAI_KHOAN.map((tk) => {
    const nguonTk = nguonList.filter((n) => n.kind === `bank_${tk.toLowerCase()}`)
    const moiNhat = nguonTk.at(-1) ?? null
    const dongTk = dongList.filter((d) => d.account === tk)
    const h = (moiNhat?.headers ?? {}) as { so_du_dau?: number | null; so_du_cuoi?: number | null; tong_no?: number | null; tong_co?: number | null }
    return {
      taiKhoan: tk,
      soDuDau: h.so_du_dau ?? null,
      soDuCuoi: h.so_du_cuoi ?? null,
      tongNo: dongTk.reduce((s, d) => s + d.debit, 0),
      tongCo: dongTk.reduce((s, d) => s + d.credit, 0),
      tongNoHeader: h.tong_no ?? null,
      tongCoHeader: h.tong_co ?? null,
      soDong: dongTk.length,
      fileName: moiNhat?.file_name ?? null,
    }
  })

  return { period, dong: dongList, tong, hoaDon: gomHoaDon([...(vao ?? []), ...(ra ?? [])]) }
}

/** Chốt tay 1 dòng sao kê (nối hoá đơn/mã/khách…) — match_conf luôn thành 'tay', engine không đè lại nữa. */
export async function suaSaoKe(input: {
  lineId: number; ky: string; matchKind: 'pending' | 'invoice' | 'none'; matchId: number | null; code: string | null; codeName: string | null
  partyCode: string | null; customerCode: string | null; hasInvoice: boolean | null; note: string | null
}): Promise<{ ok: true } | { ok: false; error: string }> {
  await chanKeToan()
  try {
    await goi('ke_toan_sao_ke_sua', {
      p_line_id: input.lineId, p_match_kind: input.matchKind, p_match_id: input.matchId, p_code: input.code, p_code_name: input.codeName,
      p_party_code: input.partyCode, p_customer_code: input.customerCode, p_has_invoice: input.hasInvoice, p_note: input.note,
    })
    revalidatePath(`/ke-toan/sao-ke/${input.ky}`)
    return { ok: true }
  } catch (e) { return { ok: false, error: (e as Error).message } }
}
