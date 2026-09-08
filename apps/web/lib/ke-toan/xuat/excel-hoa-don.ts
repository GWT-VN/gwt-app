/**
 * Xuất Excel "_DAXULY" cho một kỳ kế toán.
 *
 * Đường CHÍNH — `dienExcelHoaDon`: mở đúng file NEXIA gốc (tải từ Storage) và ĐIỀN cột đề xuất vào
 * đó, như tool Python (openpyxl load → ghi → save). Giữ nguyên mọi thứ kế toán đã quen: Sheet1, độ
 * rộng cột, header vàng, định dạng số, màu dòng HDCT (FFE699), bộ lọc. Nếu file đã có sẵn khối cột
 * đề xuất (bản Python xử lý trước, hoặc xuất lần 2) thì ghi đè vào khối ĐẦU TIÊN và xoá các khối
 * trùng phía sau — KHÔNG nối thêm bộ thứ hai (Python bị lỗi này: file T8 "đã xử lý" mang 2 bộ cột
 * sau khi chạy lại).
 *
 * Đường DỰ PHÒNG — `dungExcelHoaDon`: dựng workbook mới từ header thô + dòng trong DB, dùng khi
 * không tải được file gốc (source bị xoá). Mất định dạng gốc nhưng vẫn ra đủ dữ liệu.
 */
import ExcelJS from 'exceljs'
import { timCot, laTab } from '../doc-file/nexia'
import { sd } from '../chuan-hoa'

export type DongXuat = {
  /** Thứ tự dòng dữ liệu trong file nguồn (row_order trong DB) — khớp ngược về dòng Excel gốc. */
  rowOrder?: number
  /** Số hoá đơn — để kiểm tra dòng Excel gốc và dòng DB đúng là một, lệch thì từ chối xuất. */
  soHd?: string | null
  raw: (string | number | null)[]
  code: string | null
  codeName: string | null
  tkNo: string | null
  tkCo: string | null
  vat1331: string | null
  note: string | null
  engineConf: string | null
  engineKind: string | null
  tuHdct: boolean
}

export const COT_THEM_VAO = ['Mã KMCP (đề xuất)', 'Tên KMCP', 'TK Nợ', 'TK Có', 'Nợ 1331 (VAT)', 'Ghi chú'] as const
export const COT_THEM_RA = ['Mã nội bộ (đề xuất)', 'Mã khách hàng'] as const

const FILL = (argb: string): ExcelJS.FillPattern => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } })
const HDCT = FILL('FFFFE699') // dòng đã tách từ hoá đơn combo trước (tuHdct)
const GOOD = FILL('FFDDEBF7') // hàng hoá / mua hàng NK — engineKind goods|muahang (Python _GOOD)
const WARN = FILL('FFFFF2CC') // chưa có mã đề xuất (Python _WARN)
const HEAD = FILL('FF305496') // header của cột thêm vào (Python _HFILL)

/** Ghi chú cho kế toán khi người dùng chưa ghi gì — cùng câu chữ tool Python để kế toán không thấy lạ. */
export function ghiChuMacDinh(d: DongXuat): string {
  if (d.note) return d.note
  if (d.engineKind === 'goods') return 'Mua vào (mã nội bộ) — không phải chi phí'
  if (d.engineKind === 'muahang') return 'Tính vào giá vốn hàng NK (156)'
  if (!d.code) return '⚠ chưa khớp — cần gán tay'
  return ''
}

/**
 * Đặt/bỏ tô nền cho một ô bằng cách THAY object style, không mutate.
 * Bẫy exceljs (đo 07/09/2026 trên file T8 thật): sau `xlsx.load`, mọi ô cùng một xf dùng CHUNG một
 * object `style`; `cell.fill = X` là sửa object chung → 50 dòng HDCT tô cam ở cột B mất màu vì
 * ô cột đề xuất cùng dòng bị gán fill khác. Gán `cell.style = { ...cũ, fill }` tách riêng từng ô.
 */
function datFill(cell: ExcelJS.Cell, f: ExcelJS.FillPattern | null) {
  const { fill: _bo, ...conLai } = cell.style
  void _bo
  cell.style = f ? { ...conLai, fill: f } : conLai
}

function toCotThem(row: ExcelJS.Row, c0: number, n: number, d: DongXuat, tab: 'vao' | 'ra') {
  // Tab đầu ra lát 1 chưa có engine → không tô (tô vàng cả tab chỉ gây nhiễu). Lát 3 bật lại.
  const f = tab === 'ra' ? null : d.engineKind === 'goods' || d.engineKind === 'muahang' ? GOOD : !d.code ? WARN : null
  for (let c = c0; c < c0 + n; c++) datFill(row.getCell(c), f)
}

function giaTriThem(d: DongXuat, tab: 'vao' | 'ra'): (string | null)[] {
  return tab === 'vao' ? [d.code, d.codeName, d.tkNo, d.tkCo, d.vat1331, ghiChuMacDinh(d) || null] : [d.code, null]
}

function ghiHeaderThem(ws: ExcelJS.Worksheet, c0: number, them: readonly string[]) {
  them.forEach((h, i) => {
    const cell = ws.getRow(1).getCell(c0 + i)
    cell.value = h
    cell.style = { ...cell.style, font: { bold: true, color: { argb: 'FFFFFFFF' } }, fill: HEAD, alignment: { wrapText: true, vertical: 'middle' } }
    ws.getColumn(c0 + i).width = 16
  })
}

// ───────────────────────── Đường chính: điền vào file gốc ─────────────────────────

/** Giá trị ô exceljs → chuỗi trim (rich text, công thức, ngày… đều về text để so/khớp). */
function chuoiO(v: ExcelJS.CellValue): string {
  if (v == null) return ''
  if (typeof v === 'object') {
    // Ngày theo giờ máy, không toISOString() (bẫy UTC — docs/CHUAN-FILTER.md); chỉ dùng để so khớp.
    if (v instanceof Date) return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`
    if ('richText' in v) return v.richText.map((t) => t.text).join('').trim()
    if ('result' in v) return chuoiO(v.result as ExcelJS.CellValue)
    if ('text' in v) return String(v.text).trim()
    return ''
  }
  return String(v).trim()
}

/** Header dòng 1, bỏ ô rỗng ở đuôi. `soCot` = ws.columnCount đã hoist (getter đó quét cả sheet mỗi lần gọi). */
function headersCua(ws: ExcelJS.Worksheet, soCot: number): string[] {
  const out: string[] = []
  const r1 = ws.getRow(1)
  for (let c = 1; c <= soCot; c++) out.push(chuoiO(r1.getCell(c).value))
  while (out.length && !out[out.length - 1]) out.pop()
  return out
}

/** Mọi vị trí (1-based) khối cột đề xuất trong header — so bằng sd() (bỏ dấu, gộp khoảng trắng). */
function cacKhoiCotThem(headers: string[], them: readonly string[]): number[] {
  const h = headers.map((x) => sd(x)), t = them.map((x) => sd(x))
  const out: number[] = []
  for (let i = 0; i + t.length <= h.length; i++) {
    if (t.every((x, k) => h[i + k] === x)) { out.push(i + 1); i += t.length - 1 }
  }
  return out
}

/** Vị trí khối ĐẦU TIÊN; -1 nếu chưa có → nối vào sau cột cuối. */
export function timKhoiCotThem(headers: string[], them: readonly string[]): number {
  return cacKhoiCotThem(headers, them)[0] ?? -1
}

/**
 * Ánh xạ row_order (1..n, đếm theo cùng luật bỏ dòng của bộ đọc `docTab`: bỏ dòng không có Số HĐ
 * lẫn Tên hàng) → số dòng Excel thật. Phải giống hệt `doc-file/nexia.ts`, nếu không cột đề xuất rơi
 * sai dòng — vì thế còn kiểm Số HĐ từng dòng khi ghi. Không thấy hai cột mốc ở dòng 1 → ném lỗi thay
 * vì im lặng nối mọi dòng xuống đáy (review 08/09/2026 issue 3).
 */
function anhXaDong(ws: ExcelJS.Worksheet, headers: string[], tenTab: string): Map<number, number> {
  const cSo = timCot(headers, 'số hóa đơn'), cTen = timCot(headers, 'tên hàng')
  if (cSo < 0 && cTen < 0) throw new Error(`Tab "${tenTab}" không có cột "Số hóa đơn"/"Tên hàng" ở dòng 1 — file gốc không đúng khuôn NEXIA.`)
  const map = new Map<number, number>()
  let k = 0
  const soDong = ws.rowCount
  for (let r = 2; r <= soDong; r++) {
    const row = ws.getRow(r)
    const so = cSo >= 0 ? chuoiO(row.getCell(cSo + 1).value) : ''
    const ten = cTen >= 0 ? chuoiO(row.getCell(cTen + 1).value) : ''
    if (!so && !ten) continue
    map.set(++k, r)
  }
  return map
}

function dienTab(ws: ExcelJS.Worksheet, tab: 'vao' | 'ra', them: readonly string[], dong: DongXuat[]) {
  const soCot = ws.columnCount
  const headers = headersCua(ws, soCot)
  const khoi = cacKhoiCotThem(headers, them)
  let c0: number, nGoc: number
  if (khoi.length) {
    c0 = khoi[0]; nGoc = c0 - 1
    // Khối trùng phía sau (file đã qua tool Python 2 lần) → cắt, từ phải sang trái để index không trượt.
    for (const k of [...khoi.slice(1)].reverse()) ws.spliceColumns(k, them.length)
  } else {
    // Cột cuối không có tên header nhưng có dữ liệu vẫn là cột thật (review issue 2) → nối SAU nó.
    nGoc = Math.max(headers.length, soCot); c0 = nGoc + 1
    ghiHeaderThem(ws, c0, them)
  }
  const map = anhXaDong(ws, headers.slice(0, nGoc), ws.name)
  if (map.size === 0 && dong.length > 0) throw new Error(`Tab "${ws.name}" trong file gốc không có dòng dữ liệu nào nhưng kỳ có ${dong.length} dòng.`)
  const cSo = timCot(headers, 'số hóa đơn')
  let cuoi = ws.rowCount
  const daGhi = new Set<number>()
  for (const d of dong) {
    const r = d.rowOrder != null ? map.get(d.rowOrder) : undefined
    let row: ExcelJS.Row
    if (r != null) {
      row = ws.getRow(r)
      if (cSo >= 0 && d.soHd != null) {
        const trongFile = chuoiO(row.getCell(cSo + 1).value)
        if (trongFile !== String(d.soHd).trim()) {
          throw new Error(`Dòng ${d.rowOrder}: Số HĐ trong file gốc («${trongFile}») khác dữ liệu đã nạp («${d.soHd}») — file trên Storage và dữ liệu kỳ không còn khớp nhau; upload lại file NEXIA mới nhất rồi xuất.`)
        }
      }
      daGhi.add(d.rowOrder!)
    } else {
      // Dòng không có trong file gốc (HDCT/HDTQ bổ sung — lát 4) → nối cuối, tô cam như quy ước cũ.
      row = ws.getRow(++cuoi)
      for (let c = 1; c <= nGoc; c++) row.getCell(c).value = d.raw[c - 1] ?? null
      if (d.tuHdct) for (let c = 1; c <= nGoc; c++) datFill(row.getCell(c), HDCT)
    }
    giaTriThem(d, tab).forEach((v, i) => { row.getCell(c0 + i).value = v })
    toCotThem(row, c0, them.length, d, tab)
  }
  // Dòng trong file có khối cột cũ (bản Python) nhưng không còn dòng DB tương ứng → xoá số liệu cũ,
  // không để lẫn vào file gửi kế toán (review issue 14).
  for (const [k, r] of map) {
    if (daGhi.has(k)) continue
    const row = ws.getRow(r)
    for (let c = c0; c < c0 + them.length; c++) { row.getCell(c).value = null; datFill(row.getCell(c), null) }
  }
}

/** Điền cột đề xuất vào chính file NEXIA gốc. `goc` = nội dung .xlsx tải từ Storage. */
export async function dienExcelHoaDon(input: { goc: ArrayBuffer | Uint8Array; vao: DongXuat[]; ra: DongXuat[] }): Promise<Uint8Array> {
  const wb = new ExcelJS.Workbook()
  const buf = input.goc instanceof Uint8Array ? input.goc : new Uint8Array(input.goc)
  await wb.xlsx.load(Buffer.from(buf) as unknown as Parameters<typeof wb.xlsx.load>[0])
  // Cùng luật nhận diện tab với bộ đọc (laTab) — upload được thì xuất phải mở được.
  const wsVao = wb.worksheets.find((w) => laTab(w.name, 'vao'))
  const wsRa = wb.worksheets.find((w) => laTab(w.name, 'ra'))
  if (!wsVao) throw new Error('File gốc không có tab "HĐ đầu vào".')
  if (!wsRa && input.ra.length > 0) throw new Error(`File gốc không có tab "HĐ Đầu ra" nhưng kỳ có ${input.ra.length} dòng đầu ra.`)
  dienTab(wsVao, 'vao', COT_THEM_VAO, input.vao)
  if (wsRa) dienTab(wsRa, 'ra', COT_THEM_RA, input.ra)
  return new Uint8Array(await wb.xlsx.writeBuffer())
}

// ───────────────────────── Đường dự phòng: dựng từ đầu ─────────────────────────

function ghiTab(wb: ExcelJS.Workbook, ten: string, tab: 'vao' | 'ra', headers: string[], them: readonly string[], dong: DongXuat[]) {
  const ws = wb.addWorksheet(ten)
  const n = headers.length
  ws.addRow([...headers])
  for (let c = 1; c <= n; c++) ws.getRow(1).getCell(c).font = { bold: true }
  ghiHeaderThem(ws, n + 1, them)
  for (const d of dong) {
    const raw = Array.from({ length: n }, (_, i) => d.raw[i] ?? null)
    const row = ws.addRow([...raw, ...giaTriThem(d, tab)])
    if (d.tuHdct) for (let c = 1; c <= n; c++) row.getCell(c).fill = HDCT
    toCotThem(row, n + 1, them.length, d, tab)
  }
  ws.views = [{ state: 'frozen', ySplit: 1 }]
}

export async function dungExcelHoaDon(input: { headersVao: string[]; vao: DongXuat[]; headersRa: string[]; ra: DongXuat[] }): Promise<Uint8Array> {
  const wb = new ExcelJS.Workbook()
  ghiTab(wb, 'HĐ đầu vào', 'vao', input.headersVao, COT_THEM_VAO, input.vao)
  ghiTab(wb, 'HĐ Đầu ra', 'ra', input.headersRa, COT_THEM_RA, input.ra)
  return new Uint8Array(await wb.xlsx.writeBuffer())
}
