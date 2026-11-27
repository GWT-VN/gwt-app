import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Hai DB giả: ghi lại `nguồn:schema.bảng` mỗi lần đọc; dữ liệu theo khoá đó (không có → rỗng).
const goi: string[] = []
let duLieu: Record<string, Record<string, unknown>[]> = {}
function bang(nguon: 'st' | 'md', schema: string, ten: string) {
  const khoa = `${nguon}:${schema}.${ten}`
  goi.push(khoa)
  const kq = () => ({ data: duLieu[khoa] ?? [], error: null, count: (duLieu[khoa] ?? []).length })
  const b: Record<string, unknown> = new Proxy({}, {
    get: (_, p: string) => (p === 'then' ? (res: (v: unknown) => unknown) => Promise.resolve(kq()).then(res) : () => b),
  })
  return b
}
const client = (nguon: 'st' | 'md') => ({
  from: (t: string) => bang(nguon, 'public', t),
  schema: (s: string) => ({ from: (t: string) => bang(nguon, s, t) }),
})

vi.mock('server-only', () => ({}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/nen-tang/db', () => ({ dataClient: () => client('st'), mdClient: () => client('md') }))
vi.mock('@/lib/nen-tang/phien', () => ({ requireStaff: vi.fn(async () => ({})), layNhanVien: vi.fn(async () => ({ id: 'nv1' })) }))
vi.mock('@/lib/nen-tang/kiem-quyen', () => ({
  doQuyen: vi.fn(async () => {}), coQuyen: vi.fn(async () => true), coQuyenHienNut: vi.fn(async () => true),
}))

import { searchTickets } from './actions'
import { danhMucLoi } from './ticket/loi-actions'

beforeEach(() => {
  goi.length = 0
  duLieu = {}
})
afterEach(() => vi.unstubAllEnvs())

describe('searchTickets theo CSKH_NGUON', () => {
  it('md: đọc customer_care.v_tickets kể cả khi lọc mã lỗi (view MD có sẵn loi_codes); dòng máy từ issue_reports', async () => {
    vi.stubEnv('CSKH_NGUON', 'md')
    duLieu = {
      'md:customer_care.v_tickets': [{ ticket_code: 'TK-1', state: 'Open', created_at: '2026-11-20T02:00:00Z', khan: false }],
      'md:customer_care.issue_reports': [{
        id: 'r1', ticket_code: 'TK-1', report_no: 1, serial: null, source_serial: null, internal_code: null, issue_code: 'E3',
        customer_said: null, handling: null, handling_source: null, status: 'khong_loi', created_at: '2026-11-20T02:00:00Z', issue_codes: { name: 'Lỗi E3' },
      }],
    }
    const kq = await searchTickets('', undefined, false, undefined, { loiCode: 'E3' })
    expect(kq.rows.map((r) => r.ticket_code)).toEqual(['TK-1'])
    expect(kq.rows[0].dong_may?.map((d) => d.loi_code)).toEqual(['E3'])
    expect(goi).toContain('md:customer_care.v_tickets')
    expect(goi).not.toContain('st:public.v_tickets_loi')
    expect(goi).not.toContain('st:public.v_tickets')
    expect(goi).not.toContain('st:public.ticket_may')
  })

  it('st: như cũ — lọc mã lỗi đi v_tickets_loi của ST, không gọi MD', async () => {
    vi.stubEnv('CSKH_NGUON', '')
    duLieu = { 'st:public.v_tickets_loi': [{ ticket_code: 'TK-1', state: 'Open', created_at: '2026-11-20T02:00:00Z', khan: false }] }
    const kq = await searchTickets('', undefined, false, undefined, { loiCode: 'E3' })
    expect(kq.rows.map((r) => r.ticket_code)).toEqual(['TK-1'])
    expect(goi).toContain('st:public.v_tickets_loi')
    expect(goi.filter((g) => g.startsWith('md:'))).toEqual([])
  })
})

describe('danhMucLoi theo CSKH_NGUON', () => {
  it('md: customer_care.issue_codes đổi sang khuôn LoiDanhMuc', async () => {
    vi.stubEnv('CSKH_NGUON', 'md')
    duLieu = {
      'md:customer_care.issue_codes': [{
        code: 'E3', group_code: 'NUOC', name: 'Lỗi E3', aliases: ['e3'], model_patterns: ['CTS20'], signs: 'đèn đỏ', handling: 'thay van',
        source: 'app', status: 'da_duyet', approved_by: 'a@gwt.vn', approved_at: '2026-11-01T00:00:00Z', sort_order: null,
      }],
    }
    expect(await danhMucLoi()).toEqual([{
      code: 'E3', nhom: 'NUOC', ten: 'Lỗi E3', aliases: ['e3'], ma_may: ['CTS20'], dau_hieu: 'đèn đỏ', huong_xu_ly: 'thay van',
      nguon: 'app', trang_thai: 'da_duyet', duyet_boi: 'a@gwt.vn', duyet_luc: '2026-11-01T00:00:00Z', thu_tu: 0,
    }])
    expect(goi).toEqual(['md:customer_care.issue_codes'])
  })

  it('st: loi_danh_muc như cũ', async () => {
    vi.stubEnv('CSKH_NGUON', '')
    duLieu = { 'st:public.loi_danh_muc': [{ code: 'E3', ten: 'Lỗi E3' }] }
    expect(await danhMucLoi()).toEqual([{ code: 'E3', ten: 'Lỗi E3' }])
    expect(goi).toEqual(['st:public.loi_danh_muc'])
  })
})
