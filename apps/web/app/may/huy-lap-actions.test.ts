import { beforeEach, describe, expect, it, vi } from 'vitest'

let rpcGoi: { ten: string; arg: Record<string, unknown> }[] = []
let rpcKq: { data: unknown; error: { message: string } | null } = { data: null, error: null }
let may: Record<string, unknown> | null = null
let con: Record<string, unknown>[] = []
let audit: unknown[] = []

function builder(t: string) {
  let laCon = false
  const b: Record<string, unknown> = {}
  for (const m of ['select', 'order']) b[m] = () => b
  b.eq = (k: string) => { if (k === 'parent_serial') laCon = true; return b }
  b.maybeSingle = async () => ({ data: t === 'installed_base' ? may : null, error: null })
  b.then = (res: (v: unknown) => unknown) => Promise.resolve({ data: laCon ? con : [], error: null }).then(res)
  return b
}
vi.mock('server-only', () => ({}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/nen-tang/db', () => ({
  dataClient: () => ({ from: builder, rpc: vi.fn(async (ten: string, arg: Record<string, unknown>) => { rpcGoi.push({ ten, arg }); return rpcKq }) }),
}))
vi.mock('@/lib/nen-tang/phien', () => ({ requireStaff: vi.fn(async () => ({})) }))
vi.mock('@/lib/nen-tang/nhat-ky', () => ({ ghiAudit: vi.fn(async (...a: unknown[]) => { audit.push(a) }) }))
vi.mock('@/lib/nen-tang/kiem-quyen', () => ({ doQuyen: vi.fn(async () => {}) }))

import { docThongTinLap, huyLapMay, suaNgayBaoHanhBo } from './huy-lap-actions'

const gioTruoc = (h: number) => new Date(Date.now() - h * 3600_000).toISOString()
beforeEach(() => { rpcGoi = []; audit = []; rpcKq = { data: null, error: null }; may = null; con = [] })

describe('docThongTinLap', () => {
  it('bộ: có danh sách thiết bị + hạn BH, huỷ được', async () => {
    may = { serial: 'WH30AECO202611002', parent_serial: null, install_date: '2026-11-15', created_at: gioTruoc(2) }
    con = [
      { serial: 'F1', internal_code: 'GTEC-30A01-G', cho_serial: false, created_at: gioTruoc(2), warranty: [{ full_end: '2027-11-15' }] },
      { serial: 'TAM202611004', internal_code: 'GTEP-00X00', cho_serial: true, created_at: gioTruoc(2), warranty: { full_end: null } },
    ]
    const r = await docThongTinLap('WH30AECO202611002')
    expect(r.la_bo).toBe(true)
    expect(r.huy_duoc).toBe(true)
    expect(r.con).toEqual([
      { serial: 'F1', internal_code: 'GTEC-30A01-G', cho_serial: false, full_end: '2027-11-15' },
      { serial: 'TAM202611004', internal_code: 'GTEP-00X00', cho_serial: true, full_end: null },
    ])
  })
  it('lắp lâu rồi vẫn huỷ được (bất cứ lúc nào — anh Dũng 18/11)', async () => {
    may = { serial: 'X', parent_serial: null, install_date: '2024-01-15', created_at: gioTruoc(24 * 400) }
    expect((await docThongTinLap('X')).huy_duoc).toBe(true)
  })
  it('thiết bị trong bộ → không huỷ lẻ, trỏ về bộ', async () => {
    may = { serial: 'F1', parent_serial: 'WH30AECO202611002', install_date: '2026-11-15', created_at: gioTruoc(1) }
    const r = await docThongTinLap('F1')
    expect(r).toMatchObject({ la_bo: false, bo_cha: 'WH30AECO202611002', huy_duoc: false })
  })
})

describe('huyLapMay', () => {
  it('bắt buộc lý do — thiếu thì không gọi DB', async () => {
    expect((await huyLapMay('X', ' sai ')).ok).toBe(false)
    expect(rpcGoi).toEqual([])
  })
  it('gọi huy_lap_may KHÔNG giới hạn giờ, ghi audit kèm lý do + serial đã xoá', async () => {
    rpcKq = { data: { so_may: 3, serials: ['A', 'B', 'C'], tra_kho: ['A'], customer_id: 'k1' }, error: null }
    expect(await huyLapMay('C', 'nhập nhầm bộ')).toEqual({ ok: true, customer_id: 'k1', so_may: 3 })
    expect(rpcGoi).toEqual([{ ten: 'huy_lap_may', arg: { p_serial: 'C', p_so_gio: null } }])
    expect(audit[0]).toEqual(['huy_lap_may', 'serial:C', { ly_do: 'nhập nhầm bộ', serials: ['A', 'B', 'C'], tra_kho: ['A'] }])
  })
  it('DB chặn (đã có ticket / lịch bảo trì) → hiện nguyên câu', async () => {
    rpcKq = { data: null, error: { message: 'Máy / bộ đã có ticket hoặc lịch bảo trì — không huỷ được' } }
    expect(await huyLapMay('C', 'nhập nhầm bộ')).toEqual({ ok: false, error: 'Máy / bộ đã có ticket hoặc lịch bảo trì — không huỷ được' })
    expect(audit).toEqual([])
  })
})

describe('suaNgayBaoHanhBo', () => {
  it('ngày hợp lệ → RPC + audit', async () => {
    rpcKq = { data: 3, error: null }
    expect(await suaNgayBaoHanhBo('WH30AECO202611002', '2026-11-10')).toEqual({ ok: true, so_thiet_bi: 3 })
    expect(rpcGoi[0]).toEqual({ ten: 'sua_ngay_bh_bo', arg: { p_bo: 'WH30AECO202611002', p_ngay: '2026-11-10' } })
  })
  it('ngày sai → chặn trước DB', async () => {
    expect((await suaNgayBaoHanhBo('B', '10/11/2026')).ok).toBe(false)
    expect(rpcGoi).toEqual([])
  })
})
