/**
 * Xuất Excel "_DAXULY" cho một kỳ kế toán: header thô của file NEXIA giữ nguyên (kể cả cột
 * không tên hoặc trùng tên), thêm cột kết quả engine ở bên phải, tô màu theo nguồn/loại để kế
 * toán rà nhanh. Không tính điểm tin cậy/căn cứ ra cột riêng (đã bỏ theo brief lát 1).
 */
import ExcelJS from 'exceljs'

export type DongXuat = {
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
const GOOD = FILL('FFDDEBF7') // hàng hoá / mua hàng — engineKind goods|muahang
const WARN = FILL('FFFFF2CC') // chưa có mã đề xuất
const HEAD = FILL('FF305496') // header của cột thêm vào

function ghiTab(
  wb: ExcelJS.Workbook,
  ten: string,
  headers: string[],
  them: readonly string[],
  dong: DongXuat[],
  cotThem: (d: DongXuat) => (string | null)[],
) {
  const ws = wb.addWorksheet(ten)
  const n = headers.length
  ws.addRow([...headers, ...them])
  for (let c = 1; c <= n + them.length; c++) {
    const cell = ws.getRow(1).getCell(c)
    cell.font = { bold: true, color: c > n ? { argb: 'FFFFFFFF' } : undefined }
    if (c > n) {
      cell.fill = HEAD
      cell.alignment = { wrapText: true, vertical: 'middle' }
      ws.getColumn(c).width = 16
    }
  }
  for (const d of dong) {
    const raw = Array.from({ length: n }, (_, i) => d.raw[i] ?? null)
    const row = ws.addRow([...raw, ...cotThem(d)])
    if (d.tuHdct) for (let c = 1; c <= n; c++) row.getCell(c).fill = HDCT
    const fillThem = d.engineKind === 'goods' || d.engineKind === 'muahang' ? GOOD : !d.code ? WARN : null
    if (fillThem) for (let c = n + 1; c <= n + them.length; c++) row.getCell(c).fill = fillThem
  }
  ws.views = [{ state: 'frozen', ySplit: 1 }]
}

export async function dungExcelHoaDon(input: { headersVao: string[]; vao: DongXuat[]; headersRa: string[]; ra: DongXuat[] }): Promise<Uint8Array> {
  const wb = new ExcelJS.Workbook()
  ghiTab(wb, 'HĐ đầu vào', input.headersVao, COT_THEM_VAO, input.vao, (d) => [d.code, d.codeName, d.tkNo, d.tkCo, d.vat1331, d.note])
  ghiTab(wb, 'HĐ Đầu ra', input.headersRa, COT_THEM_RA, input.ra, (d) => [d.code, null])
  return new Uint8Array(await wb.xlsx.writeBuffer())
}
