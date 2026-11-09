import { beforeEach, describe, expect, it, vi } from 'vitest'

const chuoi: string[] = []
let insertArg: Record<string, unknown> | null = null
let quyenLoi = false
let ganTra: { ok: boolean; error?: string } = { ok: true }
const ganMock = vi.fn(async (...a: unknown[]) => { void a; chuoi.push('gan'); return ganTra })

function builder() {
  const b: Record<string, unknown> = {}
  for (const m of ['select', 'like', 'order']) b[m] = () => b
  b.limit = async () => ({ data: [], error: null })
  b.insert = async (a: Record<string, unknown>) => { chuoi.push('insert'); insertArg = a; return { error: null } }
  return b
}
vi.mock('server-only', () => ({}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/nen-tang/db', () => ({ dataClient: () => ({ from: () => builder() }) }))
vi.mock('@/lib/nen-tang/phien', () => ({ requireStaff: vi.fn(async () => ({})), layNhanVien: vi.fn(async () => ({ id: 'nv1', email: 'a@gwt.vn' })) }))
vi.mock('@/lib/nen-tang/kiem-quyen', () => ({
  coQuyen: vi.fn(async () => true),
  doQuyen: vi.fn(async (q: string) => { chuoi.push(`quyen:${q}`); if (quyenLoi) throw new Error('KHONG_DU_QUYEN') }),
}))
vi.mock('@/lib/loi/ganDongMayServer', () => ({ ganDongMayChoTicketMoi: (...a: unknown[]) => ganMock(...a) }))
vi.mock('@/app/ticket/loi-actions', () => ({ dongMayTheoTickets: vi.fn() }))

import { createTicket } from './actions'

const base = { customer_id: 'k1', ticket_type: 'Lỗi máy', description: 'rò nước' }
const S1 = 'A12345678ABC12345678'
beforeEach(() => { chuoi.length = 0; insertArg = null; quyenLoi = false; ganTra = { ok: true }; ganMock.mockClear() })

describe('createTicket + dòng máy', () => {
  it('cổng cs.ticket.tao_sua chạy trước, không đụng DB/gán khi bị từ chối', async () => {
    quyenLoi = true
    await expect(createTicket({ ...base, dong_may: [{ serial: S1 }] })).rejects.toThrow()
    expect(chuoi).toEqual(['quyen:cs.ticket.tao_sua'])
  })
  it('không serial ở đâu cả thì từ chối', async () => {
    const r = await createTicket({ ...base, dong_may: [{ serial: '  ' }] })
    expect(r.ok).toBe(false)
    expect(insertArg).toBeNull()
  })
  it('chỉ có dòng máy: source_serial lấy dòng đầu (chuẩn hoá), serial để trống (tránh vỡ FK)', async () => {
    const r = await createTicket({ ...base, dong_may: [{ serial: ` ${S1.toLowerCase()} ` }] })
    expect(r.ok).toBe(true)
    expect(insertArg).toMatchObject({ serial: null, source_serial: S1 })
  })
  it('serial đã lắp + source_serial riêng được giữ nguyên', async () => {
    await createTicket({ ...base, serial: S1, source_serial: 'XYZ' })
    expect(insertArg).toMatchObject({ serial: S1, source_serial: 'XYZ' })
  })
  it('gán dòng máy SAU khi insert ticket', async () => {
    const dong = [{ serial: S1, loi_code: 'CHUA_PHAN_LOAI' }]
    const r = await createTicket({ ...base, dong_may: dong })
    expect(chuoi.indexOf('insert')).toBeLessThan(chuoi.indexOf('gan'))
    expect(ganMock).toHaveBeenCalledWith(expect.stringMatching(/^TK-\d{4}-001$/), dong)
    expect(r).toMatchObject({ ok: true })
  })
  it('gán lỗi thì ticket vẫn tạo, trả canhBao', async () => {
    ganTra = { ok: false, error: 'Mã lỗi không dùng được' }
    const r = await createTicket({ ...base, dong_may: [{ serial: S1 }] })
    expect(r).toMatchObject({ ok: true })
    expect((r as { canhBao?: string }).canhBao).toContain('Mã lỗi không dùng được')
  })
  it('quá 20 dòng bị chặn trước khi tạo ticket', async () => {
    const r = await createTicket({ ...base, dong_may: Array.from({ length: 21 }, () => ({ serial: S1 })) })
    expect(r.ok).toBe(false)
    expect(insertArg).toBeNull()
  })
})
