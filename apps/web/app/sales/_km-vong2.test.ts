import { describe, it, expect } from 'vitest'
import {
  ctkmChoDon, giaGoiY, khachDuocHuong, tomTatChinhSach, trongNhomTru, nhanKieuGiam, giaSauGiam,
  type BoiCanhGia, type CtkmApDung, type Ctkm, type KhachXet,
} from './_ctkm'

const NY = { CTD50NG: 19_950_000 }
const bc = (p: Partial<BoiCanhGia> = {}): BoiCanhGia =>
  ({ bac: null, channel_id: 1, chinhSach: [], ctkm: null, soCtkmKhac: 0, niemYet: NY, ...p })

const CT = (p: Partial<CtkmApDung> = {}): CtkmApDung => ({
  id: 'x', ten: 'CT', tu_ngay: '2026-08-01', den_ngay: '2026-08-31',
  kieu_giam: 'PCT', muc_chung: 15, giam_toi_da: null, trang_thai: 'ban_hanh',
  kenh: [1], sp: {}, qua: [], ...p,
})

const QUA = [{ internal_code_qua: 'LOI-PCF', so_luong: 2, gia_tri_quy_doi: 300_000, dieu_kien: null }]

// ── 1. Chương trình CHỈ TẶNG QUÀ (kieu_giam = 'KHONG') ──────────────────────

describe('chương trình chỉ tặng quà', () => {
  it('không đụng vào giá, dù có lỡ để lại mức cũ', () => {
    expect(giaSauGiam('KHONG', 19_950_000, 15)).toBe(19_950_000)
    expect(giaSauGiam('KHONG', 19_950_000, null)).toBe(19_950_000)
  })

  it('giá giữ niêm yết nhưng QUÀ vẫn ra', () => {
    const km = CT({ kieu_giam: 'KHONG', muc_chung: null, cong_don: true, qua: QUA })
    const r = giaGoiY(bc({ ctkmCong: [km] }), 'CTD50NG', '2026-08-24')
    expect(r.gia).toBe(19_950_000)
    expect(r.nguon).toBe('NIEM_YET')
    expect(r.qua).toHaveLength(1)
    expect(r.qua[0].ctkmTen).toBe('CT')
  })

  it('ca CEO nêu: 15% + chương trình tặng quà riêng, cùng lúc', () => {
    const giam = CT({ id: 'a', ten: 'Giảm 15%', sp: { CTD50NG: null } })
    const tang = CT({ id: 'b', ten: 'Tặng lõi', kieu_giam: 'KHONG', muc_chung: null, cong_don: true, qua: QUA })
    const r = giaGoiY(bc({ ctkm: giam, ctkmCong: [tang] }), 'CTD50NG', '2026-08-24')
    expect(r.gia).toBe(16_957_500)
    expect(r.qua).toHaveLength(1)
  })

  it('nhãn danh sách đọc ra là "Chỉ tặng quà", không phải "Chưa đặt mức giảm"', () => {
    expect(nhanKieuGiam('KHONG', null)).toBe('Chỉ tặng quà')
  })
})

// ── 2. Khối "Đang áp" phải hiện kể cả khi mọi chương trình đều cộng dồn ──────

describe('tomTatChinhSach', () => {
  it('CHỈ có chương trình cộng dồn -> vẫn ra chip (lỗi CEO gặp 24/08)', () => {
    // Bản cũ điều kiện JSX là `bcGia.bac || bcGia.ctkm`; cả hai null -> ẩn sạch cả dải,
    // kể cả các chip cộng dồn nằm bên trong.
    const chip = tomTatChinhSach(bc({ ctkm: null, ctkmCong: [CT({ ten: 'Tặng lõi' })] }))
    expect(chip).toEqual([{ nhan: 'Tặng lõi', kieu: 'cong' }])
  })

  it('không có gì áp -> rỗng, giao diện tự ẩn', () => {
    expect(tomTatChinhSach(bc())).toEqual([])
    expect(tomTatChinhSach(null)).toEqual([])
  })

  it('đủ bậc + chương trình chính + cộng dồn, đúng thứ tự', () => {
    const chip = tomTatChinhSach(bc({
      bac: 'DAI_LY', ctkm: CT({ ten: 'KM tháng 8' }), ctkmCong: [CT({ ten: 'Tặng lõi' })],
    }))
    expect(chip.map((c) => c.kieu)).toEqual(['bac', 'chinh', 'cong'])
  })
})

// ── 3. Loại trừ theo NHÓM ───────────────────────────────────────────────────

const KH = (p: Partial<KhachXet> = {}): KhachXet =>
  ({ customer_code: 'KH01', daMua: true, channel_id: 5, bac: null, ...p })

describe('loại trừ cả một tập khách', () => {
  it('theo KÊNH', () => {
    expect(trongNhomTru([{ loai: 'KENH', gia_tri: '5' }], KH({ channel_id: 5 }))).toBe(true)
    expect(trongNhomTru([{ loai: 'KENH', gia_tri: '5' }], KH({ channel_id: 6 }))).toBe(false)
  })

  it('theo BẬC — CO_BAC gom mọi cấp', () => {
    const n = [{ loai: 'BAC' as const, gia_tri: 'CO_BAC' }]
    expect(trongNhomTru(n, KH({ bac: 'NPP' }))).toBe(true)
    expect(trongNhomTru(n, KH({ bac: 'GIOI_THIEU' }))).toBe(true)
    expect(trongNhomTru(n, KH({ bac: null }))).toBe(false)
  })

  it('theo BẬC — chỉ định đúng một cấp', () => {
    const n = [{ loai: 'BAC' as const, gia_tri: 'DAI_LY' }]
    expect(trongNhomTru(n, KH({ bac: 'DAI_LY' }))).toBe(true)
    expect(trongNhomTru(n, KH({ bac: 'NPP' }))).toBe(false)
  })

  it('theo NHÓM mới / đã mua', () => {
    expect(trongNhomTru([{ loai: 'NHOM', gia_tri: 'DA_MUA' }], KH({ daMua: true }))).toBe(true)
    expect(trongNhomTru([{ loai: 'NHOM', gia_tri: 'MOI' }], KH({ daMua: false }))).toBe(true)
    expect(trongNhomTru([{ loai: 'NHOM', gia_tri: 'MOI' }], KH({ daMua: true }))).toBe(false)
  })

  it('CHƯA BIẾT đã mua hay chưa -> KHÔNG gạch', () => {
    // Gạch nhầm là khách thật mất khuyến mãi. Bỏ sót một lần gạch nhẹ hơn nhiều.
    expect(trongNhomTru([{ loai: 'NHOM', gia_tri: 'MOI' }], KH({ daMua: null }))).toBe(false)
    expect(trongNhomTru([{ loai: 'NHOM', gia_tri: 'DA_MUA' }], KH({ daMua: null }))).toBe(false)
  })

  it('nhóm trừ chặn ngay cả khách nằm trong DANH SÁCH CHỈ ĐỊNH', () => {
    const c = CT({ nhom_khach: 'CHI_DINH', khachGom: ['KH01'], nhomTru: [{ loai: 'KENH', gia_tri: '5' }] })
    expect(khachDuocHuong(c, KH({ channel_id: 5 }))).toBe(false)
    expect(khachDuocHuong(c, KH({ channel_id: 9 }))).toBe(true)
  })

  it('lọc được ở ctkmChoDon', () => {
    const c = CT({ nhomTru: [{ loai: 'BAC', gia_tri: 'CO_BAC' }] }) as Ctkm
    expect(ctkmChoDon([c], '2026-08-24', 1, undefined, KH({ bac: 'DAI_LY' })).chon).toBeNull()
    expect(ctkmChoDon([c], '2026-08-24', 1, undefined, KH({ bac: null })).chon?.id).toBe('x')
  })
})
