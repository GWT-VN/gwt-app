import { beforeEach, describe, expect, it, vi } from 'vitest'

// DB giả: mỗi bảng một danh sách dòng; ghi lại mọi update / insert để kiểm.
let rows: Record<string, Record<string, unknown>[]> = {}
let ghi: { bang: string; op: 'update' | 'insert' | 'delete'; arg: Record<string, unknown> }[] = []
let quyenLoi = false
let emailDangNhap: string | null = 'admin@gwt.vn'

function builder(t: string) {
  let op: 'select' | 'update' | 'insert' | 'delete' = 'select'
  const loc: [string, unknown][] = []
  const b: Record<string, unknown> = {}
  const khop = () => (rows[t] ?? []).filter((r) => loc.every(([k, v]) => r[k] === v))
  for (const m of ['select', 'order', 'limit', 'gte']) b[m] = () => b
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
vi.mock('@/lib/nen-tang/phien', () => ({
  requireStaff: vi.fn(async () => ({})), layNhanVien: vi.fn(async () => (emailDangNhap ? { email: emailDangNhap } : null)),
}))
vi.mock('@/lib/nen-tang/nhat-ky', () => ({ ghiAudit: vi.fn(async () => {}) }))
vi.mock('@/lib/nen-tang/kiem-quyen', () => ({
  doQuyen: vi.fn(async () => { if (quyenLoi) throw new Error('KHONG_DU_QUYEN') }),
}))

import { docNguoiTicket, dsNguoiQuanTri, ganCsTheoDoi, ganKyThuat, themNguoi, xoaNguoi } from './nguoi-actions'

const MA = 'GWT-260053'
beforeEach(() => {
  quyenLoi = false; ghi = []; emailDangNhap = 'admin@gwt.vn'
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
    tickets: [
      { ticket_code: MA, cs_theo_doi: null, kt_ho_so: null, state: 'Open' },
      { ticket_code: 'GWT-1', cs_theo_doi: 'Hiệp', kt_ho_so: 't2', state: 'Open' },
      { ticket_code: 'GWT-2', cs_theo_doi: 'Hiệp', kt_ho_so: 't2', state: 'Done' },
    ],
    lich_ky_thuat: [{ id: 'l1', ky_thuat_id: 't1', trang_thai: 'hen' }],
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
  it('người đã xoá (hoat_dong false, 19/11) → không gán mới được, vẫn đọc ra để ticket cũ hiện tên', async () => {
    expect((await docNguoiTicket(MA)).cs.find((x) => x.id === 'c2')?.hoat_dong).toBe(false)
    expect((await ganCsTheoDoi(MA, 'c2')).ok).toBe(false)
  })
})

describe('thêm / xoá người: chỉ admin@ + ai@ (Hiệp 19/11)', () => {
  it('tài khoản khác (trưởng CSKH tk@, CEO bella@) → không thêm, không xoá, không gọi DB ghi', async () => {
    for (const e of ['tk@gwt.vn', 'bella@gwt.vn', null]) {
      emailDangNhap = e
      expect((await themNguoi('cs', 'Thanh Hiền')).ok).toBe(false)
      expect((await xoaNguoi('cs', 'c1')).ok).toBe(false)
      expect((await dsNguoiQuanTri()).ok).toBe(false)
    }
    expect(ghi).toEqual([])
  })
  it('ai@ cũng được', async () => {
    emailDangNhap = 'ai@gwt.vn'
    expect((await themNguoi('cs', 'Thanh Hiền')).ok).toBe(true)
  })
  it('trang quản trị: số ticket ĐANG MỞ gán mỗi người (ticket đã xong không tính)', async () => {
    const r = await dsNguoiQuanTri()
    if (!r.ok) throw new Error(r.error)
    expect(r.cs.find((x) => x.id === 'c1')?.so_ticket).toBe(1)
    expect(r.kt.find((x) => x.id === 't2')?.so_ticket).toBe(1)
    expect(r.kt.find((x) => x.id === 't1')?.so_ticket).toBe(0)
    expect(r.kt.find((x) => x.id === 't1')?.so_lich_hen).toBe(1)
  })
})

describe('themNguoi / xoaNguoi (admin@)', () => {
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
  it('xoá CS = ngừng dùng, KHÔNG xoá dòng: ticket đang mở về chưa gán, ticket đã xong giữ tên', async () => {
    expect(await xoaNguoi('cs', 'c1')).toEqual({ ok: true, so_ticket: 1 })
    expect(ghi).toEqual([
      { bang: 'tickets', op: 'update', arg: { cs_theo_doi: null } },
      { bang: 'cs_theo_doi_ds', op: 'update', arg: { hoat_dong: false } },
    ])
    expect(ghi.some((g) => g.op === 'delete')).toBe(false)
  })
  it('xoá CS + chuyển ticket đang mở sang người khác → ghi tên người nhận', async () => {
    rows.cs_theo_doi_ds.push({ id: 'c3', ten: 'Hiền', hoat_dong: true })
    expect(await xoaNguoi('cs', 'c1', 'c3')).toEqual({ ok: true, so_ticket: 1 })
    expect(ghi[0]).toEqual({ bang: 'tickets', op: 'update', arg: { cs_theo_doi: 'Hiền' } })
  })
  it('xoá thợ (kể cả đã có lịch) = ngừng dùng; chuyển ticket sang thợ có tài khoản → ghi cả tài khoản', async () => {
    expect(await xoaNguoi('kt', 't2', 't1')).toEqual({ ok: true, so_ticket: 1 })
    expect(ghi).toEqual([
      { bang: 'tickets', op: 'update', arg: { kt_ho_so: 't1', ky_thuat: 's-binh' } },
      { bang: 'ky_thuat', op: 'update', arg: { hoat_dong: false } },
    ])
    expect((await xoaNguoi('kt', 't1')).ok).toBe(true)
  })
  it('người nhận không hợp lệ (chính người đó, người đã xoá, không có) → chặn, không ghi gì', async () => {
    for (const nhan of ['c1', 'c2', 'zz']) expect((await xoaNguoi('cs', 'c1', nhan)).ok).toBe(false)
    expect((await xoaNguoi('kt', 't2', 't3')).ok).toBe(false)
    expect(ghi).toEqual([])
  })
  it('xoá người đã xoá rồi → báo không thấy', async () => {
    expect((await xoaNguoi('cs', 'c2')).ok).toBe(false)
  })
  it('xoá người không có → báo không thấy', async () => {
    expect((await xoaNguoi('cs', 'zz')).ok).toBe(false)
  })
  it('loại danh sách lạ → chặn', async () => {
    // @ts-expect-error cố tình truyền sai từ client
    expect((await themNguoi('staff', 'A')).ok).toBe(false)
  })
})
