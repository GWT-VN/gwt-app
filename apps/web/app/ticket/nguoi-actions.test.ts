import { beforeEach, describe, expect, it, vi } from 'vitest'

// DB giả: mỗi bảng một danh sách dòng; ghi lại mọi update / insert để kiểm.
let rows: Record<string, Record<string, unknown>[]> = {}
let ghi: { bang: string; op: 'update' | 'insert' | 'delete'; arg: Record<string, unknown> }[] = []
let quyenLoi = false

function builder(t: string) {
  let op: 'select' | 'update' | 'insert' | 'delete' = 'select'
  const loc: [string, unknown][] = []
  const b: Record<string, unknown> = {}
  const khop = () => (rows[t] ?? []).filter((r) => loc.every(([k, v]) => r[k] === v))
  for (const m of ['select', 'order', 'limit']) b[m] = () => b
  b.eq = (k: string, v: unknown) => { loc.push([k, v]); return b }
  b.update = (a: Record<string, unknown>) => { op = 'update'; ghi.push({ bang: t, op, arg: a }); return b }
  b.insert = (a: Record<string, unknown>) => { op = 'insert'; ghi.push({ bang: t, op, arg: a }); return b }
  b.delete = () => { op = 'delete'; ghi.push({ bang: t, op, arg: {} }); return b }
  b.single = async () => ({ data: { id: 'moi' }, error: null })
  b.maybeSingle = async () => ({ data: khop()[0] ?? null, error: null })
  b.then = (res: (v: unknown) => unknown) => Promise.resolve({ data: khop(), error: null }).then(res)
  return b
}
vi.mock('server-only', () => ({}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/nen-tang/db', () => ({ dataClient: () => ({ from: builder }) }))
vi.mock('@/lib/nen-tang/phien', () => ({ requireStaff: vi.fn(async () => ({})) }))
vi.mock('@/lib/nen-tang/nhat-ky', () => ({ ghiAudit: vi.fn(async () => {}) }))
vi.mock('@/lib/nen-tang/kiem-quyen', () => ({
  doQuyen: vi.fn(async () => { if (quyenLoi) throw new Error('KHONG_DU_QUYEN') }),
}))

import { docNguoiTicket, doiTenNguoi, ganCsTheoDoi, ganKyThuat, themNguoi, xoaNguoi } from './nguoi-actions'

const MA = 'GWT-260053'
beforeEach(() => {
  quyenLoi = false; ghi = []
  rows = {
    cs_theo_doi_ds: [
      { id: 'c1', ten: 'Hiệp', hoat_dong: true }, { id: 'c2', ten: 'Tuyết Trang', hoat_dong: false },
    ],
    ky_thuat: [
      { id: 't1', ten: 'Đỗ Ngọc Bình', hoat_dong: true, la_ctv: false, email: 'binh@gwt.vn' },
      { id: 't2', ten: 'Trần Văn Sơn', hoat_dong: true, la_ctv: true, email: null },
      { id: 't3', ten: 'Thợ cũ', hoat_dong: false, la_ctv: true, email: null },
    ],
    staff: [{ id: 's-binh', email: 'Binh@GWT.vn', hoat_dong: true }],
    tickets: [{ ticket_code: MA, cs_theo_doi: null, kt_ho_so: null }],
    lich_ky_thuat: [{ id: 'l1', ky_thuat_id: 't1' }],
  }
})

describe('ganKyThuat', () => {
  it('thợ có tài khoản (khớp email) → ghi kt_ho_so + ky_thuat = tài khoản, để "ticket của tôi" chạy', async () => {
    expect(await ganKyThuat(MA, 't1')).toEqual({ ok: true })
    expect(ghi).toEqual([{ bang: 'tickets', op: 'update', arg: { kt_ho_so: 't1', ky_thuat: 's-binh' } }])
  })
  it('CTV không tài khoản → ky_thuat = null', async () => {
    await ganKyThuat(MA, 't2')
    expect(ghi[0].arg).toEqual({ kt_ho_so: 't2', ky_thuat: null })
  })
  it('bỏ gán → xoá cả hai cột', async () => {
    await ganKyThuat(MA, null)
    expect(ghi[0].arg).toEqual({ kt_ho_so: null, ky_thuat: null })
  })
  it('thợ đã ẩn → không gán được (trừ khi ticket đang gán sẵn)', async () => {
    const r = await ganKyThuat(MA, 't3')
    expect(r.ok).toBe(false)
    expect(ghi).toEqual([])
    rows.tickets[0].kt_ho_so = 't3'
    expect((await ganKyThuat(MA, 't3')).ok).toBe(true)
  })
  it('mã ticket rỗng → không đụng DB; mã không tồn tại → báo không thấy ticket', async () => {
    expect((await ganKyThuat('  ', 't1')).ok).toBe(false)
    expect(ghi).toEqual([])
    expect(await ganKyThuat('GWT-999999', 't1')).toEqual({ ok: false, error: 'Không thấy ticket.' })
  })
  it('không đủ quyền → chặn trước mọi thứ', async () => {
    quyenLoi = true
    await expect(ganKyThuat(MA, 't1')).rejects.toThrow()
    expect(ghi).toEqual([])
  })
})

describe('ganCsTheoDoi', () => {
  it('ghi TÊN người (cột cs_theo_doi là tên, FK sang danh sách)', async () => {
    await ganCsTheoDoi(MA, 'c1')
    expect(ghi[0]).toEqual({ bang: 'tickets', op: 'update', arg: { cs_theo_doi: 'Hiệp' } })
  })
  it('không còn "ẩn": người cũ bị ẩn trước đây vẫn chọn / gán được (18/11: chỉ Thêm + Xoá)', async () => {
    expect((await docNguoiTicket(MA)).cs.every((x) => x.hoat_dong)).toBe(true)
    expect(await ganCsTheoDoi(MA, 'c2')).toEqual({ ok: true })
  })
})

describe('themNguoi / doiTenNguoi / datHienNguoi', () => {
  it('thêm tên mới (CS) → insert, thứ tự cuối danh sách', async () => {
    const r = await themNguoi('cs', '  Thanh   Hiền ')
    expect(r).toEqual({ ok: true, id: 'moi', ten: 'Thanh Hiền' })
    expect(ghi[0]).toEqual({ bang: 'cs_theo_doi_ds', op: 'insert', arg: { ten: 'Thanh Hiền', thu_tu: 3 } })
  })
  it('thêm thợ CTV → la_ctv = true', async () => {
    await themNguoi('kt', 'Nguyễn Văn Đại', true)
    expect(ghi[0].arg).toEqual({ ten: 'Nguyễn Văn Đại', la_ctv: true, hoat_dong: true })
  })
  it('gõ trùng người đã có → dùng lại, không tạo bản trùng', async () => {
    const r = await themNguoi('cs', 'tuyet trang')
    expect(r).toEqual({ ok: true, id: 'c2', ten: 'Tuyết Trang' })
    expect(ghi.filter((g) => g.op === 'insert')).toEqual([])
  })
  it('đổi tên trùng người khác → chặn', async () => {
    expect((await doiTenNguoi('kt', 't2', 'do ngoc binh')).ok).toBe(false)
    expect(ghi).toEqual([])
  })
  it('đổi tên hợp lệ → update tên', async () => {
    expect(await doiTenNguoi('kt', 't2', 'Trần Văn Sơn (HCM)')).toEqual({ ok: true })
    expect(ghi[0]).toEqual({ bang: 'ky_thuat', op: 'update', arg: { ten: 'Trần Văn Sơn (HCM)' } })
  })
  it('xoá CS → xoá dòng trong danh sách (ticket đang gán về chưa gán nhờ FK on delete set null)', async () => {
    expect(await xoaNguoi('cs', 'c1')).toEqual({ ok: true })
    expect(ghi).toEqual([{ bang: 'cs_theo_doi_ds', op: 'delete', arg: {} }])
  })
  it('xoá thợ chưa có lịch kỹ thuật → xoá', async () => {
    expect(await xoaNguoi('kt', 't2')).toEqual({ ok: true })
    expect(ghi).toEqual([{ bang: 'ky_thuat', op: 'delete', arg: {} }])
  })
  it('xoá thợ ĐÃ có lịch kỹ thuật → chặn (giữ lịch sử lịch + ngày nghỉ)', async () => {
    const r = await xoaNguoi('kt', 't1')
    expect(r.ok).toBe(false)
    expect(ghi).toEqual([])
  })
  it('xoá người không có → báo không thấy', async () => {
    expect((await xoaNguoi('cs', 'zz')).ok).toBe(false)
  })
  it('loại danh sách lạ → chặn', async () => {
    // @ts-expect-error cố tình truyền sai từ client
    expect((await themNguoi('staff', 'A')).ok).toBe(false)
  })
})
