import { describe, expect, it } from 'vitest'
import { demDoiTrangThai, docDanhMuc, docGanTicket, trangThaiSauNhap } from './danhMucNhap'
import type { TrangThaiLoi } from './kieu'

const NHOM = new Set(['ro_nuoc', 'loi_dien'])

describe('lib/loi/danhMucNhap — đọc Sheet "Danh mục lỗi" đã duyệt', () => {
  it('đọc đủ cột, tách danh sách, hiểu cột Duyệt', () => {
    const r = docDanhMuc([{
      'Mã': 'cts20-ro-nuoc-day', 'Nhóm': 'ro_nuoc', 'Tên chuẩn': 'Rò nước đáy',
      'Các cách ghi': 'rò nước đáy; chảy nước dưới đáy\nrò nước đáy', 'Mã máy áp dụng': 'CTS20%',
      'Dấu hiệu': 'Nước đọng dưới đáy', 'Phương án xử lý chuẩn': 'Thay gioăng van xả', 'Nguồn': 'Sheet 261026', 'Duyệt': 'X',
    }], NHOM)
    expect(r.loi).toEqual([])
    expect(r.hopLe[0]).toMatchObject({
      code: 'CTS20-RO-NUOC-DAY', nhom: 'ro_nuoc', ten: 'Rò nước đáy',
      aliases: ['rò nước đáy', 'chảy nước dưới đáy'], ma_may: ['CTS20%'], trang_thai: 'da_duyet', thu_tu: 10,
    })
  })
  it('báo lỗi theo số dòng Sheet: thiếu tên, mã sai, nhóm lạ, trùng mã', () => {
    const r = docDanhMuc([
      { 'Mã': 'A1', 'Tên chuẩn': '' },
      { 'Mã': 'sai mã!', 'Tên chuẩn': 'x' },
      { 'Mã': 'B1', 'Tên chuẩn': 'x', 'Nhóm': 'khong_co' },
      { 'Mã': 'C1', 'Tên chuẩn': 'x' }, { 'Mã': 'C1', 'Tên chuẩn': 'y' },
    ], NHOM)
    expect(r.loi.map((l) => l.dong)).toEqual([2, 3, 4, 6])
    expect(r.hopLe.map((d) => d.code)).toEqual(['C1'])
  })
  it('Mã máy áp dụng không có % thì thêm % cuối (khớp tiền tố)', () => {
    expect(docDanhMuc([{ 'Mã': 'E5', 'Tên chuẩn': 'Lỗi E5', 'Mã máy áp dụng': 'GTUN-8600HP-G' }], NHOM).hopLe[0].ma_may).toEqual(['GTUN-8600HP-G%'])
  })
  it('không cho ghi đè mã hệ thống CHUA_PHAN_LOAI', () => {
    expect(docDanhMuc([{ 'Mã': 'CHUA_PHAN_LOAI', 'Tên chuẩn': 'x' }], NHOM).loi[0].loi).toMatch(/hệ thống/)
  })
  it('cột Duyệt: trống → chờ duyệt, ngừng/bỏ → ngưng, "Đã duyệt" → đã duyệt', () => {
    const r = docDanhMuc([
      { 'Mã': 'A1', 'Tên chuẩn': 'a', 'Duyệt': '' },
      { 'Mã': 'A2', 'Tên chuẩn': 'b', 'Duyệt': 'Ngừng' },
      { 'Mã': 'A3', 'Tên chuẩn': 'c', 'Duyệt': 'Đã duyệt' },
      { 'Mã': 'A4', 'Tên chuẩn': 'd', 'Duyệt': 'Bỏ' },
    ], NHOM)
    expect(r.hopLe.map((d) => d.trang_thai)).toEqual(['cho_duyet', 'ngung', 'da_duyet', 'ngung'])
  })
})

describe('docGanTicket', () => {
  it('chỉ lấy dòng đã duyệt, mã lỗi phải có trong danh mục', () => {
    const r = docGanTicket([
      { 'Mã ticket': 'TK-2610-001', 'Mã lỗi': 'cts20-ro-nuoc-day', 'Duyệt': 'có' },
      { 'Mã ticket': 'TK-2610-002', 'Mã lỗi': 'KHONG-CO', 'Duyệt': 'x' },
      { 'Mã ticket': 'TK-2610-003', 'Mã lỗi': 'CTS20-RO-NUOC-DAY', 'Duyệt': '' },
    ], new Set(['CTS20-RO-NUOC-DAY']))
    expect(r.hopLe).toEqual([{ ticket_code: 'TK-2610-001', loi_code: 'CTS20-RO-NUOC-DAY' }])
    expect(r.loi).toEqual([{ dong: 3, loi: 'Mã lỗi "KHONG-CO" không có trong danh mục.' }])
  })
})

describe('mã máy áp dụng — ký tự đặc biệt của LIKE', () => {
  it('"_" và "\\" được thoát (khớp đúng ký tự), "%" do người dùng gõ giữ làm ký tự đại diện', () => {
    const r = docDanhMuc([{ 'Mã': 'E6', 'Tên chuẩn': 'x', 'Mã máy áp dụng': 'AB_C%; AB_C' }], NHOM)
    expect(r.hopLe[0].ma_may).toEqual(['AB\\_C%'])
  })
})

describe('I3: cách ghi phải từ 3 ký tự', () => {
  it('Sheet: alias ngắn -> lỗi kèm số dòng, mã không vào', () => {
    const r = docDanhMuc([
      { 'Mã': 'A1', 'Tên chuẩn': 'Lỗi A', 'Các cách ghi': 'rò nước; E5' },
      { 'Mã': 'B1', 'Tên chuẩn': 'Lỗi B', 'Các cách ghi': ' ab ;rò rỉ' },
      { 'Mã': 'C1', 'Tên chuẩn': 'Lỗi C', 'Các cách ghi': 'abc' },
    ], NHOM)
    expect(r.loi.map((l) => l.dong)).toEqual([2, 3])
    expect(r.loi[0].loi).toContain('E5')
    expect(r.hopLe.map((d) => d.code)).toEqual(['C1'])
  })
})

describe('I2: đếm mã sẽ đổi trạng thái khi nhập', () => {
  it('chỉ đếm mã đã có mà trạng thái thật sự đổi; cho_duyet không hạ cấp mục đã có', () => {
    const coSan = new Map<string, TrangThaiLoi>([['A1', 'da_duyet'], ['B1', 'cho_duyet'], ['C1', 'da_duyet'], ['D1', 'ngung']])
    const moi = [
      { code: 'A1', trang_thai: 'cho_duyet' as const },  // giữ da_duyet -> không đổi
      { code: 'B1', trang_thai: 'da_duyet' as const },   // đổi
      { code: 'C1', trang_thai: 'ngung' as const },      // đổi
      { code: 'D1', trang_thai: 'cho_duyet' as const },  // giữ ngung
      { code: 'E1', trang_thai: 'da_duyet' as const },   // mã mới, không tính
    ]
    expect(demDoiTrangThai(moi, coSan)).toBe(2)
    expect(trangThaiSauNhap('da_duyet', 'cho_duyet')).toBe('da_duyet')
    expect(trangThaiSauNhap(undefined, 'cho_duyet')).toBe('cho_duyet')
    expect(trangThaiSauNhap('da_duyet', 'ngung')).toBe('ngung')
  })
})
