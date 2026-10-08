import { describe, it, expect } from 'vitest'
import ExcelJS from 'exceljs'
import { nhanDienFile, doiChieuTongQuan, ghepNexia, chuanBiThuMuc, COT_KHUON_RA, MST_GWT } from './cong-thue'
import { docNexia } from './nexia'
import { dienExcelHoaDon, COT_THEM_VAO, type DongXuat } from '../xuat/excel-hoa-don'

// 37 cột đúng thứ tự file "Chi tiết" cổng hoá đơn điện tử (đo trên file T9/2026 thật).
const H_CT = ['Mẫu số HD', 'Ký hiệu hóa đơn', 'Số hóa đơn', 'Ngày lập hóa đơn', 'Ngày người bán ký số', 'MCCQT', 'Ngày CQT ký số',
  'Đơn vị tiền tệ', 'Tỷ giá', 'Tên người bán', 'MST người bán', 'Địa chỉ người bán', 'Tên người mua', 'MST người mua',
  'Địa chỉ người mua', 'Mã VT', 'Tên hàng hóa, dịch vụ', 'Đơn vị tính', 'Số lượng', 'Đơn giá', 'Chiết khấu', 'Thuế suất',
  'Thành tiền chưa thuế', 'Tiền thuế', 'Tổng tiền CKTM', 'Tổng tiền phí', 'Tổng tiền thanh toán', 'Trạng thái hóa đơn',
  'Kết quả kiểm tra hóa đơn', 'url tra cứu hóa đơn', 'Mã tra cứu', 'Ghi chú 1', 'Hình thức thanh toán', 'Tính chất',
  'Ghi chú 2', 'Số lô', 'Hạn dùng']
const NCC = '0100000001'

type DongCT = { kh: string; so: number; ngay: string; tenHang: string; tien: number; tong: number }

/** Dòng file Chi tiết: hướng vào thì GWT là người mua, hướng ra thì GWT là người bán. */
function dongCT(huong: 'vao' | 'ra', d: DongCT): (string | number | null)[] {
  const r: (string | number | null)[] = H_CT.map(() => null)
  const set = (ten: string, v: string | number) => { r[H_CT.indexOf(ten)] = v }
  set('Mẫu số HD', 1); set('Ký hiệu hóa đơn', d.kh); set('Số hóa đơn', d.so); set('Ngày lập hóa đơn', d.ngay)
  set('Tên người bán', huong === 'vao' ? 'Công ty NCC A' : 'GWT'); set('MST người bán', huong === 'vao' ? NCC : MST_GWT)
  set('Tên người mua', huong === 'vao' ? 'GWT' : 'Khách lẻ'); if (huong === 'vao') set('MST người mua', MST_GWT)
  set('Tên hàng hóa, dịch vụ', d.tenHang); set('Thuế suất', '8%'); set('Thành tiền chưa thuế', d.tien)
  set('Tiền thuế', Math.round(d.tien * 0.08)); set('Tổng tiền thanh toán', d.tong); set('Trạng thái hóa đơn', 'Hóa đơn mới')
  return r
}

async function fileChiTiet(huong: 'vao' | 'ra', dong: DongCT[]): Promise<Uint8Array> {
  const wb = new ExcelJS.Workbook(); const ws = wb.addWorksheet('Sheet1')
  ws.addRow(H_CT); ws.getRow(1).font = { bold: true }; ws.getColumn(17).width = 55
  for (const d of dong) ws.addRow(dongCT(huong, d))
  return new Uint8Array(await wb.xlsx.writeBuffer())
}

/** File "Tổng quan": tiêu đề gộp ô, dòng khoảng thời gian, header ở dòng 5 (mua vào) / 6 (bán ra), dòng cuối tổng. */
async function fileTongQuan(huong: 'vao' | 'ra', hd: { kh: string; so: number; ngay: string; tong: number }[]): Promise<Uint8Array> {
  const wb = new ExcelJS.Workbook(); const ws = wb.addWorksheet(huong === 'vao' ? 'combined' : 'Hóa đơn điện tử')
  const dongHeader = huong === 'vao' ? 5 : 6
  ws.getCell(dongHeader - 4, 1).value = 'DANH SÁCH HÓA ĐƠN TỔNG QUAN'
  ws.getCell(dongHeader - 2, 1).value = 'Từ ngày 01/09/2026 đến ngày 30/09/2026'
  const h = ['STT', 'Ký hiệu mẫu số', 'Ký hiệu hóa đơn', 'Số hóa đơn', 'Ngày lập', 'MST người bán/MST người xuất', 'Tên người bán/Tên người xuất',
    'MST người mua/MST người nhận', 'Tên người mua/Tên người nhận', 'Tổng tiền chưa thuế', 'Tổng tiền thuế', 'Tổng tiền thanh toán', 'Trạng thái hóa đơn']
  ws.getRow(dongHeader).values = h
  hd.forEach((x, i) => {
    ws.getRow(dongHeader + 1 + i).values = [i + 1, 1, x.kh, x.so, x.ngay, huong === 'vao' ? NCC : MST_GWT, 'X', huong === 'vao' ? MST_GWT : '', 'Y', 0, 0, x.tong, 'Hóa đơn mới']
  })
  ws.getRow(dongHeader + 1 + hd.length).values = ['Tổng cộng', null, null, null, null, null, null, null, null, 0, 0, hd.reduce((s, x) => s + x.tong, 0)]
  return new Uint8Array(await wb.xlsx.writeBuffer())
}

async function fileBia(): Promise<Uint8Array> {
  const wb = new ExcelJS.Workbook(); const ws = wb.addWorksheet('Sheet1')
  ws.addRow(['STT', 'Chứng từ', 'Link', 'NOTE']); ws.addRow([1, 'Hoá đơn đầu ra', { text: 'Link', hyperlink: 'https://example.com/ra' }, 'Phân loại'])
  ws.mergeCells('B5:D5'); ws.getCell('B5').value = 'Other note'; ws.getColumn(4).width = 80
  return new Uint8Array(await wb.xlsx.writeBuffer())
}

const VAO: DongCT[] = [
  { kh: 'C26MAA', so: 21906, ngay: '03/09/2026', tenHang: 'Cước vận chuyển', tien: 287037, tong: 570000 },
  { kh: 'C26MAA', so: 21906, ngay: '03/09/2026', tenHang: 'Cước vận chuyển 2', tien: 240741, tong: 570000 },
  { kh: 'C26MUN', so: 787, ngay: '15/09/2026', tenHang: 'Suất ăn', tien: 569000, tong: 614520 },
]
const RA: DongCT[] = [
  { kh: 'C26TGR', so: 267, ngay: '30/09/2026', tenHang: 'Muối tinh 50kg', tien: 825000, tong: 825000 },
  { kh: 'C26TGR', so: 268, ngay: '30/09/2026', tenHang: 'Bộ lọc GE', tien: 1840278, tong: 2287500 },
  { kh: 'C26TGR', so: 268, ngay: '30/09/2026', tenHang: 'Dịch vụ lắp đặt', tien: 277778, tong: 2287500 },
]
const tomHd = (ds: DongCT[]) => [...new Map(ds.map((d) => [`${d.kh}-${d.so}`, { kh: d.kh, so: d.so, ngay: d.ngay, tong: d.tong }])).values()]

async function doc(buf: Uint8Array) {
  const wb = new ExcelJS.Workbook(); await wb.xlsx.load(Buffer.from(buf) as unknown as Parameters<typeof wb.xlsx.load>[0]); return wb
}
const hang1 = (ws: ExcelJS.Worksheet) => (ws.getRow(1).values as unknown[]).slice(1).map((v) => (v == null ? '' : String(v)))

describe('nhanDienFile', () => {
  it('Chi tiết mua vào: GWT là người mua → vao; gom theo hoá đơn, tổng tiền lấy một lần mỗi HĐ', async () => {
    const f = await nhanDienFile(await fileChiTiet('vao', VAO))
    expect(f).toMatchObject({ loai: 'chi_tiet', huong: 'vao', soDong: 3, thang: ['2026-09'] })
    if (f.loai === 'khac') throw new Error('sai loại')
    expect(f.hoaDon.size).toBe(2)
    expect([...f.hoaDon.values()].reduce((s, x) => s + x, 0)).toBe(570000 + 614520)
  })

  it('Chi tiết bán ra: GWT là người bán → ra', async () => {
    expect(await nhanDienFile(await fileChiTiet('ra', RA))).toMatchObject({ loai: 'chi_tiet', huong: 'ra', soDong: 3 })
  })

  it('Tổng quan: header không ở dòng 1, bỏ dòng Tổng cộng', async () => {
    const f = await nhanDienFile(await fileTongQuan('vao', tomHd(VAO)))
    expect(f).toMatchObject({ loai: 'tong_quan', huong: 'vao' })
    if (f.loai === 'khac') throw new Error('sai loại')
    expect(f.hoaDon.size).toBe(2)
    const ra = await nhanDienFile(await fileTongQuan('ra', tomHd(RA)))
    expect(ra).toMatchObject({ loai: 'tong_quan', huong: 'ra' })
  })

  it('file không phải hoá đơn cổng thuế → khac', async () => {
    expect((await nhanDienFile(await fileBia())).loai).toBe('khac')
  })

  it('không thấy MST GWT ở bên nào → huong null', async () => {
    expect(await nhanDienFile(await fileChiTiet('vao', VAO), '1111111111')).toMatchObject({ loai: 'chi_tiet', huong: null })
  })
})

describe('doiChieuTongQuan', () => {
  it('khớp → không lệch', async () => {
    const ct = await nhanDienFile(await fileChiTiet('ra', RA)), tq = await nhanDienFile(await fileTongQuan('ra', tomHd(RA)))
    if (ct.loai === 'khac' || tq.loai === 'khac') throw new Error('sai loại')
    expect(doiChieuTongQuan(ct, tq)).toEqual([])
  })

  it('thiếu HĐ và lệch tổng tiền → liệt kê', async () => {
    const ct = await nhanDienFile(await fileChiTiet('ra', RA.slice(0, 1)))
    const tq = await nhanDienFile(await fileTongQuan('ra', tomHd(RA)))
    if (ct.loai === 'khac' || tq.loai === 'khac') throw new Error('sai loại')
    const lech = doiChieuTongQuan(ct, tq)
    expect(lech.join('\n')).toMatch(/C26TGR-268/)
    expect(lech.join('\n')).toMatch(/Tổng tiền/)
  })
})

describe('ghepNexia', () => {
  it('ghép thành workbook khuôn NEXIA: bìa + HĐ đầu vào + HĐ Đầu ra (thêm cột khuôn kế toán)', async () => {
    const out = await ghepNexia({ vao: await fileChiTiet('vao', VAO), ra: await fileChiTiet('ra', RA), bia: await fileBia() })
    const wb = await doc(out)
    expect(wb.worksheets.map((w) => w.name)).toEqual(['Sheet1', 'HĐ đầu vào', 'HĐ Đầu ra'])
    const bia = wb.getWorksheet('Sheet1')!
    expect(bia.getCell('B2').value).toBe('Hoá đơn đầu ra')
    expect((bia.getCell('C2').value as ExcelJS.CellHyperlinkValue).hyperlink).toBe('https://example.com/ra')
    expect(bia.getCell('B5').isMerged).toBe(true)
    expect(bia.getColumn(4).width).toBe(80)
    expect(hang1(wb.getWorksheet('HĐ đầu vào')!)).toEqual(H_CT)
    expect(hang1(wb.getWorksheet('HĐ Đầu ra')!)).toEqual([...H_CT, ...COT_KHUON_RA])
    expect(wb.getWorksheet('HĐ đầu vào')!.getColumn(17).width).toBe(55)
    expect(wb.getWorksheet('HĐ Đầu ra')!.rowCount).toBe(1 + RA.length)
  })

  it('không có mẫu bìa → chỉ hai tab hoá đơn', async () => {
    const wb = await doc(await ghepNexia({ vao: await fileChiTiet('vao', VAO), ra: await fileChiTiet('ra', RA), bia: null }))
    expect(wb.worksheets.map((w) => w.name)).toEqual(['HĐ đầu vào', 'HĐ Đầu ra'])
  })

  it('workbook ghép đọc lại được bằng docNexia và xuất _DAXULY điền đúng cột khuôn tab ra', async () => {
    const out = await ghepNexia({ vao: await fileChiTiet('vao', VAO), ra: await fileChiTiet('ra', RA), bia: await fileBia() })
    const f = await docNexia(out)
    expect(f.vao?.dong.map((d) => d.truong.soHd)).toEqual(['21906', '21906', '787'])
    expect(f.ra?.dong.map((d) => d.truong.tenHang)).toEqual(['Muối tinh 50kg', 'Bộ lọc GE', 'Dịch vụ lắp đặt'])
    expect(f.vao?.dong[0].truong.mstMua).toBe(MST_GWT)

    const dx = (rowOrder: number, soHd: string, phan: Partial<DongXuat> = {}): DongXuat => ({
      rowOrder, soHd, raw: [], code: null, codeName: null, tkNo: null, tkCo: null, vat1331: null, note: null, engineConf: 'cao',
      engineKind: 'kmcp', customerCode: null, productGroup: null, channelL1: null, channelL2: null, dealerName: null, nguon: 'nexia', ...phan,
    })
    const xuat = await doc(await dienExcelHoaDon({
      goc: out,
      vao: f.vao!.dong.map((d) => dx(d.rowOrder, d.truong.soHd, { code: 'cp.vanchuyen', codeName: 'CP vận chuyển', tkNo: '6427', tkCo: '331' })),
      ra: f.ra!.dong.map((d) => dx(d.rowOrder, d.truong.soHd, { code: 'MUOI50', productGroup: 'Others', channelL1: 'Direct', customerCode: 'KHL' })),
    }))
    expect(xuat.worksheets.map((w) => w.name)).toEqual(['Sheet1', 'HĐ đầu vào', 'HĐ Đầu ra'])
    const vao = xuat.getWorksheet('HĐ đầu vào')!
    expect(hang1(vao).slice(H_CT.length, H_CT.length + COT_THEM_VAO.length)).toEqual([...COT_THEM_VAO])
    expect(vao.getCell(2, H_CT.length + 1).value).toBe('cp.vanchuyen')
    const ra = xuat.getWorksheet('HĐ Đầu ra')!
    const h = hang1(ra)
    expect(ra.getCell(2, h.indexOf('Mã hàng') + 1).value).toBe('MUOI50')
    expect(ra.getCell(2, h.indexOf('Loại') + 1).value).toBe('Others')
    expect(ra.getCell(2, h.indexOf('Kênh') + 1).value).toBe('Direct')
  })
})

describe('chuanBiThuMuc', () => {
  const thuMuc = async () => [
    { ten: 'Mua vào/0110530659 - Mua vào - Chi tiết - 2026-09-01_2026-09-30.xlsx', buf: await fileChiTiet('vao', VAO) },
    { ten: 'Mua vào/0110530659 - Mua vào - Tổng quan - 2026-09-01_2026-09-30.xlsx', buf: await fileTongQuan('vao', tomHd(VAO)) },
    { ten: 'Bán ra/0110530659 - Bán ra - Chi tiết - 2026-09-01_2026-09-30.xlsx', buf: await fileChiTiet('ra', RA) },
    { ten: 'Bán ra/0110530659 - Bán ra - Tổng quan - 2026-09-01_2026-09-30.xlsx', buf: await fileTongQuan('ra', tomHd(RA)) },
  ]

  it('đủ bộ, khớp Tổng quan → workbook NEXIA + tóm tắt', async () => {
    const kq = await chuanBiThuMuc(await thuMuc(), { ky: '2026-09', bia: null })
    if (!kq.ok) throw new Error(kq.loi.join('; '))
    expect(kq.ky).toBe('2026-09')
    expect(kq.tomTat).toMatchObject({ vao: { soDong: 3, soHd: 2, tong: 570000 + 614520 }, ra: { soDong: 3, soHd: 2 }, doiChieu: 'khop' })
    expect((await docNexia(kq.nexia)).ra?.dong).toHaveLength(3)
  })

  it('không chọn kỳ → lấy kỳ từ ngày lập', async () => {
    const kq = await chuanBiThuMuc(await thuMuc(), { ky: null, bia: null })
    expect(kq.ok && kq.ky).toBe('2026-09')
  })

  it('thiếu file Chi tiết bán ra → chặn, nói rõ thiếu gì', async () => {
    const ds = (await thuMuc()).filter((f) => !f.ten.includes('Bán ra - Chi tiết'))
    const kq = await chuanBiThuMuc(ds, { ky: '2026-09', bia: null })
    expect(kq.ok).toBe(false)
    expect(!kq.ok && kq.loi.join(' ')).toMatch(/Chi tiết.*[Bb]án ra/)
  })

  it('kỳ chọn khác tháng của hoá đơn → chặn', async () => {
    const kq = await chuanBiThuMuc(await thuMuc(), { ky: '2026-08', bia: null })
    expect(!kq.ok && kq.loi.join(' ')).toMatch(/2026-09/)
  })

  it('Tổng quan lệch Chi tiết → chặn trước khi ghi', async () => {
    const ds = await thuMuc()
    ds[3] = { ten: ds[3].ten, buf: await fileTongQuan('ra', [...tomHd(RA), { kh: 'C26TGR', so: 999, ngay: '30/09/2026', tong: 1000 }]) }
    const kq = await chuanBiThuMuc(ds, { ky: '2026-09', bia: null })
    expect(!kq.ok && kq.loi.join(' ')).toMatch(/C26TGR-999/)
  })

  it('không có Tổng quan → vẫn chạy, ghi rõ chưa đối chiếu', async () => {
    const ds = (await thuMuc()).filter((f) => !f.ten.includes('Tổng quan'))
    const kq = await chuanBiThuMuc(ds, { ky: '2026-09', bia: null })
    expect(kq.ok && kq.tomTat.doiChieu).toBe('khong_co_tong_quan')
  })

  it('hai file Chi tiết cùng hướng → chặn', async () => {
    const ds = [{ ten: 'a.xlsx', buf: await fileChiTiet('vao', VAO) }, { ten: 'b.xlsx', buf: await fileChiTiet('vao', VAO) }, { ten: 'c.xlsx', buf: await fileChiTiet('ra', RA) }]
    const kq = await chuanBiThuMuc(ds, { ky: '2026-09', bia: null })
    expect(!kq.ok && kq.loi.join(' ')).toMatch(/hai file Chi tiết mua vào/i)
  })
})
