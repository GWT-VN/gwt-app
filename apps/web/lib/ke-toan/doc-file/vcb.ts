import * as XLSX from 'xlsx'
import type { DongSaoKe, SaoKe } from '../sao-ke/kieu'
const so = (v: unknown): number => { const s = String(v ?? '').replace(/VND/i, '').replace(/,/g, '').trim(); return s ? Math.round(Number(s)) || 0 : 0 }
const ngayIso = (ddmmyyyy: string): string => { const m = /(\d{2})\/(\d{2})\/(\d{4})/.exec(ddmmyyyy); return m ? `${m[3]}-${m[2]}-${m[1]}` : '' }
const chuoi = (v: unknown) => String(v ?? '').trim()
/** VCB DigiBiz .xls: 7 cột, header ở hàng có cột A bắt đầu 'STT'; giao dịch = cột A là số; phần đầu có 'Số dư đầu kỳ' (cột C) và 'Từ/ From' (C) · 'Đến/ To' (F). */
export function saoKeTuBangVcb(rows: unknown[][], taiKhoan: 'VCB21' | 'VCB63'): SaoKe {
  const iHdr = rows.findIndex((r) => /^STT/i.test(chuoi(r[0])))
  if (iHdr < 0) throw new Error('File không đúng khuôn sao kê VCB: không thấy hàng header "STT".')
  let tu: string | null = null, den: string | null = null, soDuDau: number | null = null
  for (const r of rows.slice(0, iHdr)) {
    const a = chuoi(r[0])
    if (/^Từ\//i.test(a)) { tu = ngayIso(chuoi(r[2])) || null; den = ngayIso(chuoi(r[5])) || null }
    if (/^Số dư đầu kỳ/i.test(a)) soDuDau = so(r[2])
  }
  const dong: DongSaoKe[] = []
  for (const r of rows.slice(iHdr + 1)) {
    if (!/^\d+(\.0+)?$/.test(chuoi(r[0]))) break
    const [ngay, soCt = ''] = chuoi(r[1]).split(' / ')
    dong.push({ rowOrder: dong.length + 1, ngay: ngayIso(ngay), soCt: soCt.replace(/\s+/g, ''), no: so(r[3]), co: so(r[4]), soDu: chuoi(r[5]) ? so(r[5]) : null,
      noiDung: chuoi(r[6]), tenDoiUng: null, raw: r.slice(0, 7).map((v) => (v == null || v === '' ? null : typeof v === 'number' ? v : String(v))) })
  }
  return { taiKhoan, tu, den, soDuDau, soDuCuoi: dong.at(-1)?.soDu ?? null, tongNo: dong.reduce((s, d) => s + d.no, 0), tongCo: dong.reduce((s, d) => s + d.co, 0),
    headers: (rows[iHdr] as unknown[]).map((h) => chuoi(h).replace(/\s+/g, ' ')), dong }
}
export function docVcb(buf: ArrayBuffer | Uint8Array, taiKhoan: 'VCB21' | 'VCB63'): SaoKe {
  const wb = XLSX.read(buf instanceof Uint8Array ? buf : new Uint8Array(buf), { type: 'array', raw: false })
  const ws = wb.Sheets[wb.SheetNames[0]]
  if (!ws) throw new Error('File không có sheet nào.')
  return saoKeTuBangVcb(XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: false, defval: '' }), taiKhoan)
}
