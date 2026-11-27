import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Hai DB giả: ghi lại `nguồn:schema.bảng` mỗi lần đọc; dữ liệu theo khoá đó (không có → rỗng).
const goi: string[] = []
let duLieu: Record<string, Record<string, unknown>[]> = {}
function bang(nguon: 'st' | 'md', schema: string, ten: string) {
  const khoa = `${nguon}:${schema}.${ten}`
  goi.push(khoa)
  const kq = () => ({ data: duLieu[khoa] ?? [], error: null, count: (duLieu[khoa] ?? []).length })
  const b: Record<string, unknown> = new Proxy({}, {
    get: (_, p: string) =>
      p === 'then' ? (res: (v: unknown) => unknown) => Promise.resolve(kq()).then(res)
        : p === 'maybeSingle' ? async () => ({ data: (duLieu[khoa] ?? [])[0] ?? null, error: null })
          : () => b,
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

import { getTicket, machinesOfCustomer, searchTickets, ticketsOfSerial } from './actions'
import { danhMucLoi, doiMayTicket, dongMayCuaTicket, suaDongMay, themDongMay, xacNhanHuongXuLy, xoaDongMay } from './ticket/loi-actions'
import { DONG_MAY_CHI_XEM_MD } from '@/lib/loi/dongMayTicket'
import { suaLanLoi, themLanLoi, xoaLanLoi } from './ticket/lan-loi-actions'
import { LAN_LOI_O_MD } from '@/lib/loi/lanLoi'

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

describe('getTicket / ticketsOfSerial theo CSKH_NGUON', () => {
  it('md: đọc customer_care.v_tickets, không đọc ST', async () => {
    vi.stubEnv('CSKH_NGUON', 'md')
    duLieu = { 'md:customer_care.v_tickets': [{ ticket_code: 'SEED-TK-001', serial: 'S1' }] }
    expect((await getTicket('SEED-TK-001'))?.ticket_code).toBe('SEED-TK-001')
    expect((await ticketsOfSerial('S1')).map((t) => t.ticket_code)).toEqual(['SEED-TK-001'])
    expect(goi).toEqual(['md:customer_care.v_tickets', 'md:customer_care.v_tickets'])
  })
  it('st: v_tickets của ST như cũ', async () => {
    vi.stubEnv('CSKH_NGUON', '')
    duLieu = { 'st:public.v_tickets': [{ ticket_code: 'TK-1', serial: 'S1' }] }
    expect((await getTicket('TK-1'))?.ticket_code).toBe('TK-1')
    expect((await ticketsOfSerial('S1')).map((t) => t.ticket_code)).toEqual(['TK-1'])
    expect(goi).toEqual(['st:public.v_tickets', 'st:public.v_tickets'])
  })
})

describe('machinesOfCustomer: ảnh product_master', () => {
  it('md: chỉ nhận URL http(s) — dấu CHUA_LAY / rỗng / đường dẫn lạ → null (ô icon)', async () => {
    vi.stubEnv('CSKH_NGUON', 'md')
    duLieu = {
      'md:public.v_installed_base': ['A', 'B', 'C', 'D'].map((x) => ({ serial: `S${x}`, internal_code: `M${x}` })),
      'md:public.product_master': [
        { internal_code: 'MA', image_url: 'https://anh.test/a.png' },
        { internal_code: 'MB', image_url: 'CHUA_LAY' },
        { internal_code: 'MC', image_url: '' },
        { internal_code: 'MD', image_url: 'javascript:alert(1)' },
      ],
    }
    expect((await machinesOfCustomer('k')).map((m) => m.image_url)).toEqual(['https://anh.test/a.png', null, null, null])
  })
  it('md: cờ chờ serial từ customer_care.machine_details (nối theo serial; không có dòng = false), không đọc ST', async () => {
    vi.stubEnv('CSKH_NGUON', 'md')
    duLieu = {
      'md:public.v_installed_base': [{ serial: 'TAM202611001', internal_code: null }, { serial: 'S2', internal_code: null }, { serial: 'S3', internal_code: null }],
      'md:customer_care.machine_details': [{ serial: 'TAM202611001', waiting_for_serial: true }, { serial: 'S2', waiting_for_serial: false }],
    }
    expect((await machinesOfCustomer('k')).map((m) => m.cho_serial)).toEqual([true, false, false])
    expect(goi).toContain('md:customer_care.machine_details')
    expect(goi.filter((g) => g.startsWith('st:'))).toEqual([])
  })
  it('st: cờ chờ serial từ installed_base.cho_serial (v_installed_base chưa có cột), không gọi MD', async () => {
    vi.stubEnv('CSKH_NGUON', '')
    duLieu = {
      'st:public.v_installed_base': [{ serial: 'TAM202611001' }, { serial: 'S2' }],
      'st:public.installed_base': [{ serial: 'TAM202611001', cho_serial: true }, { serial: 'S2', cho_serial: false }],
    }
    expect((await machinesOfCustomer('k')).map((m) => m.cho_serial)).toEqual([true, false])
    expect(goi).toContain('st:public.installed_base')
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

describe('danhMucLoi(…, chiSt) — trang danh mục đọc đúng nguồn nó ghi', () => {
  it('md + chiSt: đọc loi_danh_muc ST (luuLoi ghi ST), không đọc MD', async () => {
    vi.stubEnv('CSKH_NGUON', 'md')
    duLieu = { 'st:public.loi_danh_muc': [{ code: 'E3', ten: 'Lỗi E3' }] }
    expect(await danhMucLoi(false, true)).toEqual([{ code: 'E3', ten: 'Lỗi E3' }])
    expect(goi).toEqual(['st:public.loi_danh_muc'])
  })
})

const lanMd = (o: Record<string, unknown>) => ({
  id: 'r', ticket_code: 'TK-1', report_no: 1, serial: 'S1', source_serial: null, internal_code: 'CTS20', issue_code: 'E3',
  customer_said: null, handling: null, handling_source: null, status: 'dang_xu_ly', created_at: '2026-11-20T02:00:00Z',
  issue_codes: { name: 'Lỗi E3' }, ...o,
})

describe('dongMayCuaTicket (trang chi tiết) theo CSKH_NGUON', () => {
  it('md: MỘT dòng mỗi máy (lần mới nhất của máy, giữ thứ tự xuất hiện); cho_xu_ly giữ nguyên', async () => {
    vi.stubEnv('CSKH_NGUON', 'md')
    duLieu = {
      'md:customer_care.issue_reports': [
        lanMd({ id: 'r1', report_no: 1, serial: 'S1', status: 'da_xu_ly' }),
        lanMd({ id: 'r2', report_no: 2, serial: null, status: 'cho_xu_ly', issue_code: 'CHUA_PHAN_LOAI' }),
        lanMd({ id: 'r3', report_no: 3, serial: 'S1', status: 'cho_xu_ly' }),
      ],
    }
    const ds = await dongMayCuaTicket('TK-1')
    expect(ds.map((d) => [d.id, d.serial, d.trang_thai])).toEqual([['r3', 'S1', 'cho_xu_ly'], ['r2', null, 'cho_xu_ly']])
    expect(goi.filter((g) => g.startsWith('st:'))).toEqual([])
  })

  it('st: mọi dòng ticket_may như cũ', async () => {
    vi.stubEnv('CSKH_NGUON', '')
    duLieu = { 'st:public.ticket_may': [
      { id: 'a', ticket_code: 'TK-1', serial: 'S1', loi_danh_muc: null },
      { id: 'b', ticket_code: 'TK-1', serial: 'S1', loi_danh_muc: null },
    ] }
    expect((await dongMayCuaTicket('TK-1')).map((d) => d.id)).toEqual(['a', 'b'])
  })
})

describe('ghi dòng máy ST bị chặn khi CSKH_NGUON=md (id dòng là của MD)', () => {
  const ID = '11111111-1111-4111-8111-111111111111'
  it('md: suaDongMay / themDongMay / xoaDongMay / xacNhanHuongXuLy / doiMayTicket → ok:false, không gọi DB', async () => {
    vi.stubEnv('CSKH_NGUON', 'md')
    for (const r of [
      await suaDongMay(ID, { loi_code: 'E3' }),
      await themDongMay('TK-1', { loi_code: 'E3' }),
      await xoaDongMay(ID),
      await xacNhanHuongXuLy(ID, 'thay van', false),
      // Ô Máy danh sách F — ghi tickets.serial + ticket_may ở ST trong khi danh sách đọc MD (review cuối đợt 1).
      await doiMayTicket('TK-2611-001', 'S2'),
    ]) expect(r).toEqual({ ok: false, error: DONG_MAY_CHI_XEM_MD })
    expect(goi).toEqual([])
  })
})

describe('lần lỗi ST (ticket_lan_loi) bị chặn ghi khi CSKH_NGUON=md', () => {
  const ID = '11111111-1111-4111-8111-111111111111'
  it('md: themLanLoi / suaLanLoi / xoaLanLoi → ok:false, không gọi DB', async () => {
    vi.stubEnv('CSKH_NGUON', 'md')
    for (const r of [
      await themLanLoi('TK-1', { mo_ta: 'báo lại' }),
      await suaLanLoi(ID, 'TK-1', { mo_ta: 'báo lại' }),
      await xoaLanLoi(ID, 'TK-1'),
    ]) expect(r).toEqual({ ok: false, error: LAN_LOI_O_MD })
    expect(goi).toEqual([])
  })
})
