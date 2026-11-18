import { beforeEach, describe, expect, it, vi } from 'vitest'

let rpcGoi: { ten: string; arg: Record<string, unknown> }[] = []
let rpcKq: { data: unknown; error: { message: string } | null } = { data: 'TAM202611001', error: null }
let dm1: string | null = 'Machines'
let ghi: { bang: string; op: string; arg: Record<string, unknown> }[] = []
let quyenLoi = false

function builder(t: string) {
  const b: Record<string, unknown> = {}
  for (const m of ['select', 'eq', 'limit', 'order']) b[m] = () => b
  b.maybeSingle = async () => ({
    data: t === 'catalog_item' ? (dm1 ? { 'Danh mục cấp 1': dm1 } : null) : t === 'installed_base' ? { customer_id: 'k1', cho_serial: true, internal_code: 'CTS20NG' } : null,
    error: null,
  })
  b.insert = async (a: Record<string, unknown>) => { ghi.push({ bang: t, op: 'insert', arg: a }); return { error: null } }
  b.update = (a: Record<string, unknown>) => { ghi.push({ bang: t, op: 'update', arg: a }); return b }
  b.then = (res: (v: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(res)
  return b
}
vi.mock('server-only', () => ({}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/nen-tang/db', () => ({
  dataClient: () => ({ from: builder, rpc: vi.fn(async (ten: string, arg: Record<string, unknown>) => { rpcGoi.push({ ten, arg }); return rpcKq }) }),
}))
vi.mock('@/lib/nen-tang/phien', () => ({ requireStaff: vi.fn(async () => ({})), layNhanVien: vi.fn(async () => ({ email: 'cs@gwt.vn' })) }))
vi.mock('@/lib/nen-tang/nhat-ky', () => ({ ghiAudit: vi.fn(async () => {}) }))
vi.mock('@/lib/nen-tang/kiem-quyen', () => ({ doQuyen: vi.fn(async () => { if (quyenLoi) throw new Error('KHONG_DU_QUYEN') }) }))

import { boSungSerial, docChoSerial, kichHoatChuaSerial } from './chua-serial-actions'

const vao = { internal_code: 'CTS20NG', customer_id: 'k1', install_date: '2026-11-18' }
beforeEach(() => { rpcGoi = []; ghi = []; rpcKq = { data: 'TAM202611001', error: null }; dm1 = 'Machines'; quyenLoi = false })

describe('kichHoatChuaSerial', () => {
  it('gọi RPC kich_hoat_bh_chua_serial, trả mã tạm', async () => {
    expect(await kichHoatChuaSerial({ ...vao, install_address: ' Đà Nẵng ' })).toEqual({ ok: true, serial: 'TAM202611001' })
    expect(rpcGoi).toEqual([{ ten: 'kich_hoat_bh_chua_serial', arg: {
      p_customer: 'k1', p_internal_code: 'CTS20NG', p_model: null, p_install_date: '2026-11-18',
      p_install_address: 'Đà Nẵng', p_ngay_lap_do_chac: 'chinh_xac', p_ghi_chu: null,
    } }])
  })
  it('chưa chọn máy / khách / ngày sai → chặn trước khi gọi DB', async () => {
    expect((await kichHoatChuaSerial({ ...vao, internal_code: ' ' })).ok).toBe(false)
    expect((await kichHoatChuaSerial({ ...vao, customer_id: '' })).ok).toBe(false)
    expect((await kichHoatChuaSerial({ ...vao, install_date: '18/11/2026' })).ok).toBe(false)
    expect(rpcGoi).toEqual([])
  })
  it('lõi / vật tư → không kích hoạt BH', async () => {
    dm1 = 'Filters'
    const r = await kichHoatChuaSerial(vao)
    expect(r.ok).toBe(false)
    expect(rpcGoi).toEqual([])
  })
  it('không đủ quyền → chặn', async () => {
    quyenLoi = true
    await expect(kichHoatChuaSerial(vao)).rejects.toThrow()
  })
})

describe('boSungSerial', () => {
  it('gọi RPC bo_sung_serial, ghi lịch sử serial thật + trạng thái kho đã lắp', async () => {
    rpcKq = { data: null, error: null }
    expect(await boSungSerial('TAM202611001', ' F00000266V9400030067 ')).toEqual({ ok: true, serial: 'F00000266V9400030067' })
    expect(rpcGoi).toEqual([{ ten: 'bo_sung_serial', arg: { p_tam: 'TAM202611001', p_serial: 'F00000266V9400030067' } }])
    expect(ghi.find((g) => g.bang === 'serial_su_dung')?.arg).toMatchObject({ serial: 'F00000266V9400030067', su_kien: 'lap_dat', den_trang_thai: 'da_lap', customer_id: 'k1' })
    expect(ghi.find((g) => g.bang === 'serial_registry')?.arg).toEqual({ trang_thai: 'da_lap' })
  })
  it('lỗi tiếng Việt từ DB (sai loại máy…) → hiện nguyên câu cho người dùng, không ghi lịch sử', async () => {
    rpcKq = { data: null, error: { message: 'Serial U1 là máy UPF10, còn máy đang chờ là CTS20NG — kiểm tra lại' } }
    expect(await boSungSerial('TAM202611001', 'U1')).toEqual({ ok: false, error: 'Serial U1 là máy UPF10, còn máy đang chờ là CTS20NG — kiểm tra lại' })
    expect(ghi).toEqual([])
  })
  it('lỗi kỹ thuật → câu chung', async () => {
    rpcKq = { data: null, error: { message: 'connection reset' } }
    expect(await boSungSerial('TAM202611001', 'U1')).toEqual({ ok: false, error: 'Không thực hiện được, vui lòng thử lại.' })
  })
  it('thiếu serial → chặn', async () => {
    expect((await boSungSerial('TAM202611001', '  ')).ok).toBe(false)
    expect(rpcGoi).toEqual([])
  })
})

describe('docChoSerial', () => {
  it('đọc cờ chờ serial từ installed_base', async () => {
    expect(await docChoSerial('TAM202611001')).toEqual({ cho_serial: true, internal_code: 'CTS20NG' })
  })
})
