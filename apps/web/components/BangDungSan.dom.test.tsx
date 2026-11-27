// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react'
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
          viDuTen="VD" khu="Kho" timKiem={m.tim ? 'Tìm…' : undefined} truong={m.truong}
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
  // Khuôn F: tab không mang số; bộ đếm DUY NHẤT là phân trang dưới bảng.
  expect(screen.getByRole('tab', { selected: true }).textContent).toBe(m.tab[0].ten)
  expect(screen.getByText(/1–1 trên 1 dòng/)).toBeTruthy()
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

/** Bảng có cột trùng / khác id với trường lọc (như Nhật ký kho: `loai` ↔ `loai`, `trang_thai` ↔ `tt`, `ngay` không có cột). */
function moLoc(dong = [{ khoa: '7', o: { x: 'Dòng bảy' }, href: '/kho/ma/LOI-01', ma: 'LOI-01' }, { khoa: '8', o: { x: 'Dòng tám' } }]) {
  duongDan.v = '/kho/nhat-ky'
  const chon = (...g: string[]) => g.map((x) => ({ giaTri: x, nhan: x }))
  render(
    <DsRoot>
      <CauHinhBangDs>
        <BangDungSan
          tieuDe="Nhật ký nhập / xuất" nhan="dòng sổ" bang="kho_nhat_ky_tab" tabCoDinh={TAB_NHAT_KY} tabRieng={[]} quyenTabChung={false}
          viDuTen="VD" khu="Kho" timKiem="Tìm…"
          truong={[
            { id: 'loai', ten: 'Loại', kieu: 'chon', tuyChon: chon('Nhập', 'Xuất') },
            { id: 'tt', ten: 'Trạng thái', kieu: 'chon', tuyChon: chon('approved', 'void') },
            { id: 'ngay', ten: 'Ngày nghiệp vụ', kieu: 'ngay' },
          ]}
          locCot={{ trang_thai: 'tt' }}
          cot={[
            { id: 'x', ten: 'Cột X', kieu: 'thuong', khoa: true },
            { id: 'loai', ten: 'Loại', kieu: 'thuong' },
            { id: 'trang_thai', ten: 'Trạng thái', kieu: 'thuong' },
          ]}
          dienThoai={{ tren: 'x' }} dong={dong} tong={240} trang={2} soTrang={3} moiTrang={100}
        />
      </CauHinhBangDs>
    </DsRoot>,
  )
}

test('lọc ở nhãn cột: chip "TÊN: GIÁ TRỊ" ở tiêu đề (cả cột khác id trường); trường không có cột → chip cạnh nút Lọc; "Xoá bộ lọc" giữ kho + tìm', async () => {
  const user = userEvent.setup()
  thamSo.v = `kho=HCM&q=loi&loai=${encodeURIComponent('Nhập')}&tt=void&ngay=khoang~2026-11-01..2026-11-27&trang=2`
  try {
    moLoc()
    const table = screen.getByRole('table', { name: 'Nhật ký nhập / xuất' })
    expect(within(table).getByRole('columnheader', { name: /Loại: Nhập/ })).toBeTruthy()
    expect(within(table).getByRole('columnheader', { name: /Trạng thái: void/ })).toBeTruthy()
    // Không còn hàng chip cũ dưới thanh công cụ.
    expect(screen.queryByRole('region', { name: 'Điều kiện đang áp dụng' })).toBeNull()
    const toolbar = screen.getByRole('heading', { name: 'Nhật ký nhập / xuất' }).closest('[data-slot="data-view-toolbar"]') as HTMLElement
    const chip = toolbar.querySelectorAll('[data-slot="chip-loc"]')
    expect(chip.length).toBe(1)
    expect(chip[0].textContent).toContain('Ngày nghiệp vụ')
    await user.click(screen.getByRole('button', { name: 'Xoá bộ lọc' }))
    expect(push).toHaveBeenLastCalledWith('/kho/nhat-ky?kho=HCM&q=loi', { scroll: false })
  } finally {
    thamSo.v = 'kho=HCM&trang=3'
  }
})

test('bộ đếm duy nhất = phân trang theo số dòng mỗi trang của nguồn', () => {
  moLoc()
  expect(screen.getByText('101–200 trên 240 dòng sổ')).toBeTruthy()
  expect(screen.getByText('Trang 2 / 3')).toBeTruthy()
})

test('chuột phải dòng → Mở chi tiết / Sao chép mã / Sao chép đường dẫn; dòng không có trang chi tiết chỉ còn Sao chép mã', async () => {
  moLoc()
  fireEvent.contextMenu(screen.getByText('Dòng bảy').closest('tr')!)
  expect(await screen.findByRole('menu', { name: 'Thao tác LOI-01' })).toBeTruthy()
  expect(screen.getByRole('menuitem', { name: 'Sao chép mã' })).toBeTruthy()
  expect(screen.getByRole('menuitem', { name: 'Sao chép đường dẫn' })).toBeTruthy()
  fireEvent.click(screen.getByRole('menuitem', { name: 'Mở chi tiết' }))
  expect(push).toHaveBeenLastCalledWith('/kho/ma/LOI-01')

  fireEvent.contextMenu(screen.getByText('Dòng tám').closest('tr')!)
  expect(await screen.findByRole('menu', { name: 'Thao tác 8' })).toBeTruthy()
  expect(screen.getByRole('menuitem', { name: 'Sao chép mã' })).toBeTruthy()
  expect(screen.queryByRole('menuitem', { name: 'Mở chi tiết' })).toBeNull()
  expect(screen.queryByRole('menuitem', { name: 'Sao chép đường dẫn' })).toBeNull()
})
