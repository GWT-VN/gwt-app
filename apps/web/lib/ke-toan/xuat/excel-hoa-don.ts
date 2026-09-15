/**
 * Xuất Excel "_DAXULY" cho một kỳ kế toán — `dienExcelHoaDon`: mở đúng file NEXIA gốc (tải từ
 * Storage) và ĐIỀN cột đề xuất vào đó, như tool Python (openpyxl load → ghi → save). Giữ nguyên mọi
 * thứ kế toán đã quen: Sheet1, độ rộng cột, header vàng, định dạng số, bộ lọc. Nếu file đã có sẵn
 * khối cột đề xuất (bản Python xử lý trước, hoặc xuất lần 2) thì ghi đè vào khối ĐẦU TIÊN và xoá
 * các khối trùng phía sau — KHÔNG nối thêm bộ thứ hai (Python bị lỗi này: file T8 "đã xử lý" mang
 * 2 bộ cột sau khi chạy lại).
 *
 * Không có đường dự phòng "dựng từ đầu": file gốc mất trên Storage → route báo lỗi, người dùng upload
 * lại (audit 15/09/2026 — đường đó chưa từng chạy thật, và mất định dạng kế toán quen).
 */
import ExcelJS from 'exceljs'
import { timCot, laTab, chuoiO, moWorkbook } from '../doc-file/nexia'
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
  /** đầu ra (engine dau-ra.ts) — điền cột đề xuất + cột template Loại/Kênh/Đại lý. */
  customerCode: string | null
  productGroup: string | null
  channelL1: string | null
  channelL2: string | null
  dealerName: string | null
  /** Nguồn dòng: nexia (file NEXIA) | hdct | hdtq (cổng thuế, Task 10). */
  nguon: 'nexia' | 'hdct' | 'hdtq'
}

export const COT_THEM_VAO = ['Mã KMCP (đề xuất)', 'Tên KMCP', 'TK Nợ', 'TK Có', 'Nợ 1331 (VAT)', 'Ghi chú'] as const
export const COT_THEM_RA = ['Mã nội bộ (đề xuất)', 'Mã khách hàng'] as const

const FILL = (argb: string): ExcelJS.FillPattern => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } })
const GOOD = FILL('FFDDEBF7') // hàng hoá / mua hàng NK — engineKind goods|muahang (Python _GOOD)
const WARN = FILL('FFFFF2CC') // chưa có mã đề xuất (Python _WARN)
const HEAD = FILL('FF305496') // header của cột thêm vào (Python _HFILL)
const HDCT = FILL('FFFFE699') // dòng nối cuối từ nguồn HDCT/HDTQ — không có trong file NEXIA gốc (Task 10)

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

const MONG: ExcelJS.Border = { style: 'thin', color: { argb: 'FF000000' } }
const VIEN: Partial<ExcelJS.Borders> = { top: MONG, left: MONG, bottom: MONG, right: MONG }
/** Kẻ viền mỏng nếu ô chưa có — cùng cách thay object style (bẫy exceljs ở `datFill`). */
function keVien(cell: ExcelJS.Cell) {
  if (cell.border?.left) return
  cell.style = { ...cell.style, border: VIEN }
}

function toCotThem(row: ExcelJS.Row, c0: number, n: number, d: DongXuat, tab: 'vao' | 'ra') {
  // Tab đầu ra: engine đã chạy (lát 2) nhưng cố ý không tô — tô vàng cả tab chỉ gây nhiễu, khác nghiệp vụ tab vào.
  const f = tab === 'ra' ? null : d.engineKind === 'goods' || d.engineKind === 'muahang' ? GOOD : !d.code ? WARN : null
  for (let c = c0; c < c0 + n; c++) datFill(row.getCell(c), f)
}

function giaTriThem(d: DongXuat, tab: 'vao' | 'ra'): (string | null)[] {
  return tab === 'vao' ? [d.code, d.codeName, d.tkNo, d.tkCo, d.vat1331, ghiChuMacDinh(d) || null] : [d.code, d.customerCode]
}

function ghiHeaderThem(ws: ExcelJS.Worksheet, c0: number, them: readonly string[]) {
  them.forEach((h, i) => {
    const cell = ws.getRow(1).getCell(c0 + i)
    cell.value = h
    cell.style = { ...cell.style, font: { bold: true, color: { argb: 'FFFFFFFF' } }, fill: HEAD, alignment: { wrapText: true, vertical: 'middle' } }
  })
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
  // Tab đầu ra: file NEXIA gốc có sẵn cột "Mã hàng/Loại/Kênh/Đại lý" (khuôn Excel kế toán) — điền
  // thẳng vào đó thay vì chỉ nối khối 2 cột đề xuất. Không thấy cột nào thì bỏ qua, không lỗi.
  const hGoc = headers.slice(0, nGoc)
  const cTpl = tab === 'ra' ? { maHang: timCot(hGoc, 'mã hàng'), loai: timCot(hGoc, 'loại'), kenh: timCot(hGoc, 'kênh'), daiLy: timCot(hGoc, 'đại lý') } : null
  const map = anhXaDong(ws, headers.slice(0, nGoc), ws.name)
  // Tab gốc rỗng nhưng kỳ chỉ toàn dòng HDCT/HDTQ (nối cuối, không cần khớp file gốc) thì vẫn xuất
  // được — chỉ chặn khi có dòng NEXIA thật sự cần khớp mà không có gì để khớp vào.
  if (map.size === 0 && dong.some((d) => d.nguon === 'nexia')) throw new Error(`Tab "${ws.name}" trong file gốc không có dòng dữ liệu nào nhưng kỳ có ${dong.length} dòng.`)
  const cSo = timCot(headers, 'số hóa đơn')
  const daGhi = new Set<number>()
  let cuoi = ws.rowCount
  const lech = (d: DongXuat, chiTiet: string) =>
    new Error(`Dòng ${d.rowOrder}: ${chiTiet} — file trên Storage và dữ liệu kỳ không còn khớp nhau; upload lại file NEXIA mới nhất rồi xuất.`)
  for (const d of dong) {
    // Mọi dòng nguồn NEXIA phải có trong file gốc — lệch thì báo lỗi thay vì âm thầm nối xuống đáy.
    // Dòng nguồn HDCT/HDTQ không có trong file gốc (Task 10 — bổ sung ngoài NEXIA) thì NỐI CUỐI, tô
    // cam để kế toán thấy ngay đây là dữ liệu ngoài file gốc.
    let r = d.rowOrder != null ? map.get(d.rowOrder) : undefined
    const vuaNoi = r == null // dòng vừa tự ghi (HDCT/HDTQ nối cuối) — raw của nó đến từ nguồn khác cột Số HĐ trong file gốc, không so được với chính nó
    if (r == null) {
      if (d.nguon === 'nexia') throw lech(d, `Số HĐ «${d.soHd ?? ''}» không có trong file gốc`)
      const rowMoi = ws.getRow(++cuoi)
      for (let c = 1; c <= nGoc; c++) { rowMoi.getCell(c).value = d.raw[c - 1] ?? null; datFill(rowMoi.getCell(c), HDCT) }
      r = cuoi
      map.set(d.rowOrder!, r)
    }
    const row = ws.getRow(r)
    if (!vuaNoi && cSo >= 0 && d.soHd != null) {
      const trongFile = chuoiO(row.getCell(cSo + 1).value)
      if (trongFile !== String(d.soHd).trim()) throw lech(d, `Số HĐ trong file gốc («${trongFile}») khác dữ liệu đã nạp («${d.soHd}»)`)
    }
    daGhi.add(d.rowOrder!)
    giaTriThem(d, tab).forEach((v, i) => { row.getCell(c0 + i).value = v })
    if (cTpl) {
      if (cTpl.maHang >= 0 && d.code) row.getCell(cTpl.maHang + 1).value = d.code
      if (cTpl.loai >= 0) row.getCell(cTpl.loai + 1).value = d.productGroup || null
      if (cTpl.kenh >= 0) row.getCell(cTpl.kenh + 1).value = d.channelL1 ? (d.channelL2 ? `${d.channelL1} / ${d.channelL2}` : d.channelL1) : null
      if (cTpl.daiLy >= 0) row.getCell(cTpl.daiLy + 1).value = d.dealerName || null
    }
    toCotThem(row, c0, them.length, d, tab)
  }
  // Dòng trong file có khối cột cũ (bản Python) nhưng không còn dòng DB tương ứng → xoá số liệu cũ,
  // không để lẫn vào file gửi kế toán (review issue 14).
  for (const [k, r] of map) {
    if (daGhi.has(k)) continue
    const row = ws.getRow(r)
    for (let c = c0; c < c0 + them.length; c++) { row.getCell(c).value = null; datFill(row.getCell(c), null) }
  }
  // Viền: file gốc qua tool Python có 99/250 dòng tô cam mất viền (openpyxl rơi border khi tô) và
  // khối cột thêm chưa có viền → kẻ cho mọi ô dòng dữ liệu + header (CEO 15/09: "mất line bảng").
  const cCuoi = c0 + them.length - 1
  for (let c = 1; c <= cCuoi; c++) keVien(ws.getRow(1).getCell(c))
  for (const r of map.values()) { const row = ws.getRow(r); for (let c = 1; c <= cCuoi; c++) keVien(row.getCell(c)) }
}

/** Điền cột đề xuất vào chính file NEXIA gốc. `goc` = nội dung .xlsx tải từ Storage. */
export async function dienExcelHoaDon(input: { goc: ArrayBuffer | Uint8Array; vao: DongXuat[]; ra: DongXuat[] }): Promise<Uint8Array> {
  const wb = await moWorkbook(input.goc)
  // Cùng luật nhận diện tab với bộ đọc (laTab) — upload được thì xuất phải mở được.
  const wsVao = wb.worksheets.find((w) => laTab(w.name, 'vao'))
  const wsRa = wb.worksheets.find((w) => laTab(w.name, 'ra'))
  if (!wsVao) throw new Error('File gốc không có tab "HĐ đầu vào".')
  if (!wsRa && input.ra.length > 0) throw new Error(`File gốc không có tab "HĐ Đầu ra" nhưng kỳ có ${input.ra.length} dòng đầu ra.`)
  dienTab(wsVao, 'vao', COT_THEM_VAO, input.vao)
  if (wsRa) dienTab(wsRa, 'ra', COT_THEM_RA, input.ra)
  coCotTheoNoiDung(wsVao)
  if (wsRa) coCotTheoNoiDung(wsRa)
  return new Uint8Array(await wb.xlsx.writeBuffer())
}

/** Độ dài hiển thị ước lượng của một ô (số có dấu phân cách nghìn, ngày 10 ký tự). */
function doDaiO(v: ExcelJS.CellValue): number {
  if (typeof v === 'number') return Math.round(v).toLocaleString('en-US').length + (Number.isInteger(v) ? 0 : 3)
  if (v instanceof Date) return 10
  return chuoiO(v).length
}

/**
 * Co giãn mọi cột vừa nội dung (CEO 15/09: file NEXIA gốc nhiều cột hẹp cắt số/header). exceljs không
 * có autofit → ước lượng theo ký tự dài nhất trong cột, kẹp [6, 60] để cột diễn giải dài không phình.
 * Ghi đè độ rộng file gốc có chủ đích — kế toán đọc được số quan trọng hơn giữ y nguyên khung cũ.
 */
export function coCotTheoNoiDung(ws: ExcelJS.Worksheet) {
  const soCot = ws.columnCount, soDong = ws.rowCount
  const dai = new Array<number>(soCot + 1).fill(0)
  for (let r = 1; r <= soDong; r++) {
    const row = ws.getRow(r)
    for (let c = 1; c <= soCot; c++) dai[c] = Math.max(dai[c], doDaiO(row.getCell(c).value))
  }
  for (let c = 1; c <= soCot; c++) ws.getColumn(c).width = Math.min(60, Math.max(6, dai[c] + 2))
}
