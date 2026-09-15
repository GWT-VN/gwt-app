import ExcelJS from 'exceljs'
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

/** Gỡ vỏ giá trị ô exceljs về nguyên thuỷ: công thức → kết quả, rich text/hyperlink → text, ô lỗi → null. */
export function giaTriO(v: ExcelJS.CellValue): string | number | Date | null {
  if (v == null) return null
  if (typeof v !== 'object') return typeof v === 'boolean' ? String(v) : v
  if (v instanceof Date) return v
  if ('richText' in v) return v.richText.map((t) => t.text).join('')
  if ('result' in v) return giaTriO(v.result as ExcelJS.CellValue)
  if ('text' in v) return giaTriO(v.text as ExcelJS.CellValue)
  return null
}

function ngay(v: unknown): string | null {
  if (v instanceof Date) {
    // Ngày theo giờ máy, không toISOString() (bẫy UTC — docs/CHUAN-FILTER.md).
    const p = (n: number) => String(n).padStart(2, '0')
    return `${v.getFullYear()}-${p(v.getMonth() + 1)}-${p(v.getDate())}`
  }
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(String(v ?? ''))
  if (!m) return null
  return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
}
function chuoi(v: unknown): string {
  if (v == null) return ''
  return (v instanceof Date ? ngay(v)! : String(v)).trim()
}
/** Giá trị ô exceljs → chuỗi trim (ngày → YYYY-MM-DD). Bộ đọc và bộ xuất dùng chung để so/khớp một kiểu. */
export function chuoiO(v: ExcelJS.CellValue): string { return chuoi(giaTriO(v)) }
function so(v: unknown): number | null {
  if (v == null || v === '') return null
  if (typeof v === 'number') return v
  const n = Number(String(v).replace(/[,\s]/g, ''))
  return Number.isFinite(n) ? n : null
}
function oTho(v: unknown): string | number | null {
  if (v == null || v === '') return null
  if (typeof v === 'number') return v
  if (v instanceof Date) return ngay(v)
  return String(v)
}

function docTab(ws: ExcelJS.Worksheet, ten: 'vao' | 'ra'): TabNexia {
  const o = (row: ExcelJS.Row, i: number) => giaTriO(row.getCell(i + 1).value)
  const soCot = ws.columnCount // getter quét cả sheet — hoist
  const r1 = ws.getRow(1)
  const headers = Array.from({ length: soCot }, (_, i) => chuoi(o(r1, i)))
  const c = {
    kyHieu: timCot(headers, 'ký hiệu', 'hóa'), soHd: timCot(headers, 'số hóa đơn'), ngayLap: timCot(headers, 'ngày lập'),
    mccqt: timCot(headers, 'mccqt'), tenBan: timCot(headers, 'tên người bán'), mstBan: timCot(headers, 'mst người bán'),
    tenMua: timCot(headers, 'tên người mua'), mstMua: timCot(headers, 'mst người mua'), tenHang: timCot(headers, 'tên hàng'),
    dvt: timCot(headers, 'đơn vị tính'), soLuong: timCot(headers, 'số lượng'), donGia: timCot(headers, 'đơn giá'),
    thueSuat: timCot(headers, 'thuế suất'), thanhTien: timCot(headers, 'thành tiền chưa thuế'), tienThue: timCot(headers, 'tiền thuế'),
    tongThanhToan: timCot(headers, 'tổng tiền thanh toán'), trangThai: timCot(headers, 'trạng thái hóa đơn'), tinhChat: timCot(headers, 'tính chất'),
  }
  const g = (row: ExcelJS.Row, i: number) => (i >= 0 ? o(row, i) : null)
  const dong: DongTho[] = []
  const soDong = ws.rowCount
  for (let r = 2; r <= soDong; r++) {
    const row = ws.getRow(r)
    // Cùng luật bỏ dòng với `anhXaDong` bên xuất — lệch là cột đề xuất rơi sai dòng.
    if (!chuoi(g(row, c.soHd)) && !chuoi(g(row, c.tenHang))) continue
    const raw = headers.map((_, i) => oTho(o(row, i)))
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

/**
 * Nhận diện tab NEXIA theo tên bỏ dấu, kiểu CHỨA ("HĐ đầu vào", "Hoá đơn đầu vào T8", "HD DAU VAO"…).
 * Bộ đọc (upload) và bộ xuất (điền file gốc) PHẢI dùng chung hàm này — review 08/09/2026: exporter từng so
 * bằng đúng tên nên file upload được mà xuất lại 409.
 */
export function laTab(name: string, loai: 'vao' | 'ra'): boolean {
  return sd(name).includes(sd(loai === 'vao' ? 'đầu vào' : 'đầu ra'))
}

/** Mở workbook từ nội dung .xlsx — bộ đọc và bộ xuất dùng chung (một thư viện Excel duy nhất: exceljs). */
export async function moWorkbook(buf: ArrayBuffer | Uint8Array): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(Buffer.from(buf as Uint8Array) as unknown as Parameters<typeof wb.xlsx.load>[0])
  return wb
}

export async function docNexia(buf: ArrayBuffer | Uint8Array): Promise<FileNexia> {
  const wb = await moWorkbook(buf)
  let vao: TabNexia | null = null, ra: TabNexia | null = null
  for (const ws of wb.worksheets) {
    if (laTab(ws.name, 'vao') && !vao) vao = docTab(ws, 'vao')
    else if (laTab(ws.name, 'ra') && !ra) ra = docTab(ws, 'ra')
  }
  return { vao, ra }
}
