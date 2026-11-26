import { describe, expect, test } from 'vitest'
import { apLoc, docDieuKien, docTatCa, ghiDieuKien, laRong, nhanChip, PHEP_MAC_DINH, TOI, type TruongDuLieu } from './locTruong'

type Dong = { tt: string; cs: string | null; han: string | null; khach: string | null }
const TRUONG: TruongDuLieu<Dong>[] = [
  { id: 'tt', kieu: 'chon', lay: (d) => d.tt },
  { id: 'cs', kieu: 'nguoi', lay: (d) => d.cs },
  { id: 'han', kieu: 'ngay', lay: (d) => d.han },
  { id: 'khach', kieu: 'chu', lay: (d) => d.khach },
]
const D: Dong[] = [
  { tt: 'Open', cs: 'Lan', han: '2026-11-20', khach: 'Công ty Đông Á' },
  { tt: 'Done', cs: 'Mai', han: '2026-11-26', khach: 'Anh Khoa' },
  { tt: 'Open', cs: null, han: null, khach: null },
]
const ma = (r: Dong[]) => r.map((d) => D.indexOf(d))

describe('đọc/ghi URL', () => {
  test('chọn/người: không tiền tố = "là" (tương thích `tt=Open,Done` cũ)', () => {
    expect(docDieuKien('Open,Done', 'chon')).toEqual({ phep: 'la', giaTri: ['Open', 'Done'] })
    expect(ghiDieuKien({ phep: 'la', giaTri: ['Open', 'Done'] }, 'chon')).toBe('Open,Done')
    expect(docDieuKien('khong-la~Open', 'chon')).toEqual({ phep: 'khong-la', giaTri: ['Open'] })
    expect(ghiDieuKien({ phep: 'trong', giaTri: [] }, 'chon')).toBe('trong~')
    expect(docDieuKien('co~', 'chon')).toEqual({ phep: 'co', giaTri: [] })
  })
  test('phép không hợp kiểu → cả chuỗi là giá trị của phép mặc định; rỗng → null', () => {
    expect(docDieuKien('trong~', 'nguoi')).toEqual({ phep: 'la', giaTri: ['trong~'] })
    expect(docDieuKien('', 'chon')).toBeNull()
    expect(docDieuKien('khong-la~', 'chon')).toBeNull()
    expect(docDieuKien(undefined, 'chon')).toBeNull()
  })
  test('ngày: hôm nay / khoảng (đảo nếu ngược) / trước / sau; ngày sai dạng bỏ', () => {
    expect(docDieuKien('hom-nay~', 'ngay')).toEqual({ phep: 'hom-nay', giaTri: [] })
    expect(docDieuKien('khoang~2026-11-20..2026-11-01', 'ngay')).toEqual({ phep: 'khoang', giaTri: ['2026-11-01', '2026-11-20'] })
    expect(docDieuKien('truoc~20/11/2026', 'ngay')).toBeNull()
    expect(ghiDieuKien({ phep: 'khoang', giaTri: ['2026-11-01', '2026-11-20'] }, 'ngay')).toBe('khoang~2026-11-01..2026-11-20')
    expect(ghiDieuKien({ phep: 'sau', giaTri: ['2026-11-01'] }, 'ngay')).toBe('sau~2026-11-01')
  })
  test('chữ: luôn ghi tiền tố, giữ nguyên dấu phẩy/dấu ~ trong chữ', () => {
    expect(ghiDieuKien({ phep: 'chua', giaTri: ['a, b~c'] }, 'chu')).toBe('chua~a, b~c')
    expect(docDieuKien('chua~a, b~c', 'chu')).toEqual({ phep: 'chua', giaTri: ['a, b~c'] })
    expect(docDieuKien('  ', 'chu')).toBeNull()
  })
  test('docTatCa đọc cả URLSearchParams lẫn searchParams của Server Component', () => {
    const k = [{ truong: 'tt', phep: 'la', giaTri: ['Open'] }]
    expect(docTatCa(new URLSearchParams('tt=Open&x=1'), TRUONG)).toEqual(k)
    expect(docTatCa({ tt: ['Open', 'Done'], cs: undefined }, TRUONG)).toEqual(k)
  })
  test('laRong + phép mặc định là phép đầu CẦN giá trị (chọn trường không tự áp)', () => {
    expect(laRong({ phep: 'la', giaTri: [] })).toBe(true)
    expect(laRong({ phep: 'trong', giaTri: [] })).toBe(false)
    expect(laRong({ phep: 'chua', giaTri: [' '] })).toBe(true)
    expect(laRong({ phep: 'khoang', giaTri: ['2026-11-01'] })).toBe(true)
    expect(PHEP_MAC_DINH).toEqual({ chon: 'la', nguoi: 'la', ngay: 'khoang', chu: 'chua' })
  })
})

describe('áp lên dòng', () => {
  const ap = (url: string) => ma(apLoc(D, docTatCa(new URLSearchParams(url), TRUONG), TRUONG, { toi: 'Lan', homNay: new Date(2026, 10, 26, 9) }))
  test('chọn: là / không là / trống / có', () => {
    expect(ap('tt=Open')).toEqual([0, 2])
    expect(ap('tt=khong-la~Open')).toEqual([1])
    expect(ap('cs=Mai,Lan')).toEqual([0, 1])
  })
  test('người: "Tôi" = người đang đăng nhập', () => {
    expect(ap(`cs=${TOI}`)).toEqual([0])
    expect(ap(`cs=khong-la~${TOI}`)).toEqual([1, 2])
  })
  test('ngày: hôm nay / khoảng (gồm 2 đầu) / trước (<) / từ (≥) / trống; dòng không có ngày không khớp', () => {
    expect(ap('han=hom-nay~')).toEqual([1])
    expect(ap('han=khoang~2026-11-20..2026-11-26')).toEqual([0, 1])
    expect(ap('han=truoc~2026-11-26')).toEqual([0])
    expect(ap('han=sau~2026-11-26')).toEqual([1])
    expect(ap('han=trong~')).toEqual([2])
  })
  test('ngày dạng timestamp UTC đổi sang ngày giờ máy', () => {
    const r = [{ tt: '', cs: null, han: new Date(2026, 10, 26, 6).toISOString(), khach: null }]
    expect(apLoc(r, [{ truong: 'han', phep: 'hom-nay', giaTri: [] }], TRUONG, { homNay: new Date(2026, 10, 26, 23) })).toHaveLength(1)
  })
  test('chữ: chứa / không chứa, khớp không dấu, ô trống coi như chuỗi rỗng', () => {
    expect(ap('khach=chua~dong a')).toEqual([0])
    expect(ap('khach=khong-chua~DONG')).toEqual([1, 2])
  })
  test('nhiều điều kiện = VÀ', () => {
    expect(ap('tt=Open&cs=Lan')).toEqual([0])
  })
})

describe('nhãn chip (gọn kiểu Twenty)', () => {
  const ten = (g: string) => ({ Open: 'Đang mở', Done: 'Đã xong' })[g] ?? g
  test('là / không là / trống / có', () => {
    expect(nhanChip({ phep: 'la', giaTri: ['Open', 'Done'] }, 'Trạng thái', ten)).toEqual({ truoc: 'Trạng thái:', giaTri: 'Đang mở, Đã xong' })
    expect(nhanChip({ phep: 'khong-la', giaTri: ['Open'] }, 'Trạng thái', ten)).toEqual({ truoc: 'Trạng thái: Không', giaTri: 'Đang mở' })
    expect(nhanChip({ phep: 'trong', giaTri: [] }, 'Tỉnh/TP', ten).giaTri).toBe('Trống')
    expect(nhanChip({ phep: 'co', giaTri: [] }, 'Tỉnh/TP', ten).giaTri).toBe('Có giá trị')
  })
  test('> 3 giá trị → "N lựa chọn"; "Tôi"', () => {
    expect(nhanChip({ phep: 'la', giaTri: ['a', 'b', 'c', 'd'] }, 'Loại', ten).giaTri).toBe('4 lựa chọn')
    expect(nhanChip({ phep: 'la', giaTri: ['a', 'b', 'c'] }, 'Loại', ten).giaTri).toBe('a, b, c')
    expect(nhanChip({ phep: 'la', giaTri: [TOI] }, 'Phụ trách', ten).giaTri).toBe('Tôi')
  })
  test('ngày + chữ', () => {
    expect(nhanChip({ phep: 'truoc', giaTri: ['2026-11-20'] }, 'Hạn', ten)).toEqual({ truoc: 'Hạn <', giaTri: '20/11/2026' })
    expect(nhanChip({ phep: 'sau', giaTri: ['2026-11-20'] }, 'Hạn', ten)).toEqual({ truoc: 'Hạn ≥', giaTri: '20/11/2026' })
    expect(nhanChip({ phep: 'khoang', giaTri: ['2026-11-01', '2026-11-20'] }, 'Hạn', ten).giaTri).toBe('01/11/2026 – 20/11/2026')
    expect(nhanChip({ phep: 'hom-nay', giaTri: [] }, 'Hạn', ten).giaTri).toBe('Hôm nay')
    expect(nhanChip({ phep: 'khong-chua', giaTri: ['E3'] }, 'Máy', ten)).toEqual({ truoc: 'Máy: Không chứa', giaTri: 'E3' })
  })
})
