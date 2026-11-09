import { beforeEach, describe, expect, it, vi } from 'vitest'

const NV_ID = vi.hoisted(() => '22222222-2222-4222-8222-222222222222')
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
  for (const m of ['select', 'order', 'limit', 'range', 'in', 'ilike', 'or', 'neq', 'is', 'not']) b[m] = (...a: unknown[]) => { if (m === 'in' || m === 'neq') st.loc[`${m}:${a[0]}`] = a[1]; return b }
  b.eq = (c: string, v: unknown) => { st.loc[c] = v; return b }
  for (const m of ['insert', 'update', 'delete', 'upsert']) b[m] = (a?: unknown) => { st.op = m; st.arg = a; ghi.push({ op: m, bang, arg: a, loc: st.loc }); return b }
  b.maybeSingle = async () => tra()
  b.single = async () => tra()
  b.then = (res: (v: unknown) => unknown) => Promise.resolve(tra()).then(res)
  return b
}
let rpcTra: Record<string, unknown> = {}
const db = {
  from: (t: string) => { chuoi.push(`db:${t}`); return builder(t) },
  rpc: vi.fn(async (ten: string) => { chuoi.push(`rpc:${ten}`); return { data: rpcTra[ten] ?? { ok: true }, error: null } }),
}
vi.mock('server-only', () => ({}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/nen-tang/db', () => ({ dataClient: () => db }))
vi.mock('@/lib/nen-tang/phien', () => ({ requireStaff: vi.fn(async () => ({})), layNhanVien: vi.fn(async () => ({ id: NV_ID, email: 'a@gwt.vn' })) }))
vi.mock('@/lib/nen-tang/kiem-quyen', () => ({
  coQuyen: vi.fn(async () => { chuoi.push('coQuyen'); return coQuyenTra }),
  doQuyen: vi.fn(async () => { chuoi.push('doQuyen') }),
}))
vi.mock('@/lib/nen-tang/nhat-ky', () => ({ ghiAudit: vi.fn(async () => {}) }))
vi.mock('@/bang/timkiem', () => ({ boDau: (s: string) => s }))

import * as A from '../../app/ticket/loi-actions'

beforeEach(() => { ghi.length = 0; chuoi.length = 0; phan = {}; rpcTra = {}; coQuyenTra = true; db.rpc.mockClear() })

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

const UUID = '11111111-1111-4111-8111-111111111111'
const nhapLoi = { code: 'X1', nhom: null, ten: 't', aliases: [], ma_may: [], dau_hieu: null, huong_xu_ly: null, nguon: null, trang_thai: 'cho_duyet' as const, thu_tu: 1 }
const khongChamDb = () => expect(chuoi.filter((x) => /^(db|rpc):/.test(x))).toEqual([])

describe('dòng máy', () => {
  it('xoá: gọi RPC nguyên tử, dòng cuối bị từ chối', async () => {
    rpcTra = { cs_xoa_dong_may: { ok: false, loi: 'dong_cuoi' } }
    const r = await A.xoaDongMay(UUID)
    expect(r.ok).toBe(false)
    expect(db.rpc).toHaveBeenCalledWith('cs_xoa_dong_may', { p_id: UUID, p_nguoi: 'a@gwt.vn', p_nguoi_id: NV_ID })
    expect(ghi.some((g) => g.op === 'delete')).toBe(false)
  })
  it('xoá thành công', async () => {
    rpcTra = { cs_xoa_dong_may: { ok: true, ticket_code: 'T1' } }
    expect((await A.xoaDongMay(UUID)).ok).toBe(true)
  })
  it('id không phải UUID không chạm DB', async () => {
    expect((await A.xoaDongMay('abc')).ok).toBe(false)
    expect((await A.suaDongMay('abc', {})).ok).toBe(false)
    expect((await A.xacNhanHuongXuLy('abc', 'x', true)).ok).toBe(false)
    khongChamDb()
  })
  it('xacNhanHuongXuLy: chỉ ghi ticket_may, cs_sua=true, không đụng tickets', async () => {
    phan = { 'update:ticket_may': { data: { ticket_code: 'T1' } } }
    expect((await A.xacNhanHuongXuLy(UUID, 'Đổi bo', true)).ok).toBe(true)
    expect(ghi.map((g) => g.bang)).toEqual(['ticket_may'])
    expect(ghi[0].arg).toEqual({ huong_xu_ly: 'Đổi bo', huong_xu_ly_nguon: 'danh_muc', cs_sua: true })
  })
  it('xacNhanHuongXuLy: 0 dòng khớp → lỗi', async () => {
    expect((await A.xacNhanHuongXuLy(UUID, 'x', false)).ok).toBe(false)
  })
  it('xacNhanHuongXuLy: quá dài bị chặn', async () => {
    expect((await A.xacNhanHuongXuLy(UUID, 'x'.repeat(2001), false)).ok).toBe(false)
    khongChamDb()
  })
  it('suaDongMay đặt cs_sua = true', async () => {
    phan = { 'select:ticket_may': { data: { id: UUID, ticket_code: 'T1' } }, 'update:ticket_may': { data: { id: UUID } }, 'select:loi_danh_muc': { data: { trang_thai: 'da_duyet' } } }
    expect((await A.suaDongMay(UUID, { mo_ta: 'x', loi_code: 'L1' })).ok).toBe(true)
    expect((ghi.find((g) => g.op === 'update')!.arg as Record<string, unknown>).cs_sua).toBe(true)
  })
  it('mã lỗi ngừng dùng bị từ chối khi thêm dòng', async () => {
    phan = { 'select:loi_danh_muc': { data: { trang_thai: 'ngung' } } }
    expect(await A.themDongMay('T1', { loi_code: 'L1' })).toEqual({ ok: false, error: 'Mã lỗi không dùng được' })
    expect(db.rpc).not.toHaveBeenCalled()
  })
  it('themDongMay qua RPC (nguon app + thu_tu do DB cấp)', async () => {
    phan = { 'select:loi_danh_muc': { data: { trang_thai: 'da_duyet' } } }
    rpcTra = { cs_them_dong_may: { ok: true, id: 'n1' } }
    expect(await A.themDongMay('T1', { loi_code: 'L1', mo_ta: 'm' })).toEqual({ ok: true, id: 'n1' })
    expect(db.rpc).toHaveBeenCalledWith('cs_them_dong_may', expect.objectContaining({ p_ticket: 'T1', p_loi_code: 'L1', p_nguoi: 'a@gwt.vn' }))
  })
  it('themDongMay: đầu vào xấu không chạm DB', async () => {
    expect((await A.themDongMay('', {})).ok).toBe(false)
    expect((await A.themDongMay('T1', { mo_ta: 'x'.repeat(2001) })).ok).toBe(false)
    expect((await A.themDongMay('T1', { loi_code: 'a b!' })).ok).toBe(false)
    expect((await A.themDongMay('T1', { trang_thai: 'xx' as never })).ok).toBe(false)
    khongChamDb()
  })
  it('thiếu quyền ticket: thêm/sửa/xoá/xác nhận không chạm DB', async () => {
    const { doQuyen } = await import('@/lib/nen-tang/kiem-quyen')
    vi.mocked(doQuyen).mockImplementation(async () => { chuoi.push('doQuyen'); throw new Error('NEXT_REDIRECT') })
    await expect(A.themDongMay('T1', {})).rejects.toThrow()
    await expect(A.suaDongMay(UUID, {})).rejects.toThrow()
    await expect(A.xoaDongMay(UUID)).rejects.toThrow()
    await expect(A.xacNhanHuongXuLy(UUID, 'x', true)).rejects.toThrow()
    khongChamDb()
    vi.mocked(doQuyen).mockImplementation(async () => { chuoi.push('doQuyen') })
  })
})

describe('luuLoi: whitelist + validate', () => {
  it('chỉ ghi các cột cho phép; trường lạ bị bỏ', async () => {
    const r = await A.luuLoi({ ...nhapLoi, code: 'x-1', created_at: 'hack', duyet_boi: 'ke-gian' } as never)
    expect(r.ok).toBe(true)
    const w = ghi.find((g) => g.bang === 'loi_danh_muc')!.arg as Record<string, unknown>
    expect(Object.keys(w).sort()).toEqual(['aliases', 'code', 'dau_hieu', 'duyet_boi', 'duyet_luc', 'huong_xu_ly', 'ma_may', 'nguon', 'nhom', 'thu_tu', 'ten', 'trang_thai'].sort())
    expect(w.code).toBe('X-1')
    expect(w.duyet_boi).toBeNull()
  })
  it.each([
    ['mã sai', { code: 'a b' }],
    ['trạng thái lạ', { trang_thai: 'xx' }],
    ['tên quá dài', { ten: 'x'.repeat(201) }],
    ['hướng quá dài', { huong_xu_ly: 'x'.repeat(2001) }],
    ['quá nhiều alias', { aliases: Array.from({ length: 51 }, (_, i) => `a${i}`) }],
    ['alias quá dài', { ma_may: ['x'.repeat(101)] }],
  ])('%s → không chạm DB', async (_t, patch) => {
    expect((await A.luuLoi({ ...nhapLoi, ...patch } as never)).ok).toBe(false)
    khongChamDb()
  })
  it('nhóm không tồn tại bị từ chối', async () => {
    expect((await A.luuLoi({ ...nhapLoi, nhom: 'KHONG' })).ok).toBe(false)
    expect(ghi).toEqual([])
  })
})

describe('datTrangThaiLoi', () => {
  it('trạng thái lạ → lỗi, không DB', async () => {
    expect((await A.datTrangThaiLoi('X1', 'xx' as never)).ok).toBe(false)
    khongChamDb()
  })
  it('0 dòng khớp → lỗi', async () => {
    expect((await A.datTrangThaiLoi('x1', 'ngung')).ok).toBe(false)
  })
  it('chuẩn hoá mã và cập nhật', async () => {
    phan = { 'update:loi_danh_muc': { data: { code: 'X1' } } }
    expect((await A.datTrangThaiLoi('x1', 'ngung')).ok).toBe(true)
    expect(ghi[0].loc.code).toBe('X1')
  })
})

describe('phanLoaiLai', () => {
  it('mặc định chạy thử khi tham số không phải false', async () => {
    await A.phanLoaiLai(undefined as never)
    expect(db.rpc).toHaveBeenCalledWith('cs_ticket_may_backfill', { p_chay_thu: true })
  })
  it('false → chạy thật', async () => {
    expect((await A.phanLoaiLai(false)).ok).toBe(true)
    expect(db.rpc).toHaveBeenCalledWith('cs_ticket_may_backfill', { p_chay_thu: false })
  })
})

describe('nhập danh mục', () => {
  const fdFile = (rows: string, ten = 'a.csv') => {
    const fd = new FormData()
    fd.set('file', new File([rows], ten))
    return fd
  }
  it('thiếu quyền: nhapDanhMuc/xemTruoc không chạm DB', async () => {
    coQuyenTra = false
    expect((await A.nhapDanhMuc(fdFile('a'))).ok).toBe(false)
    expect((await A.xemTruocNhapDanhMuc(fdFile('a'))).ok).toBe(false)
    khongChamDb()
  })
  it('file sai đuôi / rỗng không chạm DB', async () => {
    expect((await A.nhapDanhMuc(fdFile('a', 'a.exe'))).ok).toBe(false)
    expect((await A.nhapDanhMuc(new FormData())).ok).toBe(false)
    khongChamDb()
  })
  it('quá 2000 dòng bị từ chối', async () => {
    const csv = 'Mã,Tên chuẩn\n' + Array.from({ length: 2001 }, (_, i) => `M${i}A,T`).join('\n')
    const r = await A.nhapDanhMuc(fdFile(csv))
    expect(r.ok).toBe(false)
    expect(db.rpc).not.toHaveBeenCalled()
  })
  it('hợp lệ → một lần gọi RPC nguyên tử, trả đếm thật', async () => {
    rpcTra = { cs_nhap_danh_muc_loi: { so_loi: 1, so_gan: 0 } }
    const r = await A.nhapDanhMuc(fdFile('Mã,Tên chuẩn,Duyệt\nAB-1,Lỗi A,x'))
    expect(r).toEqual({ ok: true, so_loi: 1, so_gan: 0 })
    expect(db.rpc).toHaveBeenCalledWith('cs_nhap_danh_muc_loi', expect.objectContaining({ p_nguoi: 'a@gwt.vn' }))
    expect(ghi.filter((g) => g.op !== 'select')).toEqual([])
  })
})

describe('đọc: giới hạn đầu vào', () => {
  it('quá 200 mã ticket bị chặn', async () => {
    await expect(A.dongMayTheoTickets(Array.from({ length: 201 }, (_, i) => `T${i}`))).rejects.toThrow()
  })
  it('traSerial/traKhachVaMay chặn chuỗi quá dài, không DB', async () => {
    expect((await A.traSerial('x'.repeat(100))).loai).toBe('sai_dang')
    expect(await A.traKhachVaMay('x'.repeat(101))).toEqual([])
    khongChamDb()
  })
})

describe('lỗi DB trả thông điệp chung', () => {
  it('không lộ chi tiết', async () => {
    db.rpc.mockImplementationOnce(async () => ({ data: null, error: { code: 'XX000', message: 'relation secret_table leaked' } }) as never)
    const r = await A.phanLoaiLai(true)
    expect(JSON.stringify(r)).not.toContain('secret_table')
  })
})

describe('ganDongMayChoTicketMoi (module server-only, không phải action)', () => {
  it('không còn export ở file use server', () => {
    expect((A as Record<string, unknown>).ganDongMayChoTicketMoi).toBeUndefined()
  })
  it('chặn >20 dòng; 0 dòng cập nhật → thêm qua RPC', async () => {
    const { ganDongMayChoTicketMoi } = await import('./ganDongMayServer')
    expect((await ganDongMayChoTicketMoi('T1', Array.from({ length: 21 }, () => ({})))).ok).toBe(false)
    phan = { 'select:loi_danh_muc': { data: { trang_thai: 'da_duyet' } } } // update trả null = 0 dòng
    rpcTra = { cs_them_dong_may: { ok: true, id: 'n' } }
    expect((await ganDongMayChoTicketMoi('T1', [{ loi_code: 'L1' }, { loi_code: 'L1' }])).ok).toBe(true)
    expect(db.rpc.mock.calls.filter((c) => c[0] === 'cs_them_dong_may')).toHaveLength(2)
  })
})

describe('duLieuTanSuat', () => {
  beforeEach(async () => {
    const { doQuyen } = await import('@/lib/nen-tang/kiem-quyen')
    vi.mocked(doQuyen).mockImplementation(async () => { chuoi.push('doQuyen') })
  })
  it('gate cs.ticket.xem trước DB; đọc 3 view, map so_ban/so_nhap -> so', async () => {
    phan = {
      v_loi_ca: { data: [{ ticket_code: 'T1' }] },
      v_loi_so_ban: { data: [{ internal_code: 'A', thang: '2026-10', so_ban: '5' }] },
      v_loi_so_nhap: { data: [{ internal_code: 'A', thang: '2026-10', so_nhap: 7 }] },
    }
    const r = await A.duLieuTanSuat()
    expect(chuoi.indexOf('doQuyen')).toBeLessThan(chuoi.findIndex((x) => x.startsWith('db:')))
    expect(r.ca).toHaveLength(1)
    expect(r.ban).toEqual([{ internal_code: 'A', thang: '2026-10', so: 5 }])
    expect(r.nhap).toEqual([{ internal_code: 'A', thang: '2026-10', so: 7 }])
    expect(chuoi.filter((x) => x.startsWith('db:')).sort()).toEqual(['db:v_loi_ca', 'db:v_loi_so_ban', 'db:v_loi_so_nhap'])
  })
  it('thiếu quyền: không chạm DB', async () => {
    const { doQuyen } = await import('@/lib/nen-tang/kiem-quyen')
    vi.mocked(doQuyen).mockImplementationOnce(async () => { chuoi.push('doQuyen'); throw new Error('NEXT_REDIRECT') })
    await expect(A.duLieuTanSuat()).rejects.toThrow()
    khongChamDb()
  })
})

describe('M4: RPC ghi audit kèm actor_id', () => {
  it('nhapDanhMuc truyền p_nguoi_id', async () => {
    rpcTra = { cs_nhap_danh_muc_loi: { so_loi: 1, so_gan: 0 } }
    const fd = new FormData()
    fd.set('file', new File(['Mã,Tên chuẩn,Duyệt\nAB-1,Lỗi A,x'], 'a.csv'))
    await A.nhapDanhMuc(fd)
    expect(db.rpc).toHaveBeenCalledWith('cs_nhap_danh_muc_loi', expect.objectContaining({ p_nguoi: 'a@gwt.vn', p_nguoi_id: NV_ID }))
  })
})

describe('I3 + M1: luuLoi kiểm cách ghi và dựng mẫu Mã máy như khi nhập Sheet', () => {
  it('cách ghi dưới 3 ký tự (sau trim) bị từ chối, không chạm DB', async () => {
    const r = await A.luuLoi({ ...nhapLoi, aliases: ['rò nước', ' E5 '] })
    expect(r.ok).toBe(false)
    expect(!r.ok && r.error).toContain('E5')
    khongChamDb()
  })
  it('ma_may thiếu % -> thêm % cuối, _ thành ký tự thật; mẫu đã thoát giữ nguyên', async () => {
    expect((await A.luuLoi({ ...nhapLoi, ma_may: ['GTUN-8600HP-G', 'T_X', 'CTS20%'] })).ok).toBe(true)
    const w = ghi.find((g) => g.bang === 'loi_danh_muc')!.arg as Record<string, unknown>
    expect(w.ma_may).toEqual(['GTUN-8600HP-G%', 'T\\_X%', 'CTS20%'])
  })
})

describe('I2: xem trước đếm mã sẽ đổi trạng thái', () => {
  it('so với trạng thái đang có trong DB', async () => {
    phan = { 'select:loi_danh_muc': { data: [{ code: 'AB-1', trang_thai: 'cho_duyet' }, { code: 'AB-2', trang_thai: 'da_duyet' }] } }
    const fd = new FormData()
    fd.set('file', new File(['Mã,Tên chuẩn,Duyệt\nAB-1,Lỗi A,x\nAB-2,Lỗi B,\nAB-3,Lỗi C,x'], 'a.csv'))
    const r = await A.xemTruocNhapDanhMuc(fd)
    expect(r.ok && r.soDoiTrangThai).toBe(1)
  })
})
