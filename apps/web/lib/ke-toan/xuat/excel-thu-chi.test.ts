import { describe, it, expect } from 'vitest'
import ExcelJS from 'exceljs'
import { dungExcelThuChi, type DongThuChi } from './excel-thu-chi'
const D: DongThuChi[] = [
  { taiKhoan: 'VCB21', ngay: '2026-08-03', noiDung: 'FACEBK *73DRRVZD42 DUBLI', no: 5270776, co: 0, soDu: 37621465, code: 'cp.qc', codeName: 'CP quảng cáo', partyCode: null, hasInvoice: false, thueHoaDon: 0, note: null, rowOrder: 1 },
  { taiKhoan: 'VCB63', ngay: '2026-08-07', noiDung: 'GWT thanh toan vat tu Xuan Lanh', no: 4659560, co: 0, soDu: 388365560, code: 'cp.vattukho', codeName: 'CP vật tư kho', partyCode: '0311054784', hasInvoice: true, thueHoaDon: 345153, note: 'HĐ 8121', rowOrder: 2 },
  { taiKhoan: 'VCB63', ngay: '2026-08-09', noiDung: 'GWT chuyen tien noi bo tu VCB63 sang VCB21', no: 50000000, co: 0, soDu: 338365560, code: 'NOI_BO', codeName: 'Chuyển tiền nội bộ', partyCode: null, hasInvoice: false, thueHoaDon: 0, note: null, rowOrder: 3 },
  { taiKhoan: 'VCB21', ngay: '2026-08-09', noiDung: 'GWT chuyen tien noi bo tu VCB63 sang VCB21', no: 0, co: 50000000, soDu: 87621465, code: 'NOI_BO', codeName: 'Chuyển tiền nội bộ', partyCode: null, hasInvoice: false, thueHoaDon: 0, note: null, rowOrder: 4 },
  { taiKhoan: 'TCB', ngay: '2026-08-03', noiDung: 'LE NAM HAI 0900000001 may CTD50', no: 0, co: 1000000, soDu: 509219466, code: 'BAN_HANG', codeName: 'Bán hàng', partyCode: 'KHL', hasInvoice: true, thueHoaDon: 74074, note: null, rowOrder: 5 },
  { taiKhoan: 'TCB', ngay: '2026-08-25', noiDung: 'INTEREST PAYMENT', no: 0, co: 5843, soDu: 509225309, code: 'LAI_NH', codeName: 'Lãi ngân hàng', partyCode: null, hasInvoice: false, thueHoaDon: 0, note: null, rowOrder: 6 },
]
async function doc(buf: Uint8Array) { const wb = new ExcelJS.Workbook(); await wb.xlsx.load(Buffer.from(buf) as unknown as Parameters<typeof wb.xlsx.load>[0]); return wb }
describe('Excel thu chi', () => {
  it('tab chi: 15 cột đúng tên, D/E theo quy ước VAT, HĐ, phân loại', async () => {
    const wb = await doc(await dungExcelThuChi({ ky: '2026-08', dong: D, soDuDau: { VCB21: 42892241, VCB63: 393025120, TCB: 508219466 } }))
    const ws = wb.getWorksheet('Báo cáo chi')!
    expect(ws.getRow(1).values).toEqual([undefined, 'Ngày', 'Tháng', 'Nội dung chi', 'Số tiền trước VAT', 'Số tiền sau VAT', 'Số tiền lũy kế trong tháng', 'Tài khoản', 'Phân loại chi phí', 'Tình trạng thanh toán', 'Không hoàn tiền', 'HĐ', 'Note', 'Đã hoàn', 'Tình trạng hoá đơn', 'Link chứng từ'])
    expect(ws.rowCount).toBe(4)
    expect(ws.getCell(2, 4).value).toBe(-5270776); expect(ws.getCell(2, 5).value).toBeNull(); expect(ws.getCell(2, 8).value).toBe('cp.qc'); expect(ws.getCell(2, 11).value).toBe('Không HĐ'); expect(ws.getCell(2, 2).value).toBe(8)
    expect(ws.getCell(3, 5).value).toBe(-4659560); expect(ws.getCell(3, 4).value).toBeCloseTo(-4314407.407, 2); expect(ws.getCell(3, 11).value).toBe('Có HĐ'); expect(ws.getCell(3, 12).value).toBe('HĐ 8121')
    expect(ws.getCell(4, 8).value).toBe('Chuyển tiền nội bộ'); expect(ws.getCell(2, 9).value).toBe('Đã TT'); expect(ws.getCell(2, 10).value).toBe('Không hoàn tiền')
  })
  it('tab thu: header hàng 3, E=D/1.08 chỉ Bán hàng, mã đối tượng', async () => {
    const wb = await doc(await dungExcelThuChi({ ky: '2026-08', dong: D, soDuDau: { VCB21: 42892241, VCB63: 393025120, TCB: 508219466 } }))
    const ws = wb.getWorksheet('Báo cáo thu')!
    expect(ws.getRow(3).values).toEqual([undefined, 'Ngày', 'Tháng', 'Nội dung thu', 'Số tiền sau VAT', 'Số tiền trước VAT', 'Số tiền lũy kế trong tháng', 'Tài khoản', 'Phân loại thu', 'Mã đối tượng', 'Note', 'Column 11'])
    expect(ws.getCell(4, 4).value).toBe(1000000); expect(ws.getCell(4, 5).value).toBeCloseTo(925925.926, 2); expect(ws.getCell(4, 8).value).toBe('Bán hàng'); expect(ws.getCell(4, 9).value).toBe('KHL')
    expect(ws.getCell(5, 8).value).toBe('Chuyển tiền nội bộ'); expect(ws.getCell(5, 5).value).toBeNull(); expect(ws.getCell(5, 9).value).toBe('chưa có thông tin')
    expect(ws.getCell(6, 8).value).toBe('Lãi ngân hàng')
  })
  it('tab tiền mặt: 31 ngày, số dư kéo theo ngày, Đầu/Thu/Chi/Cuối', async () => {
    const wb = await doc(await dungExcelThuChi({ ky: '2026-08', dong: D, soDuDau: { VCB21: 42892241, VCB63: 393025120, TCB: 508219466 } }))
    const ws = wb.getWorksheet('Tiền mặt ngân hàng')!
    expect(ws.getRow(1).values).toEqual([undefined, 'Ngày', 'VCB 63', 'VCB21', 'TCB', 'Đầu kỳ', 'Thu', 'Chi', 'Cuối kỳ'])
    expect(ws.rowCount).toBe(32)
    expect(ws.getCell(2, 5).value).toBe(42892241 + 393025120 + 508219466)                     // ngày 1: đầu kỳ = Σ số dư đầu
    expect(ws.getCell(2, 3).value).toBe(42892241)                                              // VCB21 ngày 1 chưa giao dịch → số dư đầu
    expect(ws.getCell(4, 3).value).toBe(37621465); expect(ws.getCell(4, 7).value).toBe(5270776) // ngày 3: VCB21 sau FACEBK; Chi = 5.270.776
    expect(ws.getCell(4, 6).value).toBe(1000000)                                               // Thu ngày 3 = TCB 1.000.000
    // Cuối kỳ = cột H (8): header hàng 1 chỉ có 8 tên (A..H), brief T8 dòng test gốc ghi cột 9 — lệch 1,
    // sửa về 8 cho khớp header thật (xem báo cáo Task 8, mục "self-review").
    expect(ws.getCell(10, 8).value).toBe(ws.getCell(10, 5).value as number + 50000000 - 50000000) // ngày 9 nội bộ: cuối = đầu
  })
  it('tiền mặt: số dư cuối ngày theo THỜI GIAN THẬT, không theo row_order thô (TCB mới nhất trước)', async () => {
    const dong: DongThuChi[] = [
      // TCB: rowOrder NHỎ hơn = giao dịch SAU (PDF liệt kê mới nhất trước) — rowOrder 2 (soDu 200) phải thắng dù rowOrder 3 đứng trước trong mảng.
      { taiKhoan: 'TCB', ngay: '2026-08-05', noiDung: 'TCB rowOrder 3 (trước)', no: 0, co: 0, soDu: 100, code: null, codeName: null, partyCode: null, hasInvoice: false, thueHoaDon: 0, note: null, rowOrder: 3 },
      { taiKhoan: 'TCB', ngay: '2026-08-05', noiDung: 'TCB rowOrder 2 (sau)', no: 0, co: 0, soDu: 200, code: null, codeName: null, partyCode: null, hasInvoice: false, thueHoaDon: 0, note: null, rowOrder: 2 },
      // VCB: rowOrder LỚN hơn = giao dịch SAU (đọc tuần tự) — rowOrder 2 (soDu 70) thắng.
      { taiKhoan: 'VCB21', ngay: '2026-08-05', noiDung: 'VCB21 rowOrder 1 (trước)', no: 0, co: 0, soDu: 50, code: null, codeName: null, partyCode: null, hasInvoice: false, thueHoaDon: 0, note: null, rowOrder: 1 },
      { taiKhoan: 'VCB21', ngay: '2026-08-05', noiDung: 'VCB21 rowOrder 2 (sau)', no: 0, co: 0, soDu: 70, code: null, codeName: null, partyCode: null, hasInvoice: false, thueHoaDon: 0, note: null, rowOrder: 2 },
    ]
    const wb = await doc(await dungExcelThuChi({ ky: '2026-08', dong, soDuDau: { VCB21: 0, VCB63: 0, TCB: 0 } }))
    const ws = wb.getWorksheet('Tiền mặt ngân hàng')!
    expect(ws.getCell(6, 4).value).toBe(200) // ngày 5 (dòng 6), cột D = TCB
    expect(ws.getCell(6, 3).value).toBe(70)  // ngày 5 (dòng 6), cột C = VCB21
  })
})
