import { describe, expect, it } from 'vitest'
import { tomTatKho } from './tom-tat'
import type { DongSo, DongTon } from './doc'

const ton = (ma: string, t: number, cb: DongTon['canh_bao'] = null) => ({ internal_code: ma, ten: ma, danh_muc: null, don_vi: null, tong_nhap: 0, tong_xuat: 0,
  dieu_chinh: 0, ton: t, ton_toi_thieu: null, cap_nhat: null, canh_bao: cb }) as DongTon
const so = (ngay: string, loai: string, ma: string, qty: number, tt = 'approved') => ({ id: 1, ngay, loai, internal_code: ma, ten: `Tên ${ma}`, raw_name: ma, qty,
  purpose: null, note: null, keeper: null, trang_thai: tt, discord_msg_id: null, ghi_luc: '', sua_tay_luc: null, sua_tay_boi: null }) as unknown as DongSo

describe('lib/kho/tom-tat — tóm tắt cho CEO', () => {
  it('đếm tồn / sắp hết / âm, nhập-xuất 7 ngày (bỏ dòng chờ duyệt), top xuất 30 ngày, cảnh báo chưa chốt', () => {
    const t = tomTatKho({ homNay: new Date('2026-11-04T05:00:00Z'), choDuyet: 2,
      ton: [ton('A', 5, 'sap_het'), ton('B', 20), ton('C', -2, 'am'), ton('D', 0)],
      nhatKy: [so('2026-11-03', 'Xuất', 'A', 2), so('2026-11-02', 'Nhập', 'B', 10), so('2026-10-20', 'Xuất', 'B', 6), so('2026-11-03', 'Xuất', 'X', 1, 'need_review')] })
    expect(t.nhap7).toEqual({ lan: 1, sl: 10 }); expect(t.xuat7).toEqual({ lan: 1, sl: 2 })
    expect(t.topXuat30[0]).toEqual({ ten: 'Tên B', sl: 6 })
    expect(t.cau[0]).toMatch(/2 mã hàng còn tồn/)
    expect(t.cau.join(' ')).toMatch(/1 mã xuống dưới mức tối thiểu/); expect(t.cau.join(' ')).toMatch(/1 mã đang âm/); expect(t.cau.join(' ')).toMatch(/2 dòng/)
    expect(t.canhBao).toMatch(/CHƯA CHỐT ĐẦU KỲ/)
    expect(tomTatKho({ ton: [], nhatKy: [], choDuyet: 0, daChot: true }).canhBao).toBeNull()
  })
})
