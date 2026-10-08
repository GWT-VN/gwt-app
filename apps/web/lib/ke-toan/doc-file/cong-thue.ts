import ExcelJS from 'exceljs'
import { chuoiO, giaTriO, moWorkbook, ngay, so, timCot } from './nexia'

/**
 * Thư mục file cổng hoá đơn điện tử NEXIA gửi hằng tháng (từ T9/2026) → workbook khuôn NEXIA cũ.
 *
 * Thư mục có 4 file: Mua vào / Bán ra × Chi tiết (mỗi dòng một mặt hàng, header dòng 1) / Tổng quan
 * (mỗi HĐ một dòng, header dòng 4–10, dùng để đối chiếu). 37 cột của file Chi tiết trùng tên + thứ tự
 * với 37 cột đầu tab "HĐ đầu vào"/"HĐ Đầu ra" của workbook NEXIA khuôn 2024 (đo T8 vs T9) → ghép lại
 * thành đúng khuôn đó rồi đi tiếp đường upload NEXIA có sẵn: engine, sửa tại ô, xuất _DAXULY không đổi.
 * Plan: docs/plans/2026-10-05-ke-toan-nexia-cong-thue.md.
 *
 * Nhận diện theo NỘI DUNG, không theo tên file (tên file do người tải đặt, có thể đổi).
 */

export const MST_GWT = '0110530659'

/** Cột khuôn kế toán chừa ở tab đầu ra (workbook NEXIA T8, cột 38–43) — exporter điền Mã hàng/Loại/Kênh/Đại lý. */
export const COT_KHUON_RA = ['Mã hàng', 'Loại', 'Thành phố', 'Kênh', 'Đại lý', 'Note'] as const

export type HuongHd = 'vao' | 'ra'
export type FileHoaDon = {
  loai: 'chi_tiet' | 'tong_quan'
  huong: HuongHd | null
  /** Dòng dữ liệu theo đúng luật bỏ dòng của bộ đọc NEXIA (có Số HĐ hoặc Tên hàng). */
  soDong: number
  /** `<ký hiệu>-<số HĐ>` → tổng tiền thanh toán của HĐ (file Chi tiết lặp con số này trên mọi dòng hàng). */
  hoaDon: Map<string, number>
  /** Các tháng `YYYY-MM` của ngày lập. */
  thang: string[]
}
export type FileCongThue = FileHoaDon | { loai: 'khac'; lyDo: string }

const chiSo = (v: ExcelJS.CellValue) => chuoiO(v).replace(/\D/g, '')
const khoaHd = (kyHieu: string, soHd: string) => `${kyHieu}-${soHd.replace(/^0+(?=\d)/, '')}`

export async function nhanDienFile(buf: ArrayBuffer | Uint8Array, mst: string = MST_GWT): Promise<FileCongThue> {
  let wb: ExcelJS.Workbook
  try { wb = await moWorkbook(buf) } catch { return { loai: 'khac', lyDo: 'không mở được như file Excel' } }
  const ws = wb.worksheets[0]
  if (!ws) return { loai: 'khac', lyDo: 'file không có sheet nào' }
  const soCot = ws.columnCount
  const hang = (r: number) => Array.from({ length: soCot }, (_, i) => chuoiO(ws.getRow(r).getCell(i + 1).value))

  let loai: FileHoaDon['loai'] | null = null, dongHeader = 1
  const h1 = hang(1)
  if (timCot(h1, 'số hóa đơn') >= 0 && timCot(h1, 'tên hàng') >= 0) loai = 'chi_tiet'
  else {
    for (let r = 2; r <= Math.min(ws.rowCount, 15); r++) {
      const h = hang(r)
      if (timCot(h, 'số hóa đơn') >= 0 && timCot(h, 'tổng tiền thanh toán') >= 0) { loai = 'tong_quan'; dongHeader = r; break }
    }
  }
  if (!loai) return { loai: 'khac', lyDo: 'không có cột "Số hóa đơn" — không phải file hoá đơn cổng thuế' }

  const h = hang(dongHeader)
  const c = {
    kyHieu: timCot(h, 'ký hiệu', 'hóa đơn'), soHd: timCot(h, 'số hóa đơn'), ngayLap: timCot(h, 'ngày lập'), tenHang: timCot(h, 'tên hàng'),
    mstBan: timCot(h, 'mst người bán'), mstMua: timCot(h, 'mst người mua'), tong: timCot(h, 'tổng tiền thanh toán'),
  }
  const o = (row: ExcelJS.Row, i: number) => (i >= 0 ? row.getCell(i + 1).value : null)
  const hoaDon = new Map<string, number>(), thang = new Set<string>()
  let soDong = 0, laMua = 0, laBan = 0
  for (let r = dongHeader + 1; r <= ws.rowCount; r++) {
    const row = ws.getRow(r)
    const soHd = chuoiO(o(row, c.soHd))
    if (!soHd && !chuoiO(o(row, c.tenHang))) continue // dòng trống / dòng "Tổng cộng" cuối file Tổng quan
    soDong++
    if (chiSo(o(row, c.mstMua)) === mst) laMua++
    if (chiSo(o(row, c.mstBan)) === mst) laBan++
    const d = ngay(giaTriO(o(row, c.ngayLap)))
    if (d) thang.add(d.slice(0, 7))
    if (soHd) hoaDon.set(khoaHd(chuoiO(o(row, c.kyHieu)), soHd), so(giaTriO(o(row, c.tong))) ?? 0)
  }
  const huong: HuongHd | null = laMua > laBan ? 'vao' : laBan > laMua ? 'ra' : null
  return { loai, huong, soDong, hoaDon, thang: [...thang].sort() }
}

const tien = (n: number) => Math.round(n).toLocaleString('vi-VN')
const tongHd = (f: FileHoaDon) => [...f.hoaDon.values()].reduce((s, x) => s + x, 0)
const vaiKhoa = (ds: string[]) => ds.slice(0, 5).join(', ') + (ds.length > 5 ? `… (+${ds.length - 5})` : '')

/** File Chi tiết so với file Tổng quan cùng hướng. Rỗng = khớp. Lệch dưới 1 đồng (làm tròn) bỏ qua. */
export function doiChieuTongQuan(chiTiet: FileHoaDon, tongQuan: FileHoaDon): string[] {
  const lech: string[] = []
  const thieu = [...tongQuan.hoaDon.keys()].filter((k) => !chiTiet.hoaDon.has(k))
  const thua = [...chiTiet.hoaDon.keys()].filter((k) => !tongQuan.hoaDon.has(k))
  if (thieu.length) lech.push(`file Chi tiết thiếu ${thieu.length} HĐ có trong Tổng quan: ${vaiKhoa(thieu)}`)
  if (thua.length) lech.push(`file Chi tiết có ${thua.length} HĐ không có trong Tổng quan: ${vaiKhoa(thua)}`)
  const khacTien = [...chiTiet.hoaDon].filter(([k, v]) => tongQuan.hoaDon.has(k) && Math.abs(tongQuan.hoaDon.get(k)! - v) >= 1).map(([k]) => k)
  if (khacTien.length) lech.push(`${khacTien.length} HĐ lệch tổng tiền thanh toán: ${vaiKhoa(khacTien)}`)
  const a = tongHd(chiTiet), b = tongHd(tongQuan)
  if (Math.abs(a - b) >= 1) lech.push(`Tổng tiền thanh toán: Chi tiết ${tien(a)} ≠ Tổng quan ${tien(b)}`)
  return lech
}

const nhanBan = <T>(x: T): T => JSON.parse(JSON.stringify(x ?? {}))

/** Số cột header thật = ô cuối có chữ ở dòng 1. */
function soCotHeader(ws: ExcelJS.Worksheet): number {
  let n = 0
  ws.getRow(1).eachCell({ includeEmpty: false }, (cell, c) => { if (chuoiO(cell.value)) n = c })
  return n
}

/** Chép giá trị + định dạng + độ rộng cột + chiều cao dòng + ô gộp. exceljs không có copy sheet giữa hai workbook. */
function chepSheet(src: ExcelJS.Worksheet, dst: ExcelJS.Worksheet) {
  for (let c = 1; c <= src.columnCount; c++) {
    const w = src.getColumn(c).width
    if (w) dst.getColumn(c).width = w
  }
  src.eachRow({ includeEmpty: true }, (row, r) => {
    const d = dst.getRow(r)
    if (row.height) d.height = row.height
    row.eachCell({ includeEmpty: true }, (cell, c) => {
      const o = d.getCell(c)
      if (!cell.isMerged || cell.master === cell) o.value = cell.value
      o.style = nhanBan(cell.style)
    })
  })
  for (const vung of (src.model as { merges?: string[] }).merges ?? []) dst.mergeCells(vung)
}

/** Ghép hai file Chi tiết (+ sheet bìa mẫu nếu có) thành workbook khuôn NEXIA mà `docNexia` / `dienExcelHoaDon` đọc được. */
export async function ghepNexia(input: { vao: ArrayBuffer | Uint8Array; ra: ArrayBuffer | Uint8Array; bia: ArrayBuffer | Uint8Array | null }): Promise<Uint8Array> {
  const out = new ExcelJS.Workbook()
  if (input.bia) {
    const b = (await moWorkbook(input.bia)).worksheets[0]
    if (b) chepSheet(b, out.addWorksheet(b.name || 'Sheet1'))
  }
  const vao = (await moWorkbook(input.vao)).worksheets[0]
  const ra = (await moWorkbook(input.ra)).worksheets[0]
  if (!vao || !ra) throw new Error('File Chi tiết không có sheet nào.')
  chepSheet(vao, out.addWorksheet('HĐ đầu vào'))
  const wsRa = out.addWorksheet('HĐ Đầu ra')
  chepSheet(ra, wsRa)
  const n = soCotHeader(wsRa)
  const mau = wsRa.getRow(1).getCell(n).style
  COT_KHUON_RA.forEach((ten, i) => {
    const o = wsRa.getRow(1).getCell(n + 1 + i)
    o.value = ten
    o.style = nhanBan(mau)
    wsRa.getColumn(n + 1 + i).width = Math.max(wsRa.getColumn(n + 1 + i).width ?? 0, 12)
  })
  return new Uint8Array(await out.xlsx.writeBuffer())
}

export type TomTatHuong = { soDong: number; soHd: number; tong: number; tenFile: string }
export type TomTatThuMuc = {
  vao: TomTatHuong
  ra: TomTatHuong
  /** khop: có đủ hai file Tổng quan và cả hai khớp · mot_phan: chỉ một hướng có Tổng quan (đã khớp) · khong_co_tong_quan */
  doiChieu: 'khop' | 'mot_phan' | 'khong_co_tong_quan'
  /** File bỏ qua (không phải .xlsx, hoặc không phải file hoá đơn) — để hiện cho người dùng biết. */
  boQua: string[]
}
export type KetQuaThuMuc = { ok: true; ky: string; nexia: Uint8Array; tomTat: TomTatThuMuc } | { ok: false; loi: string[] }

const TEN_HUONG: Record<HuongHd, string> = { vao: 'mua vào', ra: 'bán ra' }

/**
 * Cả thư mục → workbook NEXIA. Mọi kiểm tra chặn nằm ở đây, TRƯỚC khi đụng Storage/DB:
 * thiếu/trùng file Chi tiết, không thấy MST GWT, hoá đơn trải nhiều tháng hoặc khác kỳ đang chọn,
 * Tổng quan lệch Chi tiết. `ky = null` → lấy kỳ từ ngày lập.
 */
export async function chuanBiThuMuc(
  files: { ten: string; buf: Uint8Array }[],
  opts: { ky: string | null; bia: Uint8Array | null; mst?: string },
): Promise<KetQuaThuMuc> {
  const loi: string[] = [], boQua: string[] = []
  const ct: Record<HuongHd, { ten: string; buf: Uint8Array; f: FileHoaDon }[]> = { vao: [], ra: [] }
  const tq: Record<HuongHd, { ten: string; f: FileHoaDon }[]> = { vao: [], ra: [] }
  for (const file of files) {
    if (!file.ten.toLowerCase().endsWith('.xlsx')) { boQua.push(file.ten); continue }
    const f = await nhanDienFile(file.buf, opts.mst ?? MST_GWT)
    if (f.loai === 'khac') { boQua.push(`${file.ten} (${f.lyDo})`); continue }
    if (!f.huong) { loi.push(`${file.ten}: không thấy MST GWT ${opts.mst ?? MST_GWT} ở người mua hay người bán.`); continue }
    if (f.loai === 'chi_tiet') ct[f.huong].push({ ten: file.ten, buf: file.buf, f })
    else tq[f.huong].push({ ten: file.ten, f })
  }
  for (const h of ['vao', 'ra'] as const) {
    if (ct[h].length === 0) loi.push(`Thiếu file Chi tiết ${TEN_HUONG[h]} (file "… - ${h === 'vao' ? 'Mua vào' : 'Bán ra'} - Chi tiết - ….xlsx").`)
    if (ct[h].length > 1) loi.push(`Có hai file Chi tiết ${TEN_HUONG[h]}: ${ct[h].map((x) => x.ten).join(', ')} — chỉ giữ một.`)
    if (tq[h].length > 1) loi.push(`Có hai file Tổng quan ${TEN_HUONG[h]}: ${tq[h].map((x) => x.ten).join(', ')} — chỉ giữ một.`)
  }
  if (loi.length) return { ok: false, loi }

  const vao = ct.vao[0], ra = ct.ra[0]
  const thang = [...new Set([...vao.f.thang, ...ra.f.thang])].sort()
  if (thang.length === 0) return { ok: false, loi: ['Không đọc được ngày lập hoá đơn trong file Chi tiết.'] }
  if (thang.length > 1) return { ok: false, loi: [`Hoá đơn trải nhiều tháng (${thang.join(', ')}) — mỗi lần upload một tháng.`] }
  const ky = thang[0]
  if (opts.ky && opts.ky !== ky) return { ok: false, loi: [`Hoá đơn trong thư mục là tháng ${ky}, nhưng đang chọn kỳ ${opts.ky}.`] }

  for (const h of ['vao', 'ra'] as const) {
    if (!tq[h][0]) continue
    for (const x of doiChieuTongQuan(ct[h][0].f, tq[h][0].f)) loi.push(`${h === 'vao' ? 'Mua vào' : 'Bán ra'}: ${x}`)
  }
  if (loi.length) return { ok: false, loi }

  const soTq = (tq.vao[0] ? 1 : 0) + (tq.ra[0] ? 1 : 0)
  const tom = (x: { ten: string; f: FileHoaDon }): TomTatHuong => ({ soDong: x.f.soDong, soHd: x.f.hoaDon.size, tong: tongHd(x.f), tenFile: x.ten })
  return {
    ok: true, ky,
    nexia: await ghepNexia({ vao: vao.buf, ra: ra.buf, bia: opts.bia }),
    tomTat: { vao: tom(vao), ra: tom(ra), doiChieu: soTq === 2 ? 'khop' : soTq === 1 ? 'mot_phan' : 'khong_co_tong_quan', boQua },
  }
}
