import { beforeEach, describe, expect, it, vi } from 'vitest'

const chuoi: string[] = []
let insertArg: Record<string, unknown> | null = null
let quyenLoi = false
let bang: Record<string, unknown> = {}
let updArg: Record<string, unknown> | null = null
let rpcKq: { data: unknown; error: unknown } = { data: { ok: true, id: 'n' }, error: null }

function builder(t: string) {
  let op = 'select'
  const b: Record<string, unknown> = {}
  for (const m of ['select', 'like', 'order', 'eq']) b[m] = () => b
  b.limit = async () => ({ data: [], error: null })
  b.insert = async (a: Record<string, unknown>) => { chuoi.push('insert'); insertArg = a; return { error: null } }
  b.update = (a: Record<string, unknown>) => { op = 'update'; updArg = a; chuoi.push('update'); return b }
  b.maybeSingle = async () => ({ data: bang[t] ?? null, error: null })
  b.then = (res: (v: unknown) => unknown) => Promise.resolve({ data: op === 'update' ? [{ id: 'x' }] : null, error: null }).then(res)
  return b
}
vi.mock('server-only', () => ({}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/nen-tang/db', () => ({ dataClient: () => ({ from: builder, rpc: vi.fn(async () => rpcKq) }) }))
vi.mock('@/lib/nen-tang/phien', () => ({ requireStaff: vi.fn(async () => ({})), layNhanVien: vi.fn(async () => ({ id: 'nv1', email: 'a@gwt.vn' })) }))
vi.mock('@/lib/nen-tang/kiem-quyen', () => ({
  coQuyen: vi.fn(async () => true),
  doQuyen: vi.fn(async (q: string) => { chuoi.push(`quyen:${q}`); if (quyenLoi) throw new Error('KHONG_DU_QUYEN') }),
}))
vi.mock('@/app/ticket/loi-actions', () => ({ dongMayTheoTickets: vi.fn() }))

import { createTicket } from './actions'

const base = { customer_id: 'k1', ticket_type: 'Lỗi máy', description: 'rò nước' }
const S1 = 'A12345678ABC12345678'
beforeEach(() => {
  rpcKq = { data: { ok: true, id: 'n' }, error: null }; chuoi.length = 0; insertArg = null; updArg = null; quyenLoi = false
  bang = { loi_danh_muc: { trang_thai: 'da_duyet' } }
})

describe('createTicket + dòng máy (logic dòng máy chạy thật)', () => {
  it('cổng cs.ticket.tao_sua chạy trước mọi thứ', async () => {
    quyenLoi = true
    await expect(createTicket({ ...base, dong_may: [{ serial: S1 }] })).rejects.toThrow()
    expect(chuoi).toEqual(['quyen:cs.ticket.tao_sua'])
  })
  it('không serial ở đâu cả thì từ chối', async () => {
    expect((await createTicket({ ...base, dong_may: [{ serial: '  ' }] })).ok).toBe(false)
    expect(insertArg).toBeNull()
  })
  it('dòng máy sai (mã lỗi không tồn tại) -> không tạo ticket', async () => {
    bang = {}
    const r = await createTicket({ ...base, dong_may: [{ serial: S1, loi_code: 'KHONG_CO' }] })
    expect(r.ok).toBe(false)
    expect(insertArg).toBeNull()
  })
  it('dòng thứ 2 sai serial -> không tạo ticket', async () => {
    const r = await createTicket({ ...base, dong_may: [{ serial: S1 }, { serial: 'Z1' }] })
    expect(r.ok).toBe(false)
    expect(insertArg).toBeNull()
  })
  it('quá 20 dòng -> không tạo ticket', async () => {
    const r = await createTicket({ ...base, dong_may: Array.from({ length: 21 }, () => ({ serial: S1 })) })
    expect(r.ok).toBe(false)
    expect(insertArg).toBeNull()
  })
  it('serial chưa lắp: chỉ source_serial (chuẩn hoá), serial null; bỏ qua serial do client gửi', async () => {
    const r = await createTicket({ ...base, serial: 'GIAMAO', dong_may: [{ serial: ` ${S1.toLowerCase()} ` }] })
    expect(r.ok).toBe(true)
    expect(insertArg).toMatchObject({ serial: null, source_serial: S1 })
  })
  it('serial đã lắp (installed_base): đặt tickets.serial', async () => {
    bang = { ...bang, installed_base: { serial: S1, internal_code: 'M1' } }
    await createTicket({ ...base, dong_may: [{ serial: S1 }] })
    expect(insertArg).toMatchObject({ serial: S1 })
  })
  it('dòng đầu rỗng, dòng sau có serial: dùng dòng có serial đầu tiên', async () => {
    await createTicket({ ...base, dong_may: [{ mo_ta: 'x' }, { serial: S1 }] })
    expect(insertArg).toMatchObject({ source_serial: S1 })
  })
  it('gán dòng máy SAU insert, không ghi đè phân loại tự động khi CS không chọn', async () => {
    const r = await createTicket({ ...base, dong_may: [{ serial: S1 }] })
    expect(chuoi.indexOf('insert')).toBeLessThan(chuoi.indexOf('update'))
    expect(updArg).not.toHaveProperty('loi_code')
    expect(updArg).not.toHaveProperty('cs_sua')
    expect(r).toMatchObject({ ok: true })
  })
  it('ghi dòng máy lỗi sau khi tạo ticket: trả MÃ cảnh báo cố định, không lộ văn bản lỗi', async () => {
    rpcKq = { data: null, error: { code: 'XX', message: 'chi tiết nội bộ' } }
    const r = await createTicket({ ...base, dong_may: [{ serial: S1 }, { serial: S1 }] })
    expect(r).toMatchObject({ ok: true, canhBao: 'dong_may_chua_luu' })
  })
})
