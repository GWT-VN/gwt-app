// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { DsRoot } from '@/components/ui/ds-root'
import { TAB_CHO_DUYET, TAB_LICH_SU, TAB_NHAT_KY, TAB_TON, TRUONG_LICH_SU, TRUONG_NHAT_KY, TRUONG_TON } from '@/app/kho/truong-kho'
import { TAB_AUDIT, TRUONG_AUDIT } from '@/app/audit/truong-audit'
import type { TabCoDinh } from '@/components/HangTab'
import type { BangTab } from '@/lib/tab-view'
import { BangDungSan } from './BangDungSan'

const { push, replace, duongDan, thamSo } = vi.hoisted(() => ({
  push: vi.fn(), replace: vi.fn(), duongDan: { v: '/kho' }, thamSo: { v: 'kho=HCM&trang=3' },
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, refresh: vi.fn() }),
  usePathname: () => duongDan.v,
  useSearchParams: () => new URLSearchParams(thamSo.v),
}))
vi.mock('@/app/actions', () => ({
  luuTabView: vi.fn(), capNhatTabView: vi.fn(), doiTenTabView: vi.fn(), xoaTabView: vi.fn(),
}))

/** Mỗi màn dùng BangDungSan: (đường dẫn, khoá tab, tab cố định, có ô tìm?, query mong đợi khi bấm tab thứ 2). */
const MAN: { ten: string; duong: string; bang: BangTab; tab: TabCoDinh[]; truong: { id: string; ten: string; kieu: 'chon' | 'ngay' }[]; tim: boolean; ky: string }[] = [
  { ten: 'Tồn kho', duong: '/kho', bang: 'kho_ton_tab', tab: TAB_TON, truong: TRUONG_TON as never, tim: true, ky: 'kho=HCM&cb=sap_het&view=sap-het' },
  { ten: 'Nhật ký nhập / xuất', duong: '/kho/nhat-ky', bang: 'kho_nhat_ky_tab', tab: TAB_NHAT_KY, truong: TRUONG_NHAT_KY as never, tim: true, ky: `kho=HCM&loai=${encodeURIComponent('Nhập')}&view=nhap` },
  { ten: 'Chờ duyệt mã', duong: '/kho/cho-duyet', bang: 'kho_cho_duyet_tab', tab: TAB_CHO_DUYET, truong: [{ id: 'loai', ten: 'Loại', kieu: 'chon' }], tim: true, ky: `kho=HCM&loai=${encodeURIComponent('Nhập')}&view=nhap` },
  { ten: 'Lịch sử sửa', duong: '/kho/lich-su-sua', bang: 'kho_lich_su_tab', tab: TAB_LICH_SU, truong: TRUONG_LICH_SU as never, tim: false, ky: 'kho=HCM&hd=huy&view=huy' },
  { ten: 'Nhật ký thao tác', duong: '/audit', bang: 'audit_tab', tab: TAB_AUDIT, truong: TRUONG_AUDIT.map(({ id, ten, kieu }) => ({ id, ten, kieu })) as never, tim: true, ky: 'kho=HCM&kq=loi&view=loi' },
]

function mo(m: (typeof MAN)[number], dong = [{ khoa: 'a', o: { x: 'Ô một', y: 'Ô hai' }, href: '/x/a' }]) {
  duongDan.v = m.duong
  render(
    <DsRoot>
      <CauHinhBangDs>
        <BangDungSan
          tieuDe={m.ten} nhan="dòng" bang={m.bang} tabCoDinh={m.tab} tabRieng={[]} quyenTabChung={false}
          demTab={{ [m.tab[0].v]: 7 }} viDuTen="VD" khu="Kho" timKiem={m.tim ? 'Tìm…' : undefined} truong={m.truong}
          cot={[{ id: 'x', ten: 'Cột X', kieu: 'thuong', khoa: true }, { id: 'y', ten: 'Cột Y', kieu: 'thuong', phai: true }]}
          dienThoai={{ tren: 'x', duoi: 'y' }} dong={dong} tong={dong.length} trang={1} soTrang={1}
          nutChinh={<button>Nút chính</button>}
        />
      </CauHinhBangDs>
    </DsRoot>,
  )
}

test.each(MAN)('$ten: khuôn Ticket F — tab, tìm trong thanh công cụ, cột ghim, bấm tab cố định đổi URL', async (m) => {
  const user = userEvent.setup()
  mo(m)
  const toolbar = screen.getByRole('heading', { name: m.ten }).closest('[data-slot="data-view-toolbar"]') as HTMLElement
  expect(within(toolbar).getByRole('tablist', { name: 'Tab dòng' })).toBeTruthy()
  expect(within(toolbar).queryByRole('textbox', { name: 'Tìm dòng' }) !== null).toBe(m.tim)
  expect(within(toolbar).getByRole('button', { name: 'Cài đặt hiển thị' })).toBeTruthy()
  expect(within(toolbar).getByRole('button', { name: 'Nút chính' })).toBeTruthy()
  const table = screen.getByRole('table', { name: m.ten })
  expect(table.getAttribute('data-layout')).toBe('fixed')
  expect(within(table).getByRole('columnheader', { name: /Cột X/ }).hasAttribute('data-ghim')).toBe(true)
  expect(screen.getByRole('tab', { name: new RegExp(m.tab[0].ten) }).textContent).toContain('7')
  // Bấm tab cố định thứ 2: thay bộ lọc bằng bộ lọc của tab, giữ phạm vi kho, bỏ trang.
  await user.click(screen.getByRole('tab', { name: new RegExp(m.tab[1].ten) }))
  expect(replace).toHaveBeenLastCalledWith(`${m.duong}?${m.ky}`, { scroll: false })
})

test('rỗng khi đang lọc → EmptyState "không khớp bộ lọc"', () => {
  thamSo.v = 'loai=Nhập,Xuất'
  mo(MAN[1], [])
  expect(screen.getByRole('heading', { name: 'Không có dòng nào khớp bộ lọc' })).toBeTruthy()
  thamSo.v = 'kho=HCM&trang=3'
})
