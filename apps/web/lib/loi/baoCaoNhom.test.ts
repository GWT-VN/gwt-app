import { describe, expect, it } from 'vitest'
import { NHOM_CHINH, locBaoCao, theoMay, theoSerial, theoSku, tomTatNhom, type CaBaoCao } from './baoCaoNhom'

const ca = (p: Partial<CaBaoCao>): CaBaoCao => ({
  ticket_code: 'T1', loi_code: 'CTS20-RO-DAY', loi_ten: 'CTS20 rò đáy', nhom: 'RO-RI-NUOC', nhom_ten: 'Rò rỉ nước',
  internal_code: 'CTS20NG', may: 'S1', ngay_bao: '2026-09-13', thang: '2026-09', install_date: null, state: 'Open', ...p,
})
const DS: CaBaoCao[] = [
  ca({ ticket_code: 'T1', may: 'S1' }),
  ca({ ticket_code: 'T2', may: 'S1', ngay_bao: '2026-10-02', thang: '2026-10', state: 'Done' }),
  ca({ ticket_code: 'T3', may: 'S2', loi_code: 'CTS20-RO-VOI', loi_ten: 'CTS20 rò vòi lạnh' }),
  ca({ ticket_code: 'T4', may: 'S3', internal_code: 'CTD50NG', nhom: 'MAIN', nhom_ten: 'Main', loi_code: 'CTD50-E4', loi_ten: 'E4' }),
  ca({ ticket_code: 'T5', may: null, internal_code: '(chưa rõ)', state: 'Cancel' }),
  ca({ ticket_code: 'T6', nhom: 'KHONG-PHAI-LOI', nhom_ten: 'Không phải lỗi', loi_code: 'DV-BAO-TRI' }),
  ca({ ticket_code: 'T7', nhom: null, nhom_ten: null, loi_code: 'CHUA_PHAN_LOAI' }),
]

describe('locBaoCao', () => {
  it('mặc định bỏ ticket đã huỷ; lọc theo khoảng tháng', () => {
    expect(locBaoCao(DS, { tu: '2026-01', den: '2026-12' }).map((c) => c.ticket_code)).not.toContain('T5')
    expect(locBaoCao(DS, { tu: '2026-01', den: '2026-12', gomHuy: true }).map((c) => c.ticket_code)).toContain('T5')
    expect(locBaoCao(DS, { tu: '2026-10', den: '2026-10' }).map((c) => c.ticket_code)).toEqual(['T2'])
  })
})

describe('tomTatNhom', () => {
  it('đủ 4 nhóm chính theo thứ tự; đếm ticket, máy, đang mở, lỗi con', () => {
    const t = tomTatNhom(locBaoCao(DS, { tu: '2026-01', den: '2026-12' }))
    expect(t.nhom.map((n) => n.code)).toEqual(NHOM_CHINH.map((n) => n.code))
    const rr = t.nhom.find((n) => n.code === 'RO-RI-NUOC')!
    expect(rr).toMatchObject({ ticket: 3, may: 2, dangMo: 2 })
    expect(rr.con[0]).toEqual({ ten: 'CTS20 rò đáy', so: 2 })
    expect(t.nhom.find((n) => n.code === 'APP')!.ticket).toBe(0)
    expect(t).toMatchObject({ khongPhaiLoi: 1, chuaPhanLoai: 1 })
  })
})

describe('theoSku', () => {
  it('máy trong 1 nhóm, nhiều ticket trước', () => {
    const r = theoSku(DS.filter((c) => c.nhom === 'RO-RI-NUOC'))
    expect(r[0]).toMatchObject({ sku: 'CTS20NG', ticket: 3, may: 2 })
  })
})

describe('theoMay', () => {
  it('tỷ lệ = máy từng lỗi ÷ máy đang chạy; không tính "không phải lỗi" / chưa phân loại', () => {
    const r = theoMay(locBaoCao(DS, { tu: '2026-01', den: '2026-12' }), { CTS20NG: 47, CTD50NG: 71 })
    const cts20 = r.find((x) => x.sku === 'CTS20NG')!
    expect(cts20).toMatchObject({ dangChay: 47, mayLoi: 2, ticket: 3 })
    expect(cts20.tyLe).toBeCloseTo(2 / 47)
    expect(cts20.theoNhom).toEqual({ 'RO-RI-NUOC': 3 })
    expect(r.find((x) => x.sku === 'CTD50NG')!.tyLe).toBeCloseTo(1 / 71)
  })
})

describe('theoSerial', () => {
  it('gom theo serial: số lần, ticket mới nhất trước', () => {
    const r = theoSerial(DS.filter((c) => c.nhom === 'RO-RI-NUOC' && c.internal_code === 'CTS20NG'))
    expect(r[0]).toMatchObject({ serial: 'S1', lan: 2, ticket: ['T2', 'T1'], moiNhat: { state: 'Done', ngay: '2026-10-02' } })
  })
})
