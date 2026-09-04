import * as XLSX from 'xlsx'
import { sd } from '../chuan-hoa'

export type TruongDong = {
  kyHieu: string; soHd: string; ngayLap: string | null; mccqt: string
  tenBan: string; mstBan: string; tenMua: string; mstMua: string
  tenHang: string; dvt: string; soLuong: number | null; donGia: number | null; thueSuat: string
  thanhTien: number; tienThue: number; tongThanhToan: number | null; trangThai: string; tinhChat: string
}
export type DongTho = { rowOrder: number; raw: (string | number | null)[]; truong: TruongDong }
export type TabNexia = { ten: 'vao' | 'ra'; headers: string[]; dong: DongTho[] }
export type FileNexia = { vao: TabNexia | null; ra: TabNexia | null }

/** Tìm cột theo các mảnh tên (đều phải có), so sau khi bỏ dấu + gộp khoảng trắng. -1 nếu không có. */
export function timCot(headers: string[], ...manh: string[]): number {
  const m = manh.map((x) => sd(x))
  return headers.findIndex((h) => { const t = sd(h); return m.every((x) => t.includes(x)) })
}

function chuoi(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(v)
  return String(v).trim()
}
function so(v: unknown): number | null {
  if (v == null || v === '') return null
  if (typeof v === 'number') return v
  const n = Number(String(v).replace(/[,\s]/g, ''))
  return Number.isFinite(n) ? n : null
}
function ngay(v: unknown): string | null {
  if (v instanceof Date) {
    const p = (n: number) => String(n).padStart(2, '0')
    return `${v.getFullYear()}-${p(v.getMonth() + 1)}-${p(v.getDate())}`
  }
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(chuoi(v))
  if (!m) return null
  return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
}
function oTho(v: unknown): string | number | null {
  if (v == null || v === '') return null
  if (typeof v === 'number') return v
  if (v instanceof Date) return ngay(v)
  return String(v)
}

function docTab(ws: XLSX.WorkSheet, ten: 'vao' | 'ra'): TabNexia {
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: true, blankrows: false, defval: null })
  const headers = (aoa[0] ?? []).map((h) => chuoi(h))
  const c = {
    kyHieu: timCot(headers, 'ký hiệu', 'hóa'), soHd: timCot(headers, 'số hóa đơn'), ngayLap: timCot(headers, 'ngày lập'),
    mccqt: timCot(headers, 'mccqt'), tenBan: timCot(headers, 'tên người bán'), mstBan: timCot(headers, 'mst người bán'),
    tenMua: timCot(headers, 'tên người mua'), mstMua: timCot(headers, 'mst người mua'), tenHang: timCot(headers, 'tên hàng'),
    dvt: timCot(headers, 'đơn vị tính'), soLuong: timCot(headers, 'số lượng'), donGia: timCot(headers, 'đơn giá'),
    thueSuat: timCot(headers, 'thuế suất'), thanhTien: timCot(headers, 'thành tiền chưa thuế'), tienThue: timCot(headers, 'tiền thuế'),
    tongThanhToan: timCot(headers, 'tổng tiền thanh toán'), trangThai: timCot(headers, 'trạng thái hóa đơn'), tinhChat: timCot(headers, 'tính chất'),
  }
  const g = (r: unknown[], i: number) => (i >= 0 ? r[i] : null)
  const dong: DongTho[] = []
  for (let r = 1; r < aoa.length; r++) {
    const row = aoa[r] ?? []
    if (!chuoi(g(row, c.soHd)) && !chuoi(g(row, c.tenHang))) continue
    const raw = headers.map((_, i) => oTho(row[i]))
    dong.push({
      rowOrder: dong.length + 1, raw,
      truong: {
        kyHieu: chuoi(g(row, c.kyHieu)), soHd: chuoi(g(row, c.soHd)), ngayLap: ngay(g(row, c.ngayLap)), mccqt: chuoi(g(row, c.mccqt)),
        tenBan: chuoi(g(row, c.tenBan)), mstBan: chuoi(g(row, c.mstBan)), tenMua: chuoi(g(row, c.tenMua)), mstMua: chuoi(g(row, c.mstMua)),
        tenHang: chuoi(g(row, c.tenHang)), dvt: chuoi(g(row, c.dvt)), soLuong: so(g(row, c.soLuong)), donGia: so(g(row, c.donGia)),
        thueSuat: chuoi(g(row, c.thueSuat)), thanhTien: so(g(row, c.thanhTien)) ?? 0, tienThue: so(g(row, c.tienThue)) ?? 0,
        tongThanhToan: so(g(row, c.tongThanhToan)), trangThai: chuoi(g(row, c.trangThai)), tinhChat: chuoi(g(row, c.tinhChat)),
      },
    })
  }
  return { ten, headers, dong }
}

export function docNexia(buf: ArrayBuffer | Uint8Array): FileNexia {
  const wb = XLSX.read(buf, { type: buf instanceof Uint8Array ? 'buffer' : 'array', cellDates: true })
  let vao: TabNexia | null = null, ra: TabNexia | null = null
  for (const name of wb.SheetNames) {
    const n = sd(name)
    if (n.includes(sd('đầu vào')) && !vao) vao = docTab(wb.Sheets[name], 'vao')
    else if (n.includes(sd('đầu ra')) && !ra) ra = docTab(wb.Sheets[name], 'ra')
  }
  return { vao, ra }
}
