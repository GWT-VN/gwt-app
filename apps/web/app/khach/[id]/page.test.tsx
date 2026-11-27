import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'

// Hai DB giả: ghi lại mọi lần đọc `nguồn:schema.bảng` + bộ lọc `in`; dữ liệu theo khoá đó (không có → rỗng).
const goi: string[] = []
const loc: Record<string, unknown[]> = {}
let duLieu: Record<string, Record<string, unknown>[]> = {}

function bang(nguon: 'st' | 'md', schema: string, ten: string) {
  const khoa = `${nguon}:${schema}.${ten}`
  goi.push(khoa)
  const kq = () => ({ data: duLieu[khoa] ?? [], error: null })
  const b: Record<string, unknown> = new Proxy({}, {
    get: (_, p: string) => {
      if (p === 'then') return (res: (v: unknown) => unknown) => Promise.resolve(kq()).then(res)
      if (p === 'maybeSingle' || p === 'single') return async () => ({ data: (duLieu[khoa] ?? [])[0] ?? null, error: null })
      if (p === 'in') return (cot: string, v: unknown[]) => ((loc[`${khoa}.${cot}`] = v), b)
      return () => b
    },
  })
  return b
}
const client = (nguon: 'st' | 'md') => ({
  from: (t: string) => bang(nguon, 'public', t),
  schema: (s: string) => ({ from: (t: string) => bang(nguon, s, t) }),
})

vi.mock('server-only', () => ({}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('Not found') }, useRouter: () => ({}) }))
vi.mock('@/lib/nen-tang/db', () => ({ dataClient: () => client('st'), mdClient: () => client('md') }))
vi.mock('@/lib/nen-tang/phien', () => ({ requireStaff: vi.fn(async () => ({})), layNhanVien: vi.fn(async () => ({ id: 'nv1' })) }))
vi.mock('@/lib/nen-tang/kiem-quyen', () => ({
  doQuyen: vi.fn(async () => {}), coQuyen: vi.fn(async () => true), coQuyenHienNut: vi.fn(async () => true), hoiQuyen: vi.fn(async () => ({})),
}))
// Chỉ soi dữ liệu page đưa vào hồ sơ — không dựng giao diện.
vi.mock('@/components/khach/HoSoKhach', () => ({ HoSoKhach: () => null }))

import CustomerPage from './page'

const K = '11111111-1111-4111-8111-111111111111'
const khach = { id: K, full_name: 'Khách thử', primary_phone: null, province: 'Hà Nội', address: null, source: null, ma_kh: 'KH1', customer_code: null, channel_id: null }
const ticket = { ticket_code: 'TK-1', state: 'Open', created_at: '2026-11-20T02:00:00Z', serial: 'S1', customer_id: K, product_name: 'Máy 1' }
const may = [
  { serial: 'S1', internal_code: 'M1', product_name: 'Máy 1', customer_id: K, warranty_activated: true, warranty_full_end: null },
  { serial: 'S2', internal_code: 'M2', product_name: 'Máy 2', customer_id: K, warranty_activated: false, warranty_full_end: null },
]

type PropsHoSo = {
  khach: { ten: string }
  may: { serial: string; image_url?: string | null }[]
  tickets: { ticket_code: string }[]
  dongLoi: { ticket_code: string; serial: string | null; loi_code: string; loi_ten: string | null; state: string; product_name: string | null }[]
}
async function moHoSo(): Promise<PropsHoSo> {
  let el = (await CustomerPage({ params: Promise.resolve({ id: K }), searchParams: Promise.resolve({}) })) as ReactElement<{ children?: unknown }>
  // <ManV2><Suspense><HoSoKhach/></Suspense></ManV2>
  while (el.props.children) el = el.props.children as ReactElement<{ children?: unknown }>
  return el.props as unknown as PropsHoSo
}

beforeEach(() => {
  goi.length = 0
  for (const k of Object.keys(loc)) delete loc[k]
})
afterEach(() => vi.unstubAllEnvs())

describe('hồ sơ khách đọc theo CSKH_NGUON', () => {
  it('md: khách / ticket / máy (+ ảnh product_master) / dòng lỗi đọc từ mdClient, không đọc ST các bảng đó', async () => {
    vi.stubEnv('CSKH_NGUON', 'md')
    duLieu = {
      'md:public.customers': [khach],
      'md:customer_care.v_tickets': [ticket],
      'md:public.v_installed_base': may,
      'md:public.product_master': [{ internal_code: 'M1', image_url: 'https://anh.test/m1.png' }],
      'md:customer_care.issue_reports': [{
        id: 'r1', ticket_code: 'TK-1', report_no: 1, serial: 'S1', source_serial: null, internal_code: 'M1', issue_code: 'E3',
        customer_said: 'báo lỗi', handling: null, handling_source: null, status: 'cho_xu_ly', created_at: '2026-11-20T02:00:00Z',
        issue_codes: { name: 'Lỗi E3' },
      }],
    }
    const p = await moHoSo()
    expect(p.khach.ten).toBe('Khách thử')
    expect(p.tickets.map((t) => t.ticket_code)).toEqual(['TK-1'])
    expect(p.may.map((m) => [m.serial, m.image_url])).toEqual([['S1', 'https://anh.test/m1.png'], ['S2', null]])
    expect(loc['md:public.product_master.internal_code']).toEqual(['M1', 'M2'])
    expect(p.dongLoi).toEqual([expect.objectContaining({ ticket_code: 'TK-1', serial: 'S1', loi_code: 'E3', loi_ten: 'Lỗi E3', state: 'Open', product_name: 'Máy 1' })])
    expect(goi).toEqual(expect.arrayContaining([
      'md:public.customers', 'md:public.customer_contacts', 'md:customer_care.v_tickets', 'md:public.v_installed_base', 'md:customer_care.issue_reports',
    ]))
    // (st:public.cs_customers vẫn có: địa chỉ phụ — diaChiCuaKhach / maKhCuaKhachCS — chưa chuyển, ngoài phạm vi.)
    for (const st of ['st:public.customer_contacts', 'st:public.v_tickets', 'st:public.v_installed_base', 'st:public.ticket_may'])
      expect(goi).not.toContain(st)
  })

  it('st (env trống): đọc dataClient như cũ, không gọi mdClient, máy không kèm ảnh', async () => {
    vi.stubEnv('CSKH_NGUON', '')
    duLieu = {
      'st:public.cs_customers': [khach],
      'st:public.v_tickets': [ticket],
      'st:public.v_installed_base': may,
      'st:public.ticket_may': [{ id: 'd1', ticket_code: 'TK-1', thu_tu: 1, serial: 'S1', internal_code: 'M1', loi_code: 'E3', loi_danh_muc: { ten: 'Lỗi E3' } }],
    }
    const p = await moHoSo()
    expect(p.khach.ten).toBe('Khách thử')
    expect(p.may.map((m) => m.image_url)).toEqual([undefined, undefined])
    expect(p.dongLoi).toEqual([expect.objectContaining({ ticket_code: 'TK-1', serial: 'S1', loi_code: 'E3', loi_ten: 'Lỗi E3' })])
    expect(goi).toEqual(expect.arrayContaining(['st:public.cs_customers', 'st:public.customer_contacts', 'st:public.v_tickets', 'st:public.v_installed_base', 'st:public.ticket_may']))
    expect(goi.filter((g) => g.startsWith('md:'))).toEqual([])
  })
})
