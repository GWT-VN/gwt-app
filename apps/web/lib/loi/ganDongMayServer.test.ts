import { beforeEach, describe, expect, it, vi } from 'vitest'

const ghi: { op: string; bang: string; arg?: unknown }[] = []
let bang: Record<string, unknown> = {}
let updRows: unknown[] = [{ id: 'x' }]
function builder(t: string) {
  let op = 'select'
  const b: Record<string, unknown> = {}
  for (const m of ['select', 'eq', 'order', 'limit', 'like']) b[m] = () => b
  b.update = (a: unknown) => { op = 'update'; ghi.push({ op, bang: t, arg: a }); return b }
  b.maybeSingle = async () => ({ data: bang[t] ?? null, error: null })
  b.then = (res: (v: unknown) => unknown) => Promise.resolve({ data: op === 'update' ? updRows : bang[t] ?? null, error: null }).then(res)
  return b
}
const rpc = vi.fn(async () => ({ data: { ok: true, id: 'n' }, error: null }))
vi.mock('server-only', () => ({}))
vi.mock('@/lib/nen-tang/db', () => ({ dataClient: () => ({ from: builder, rpc }) }))
vi.mock('@/lib/nen-tang/phien', () => ({ layNhanVien: vi.fn(async () => ({ email: 'a@gwt.vn' })) }))
import { chuanBiCacDong, ganDongMayChoTicketMoi, banCapNhatDongTuDong } from './ganDongMayServer'

const S1 = 'A12345678ABC12345678'
beforeEach(() => { ghi.length = 0; bang = { loi_danh_muc: { trang_thai: 'da_duyet' } }; updRows = [{ id: 'x' }]; rpc.mockClear() })

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
