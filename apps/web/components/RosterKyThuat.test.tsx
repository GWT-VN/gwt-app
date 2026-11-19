import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/app/actions', () => ({ taoKyThuat: vi.fn(), suaKyThuat: vi.fn(), capTaiKhoanKyThuat: vi.fn(), thuTaiKhoanKyThuat: vi.fn() }))
vi.mock('@/app/ticket/nguoi-actions', () => ({ xoaNguoi: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
vi.mock('@/components/ChonTinh', () => ({ ChonTinh: () => null }))
import { RosterKyThuat } from './RosterKyThuat'

const kt = (id: string, ten: string, la_ctv = false) =>
  ({ id, ten, la_ctv, hoat_dong: true, sdt: null, vung: null, tinh: null, email: null }) as never

describe('RosterKyThuat (tab Kỹ thuật của Danh sách người)', () => {
  it('mỗi thợ hiện số ticket đang mở (mặc định 0) + nút sửa, xoá', () => {
    const h = renderToStaticMarkup(
      <RosterKyThuat dsKt={[kt('t1', 'Trần Văn Sơn'), kt('t2', 'Lê Minh Quân', true)]} trangThai={{}} choTaiKhoanKT={false} soTicket={{ t1: 3 }} />)
    for (const t of ['Trần Văn Sơn', '3 ticket đang mở', 'Lê Minh Quân', '0 ticket đang mở', 'CTV', 'Thêm kỹ thuật']) expect(h).toContain(t)
    expect(h.match(/>xoá</g)?.length).toBe(2)
    expect(h.match(/>sửa</g)?.length).toBe(2)
  })
})
