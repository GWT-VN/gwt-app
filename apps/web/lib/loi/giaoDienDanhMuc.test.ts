import { describe, expect, it, vi } from 'vitest'
import {
  apDungPhanLoai, chayNhap, chayThuPhanLoai, chayXemTruoc, dongBaoCao, duocNhap, formTuLoi, loiTuForm,
  nhanDoiTrangThai, nhanNutNhap, tomTatDanhSach, tomTatXemTruoc, TOI_DA_LOI_HIEN, XAC_NHAN_PHAN_LOAI_LAI, type XemTruoc,
} from './giaoDienDanhMuc'

const xt = (loi: { dong: number; loi: string }[] = []): Extract<XemTruoc, { ok: true }> => ({
  ok: true,
  danhMuc: { hopLe: [
    { code: 'A1', ten: 'A', nhom: null, trang_thai: 'da_duyet' },
    { code: 'B2', ten: 'B', nhom: null, trang_thai: 'cho_duyet' },
  ], loi },
  ganTicket: { hopLe: [{}, {}, {}], loi: [] }, soDongSeDoi: 7,
})

describe('helper bảng', () => {
  it('tóm tắt tối đa 3 + n', () => {
    expect(tomTatDanhSach(['a', 'b'])).toBe('a, b')
    expect(tomTatDanhSach(['a', 'b', 'c', 'd', 'e'])).toBe('a, b, c +2')
  })
  it('form <-> lỗi: textarea một dòng một mục', () => {
    const f = { ...formTuLoi({ code: 'X1', nhom: null, ten: 'T', aliases: ['a', 'b'], ma_may: [], dau_hieu: null, huong_xu_ly: null, nguon: null, trang_thai: 'cho_duyet', duyet_boi: null, duyet_luc: null, thu_tu: 10 }), aliases: 'a\n\n b \na' }
    expect(loiTuForm(f)).toMatchObject({ aliases: ['a', 'b'], nhom: null, thu_tu: 10 })
  })
})

describe('nhập từ Sheet: xem trước -> xác nhận', () => {
  it('tóm tắt đếm đúng, báo số dòng máy sẽ đổi', () => {
    const t = tomTatXemTruoc(xt())
    expect(t).toMatchObject({ daDuyet: 1, choDuyet: 1, soGan: 3, soDongSeDoi: 7, coLoi: false })
    expect(duocNhap(t)).toBe(true)
  })
  it('lỗi hiện kèm số dòng Sheet và chặn nhập', async () => {
    const nhap = vi.fn()
    const r = await chayXemTruoc(new FormData(), async () => xt([{ dong: 5, loi: 'Thiếu "Tên chuẩn".' }]))
    if (!('tomTat' in r)) throw new Error('mong có tóm tắt')
    expect(r.tomTat.loi[0]).toContain('dòng 5')
    expect(duocNhap(r.tomTat)).toBe(false)
    expect(await chayNhap(new FormData(), r.tomTat, nhap)).toHaveProperty('loi')
    expect(nhap).not.toHaveBeenCalled()
  })
  it('xem trước lỗi server trả thông báo', async () => {
    expect(await chayXemTruoc(new FormData(), async () => ({ ok: false, error: 'Chưa chọn file' }))).toEqual({ loi: 'Chưa chọn file' })
  })
  it('xác nhận gọi nhập và báo số thật', async () => {
    const nhap = vi.fn().mockResolvedValue({ ok: true, so_loi: 2, so_gan: 3 })
    const r = await chayNhap(new FormData(), tomTatXemTruoc(xt()), nhap)
    expect(nhap).toHaveBeenCalledOnce()
    expect(r).toEqual({ thongBao: 'Đã nhập 2 mã lỗi, gán 3 ticket.' })
  })
  it('chưa xem trước thì không nhập', async () => {
    const nhap = vi.fn()
    expect(await chayNhap(new FormData(), null, nhap)).toHaveProperty('loi')
    expect(nhap).not.toHaveBeenCalled()
  })
})

describe('hiển thị xem trước', () => {
  it('giới hạn 50 lỗi, phần dư gom +n', () => {
    const loi = Array.from({ length: 53 }, (_, i) => ({ dong: i + 2, loi: 'x' }))
    const t = tomTatXemTruoc(xt(loi))
    expect(TOI_DA_LOI_HIEN).toBe(50)
    expect(t.loi).toHaveLength(50)
    expect(t.soLoiKhac).toBe(3)
    expect(t.coLoi).toBe(true)
  })
  it('nhãn nút nhập có số dòng máy bị ghi đè', () => {
    expect(nhanNutNhap(tomTatXemTruoc(xt()))).toBe('Nhập 2 mã + gán 3 ticket · ghi đè 7 dòng máy')
  })
})

describe('phân loại lại: chạy thử -> áp dụng', () => {
  it('báo cáo liệt kê chỉ số và số theo mã', () => {
    const d = dongBaoCao({ so_ticket_chua_co_dong: 4, phan_loai_lai: 2, se_tao_chua_phan_loai: 1, theo_ma: { A1: 3 } })
    expect(d.map((x) => x.gia)).toEqual(['4', '2', '1', '3'])
  })
  it('chạy thử gọi với true; áp dụng cần chạy thử + xác nhận', async () => {
    const chay = vi.fn().mockResolvedValue({ ok: true, baoCao: { phan_loai_lai: 2 } })
    expect(await chayThuPhanLoai(chay)).toHaveProperty('baoCao')
    expect(chay).toHaveBeenLastCalledWith(true)
    expect(await apDungPhanLoai(false, () => true, chay)).toHaveProperty('loi')
    const tuChoi = vi.fn().mockReturnValue(false)
    expect(await apDungPhanLoai(true, tuChoi, chay)).toEqual({ huy: true })
    expect(tuChoi).toHaveBeenCalledWith(XAC_NHAN_PHAN_LOAI_LAI)
    expect(chay).toHaveBeenCalledTimes(1)
    expect(await apDungPhanLoai(true, () => true, chay)).toHaveProperty('thongBao')
    expect(chay).toHaveBeenLastCalledWith(false)
  })
})

describe('I2: xem trước báo số mã sẽ đổi trạng thái', () => {
  it('tóm tắt mang soDoiTrangThai và câu "N mã sẽ đổi trạng thái"', () => {
    const t = tomTatXemTruoc({ ...xt(), soDoiTrangThai: 2 })
    expect(t.soDoiTrangThai).toBe(2)
    expect(nhanDoiTrangThai(t)).toBe('2 mã sẽ đổi trạng thái')
    expect(nhanDoiTrangThai(tomTatXemTruoc({ ...xt(), soDoiTrangThai: 0 }))).toBe('')
  })
})

describe('M1: Mã máy áp dụng — form hiện dạng người gõ, lưu lại không thoát hai lần', () => {
  it('formTuLoi bỏ thoát \\_ và \\\\', () => {
    const f = formTuLoi({ code: 'X1', nhom: null, ten: 'T', aliases: [], ma_may: ['T\\_X%', 'CTS20%'], dau_hieu: null, huong_xu_ly: null, nguon: null, trang_thai: 'cho_duyet', duyet_boi: null, duyet_luc: null, thu_tu: 1 })
    expect(f.ma_may).toBe('T_X%\nCTS20%')
  })
})
