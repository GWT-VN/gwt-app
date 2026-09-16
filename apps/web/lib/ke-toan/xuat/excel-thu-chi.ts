/**
 * Xuất "Báo cáo thu chi" MM.YYYY.xlsx cho một kỳ sao kê (lát 5) — workbook MỚI (không mở file gốc,
 * khác `excel-hoa-don.ts`): 3 tab tính từ dữ liệu sao kê đã khớp/phân loại — Báo cáo chi, Báo cáo
 * thu, Tiền mặt ngân hàng.
 */
import ExcelJS from 'exceljs'
import { coCotTheoNoiDung } from './excel-hoa-don'
import type { TaiKhoan } from '../sao-ke/kieu'

export type DongThuChi = {
  taiKhoan: TaiKhoan; ngay: string; noiDung: string; no: number; co: number; soDu: number | null
  code: string | null; codeName: string | null; partyCode: string | null; hasInvoice: boolean; thueHoaDon: number; note: string | null
  /** row_order gốc trong `accounting.bank_lines` — cần để sắp đúng thời gian thật trong ngày, xem `theoThoiGianThat`. */
  rowOrder: number
}

const HEAD_FILL: ExcelJS.FillPattern = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } }

function ghiHeader(ws: ExcelJS.Worksheet, hang: number, ten: readonly string[]) {
  ten.forEach((h, i) => {
    const cell = ws.getRow(hang).getCell(i + 1)
    cell.value = h
    cell.font = { bold: true }
    cell.fill = HEAD_FILL
  })
}

function ngayUtc(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

/** Sắp theo ngày rồi tài khoản — khuôn T8 cho cả tab chi lẫn thu. */
function sapNgayTk(a: DongThuChi, b: DongThuChi): number {
  return a.ngay === b.ngay ? a.taiKhoan.localeCompare(b.taiKhoan) : a.ngay.localeCompare(b.ngay)
}

/**
 * Sắp lại theo THỜI GIAN GIAO DỊCH THẬT trong ngày (không phải thứ tự dòng thô `row_order`).
 * VCB (.xls/.xlsx đọc tuần tự) liệt kê tăng dần theo thời gian → row_order tăng = thời gian tăng.
 * TCB (đọc từ PDF sao kê) liệt kê MỚI NHẤT TRƯỚC → row_order tăng = thời gian GIẢM, nên đảo chiều.
 * Chỉ ảnh hưởng thứ tự các dòng CÙNG (tài khoản, ngày); khác tài khoản/ngày giữ nguyên tương đối
 * (dựa vào sort ổn định của JS) vì không ảnh hưởng số dư — mỗi tài khoản tính riêng.
 */
function theoThoiGianThat(dong: DongThuChi[]): DongThuChi[] {
  return [...dong].sort((a, b) => {
    if (a.ngay !== b.ngay) return a.ngay.localeCompare(b.ngay)
    if (a.taiKhoan !== b.taiKhoan) return 0
    return a.taiKhoan === 'TCB' ? b.rowOrder - a.rowOrder : a.rowOrder - b.rowOrder
  })
}

const PHAN_LOAI_CHI: Record<string, string> = { NOI_BO: 'Chuyển tiền nội bộ', HANG_HOA: 'HÀNG HOÁ' } // R11: engine trả HANG_HOA cho HĐ hàng hoá
const HEADER_CHI = ['Ngày', 'Tháng', 'Nội dung chi', 'Số tiền trước VAT', 'Số tiền sau VAT', 'Số tiền lũy kế trong tháng', 'Tài khoản', 'Phân loại chi phí', 'Tình trạng thanh toán', 'Không hoàn tiền', 'HĐ', 'Note', 'Đã hoàn', 'Tình trạng hoá đơn', 'Link chứng từ'] as const

function tabChi(wb: ExcelJS.Workbook, dong: DongThuChi[]) {
  const ws = wb.addWorksheet('Báo cáo chi')
  ghiHeader(ws, 1, HEADER_CHI)
  // theoThoiGianThat() trước rồi mới sort(sapNgayTk) ổn định (JS sort ổn định) — dòng cùng
  // ngày/tài khoản giữ đúng thứ tự thời gian thay vì rơi lại thứ tự row_order thô.
  const rows = theoThoiGianThat(dong).filter((d) => d.no > 0).sort(sapNgayTk)
  rows.forEach((d, i) => {
    const r = ws.getRow(i + 2)
    r.getCell(1).value = ngayUtc(d.ngay); r.getCell(1).numFmt = 'dd/mm/yyyy'
    r.getCell(2).value = Number(d.ngay.slice(5, 7))
    r.getCell(3).value = d.noiDung
    const e = d.hasInvoice && d.thueHoaDon > 0 ? -d.no : null
    r.getCell(5).value = e; r.getCell(5).numFmt = '#,##0'
    r.getCell(4).value = e != null ? Math.round((-d.no / 1.08) * 1000) / 1000 : -d.no
    r.getCell(4).numFmt = '#,##0.###'
    r.getCell(6).value = null
    r.getCell(7).value = d.taiKhoan
    r.getCell(8).value = d.code ? (PHAN_LOAI_CHI[d.code] ?? d.code) : ''
    r.getCell(9).value = 'Đã TT'
    r.getCell(10).value = 'Không hoàn tiền'
    r.getCell(11).value = d.hasInvoice ? 'Có HĐ' : 'Không HĐ'
    r.getCell(12).value = d.note
  })
  coCotTheoNoiDung(ws)
}

const PHAN_LOAI_THU: Record<string, string> = { BAN_HANG: 'Bán hàng', NOI_BO: 'Chuyển tiền nội bộ', LAI_NH: 'Lãi ngân hàng', HOAN_TIEN: 'Hoàn tiền' }
const HEADER_THU = ['Ngày', 'Tháng', 'Nội dung thu', 'Số tiền sau VAT', 'Số tiền trước VAT', 'Số tiền lũy kế trong tháng', 'Tài khoản', 'Phân loại thu', 'Mã đối tượng', 'Note', 'Column 11'] as const

function tabThu(wb: ExcelJS.Workbook, dong: DongThuChi[]) {
  const ws = wb.addWorksheet('Báo cáo thu')
  ghiHeader(ws, 3, HEADER_THU)
  const rows = theoThoiGianThat(dong).filter((d) => d.co > 0).sort(sapNgayTk)
  rows.forEach((d, i) => {
    const r = ws.getRow(i + 4)
    r.getCell(1).value = ngayUtc(d.ngay); r.getCell(1).numFmt = 'dd/mm/yyyy'
    r.getCell(2).value = Number(d.ngay.slice(5, 7))
    r.getCell(3).value = d.noiDung
    r.getCell(4).value = d.co; r.getCell(4).numFmt = '#,##0'
    const e = d.code === 'BAN_HANG' ? d.co / 1.08 : null
    r.getCell(5).value = e; r.getCell(5).numFmt = '#,##0.###'
    r.getCell(6).value = null
    r.getCell(7).value = d.taiKhoan
    r.getCell(8).value = d.code ? (PHAN_LOAI_THU[d.code] ?? d.code) : ''
    r.getCell(9).value = d.partyCode ?? 'chưa có thông tin'
    r.getCell(10).value = d.note
  })
  coCotTheoNoiDung(ws)
}

const CAC_TK: readonly TaiKhoan[] = ['VCB63', 'VCB21', 'TCB'] // đúng thứ tự cột B/C/D khuôn T8 (khác thứ tự TaiKhoan gốc)

function soNgayCuaKy(ky: string): number {
  const [y, m] = ky.split('-').map(Number)
  return new Date(Date.UTC(y, m, 0)).getUTCDate()
}

/**
 * Tab "Tiền mặt ngân hàng": mỗi dòng một ngày trong tháng `ky`. Số dư mỗi TK = số dư của giao dịch
 * CUỐI CÙNG THEO THỜI GIAN THẬT trong ngày (`theoThoiGianThat` — không phải dòng cuối theo row_order
 * thô, vì TCB nhập ngược: mới nhất trước). Chưa có giao dịch → kéo từ ngày trước, ngày đầu tháng
 * chưa có → `soDuDau`.
 */
function tabTienMat(wb: ExcelJS.Workbook, dong: DongThuChi[], ky: string, soDuDau: Record<TaiKhoan, number | null>) {
  const ws = wb.addWorksheet('Tiền mặt ngân hàng')
  ghiHeader(ws, 1, ['Ngày', 'VCB 63', 'VCB21', 'TCB', 'Đầu kỳ', 'Thu', 'Chi', 'Cuối kỳ'])
  const soDuTheoNgay: Record<TaiKhoan, Map<string, number | null>> = { VCB21: new Map(), VCB63: new Map(), TCB: new Map() }
  for (const d of theoThoiGianThat(dong)) soDuTheoNgay[d.taiKhoan].set(d.ngay, d.soDu)

  const soDuHienTai: Record<TaiKhoan, number | null> = { VCB21: soDuDau.VCB21 ?? null, VCB63: soDuDau.VCB63 ?? null, TCB: soDuDau.TCB ?? null }
  let dauKyTruoc = CAC_TK.reduce((s, tk) => s + (soDuHienTai[tk] ?? 0), 0)

  const soNgay = soNgayCuaKy(ky)
  for (let n = 1; n <= soNgay; n++) {
    const ngay = `${ky}-${String(n).padStart(2, '0')}`
    for (const tk of CAC_TK) { const gt = soDuTheoNgay[tk].get(ngay); if (gt !== undefined) soDuHienTai[tk] = gt }
    let thu = 0, chi = 0
    for (const d of dong) { if (d.ngay !== ngay) continue; thu += d.co; chi += d.no }
    const dauKy = dauKyTruoc
    const cuoiKy = dauKy + thu - chi

    const r = ws.getRow(n + 1)
    r.getCell(1).value = ngayUtc(ngay); r.getCell(1).numFmt = 'dd/mm/yyyy'
    CAC_TK.forEach((tk, i) => {
      const c = r.getCell(2 + i)
      c.value = soDuHienTai[tk]
      if (soDuHienTai[tk] != null) c.numFmt = '#,##0'
    })
    r.getCell(5).value = dauKy; r.getCell(6).value = thu; r.getCell(7).value = chi; r.getCell(8).value = cuoiKy
    for (let c = 5; c <= 8; c++) r.getCell(c).numFmt = '#,##0'

    dauKyTruoc = CAC_TK.reduce((s, tk) => s + (soDuHienTai[tk] ?? 0), 0)
  }
  coCotTheoNoiDung(ws)
}

export async function dungExcelThuChi(input: { ky: string; dong: DongThuChi[]; soDuDau: Record<TaiKhoan, number | null> }): Promise<Uint8Array> {
  const wb = new ExcelJS.Workbook()
  tabChi(wb, input.dong)
  tabThu(wb, input.dong)
  tabTienMat(wb, input.dong, input.ky, input.soDuDau)
  return new Uint8Array(await wb.xlsx.writeBuffer())
}
