import { beforeEach, describe, expect, it, vi } from 'vitest'

const ghi: { op: string; bang: string; arg?: unknown }[] = []
let bang: Record<string, unknown> = {}
let updRows: unknown[] = [{ id: 'x' }]
let loiBang: Record<string, { code?: string; message: string }> = {}
function builder(t: string) {
  let op = 'select'
  const b: Record<string, unknown> = {}
  for (const m of ['select', 'eq', 'order', 'limit', 'like']) b[m] = () => b
  b.update = (a: unknown) => { op = 'update'; ghi.push({ op, bang: t, arg: a }); return b }
  b.maybeSingle = async () => ({ data: bang[t] ?? null, error: null })
  b.then = (res: (v: unknown) => unknown) => Promise.resolve({ data: loiBang[t] ? null : op === 'update' ? updRows : bang[t] ?? null, error: loiBang[t] ?? null }).then(res)
  return b
}
const rpc = vi.fn(async () => ({ data: { ok: true, id: 'n' }, error: null }))
vi.mock('server-only', () => ({}))
vi.mock('@/lib/nen-tang/db', () => ({ dataClient: () => ({ from: builder, rpc }) }))
vi.mock('@/lib/nen-tang/phien', () => ({ layNhanVien: vi.fn(async () => ({ email: 'a@gwt.vn' })) }))
import { chuanBiCacDong, ganDongMayChoTicketMoi, banCapNhatDongTuDong, giaiSerial, coBangDongMay } from './ganDongMayServer'

const S1 = 'A12345678ABC12345678'
beforeEach(() => { loiBang = {}; ghi.length = 0; bang = { loi_danh_muc: { trang_thai: 'da_duyet' } }; updRows = [{ id: 'x' }]; rpc.mockClear() })

describe('banCapNhatDongTuDong', () => {
  const sr = { ok: true as const, serial: S1, source_serial: null, internal_code: 'M1' }
  const c = (loi: string) => ({ ok: true as const, loi, sr, mo_ta: null, trang_thai: 'dang_xu_ly' as const })
  it('không chọn lỗi, không mô tả: không đụng loi_code/mo_ta/cs_sua', () => {
    const u = banCapNhatDongTuDong(c('CHUA_PHAN_LOAI'), {})
    expect(u).not.toHaveProperty('loi_code')
    expect(u).not.toHaveProperty('mo_ta')
    expect(u).not.toHaveProperty('cs_sua')
    expect(u).toMatchObject({ serial: S1, internal_code: 'M1' })
  })
  it('chọn lỗi: ghi loi_code + cs_sua', () => {
    expect(banCapNhatDongTuDong(c('RO_NUOC'), { loi_code: 'RO_NUOC' })).toMatchObject({ loi_code: 'RO_NUOC', cs_sua: true })
  })
  it('chỉ có mô tả: ghi mo_ta + cs_sua, giữ loi_code', () => {
    const u = banCapNhatDongTuDong({ ...c('CHUA_PHAN_LOAI'), mo_ta: 'rò' }, { mo_ta: 'rò' })
    expect(u).toMatchObject({ mo_ta: 'rò', cs_sua: true })
    expect(u).not.toHaveProperty('loi_code')
  })
})
describe('chuanBiCacDong', () => {
  it('mã lỗi không tồn tại -> lỗi đầu tiên', async () => {
    bang = {}
    const r = await chuanBiCacDong([{ serial: S1, loi_code: 'KHONG_CO' }])
    expect(r.ok).toBe(false)
  })
  it('mã lỗi đã ngừng -> lỗi', async () => {
    bang = { loi_danh_muc: { trang_thai: 'ngung' } }
    expect((await chuanBiCacDong([{ serial: S1, loi_code: 'CU' }])).ok).toBe(false)
  })
  it('serial sai dạng, không có trong hệ -> lỗi; quá 20 dòng -> lỗi', async () => {
    expect((await chuanBiCacDong([{ serial: 'Z1' }])).ok).toBe(false)
    expect((await chuanBiCacDong(Array.from({ length: 21 }, () => ({ serial: S1 })))).ok).toBe(false)
  })
  it('hợp lệ -> ds đã chuẩn', async () => {
    const r = await chuanBiCacDong([{ serial: S1 }, { serial: S1 }])
    expect(r.ok && r.ds).toHaveLength(2)
  })
})
describe('ganDongMayChoTicketMoi', () => {
  it('cập nhật dòng tự động không ghi đè phân loại khi CS không chọn', async () => {
    await ganDongMayChoTicketMoi('TK-2611-001', [{ serial: S1 }])
    const u = ghi.find((g) => g.op === 'update')!.arg as Record<string, unknown>
    expect(u).not.toHaveProperty('loi_code')
    expect(u).not.toHaveProperty('cs_sua')
    expect(rpc).not.toHaveBeenCalled()
  })
  it('không có dòng tự động -> thêm qua RPC dòng đầu và các dòng sau', async () => {
    updRows = []
    await ganDongMayChoTicketMoi('TK-2611-001', [{ serial: S1 }, { serial: S1 }])
    expect(rpc).toHaveBeenCalledTimes(2)
  })
})

describe('M6: dòng máy luôn giữ source_serial (đã chuẩn hoá)', () => {
  it('serial có trong installed_base -> serial + source_serial cùng giá trị chuẩn', async () => {
    bang = { installed_base: { serial: S1, internal_code: 'M1' } }
    expect(await giaiSerial({ from: builder } as never, ` ${S1.toLowerCase()} `)).toEqual({ ok: true, serial: S1, source_serial: S1, internal_code: 'M1' })
  })
})

describe('I1: bảng ticket_may chưa có (migration chưa áp)', () => {
  it('coBangDongMay = false khi DB báo lỗi, true khi đọc được', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    loiBang = { ticket_may: { code: 'PGRST205', message: "Could not find the table 'public.ticket_may'" } }
    expect(await coBangDongMay({ from: builder } as never)).toBe(false)
    loiBang = {}
    expect(await coBangDongMay({ from: builder } as never)).toBe(true)
    log.mockRestore()
  })
})

describe('M10: dòng tự động nhận dòng đầu tiên CÓ serial', () => {
  it('dòng 0 không serial, dòng 1 có serial -> cập nhật dòng tự động bằng dòng 1, dòng 0 thêm qua RPC', async () => {
    bang = { loi_danh_muc: { trang_thai: 'da_duyet' }, installed_base: { serial: S1, internal_code: 'M1' } }
    await ganDongMayChoTicketMoi('TK-2611-001', [{ mo_ta: 'không serial' }, { serial: S1 }])
    const u = ghi.find((g) => g.op === 'update')!.arg as Record<string, unknown>
    expect(u).toMatchObject({ serial: S1 })
    expect(rpc).toHaveBeenCalledTimes(1)
    expect(rpc).toHaveBeenCalledWith('cs_them_dong_may', expect.objectContaining({ p_serial: null, p_mo_ta: 'không serial' }))
  })
})
