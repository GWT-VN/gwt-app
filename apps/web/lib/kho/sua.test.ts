import { describe, expect, it } from 'vitest'
import { chuanHoaKiemKe, chuanHoaSua, chuanTen, docSo, moTaDoi, nhanHanhDong, nhanNguon, thayDoiSua } from './sua'

describe('chuanTen — khớp ĐÚNG bot (gwt-discord-bot/shopee/kho-nx-doc.mjs), khoá wh_alias.raw_norm', () => {
  // Kết quả lấy bằng cách chạy THẬT hàm gốc của bot ngày 04/11/2026:
  //   node --input-type=module -e "import {chuanTen} from './kho-nx-doc.mjs'; console.log(chuanTen('…'))"
  // Bot đổi hàm thì chạy lại và sửa cả hai nơi.
  const MAU: [unknown, string][] = [
    ['Lõi lọc RO số 3', 'loi loc ro so 3'],
    ['ĐÈN UV  Philips (11W)', 'den uv philips 11w'],
    ['  Vòi  nước—nóng/lạnh ', 'voi nuoc nong lanh'],
    ['Cút nối 1/2" ĐỒNG', 'cut noi 1 2 dong'],
    [null, ''],
    ['Màng RO 75GPD - Dow', 'mang ro 75gpd dow'],
    ['Bộ nguồn 24V-2A', 'bo nguon 24v 2a'],
    ['Ống dây 6mm  x2', 'ong day 6mm x2'],
  ]
  for (const [vao, ra] of MAU) it(`${JSON.stringify(vao)} → "${ra}"`, () => expect(chuanTen(vao)).toBe(ra))
})

describe('chuanHoaSua — kiểm sớm gói sửa trước khi gọi wh_sua_dong', () => {
  it('chuẩn hoá: mã viết hoa, chuỗi trim, SL "2,5" → 2.5, bỏ khoá lạ', () => {
    expect(chuanHoaSua({ internal_code: ' abc ', qty: '2,5', purpose: ' cho anh A ', la: 1 })).toEqual({ internal_code: 'ABC', qty: 2.5, purpose: 'cho anh A' })
  })
  it('xoá lý do / ghi chú = chuỗi rỗng (DB đổi thành null)', () => {
    expect(chuanHoaSua({ note: '  ' })).toEqual({ note: '' })
  })
  it('báo lỗi: ngày sai, loại lạ, mã trống, SL 0 / chữ, Nhập âm, gói rỗng', () => {
    expect(() => chuanHoaSua({ ngay: '2026-02-30' })).toThrow(/Ngày không hợp lệ/)
    expect(() => chuanHoaSua({ ngay: '04/11/2026' })).toThrow(/Ngày không hợp lệ/)
    expect(() => chuanHoaSua({ loai: 'Chuyển' })).toThrow(/Loại phải là/)
    expect(() => chuanHoaSua({ internal_code: ' ' })).toThrow(/Mã không được để trống/)
    expect(() => chuanHoaSua({ qty: '0' })).toThrow(/Số lượng không hợp lệ/)
    expect(() => chuanHoaSua({ qty: 'năm' })).toThrow(/Số lượng không hợp lệ/)
    expect(() => chuanHoaSua({ loai: 'Nhập', qty: -2 })).toThrow(/số lượng dương/)
    expect(() => chuanHoaSua({})).toThrow(/Chưa đổi gì/)
  })
  it('Điều chỉnh được phép âm', () => {
    expect(chuanHoaSua({ loai: 'Điều chỉnh', qty: '-3', ngay: '2026-11-04' })).toEqual({ loai: 'Điều chỉnh', qty: -3, ngay: '2026-11-04' })
  })
})

describe('thayDoiSua — chỉ gửi trường THẬT SỰ đổi', () => {
  const goc = { ngay: '2026-11-03', loai: 'Xuất', internal_code: 'ABC', qty: 2, purpose: 'cho anh A', note: null }
  const form = { ngay: '2026-11-03', loai: 'Xuất', internal_code: 'ABC', qty: '2', purpose: 'cho anh A ', note: '' }
  it('không đổi gì → rỗng (kể cả khoảng trắng thừa, mã khác hoa/thường, "2" vs 2)', () => {
    expect(thayDoiSua(goc, { ...form, internal_code: 'abc' })).toEqual({})
  })
  it('đổi SL + ghi chú + mã cho dòng chưa có mã', () => {
    expect(thayDoiSua(goc, { ...form, qty: '3', note: 'x' })).toEqual({ qty: '3', note: 'x' })
    expect(thayDoiSua({ ...goc, internal_code: null }, { ...form, internal_code: 'XYZ' })).toEqual({ internal_code: 'XYZ' })
  })
})

describe('chuanHoaKiemKe', () => {
  it('bỏ ô trống, số ≥ 0, mã viết hoa', () => {
    expect(chuanHoaKiemKe([{ internal_code: 'a', so_dem: '0' }, { internal_code: 'b', so_dem: '' }, { internal_code: 'c', so_dem: '1,5' }]))
      .toEqual([{ internal_code: 'A', so_dem: 0 }, { internal_code: 'C', so_dem: 1.5 }])
  })
  it('lỗi: số âm / chữ, trùng mã, không điền gì', () => {
    expect(() => chuanHoaKiemKe([{ internal_code: 'A', so_dem: '-1' }])).toThrow(/Số đếm của A/)
    expect(() => chuanHoaKiemKe([{ internal_code: 'A', so_dem: 'x' }])).toThrow(/Số đếm của A/)
    expect(() => chuanHoaKiemKe([{ internal_code: 'a', so_dem: 1 }, { internal_code: 'A', so_dem: 2 }])).toThrow(/hai lần/)
    expect(() => chuanHoaKiemKe([{ internal_code: 'A', so_dem: ' ' }])).toThrow(/Chưa điền/)
  })
})

describe('moTaDoi — trước → sau dạng chữ cho trang Lịch sử sửa', () => {
  it('sửa: theo thứ tự ngày, loại, mã, SL…; số kiểu VN; ngày dd/mm/yyyy; trống', () => {
    expect(moTaDoi({ qty: 3, ngay: '2026-11-03', note: null }, { qty: 5, ngay: '2026-11-04', note: 'giao gấp' }))
      .toEqual(['Ngày: 03/11/2026 → 04/11/2026', 'SL: 3 → 5', 'Ghi chú: (trống) → giao gấp'])
    expect(moTaDoi({ qty: '1500.5' }, { qty: '2000' })).toEqual(['SL: 1.500,5 → 2.000'])
  })
  it('huỷ / duyệt: trạng thái ra nhãn; nhớ tên', () => {
    expect(moTaDoi({ trang_thai: 'approved' }, { trang_thai: 'rejected' })).toEqual(['Trạng thái: đã vào sổ → bỏ qua'])
    expect(moTaDoi({ internal_code: null, trang_thai: 'need_review' }, { internal_code: 'ABC', trang_thai: 'approved', nho_ten: 'loi loc' }))
      .toEqual(['Mã: (trống) → ABC', 'Trạng thái: chờ duyệt mã → đã vào sổ', 'Nhớ tên “loi loc” cho lần sau'])
    expect(moTaDoi({}, { nho_ten: '' })).toEqual([])
  })
  it('kiểm kê: mã giống hai phía thì không nhắc; tồn / đếm / chênh có dấu', () => {
    expect(moTaDoi({ internal_code: 'A', ton: 5 }, { internal_code: 'A', so_dem: 4, chenh: -1 })).toEqual(['Tồn sổ: 5', 'Đếm: 4', 'Chênh: -1'])
    expect(moTaDoi({ internal_code: 'A', ton: 1 }, { internal_code: 'A', so_dem: 3, chenh: 2 })).toContain('Chênh: +2')
  })
  it('null an toàn', () => expect(moTaDoi(null, undefined)).toEqual([]))
})

describe('nhãn', () => {
  it('hành động + nguồn', () => {
    expect(nhanHanhDong('kiem_ke')).toBe('Kiểm kê')
    expect(nhanNguon('sheet')).toBe('Google Sheet')
    expect(nhanNguon(null)).toBe('—')
    expect(docSo('')).toBeNull()
  })
})
