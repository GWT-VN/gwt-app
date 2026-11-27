import { beforeEach, describe, expect, it, vi } from 'vitest'

// MD giả: bảng customer_care.issue_reports; ghi lại mọi insert / update; lỗi insert lấy lần lượt từ `loiInsert`.
let rows: Record<string, unknown>[] = []
let ghi: { op: 'insert' | 'update'; arg: Record<string, unknown>; loc: [string, unknown][] }[] = []
let loiInsert: ({ code: string; message?: string } | null)[] = []
let soLanGoi = 0
let schemaGoi: string[] = []
let nguon: 'md' | 'st' = 'md'

function builder(bang: string) {
  soLanGoi++
  let op: 'select' | 'insert' | 'update' = 'select'
  let arg: Record<string, unknown> = {}
  const loc: [string, unknown][] = []
  const b: Record<string, unknown> = {}
  const khop = () => rows.filter((r) => loc.every(([k, v]) => r[k] === v))
  b.select = () => b
  b.order = () => b
  b.eq = (k: string, v: unknown) => {
    loc.push([k, v])
    return b
  }
  b.insert = (a: Record<string, unknown>) => {
    op = 'insert'
    arg = a
    ghi.push({ op, arg: a, loc })
    return b
  }
  b.update = (a: Record<string, unknown>) => {
    op = 'update'
    arg = a
    ghi.push({ op, arg: a, loc })
    return b
  }
  const ket = () => {
    if (bang !== 'issue_reports') return { data: null, error: { code: 'X', message: `sai bảng ${bang}` } }
    if (op === 'insert') {
      const e = loiInsert.shift() ?? null
      if (e) return { data: null, error: e }
      const moi: Record<string, unknown> = { id: '11111111-1111-4111-8111-111111111111', ...arg }
      rows.push(moi)
      return { data: { id: moi.id, report_no: moi.report_no }, error: null }
    }
    if (op === 'update') return { data: khop().map((r) => ({ id: r.id })), error: null }
    return { data: khop(), error: null }
  }
  b.single = async () => ket()
  b.then = (res: (v: unknown) => unknown) => Promise.resolve(ket()).then(res)
  return b
}

vi.mock('server-only', () => ({}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/nen-tang/db', () => ({
  mdClient: () => ({
    schema: (s: string) => {
      schemaGoi.push(s)
      return { from: builder }
    },
  }),
  dataClient: () => {
    throw new Error('không được gọi ST')
  },
}))
vi.mock('@/lib/nen-tang/phien', () => ({ requireStaff: vi.fn(async () => ({ email: 'cs@gwt.vn' })) }))
vi.mock('@/lib/nen-tang/nhat-ky', () => ({ ghiAudit: vi.fn(async () => {}) }))
vi.mock('@/lib/nen-tang/kiem-quyen', () => ({ doQuyen: vi.fn(async () => {}) }))
vi.mock('@/lib/cskh/nguon', () => ({ cskhNguon: () => nguon }))
vi.mock('@/app/ticket/lan-loi-actions', () => ({ listLanLoi: vi.fn(async () => [{ id: 'st1', lan: 2 }]) }))

import { requireStaff } from '@/lib/nen-tang/phien'
import { doQuyen } from '@/lib/nen-tang/kiem-quyen'
import { docLanLoi, listLanLoiMd, suaLanLoiMd, themLanLoiMd } from './lan-loi-md-actions'

const MA = 'TK-DEMO-901'
const ID = '22222222-2222-4222-8222-222222222222'
beforeEach(() => {
  ghi = []
  loiInsert = []
  soLanGoi = 0
  schemaGoi = []
  nguon = 'md'
  vi.mocked(requireStaff).mockClear()
  vi.mocked(doQuyen).mockClear()
  rows = [
    {
      id: ID, ticket_code: MA, report_no: 1, serial: 'SR-1', issue_code: 'E3', issue_codes: { name: 'Báo lỗi E3' },
      reported_on: '2026-11-20', customer_said: 'Rò nước', handling: null, status: 'cho_xu_ly', created_by: null,
    },
    { id: 'khac', ticket_code: 'TK-KHAC', report_no: 7, serial: null, issue_code: 'CHUA_PHAN_LOAI', status: 'cho_xu_ly' },
  ]
})

describe('listLanLoiMd', () => {
  it('đọc customer_care.issue_reports của đúng ticket, tên mã lỗi ra issue_name', async () => {
    const ds = await listLanLoiMd(MA)
    expect(schemaGoi).toEqual(['customer_care'])
    // DB giả không chiếu cột → so phần mong đợi; phần embed issue_codes phải được gỡ ra.
    expect(ds).toHaveLength(1)
    expect(ds[0]).toMatchObject({
      id: ID, report_no: 1, serial: 'SR-1', issue_code: 'E3', issue_name: 'Báo lỗi E3', reported_on: '2026-11-20',
      customer_said: 'Rò nước', handling: null, status: 'cho_xu_ly', created_by: null,
    })
    expect(ds[0]).not.toHaveProperty('issue_codes')
    expect(requireStaff).toHaveBeenCalled()
    expect(doQuyen).toHaveBeenCalledWith('cs.ticket.xem')
  })
  it('mã sai → [], không gọi DB', async () => {
    expect(await listLanLoiMd('')).toEqual([])
    expect(soLanGoi).toBe(0)
  })
})

describe('themLanLoiMd', () => {
  it('report_no = max + 1, mặc định CHUA_PHAN_LOAI / cho_xu_ly, máy = máy lần trước, ghi người tạo; trả id', async () => {
    const r = await themLanLoiMd(MA, { customer_said: '  Lại rò  ', reported_on: '2026-11-21' })
    expect(r).toEqual({ ok: true, id: '11111111-1111-4111-8111-111111111111', report_no: 2 })
    const ins = ghi.filter((g) => g.op === 'insert')
    expect(ins).toHaveLength(1)
    expect(ins[0].arg).toEqual({
      ticket_code: MA, report_no: 2, serial: 'SR-1', issue_code: 'CHUA_PHAN_LOAI', status: 'cho_xu_ly',
      reported_on: '2026-11-21', customer_said: 'Lại rò', created_by: 'cs@gwt.vn',
    })
    expect(doQuyen).toHaveBeenCalledWith('cs.ticket.tao_sua')
  })
  it('ticket chưa có lần nào → report_no 1; không ngày → hôm nay giờ VN', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-11-27T20:00:00Z')) // 03:00 ngày 28 giờ VN
    try {
      rows = []
      const r = await themLanLoiMd(MA, { customer_said: 'Mới' })
      expect(r).toMatchObject({ ok: true, report_no: 1 })
      expect(ghi[0].arg).toMatchObject({ report_no: 1, serial: null, reported_on: '2026-11-28' })
    } finally {
      vi.useRealTimers()
    }
  })
  it('máy truyền rõ → dùng máy đó', async () => {
    await themLanLoiMd(MA, { customer_said: 'x', serial: ' SR-2 ' })
    expect(ghi[0].arg).toMatchObject({ serial: 'SR-2' })
  })
  it('23505 → thử lại đúng 1 lần, lần 2 thành công', async () => {
    loiInsert = [{ code: '23505' }]
    const r = await themLanLoiMd(MA, { customer_said: 'x' })
    expect(r.ok).toBe(true)
    expect(ghi.filter((g) => g.op === 'insert')).toHaveLength(2)
  })
  it('23505 cả 2 lần → báo bấm Lưu lại, không thử lần 3', async () => {
    loiInsert = [{ code: '23505' }, { code: '23505' }, { code: '23505' }]
    const r = await themLanLoiMd(MA, { customer_said: 'x' })
    expect(r).toEqual({ ok: false, error: 'Có người vừa thêm lần lỗi khác, bấm Lưu lại.' })
    expect(ghi.filter((g) => g.op === 'insert')).toHaveLength(2)
  })
  it('lỗi DB khác → không thử lại', async () => {
    loiInsert = [{ code: '23503' }]
    const r = await themLanLoiMd(MA, { customer_said: 'x' })
    expect(r.ok).toBe(false)
    expect(ghi.filter((g) => g.op === 'insert')).toHaveLength(1)
  })
  it('mã ticket sai định dạng → ok:false, không gọi DB', async () => {
    const r = await themLanLoiMd('', { customer_said: 'x' })
    expect(r.ok).toBe(false)
    expect(soLanGoi).toBe(0)
  })
  it('ngày tương lai / chữ quá dài → ok:false, không gọi DB', async () => {
    expect((await themLanLoiMd(MA, { customer_said: 'x', reported_on: '2999-01-01' })).ok).toBe(false)
    expect((await themLanLoiMd(MA, { customer_said: 'x'.repeat(4001) })).ok).toBe(false)
    expect(soLanGoi).toBe(0)
  })
})

describe('suaLanLoiMd', () => {
  it('chỉ gửi trường được phép, đã làm sạch; lọc đúng id + ticket', async () => {
    const r = await suaLanLoiMd(ID, MA, { status: 'da_xu_ly', handling: '  Thay gioăng ', ...({ ticket_code: 'HACK' } as object) })
    expect(r).toEqual({ ok: true })
    expect(ghi[0].arg).toEqual({ status: 'da_xu_ly', handling: 'Thay gioăng' })
    expect(ghi[0].loc).toEqual([
      ['id', ID],
      ['ticket_code', MA],
    ])
    expect(doQuyen).toHaveBeenCalledWith('cs.ticket.tao_sua')
  })
  it('xoá trắng ô → null', async () => {
    await suaLanLoiMd(ID, MA, { handling: '   ' })
    expect(ghi[0].arg).toEqual({ handling: null })
  })
  it('trạng thái lạ / mã lỗi sai / id sai / mã ticket sai / rỗng → ok:false, không gọi DB', async () => {
    expect((await suaLanLoiMd(ID, MA, { status: 'bay' as never })).ok).toBe(false)
    expect((await suaLanLoiMd(ID, MA, { issue_code: 'e 3' })).ok).toBe(false)
    expect((await suaLanLoiMd('abc', MA, { handling: 'x' })).ok).toBe(false)
    expect((await suaLanLoiMd(ID, '', { handling: 'x' })).ok).toBe(false)
    expect((await suaLanLoiMd(ID, MA, {})).ok).toBe(false)
    expect(soLanGoi).toBe(0)
  })
  it('không thấy dòng → báo đã bị xoá', async () => {
    const r = await suaLanLoiMd('33333333-3333-4333-8333-333333333333', MA, { handling: 'x' })
    expect(r).toEqual({ ok: false, error: 'Không thấy lần lỗi này (có thể đã bị xoá).' })
  })
})

describe('docLanLoi (chọn nguồn)', () => {
  it('md → đọc MD', async () => {
    const r = await docLanLoi(MA)
    expect(r.md).toBe(true)
    expect(r.ds).toHaveLength(1)
  })
  it('st → đọc ticket_lan_loi như cũ, không đụng MD', async () => {
    nguon = 'st'
    const r = await docLanLoi(MA)
    expect(r).toEqual({ md: false, ds: [{ id: 'st1', lan: 2 }] })
    expect(soLanGoi).toBe(0)
  })
})
