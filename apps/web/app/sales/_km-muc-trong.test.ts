import { describe, it, expect } from 'vitest'
import { giaGoiY, gomSpTheoCtkm, type BoiCanhGia, type CtkmApDung } from './_ctkm'

/**
 * Lỗi CEO bắt được 24/08/2026, đã lên tới production.
 *
 * Chương trình "Khuyến mãi 15% máy để bàn" liệt kê 4 mã trong `sales_ctkm_sp` với
 * `muc = NULL` — nghĩa là "mã này dùng mức chung 15%". Chỗ nạp dữ liệu trong
 * `boiCanhGia()` làm `Number(s.muc)`, mà `Number(null)` ra **0**. Số 0 là một mức giảm
 * HỢP LỆ (giảm 0%), nên `mucApDung()` nhận luôn và không rơi xuống `muc_chung` nữa.
 *
 * Hệ quả trên màn lên đơn: CTD50NG hiện nhãn *Theo Khuyến mãi 15% máy để bàn* nhưng
 * đơn giá vẫn **19.950.000 đ** — đúng giá niêm yết, không giảm đồng nào. Đáng lẽ
 * **16.957.500 đ**.
 *
 * Đây là loại lỗi tệ nhất trong khu tính tiền: **nó không báo lỗi, nó nói dối** — dán
 * nhãn khuyến mãi lên một con số chưa được giảm. Không có gì đỏ, không có gì rỗng, chỉ
 * có nhân viên tin cái nhãn rồi báo sai giá cho khách.
 *
 * Các con số dưới đây là số THẬT của `CTD50NG` trên production ngày 24/08/2026.
 */

const NY = { CTD50NG: 19_950_000 }

function bc(p: Partial<BoiCanhGia> = {}): BoiCanhGia {
  return { bac: null, channel_id: 1, chinhSach: [], ctkm: null, soCtkmKhac: 0, niemYet: NY, ...p }
}

const KM15: CtkmApDung = {
  id: 'km15', ten: 'Khuyến mãi 15% máy để bàn',
  tu_ngay: '2026-08-01', den_ngay: '2026-08-31',
  kieu_giam: 'PCT', muc_chung: 15, giam_toi_da: null, trang_thai: 'ban_hanh',
  kenh: [1], sp: {},
}

describe('mức riêng ĐỂ TRỐNG khác hẳn mức riêng BẰNG 0', () => {
  it('để trống -> rơi xuống mức chung 15%, KHÔNG phải giảm 0%', () => {
    const r = giaGoiY(bc({ ctkm: { ...KM15, sp: { CTD50NG: null } } }), 'CTD50NG', '2026-08-22')
    expect(r.gia).toBe(16_957_500)
    expect(r.gia).not.toBe(19_950_000)
    expect(r.nguon).toBe('CTKM')
  })

  it('đặt hẳn mức 0 thì đúng là giảm 0% — người ta cố ý gõ số đó', () => {
    const r = giaGoiY(bc({ ctkm: { ...KM15, sp: { CTD50NG: 0 } } }), 'CTD50NG', '2026-08-22')
    expect(r.gia).toBe(19_950_000)
  })

  it('chương trình KHÔNG liệt kê mã nào -> mọi mã ăn mức chung', () => {
    const r = giaGoiY(bc({ ctkm: { ...KM15, sp: {} } }), 'CTD50NG', '2026-08-22')
    expect(r.gia).toBe(16_957_500)
  })

  /**
   * Rào chung cho cả HỌ lỗi này, không chỉ ca `null` vừa vá: đã dán nhãn CTKM lên một
   * dòng thì con số phải thật sự thấp hơn giá niêm yết. Ca duy nhất được phép bằng nhau
   * là người ta cố ý đặt mức 0 — ca đó đã có test riêng ở trên.
   */
  it('dán nhãn CTKM thì giá PHẢI thấp hơn niêm yết', () => {
    for (const mucRieng of [null, 5, 15, 30]) {
      const r = giaGoiY(bc({ ctkm: { ...KM15, sp: { CTD50NG: mucRieng } } }), 'CTD50NG', '2026-08-22')
      expect(r.nguon, `mức riêng ${mucRieng}`).toBe('CTKM')
      expect(r.gia!, `mức riêng ${mucRieng}`).toBeLessThan(r.niemYet!)
    }
  })

  /**
   * ĐÂY mới là chỗ lỗi thật nằm — bước nạp dòng DB vào bộ nhớ, không phải `giaGoiY()`.
   * `giaGoiY()` xử lý `null` đúng từ đầu; nó chỉ không bao giờ NHẬN được `null` vì
   * `Number(null)` đã biến thành 0 trước đó.
   */
  it('gomSpTheoCtkm: muc = NULL từ DB phải giữ là null, KHÔNG thành 0', () => {
    const m = gomSpTheoCtkm([
      { ctkm_id: 'km15', internal_code: 'CTD50NG', muc: null },
      { ctkm_id: 'km15', internal_code: 'CTS20NG', muc: null },
      { ctkm_id: 'km15', internal_code: 'CTS10NB', muc: 20 },
    ])
    const sp = m.get('km15')!
    expect(sp.CTD50NG).toBeNull()
    expect(sp.CTD50NG).not.toBe(0)
    expect(sp.CTS20NG).toBeNull()
    expect(sp.CTS10NB).toBe(20)
  })

  it('gomSpTheoCtkm: số 0 thật từ DB vẫn phải là 0', () => {
    const sp = gomSpTheoCtkm([{ ctkm_id: 'k', internal_code: 'X', muc: 0 }]).get('k')!
    expect(sp.X).toBe(0)
    expect(sp.X).not.toBeNull()
  })

  it('gomSpTheoCtkm: chuỗi rỗng / giá trị rác cũng về null chứ không thành 0', () => {
    // PostgREST có lúc trả numeric dưới dạng CHUỖI — '' và 'abc' đều phải là "chưa đặt".
    const sp = gomSpTheoCtkm([
      { ctkm_id: 'k', internal_code: 'A', muc: '' },
      { ctkm_id: 'k', internal_code: 'B', muc: 'abc' },
      { ctkm_id: 'k', internal_code: 'C', muc: '15' },
    ]).get('k')!
    expect(sp.A).toBeNull()
    expect(sp.B).toBeNull()
    expect(sp.C).toBe(15)
  })

  it('nối cả hai bước: dòng DB muc=NULL -> đơn giá đúng 16.957.500', () => {
    const sp = gomSpTheoCtkm([{ ctkm_id: 'km15', internal_code: 'CTD50NG', muc: null }]).get('km15')!
    const r = giaGoiY(bc({ ctkm: { ...KM15, sp } }), 'CTD50NG', '2026-08-22')
    expect(r.gia).toBe(16_957_500)
  })

  it('chương trình cộng dồn cũng phải rơi xuống mức chung khi để trống', () => {
    const themCd: CtkmApDung = { ...KM15, id: 'cd', ten: 'Giảm thêm', muc_chung: 10, cong_don: true, sp: { CTD50NG: null } }
    const r = giaGoiY(bc({ ctkm: null, ctkmCong: [themCd] }), 'CTD50NG', '2026-08-22')
    expect(r.gia).toBe(17_955_000) // 19.950.000 − 10%
  })
})
