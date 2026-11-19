import { describe, expect, it } from 'vitest'
import { chuanBiThietBiCombo, laMaTam } from './chuaSerial'

describe('laMaTam', () => {
  it('nhận mã tạm TAM + YYYYMM + số', () => {
    expect(laMaTam('TAM202611001')).toBe(true)
    expect(laMaTam('TAM2026110012')).toBe(true)
  })
  it('không nhận serial thật / mã bộ', () => {
    expect(laMaTam('F00000266V9400030067')).toBe(false)
    expect(laMaTam('WH30A202608001')).toBe(false)
    expect(laMaTam('tam202611001')).toBe(false)
    expect(laMaTam(null)).toBe(false)
  })
})

describe('chuanBiThietBiCombo', () => {
  it('giữ thiết bị chưa có serial (gửi serial rỗng → DB cấp mã tạm), cắt khoảng trắng', () => {
    expect(chuanBiThietBiCombo([
      { internal_code: 'POE15A', serial: ' P1 ' },
      { internal_code: 'UPF10', serial: '' },
    ], [false, true])).toEqual({ ok: true, ds: [
      { internal_code: 'POE15A', serial: 'P1' },
      { internal_code: 'UPF10', serial: '' },
    ], soChuaSerial: 1 })
  })
  it('thiết bị không đánh dấu "chưa có serial" mà để trống → báo chọn serial', () => {
    const r = chuanBiThietBiCombo([{ internal_code: 'UPF10', serial: '' }], [false])
    expect(r).toEqual({ ok: false, error: 'Chọn serial cho thiết bị UPF10 hoặc đánh dấu "Chưa có serial".' })
  })
  it('đánh dấu chưa có serial thì bỏ qua serial đã gõ dở', () => {
    const r = chuanBiThietBiCombo([{ internal_code: 'UPF10', serial: 'U1' }], [true])
    expect(r).toEqual({ ok: true, ds: [{ internal_code: 'UPF10', serial: '' }], soChuaSerial: 1 })
  })
  it('serial trùng nhau → chặn', () => {
    const r = chuanBiThietBiCombo([{ internal_code: 'UPF10', serial: 'U1' }, { internal_code: 'UPF10', serial: 'U1' }], [false, false])
    expect(r.ok).toBe(false)
  })
  it('rỗng / thiếu mã nội bộ → chặn', () => {
    expect(chuanBiThietBiCombo([], []).ok).toBe(false)
    expect(chuanBiThietBiCombo([{ internal_code: ' ', serial: '' }], [true]).ok).toBe(false)
  })
})
