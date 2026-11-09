import { beforeEach, describe, expect, it, vi } from 'vitest'

const ghi: { op: string; bang: string; arg?: unknown; loc: Record<string, unknown> }[] = []
let phan: Record<string, { data?: unknown; count?: number }> = {}
let coQuyenTra = true
const chuoi: string[] = []

function builder(bang: string) {
  const st = { op: 'select', arg: undefined as unknown, loc: {} as Record<string, unknown> }
  const b: Record<string, unknown> = {}
  const tra = () => {
    const k = `${st.op}:${bang}`
    const r = phan[k] ?? phan[bang] ?? {}
    return { data: r.data ?? null, count: r.count ?? 0, error: null }
  }
  for (const m of ['select', 'order', 'limit', 'in', 'ilike', 'or', 'neq', 'is', 'not']) b[m] = (...a: unknown[]) => { if (m === 'in' || m === 'neq') st.loc[`${m}:${a[0]}`] = a[1]; return b }
  b.eq = (c: string, v: unknown) => { st.loc[c] = v; return b }
  for (const m of ['insert', 'update', 'delete', 'upsert']) b[m] = (a?: unknown) => { st.op = m; st.arg = a; ghi.push({ op: m, bang, arg: a, loc: st.loc }); return b }
  b.maybeSingle = async () => tra()
  b.single = async () => tra()
  b.then = (res: (v: unknown) => unknown) => Promise.resolve(tra()).then(res)
  return b
}
const db = { from: (t: string) => { chuoi.push(`db:${t}`); return builder(t) }, rpc: vi.fn(async () => ({ data: { ok: 1 }, error: null })) }

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/nen-tang/db', () => ({ dataClient: () => db }))
vi.mock('@/lib/nen-tang/phien', () => ({ requireStaff: vi.fn(async () => ({})), layNhanVien: vi.fn(async () => ({ email: 'a@gwt.vn' })) }))
vi.mock('@/lib/nen-tang/kiem-quyen', () => ({
  coQuyen: vi.fn(async () => { chuoi.push('coQuyen'); return coQuyenTra }),
  doQuyen: vi.fn(async () => { chuoi.push('doQuyen') }),
}))
vi.mock('@/lib/nen-tang/nhat-ky', () => ({ ghiAudit: vi.fn(async () => {}) }))
vi.mock('@/bang/timkiem', () => ({ boDau: (s: string) => s }))

import * as A from '../../app/ticket/loi-actions'

beforeEach(() => { ghi.length = 0; chuoi.length = 0; phan = {}; coQuyenTra = true; db.rpc.mockClear() })

describe('quyền kiểm TRƯỚC khi chạm DB', () => {
  it('thiếu cs.nhom_loi.cau_hinh: luuLoi / datTrangThaiLoi / phanLoaiLai không đụng DB', async () => {
    coQuyenTra = false
    const l = { code: 'X1', nhom: null, ten: 't', aliases: [], ma_may: [], dau_hieu: null, huong_xu_ly: null, nguon: null, trang_thai: 'da_duyet' as const, thu_tu: 1 }
    expect((await A.luuLoi(l)).ok).toBe(false)
    expect((await A.datTrangThaiLoi('X1', 'ngung')).ok).toBe(false)
    expect((await A.phanLoaiLai(false)).ok).toBe(false)
    expect(chuoi.filter((x) => x.startsWith('db:'))).toEqual([])
    expect(db.rpc).not.toHaveBeenCalled()
  })
  it('doQuyen đứng trước lần chạm DB đầu tiên ở hàm đọc', async () => {
    await A.dongMayTheoTickets(['T1'])
    expect(chuoi.indexOf('doQuyen')).toBeLessThan(chuoi.findIndex((x) => x.startsWith('db:')))
  })
})

describe('luuLoi / datTrangThaiLoi', () => {
  it('da_duyet ghi duyet_boi + duyet_luc', async () => {
    const r = await A.luuLoi({ code: 'X1', nhom: null, ten: 't', aliases: [], ma_may: [], dau_hieu: null, huong_xu_ly: null, nguon: null, trang_thai: 'da_duyet', thu_tu: 1 })
    expect(r.ok).toBe(true)
    const w = ghi.find((g) => g.bang === 'loi_danh_muc')!
    expect((w.arg as Record<string, unknown>).duyet_boi).toBe('a@gwt.vn')
    expect((w.arg as Record<string, unknown>).duyet_luc).toBeTruthy()
  })
  it('từ chối CHUA_PHAN_LOAI', async () => {
    expect((await A.datTrangThaiLoi('CHUA_PHAN_LOAI', 'ngung')).ok).toBe(false)
    expect(ghi).toEqual([])
  })
})

describe('dòng máy', () => {
  it('xoá dòng cuối của ticket bị từ chối, không xoá', async () => {
    phan = { 'select:ticket_may': { data: { id: 'd1', ticket_code: 'T1' }, count: 1 } }
    const r = await A.xoaDongMay('d1')
    expect(r.ok).toBe(false)
    expect(ghi.some((g) => g.op === 'delete')).toBe(false)
  })
  it('xoá dòng khi còn dòng khác: xoá thật', async () => {
    phan = { 'select:ticket_may': { data: { id: 'd1', ticket_code: 'T1' }, count: 2 } }
    expect((await A.xoaDongMay('d1')).ok).toBe(true)
    expect(ghi.some((g) => g.op === 'delete' && g.bang === 'ticket_may')).toBe(true)
  })
  it('xacNhanHuongXuLy chỉ ghi ticket_may, không đụng tickets', async () => {
    await A.xacNhanHuongXuLy('d1', 'Đổi bo', true)
    expect(ghi.map((g) => g.bang)).toEqual(['ticket_may'])
    expect(ghi[0].arg).toEqual({ huong_xu_ly: 'Đổi bo', huong_xu_ly_nguon: 'danh_muc' })
  })
  it('suaDongMay đặt cs_sua = true', async () => {
    phan = { 'select:ticket_may': { data: { id: 'd1', ticket_code: 'T1' } }, 'select:loi_danh_muc': { data: { trang_thai: 'da_duyet' } } }
    expect((await A.suaDongMay('d1', { mo_ta: 'x', loi_code: 'L1' })).ok).toBe(true)
    const w = ghi.find((g) => g.op === 'update')!
    expect((w.arg as Record<string, unknown>).cs_sua).toBe(true)
  })
  it('mã lỗi ngừng dùng bị từ chối khi thêm dòng', async () => {
    phan = { 'select:loi_danh_muc': { data: { trang_thai: 'ngung' } } }
    const r = await A.themDongMay('T1', { loi_code: 'L1' })
    expect(r).toEqual({ ok: false, error: 'Mã lỗi không dùng được' })
    expect(ghi).toEqual([])
  })
  it('themDongMay dùng nguon app', async () => {
    phan = { 'select:loi_danh_muc': { data: { trang_thai: 'da_duyet' } }, 'insert:ticket_may': { data: { id: 'n1' } } }
    const r = await A.themDongMay('T1', { loi_code: 'L1' })
    expect(r.ok).toBe(true)
    expect((ghi.find((g) => g.op === 'insert')!.arg as Record<string, unknown>).nguon).toBe('app')
  })
})

describe('phanLoaiLai', () => {
  it('chạy thật gọi rpc và ghi audit', async () => {
    const r = await A.phanLoaiLai(false)
    expect(r.ok).toBe(true)
    expect(db.rpc).toHaveBeenCalledWith('cs_ticket_may_backfill', { p_chay_thu: false })
  })
})
