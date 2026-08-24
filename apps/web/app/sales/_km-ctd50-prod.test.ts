import { describe, it, expect } from 'vitest'
import { ctkmChoDon, giaGoiY, type Ctkm, type CtkmApDung, type BoiCanhGia } from './_ctkm'

/**
 * Dựng lại ĐÚNG dữ liệu production ngày 24/08/2026 để tìm lý do CEO không thấy quà.
 *
 * CEO báo: "CTD50 đang có 2 chương trình giảm 15% vs tặng quà nhưng tặng quà ko hiển thị".
 *
 * Đọc DB thì hai chương trình đang ban hành là:
 *   · "Khuyến mãi 15% máy để bàn" — PCT 15%, cong_don = true, sp = CTS10NB/CTS10NW/CTS20NG
 *     (⚠️ KHÔNG có CTD50NG), 0 quà
 *   · "CTD50 tháng 8"             — PCT 10%, cong_don = true, sp = CTD50NG, 2 quà
 *
 * Cả HAI đều bật cộng dồn ⇒ danh sách "không cộng dồn" rỗng ⇒ `chon` = null.
 */

const KM15: CtkmApDung = {
  id: '0e4cd830', ten: 'Khuyến mãi 15% máy để bàn',
  tu_ngay: '2026-08-01', den_ngay: '2026-08-31',
  kieu_giam: 'PCT', muc_chung: 15, giam_toi_da: null, trang_thai: 'ban_hanh',
  kenh: [1], nhom_khach: 'TAT_CA', cong_don: true,
  sp: { CTS10NB: null, CTS10NW: null, CTS20NG: null },
  qua: [],
}

const CTD50_T8: CtkmApDung = {
  id: 'c1a3fa46', ten: 'CTD50 tháng 8',
  tu_ngay: '2026-08-01', den_ngay: '2026-08-31',
  kieu_giam: 'PCT', muc_chung: 10, giam_toi_da: null, trang_thai: 'ban_hanh',
  kenh: [1], nhom_khach: 'TAT_CA', cong_don: true,
  sp: { CTD50NG: null },
  qua: [
    { internal_code_qua: 'GEUS-00X06', so_luong: 1, gia_tri_quy_doi: 1_950_000, dieu_kien: null },
    { internal_code_qua: 'LX-CFNC-002-G', so_luong: 1, gia_tri_quy_doi: 5_000_000, dieu_kien: null },
  ],
}

const NY = { CTD50NG: 19_950_000, CTS20NG: 15_000_000 }

function bc(p: Partial<BoiCanhGia> = {}): BoiCanhGia {
  return { bac: null, channel_id: 1, chinhSach: [], ctkm: null, soCtkmKhac: 0, niemYet: NY, ...p }
}

describe('ca thật trên production — CTD50NG với 2 chương trình cùng bật cộng dồn', () => {
  it('cả hai bật cộng dồn -> chon = null, cả hai nằm ở cong', () => {
    const r = ctkmChoDon([KM15 as Ctkm, CTD50_T8 as Ctkm], '2026-08-24', 1)
    expect(r.chon).toBeNull()
    expect(r.cong.map((c) => c.ten).sort()).toEqual(['CTD50 tháng 8', 'Khuyến mãi 15% máy để bàn'])
  })

  it('QUÀ của CTD50 tháng 8 phải ra tới giá gợi ý của CTD50NG', () => {
    const r = giaGoiY(bc({ ctkm: null, ctkmCong: [KM15, CTD50_T8] }), 'CTD50NG', '2026-08-24')
    expect(r.qua.map((q) => q.internal_code_qua)).toEqual(['GEUS-00X06', 'LX-CFNC-002-G'])
  })

  it('chương trình 15% KHÔNG chứa CTD50NG nên không được giảm giá mã này', () => {
    const r = giaGoiY(bc({ ctkm: null, ctkmCong: [KM15, CTD50_T8] }), 'CTD50NG', '2026-08-24')
    // Chỉ ăn 10% của "CTD50 tháng 8": 19.950.000 − 10% = 17.955.000
    expect(r.gia).toBe(17_955_000)
    expect(r.chuongTrinh).toEqual(['CTD50 tháng 8'])
  })

  it('mã CTS20NG chỉ ăn chương trình 15%, không dính quà của CTD50', () => {
    const r = giaGoiY(bc({ ctkm: null, ctkmCong: [KM15, CTD50_T8] }), 'CTS20NG', '2026-08-24')
    expect(r.gia).toBe(12_750_000)
    expect(r.qua).toEqual([])
  })
})
