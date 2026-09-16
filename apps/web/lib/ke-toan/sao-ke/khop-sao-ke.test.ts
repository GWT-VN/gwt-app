import { describe, it, expect } from 'vitest'
import { gomHoaDon, khopSaoKe } from './khop-sao-ke'
import type { HoaDonTom, KhachTom } from './kieu'
const HD: HoaDonTom[] = [
  { id: 1, direction: 'vao', kyHieu: 'C26TXL', soHd: '8121', ten: 'CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ XÂY DỰNG XUÂN LÀNH 01', mst: '0311054784', tongTt: 4659560, thue: 345153, ngay: '2026-08-08', code: 'cp.vattukho', lineIds: [1, 2] },
  { id: 3, direction: 'vao', kyHieu: 'C26TET', soHd: '220', ten: 'CÔNG TY CỔ PHẦN ETON', mst: '0314031746', tongTt: 4605152, thue: 341122, ngay: '2026-08-06', code: 'cp.thuekho', lineIds: [3] },
  { id: 4, direction: 'vao', kyHieu: 'C26MYY', soHd: '5447', ten: 'CÔNG TY CP PHÚC ANH QUỐC', mst: '3002280830', tongTt: 540000, thue: 40000, ngay: '2026-08-14', code: 'cp.tiepkhach', lineIds: [4] },
  { id: 5, direction: 'vao', kyHieu: 'C26MYY', soHd: '5489', ten: 'CÔNG TY CP PHÚC ANH QUỐC', mst: '3002280830', tongTt: 540000, thue: 40000, ngay: '2026-08-15', code: 'cp.tiepkhach', lineIds: [5] },
  { id: 9, direction: 'ra', kyHieu: 'C26TGR', soHd: '207', ten: 'Nam Hai Le', mst: null, tongTt: 16957500, thue: 1256111, ngay: '2026-08-28', code: 'CTD50NG', lineIds: [9] },
  { id: 10, direction: 'ra', kyHieu: 'C26TGR', soHd: '210', ten: 'Phạm Thị Thanh Thuý', mst: null, tongTt: 16957500, thue: 1256111, ngay: '2026-08-28', code: 'CTD50NG', lineIds: [10] },
  { id: 11, direction: 'ra', kyHieu: 'C26TGR', soHd: '202', ten: 'CÔNG TY TNHH CLEAN WATER SOLUTIONS', mst: '0314937308', tongTt: 21665000, thue: 1604815, ngay: '2026-08-25', code: 'CTD50NG', lineIds: [11] },
]
const KH: KhachTom[] = [{ customerCode: 'KH0001', ten: 'Lê Nam Hải', sdt: '0900000001' }]
describe('khopSaoKe — chi', () => {
  it('đúng tiền + tên NCC trong nội dung → chắc', () => {
    const k = khopSaoKe({ chieu: 'chi', soTien: 4659560, noiDung: 'GWT thanh toan vat tu Xuan Lanh 0508 0608', tenDoiUng: null }, HD, KH, [])
    expect(k.chac).toMatchObject({ hoaDonId: 1, soHd: '8121' }); expect(k.chac!.canCu).toMatch(/tên/)
  })
  it('đúng tiền nhưng không tín hiệu → gợi ý 1, không chắc', () => {
    const k = khopSaoKe({ chieu: 'chi', soTien: 4605152, noiDung: 'IBBIZ thanh toan', tenDoiUng: null }, HD, KH, [])
    expect(k.chac).toBeNull(); expect(k.goiY.map((g) => g.soHd)).toEqual(['220'])
  })
  it('hai HĐ cùng tiền cùng NCC → không chắc, 2 gợi ý; số HĐ trong nội dung phân định → chắc', () => {
    expect(khopSaoKe({ chieu: 'chi', soTien: 540000, noiDung: 'GWT thanh toan Phuc Anh Quoc', tenDoiUng: null }, HD, KH, []).goiY).toHaveLength(2)
    expect(khopSaoKe({ chieu: 'chi', soTien: 540000, noiDung: 'GWT thanh toan Phuc Anh Quoc HD 5489', tenDoiUng: null }, HD, KH, []).chac?.soHd).toBe('5489')
  })
  it('không đúng tiền → gợi ý HĐ cùng NCC theo chênh lệch', () => {
    const k = khopSaoKe({ chieu: 'chi', soTien: 4600000, noiDung: 'GWT thanh toan ETON van hanh kho', tenDoiUng: null }, HD, KH, [])
    expect(k.chac).toBeNull(); expect(k.goiY[0]?.soHd).toBe('220')
  })
})
describe('khopSaoKe — thu', () => {
  it('SĐT → khách → HĐ ra cùng tên, đúng tiền, dù 2 HĐ cùng tiền → chắc HĐ 207', () => {
    const k = khopSaoKe({ chieu: 'thu', soTien: 16957500, noiDung: 'LE NAM HAI 0900000001 may CTD50', tenDoiUng: 'LE NAM HAI' }, HD, KH, [])
    expect(k.sdt).toBe('0900000001'); expect(k.khach?.customerCode).toBe('KH0001'); expect(k.chac?.soHd).toBe('207'); expect(k.chac!.canCu).toMatch(/SĐT/)
  })
  it('tên công ty ở tài khoản đối ứng → chắc', () =>
    expect(khopSaoKe({ chieu: 'thu', soTien: 21665000, noiDung: 'thanh toan tien may', tenDoiUng: 'CONG TY TNHH CLEAN WATER SOLUTIONS' }, HD, KH, []).chac?.soHd).toBe('202'))
  it('không tín hiệu, 2 HĐ cùng tiền → 2 gợi ý; đơn Sales cùng khách nối vào gợi ý', () => {
    const k = khopSaoKe({ chieu: 'thu', soTien: 16957500, noiDung: 'CK', tenDoiUng: null }, HD, KH, [{ orderCode: 'SO-1', tenKhach: 'Nam Hai Le', tongTt: 16957500, ngay: '2026-08-20' }])
    expect(k.chac).toBeNull(); expect(k.goiY.map((g) => g.soHd)).toEqual(['207', '210'])
  })
})
describe('gomHoaDon', () => {
  it('gom theo số HĐ, code chung nếu đồng nhất, bỏ dòng missing', () => {
    const g = gomHoaDon([
      { id: 1, direction: 'vao', ky_hieu: 'A', so_hd: '1', ten_ban: 'X', ten_mua: null, mst_ban: '1', mst_mua: null, tong_thanh_toan: 100, tien_thue: 8, ngay_lap: '2026-08-02', code: 'cp.qc', missing_in_last_upload: false },
      { id: 2, direction: 'vao', ky_hieu: 'A', so_hd: '1', ten_ban: 'X', ten_mua: null, mst_ban: '1', mst_mua: null, tong_thanh_toan: 50, tien_thue: 4, ngay_lap: '2026-08-01', code: 'cp.vattukho', missing_in_last_upload: false },
      { id: 3, direction: 'vao', ky_hieu: 'A', so_hd: '2', ten_ban: 'Y', ten_mua: null, mst_ban: '2', mst_mua: null, tong_thanh_toan: 7, tien_thue: 0, ngay_lap: null, code: null, missing_in_last_upload: true },
    ])
    expect(g).toEqual([{ id: 1, direction: 'vao', kyHieu: 'A', soHd: '1', ten: 'X', mst: '1', tongTt: 150, thue: 12, ngay: '2026-08-01', code: null, lineIds: [1, 2] }])
  })
})
