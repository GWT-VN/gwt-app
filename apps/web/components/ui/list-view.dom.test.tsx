// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, test, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/ds',
  useSearchParams: () => new URLSearchParams(''),
}))
// Ô sửa gọi toast khi lưu — ở đây chỉ kiểm dòng/menu, không kiểm toast.
vi.mock('./sonner', () => ({ thongBao: { xong: vi.fn(), loi: vi.fn(), dangChay: vi.fn(), dong: vi.fn() } }))

import { Badge } from './badge'
import { ContextMenuItem, ContextMenuLabel } from './context-menu'
import { DsRoot } from './ds-root'
import { OSuaNhan } from './inline-edit'
import { ListView, NhanDau, NutMoMa, TieuDeGop, type CotDanhSach, type KhoaSap } from './list-view'
import type { MucLoc } from './tieu-de-cot'

type Ve = { ma: string; uu: string; loai: string; khach: string }
const VE: Ve[] = [
  { ma: 'TK-D101', uu: 'P1', loai: 'ro-ri', khach: 'Công ty Demo An Phát' },
  { ma: 'TK-D102', uu: 'P2', loai: 'main', khach: 'Khách sạn Demo Sen' },
  { ma: 'TK-D103', uu: 'P2', loai: 'ro-ri', khach: 'Khách lẻ demo 01' },
]
const UU = [
  { gt: 'P1', nhan: <Badge variant="solid" color="danger">P1</Badge>, chu: 'P1' },
  { gt: 'P2', nhan: <Badge color="warning">P2</Badge>, chu: 'P2' },
]
const KHOA: KhoaSap[] = [
  { id: 'uu', ten: 'Ưu tiên', kieu: 'sap', nghia: { tang: 'Gấp trước', giam: 'Ít gấp trước' } },
  { id: 'tao', ten: 'Thứ tự tạo', kieu: 'sap', nghia: { tang: 'Cũ nhất trước', giam: 'Mới tạo trước' } },
]
const LOC_UU: MucLoc[] = [
  { giaTri: 'P1', nhan: 'P1', color: 'danger' },
  { giaTri: 'P2', nhan: 'P2', color: 'warning' },
]
const LOC_LOAI: MucLoc[] = [
  { giaTri: 'ro-ri', nhan: 'Rò rỉ nước', color: 'info' },
  { giaTri: 'main', nhan: 'Main', color: 'discovery' },
]

function Mau({
  onMo = () => {},
  nhom,
  onLocLoai = () => {},
}: {
  onMo?: (v: Ve) => void
  nhom?: boolean
  onLocLoai?: (gt: string[]) => void
}) {
  const [sap, setSap] = useState<{ id: string; chieu: 'tang' | 'giam' } | null>({ id: 'uu', chieu: 'tang' })
  const [locLoai, setLocLoai] = useState<string[]>([])
  const cot: CotDanhSach<Ve>[] = [
    {
      id: 'ticket',
      ten: 'Ticket',
      rong: 'minmax(0,2.4fr)',
      dienThoai: 'tren',
      tieuDe: (
        <TieuDeGop
          ten="Ticket"
          sap={{ khoa: KHOA, dang: sap, onDoi: setSap }}
          loc={[
            { id: 'uu', ten: 'Ưu tiên', tuyChon: LOC_UU, daChon: [], onDoi: () => {} },
            {
              id: 'loai',
              ten: 'Loại lỗi',
              tuyChon: LOC_LOAI,
              daChon: locLoai,
              onDoi: (gt) => (setLocLoai(gt), onLocLoai(gt)),
            },
          ]}
        />
      ),
      o: (v) => (
        <>
          <OSuaNhan ma={v.ma} truong="ưu tiên" value={v.uu} muc={UU} onLuu={() => {}} />
          <NutMoMa ma={v.ma} />
          <span>{v.khach}</span>
        </>
      ),
    },
    { id: 'khach', ten: 'Khách', rong: '140px', anKhiHep: true, o: (v) => v.khach },
  ]
  return (
    <DsRoot>
      <ListView
        aria-label="Ticket"
        cot={cot}
        dong={VE}
        khoa={(v) => v.ma}
        onMo={onMo}
        nhom={
          nhom
            ? {
                theo: (v) => v.uu,
                muc: [
                  { gt: 'P1', nhan: <Badge variant="solid" color="danger">P1</Badge> },
                  { gt: 'P2', nhan: <Badge color="warning">P2</Badge> },
                  { gt: 'P3', nhan: <Badge>P3</Badge> },
                ],
              }
            : undefined
        }
        menuDong={(v) => (
          <>
            <ContextMenuLabel>{v.ma}</ContextMenuLabel>
            <ContextMenuItem onSelect={() => onMo(v)}>Mở ticket</ContextMenuItem>
            <ContextMenuItem>Sao chép mã</ContextMenuItem>
          </>
        )}
      />
    </DsRoot>
  )
}

const dong = (ma: string) => screen.getAllByRole('row').find((r) => r.getAttribute('data-khoa') === ma)!

afterEach(() => vi.restoreAllMocks())

describe('ListView — vai trò + bàn phím', () => {
  test('role table / row / columnheader / cell; dòng dữ liệu tabIndex 0', () => {
    render(<Mau />)
    const bang = screen.getByRole('table', { name: 'Ticket' })
    expect(within(bang).getAllByRole('columnheader')).toHaveLength(2)
    const d = dong('TK-D101')
    expect(d.tabIndex).toBe(0)
    expect(within(d).getAllByRole('cell')).toHaveLength(2)
  })

  test('Enter trên dòng → onMo; Enter trong ô sửa → không mở bản ghi', async () => {
    const user = userEvent.setup()
    const onMo = vi.fn()
    render(<Mau onMo={onMo} />)
    dong('TK-D102').focus()
    await user.keyboard('{Enter}')
    expect(onMo).toHaveBeenCalledTimes(1)
    expect(onMo.mock.calls[0][0].ma).toBe('TK-D102')
    onMo.mockClear()
    screen.getByRole('button', { name: 'Sửa ưu tiên TK-D101' }).focus()
    await user.keyboard('{Enter}')
    expect(onMo).not.toHaveBeenCalled()
  })

  test('bấm ô sửa → mở menu ô, KHÔNG mở bản ghi; bấm chỗ trống dòng / mã → mở bản ghi (một lần)', async () => {
    const user = userEvent.setup()
    const onMo = vi.fn()
    render(<Mau onMo={onMo} />)
    await user.click(screen.getByRole('button', { name: 'Sửa ưu tiên TK-D101' }))
    expect(await screen.findByRole('menu')).toBeTruthy()
    expect(onMo).not.toHaveBeenCalled()
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())

    await user.click(dong('TK-D103'))
    expect(onMo).toHaveBeenCalledTimes(1)
    expect(onMo.mock.calls[0][0].ma).toBe('TK-D103')

    await user.click(screen.getByRole('button', { name: 'Mở TK-D102' }))
    expect(onMo).toHaveBeenCalledTimes(2)
    expect(onMo.mock.calls[1][0].ma).toBe('TK-D102')
  })

  test('Shift+F10 trên dòng đang focus → mở menu thao tác của đúng dòng, focus mục đầu', async () => {
    const user = userEvent.setup()
    render(<Mau />)
    dong('TK-D102').focus()
    await user.keyboard('{Shift>}{F10}{/Shift}')
    const menu = await screen.findByRole('menu')
    expect(within(menu).getByText('TK-D102')).toBeTruthy()
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Mở ticket'))
    expect(dong('TK-D102').getAttribute('data-state')).toBe('open')
  })
})

describe('ListView — tiêu đề gộp', () => {
  test('nhãn nói đang sắp theo gì; aria-sort theo khoá đang sắp', () => {
    render(<Mau />)
    const nut = screen.getByRole('button', { name: /^Ticket/ })
    expect(nut.textContent).toContain('· ưu tiên gấp trước')
    expect(nut.closest('[role="columnheader"]')!.getAttribute('aria-sort')).toBe('ascending')
  })

  test('menu: sắp theo ưu tiên / thứ tự tạo, lọc ưu tiên + loại lỗi — KHÔNG có mục sắp theo loại lỗi', async () => {
    const user = userEvent.setup()
    render(<Mau />)
    await user.click(screen.getByRole('button', { name: /^Ticket/ }))
    const menu = await screen.findByRole('menu')
    const sap = within(menu)
      .getAllByRole('menuitemradio')
      .map((m) => m.textContent)
    expect(sap).toEqual(['Ưu tiên · gấp trước', 'Ưu tiên · ít gấp trước', 'Thứ tự tạo · cũ nhất trước', 'Thứ tự tạo · mới tạo trước'])
    expect(sap.some((t) => /lỗi/i.test(t ?? ''))).toBe(false)
    const loc = within(menu)
      .getAllByRole('menuitemcheckbox')
      .map((m) => m.textContent)
    expect(loc).toEqual(['P1', 'P2', 'Rò rỉ nước', 'Main'])
  })

  test('đổi khoá sắp → nhãn đổi; tick lọc loại lỗi giữ menu mở + đếm; "Bỏ lọc cột này" xoá', async () => {
    const user = userEvent.setup()
    const onLocLoai = vi.fn()
    render(<Mau onLocLoai={onLocLoai} />)
    await user.click(screen.getByRole('button', { name: /^Ticket/ }))
    await user.click(await screen.findByRole('menuitemradio', { name: 'Thứ tự tạo · mới tạo trước' }))
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    expect(screen.getByRole('button', { name: /^Ticket/ }).textContent).toContain('· thứ tự tạo mới tạo trước')

    await user.click(screen.getByRole('button', { name: /^Ticket/ }))
    await user.click(await screen.findByRole('menuitemcheckbox', { name: 'Main' }))
    expect(onLocLoai).toHaveBeenLastCalledWith(['main'])
    expect(screen.getByRole('menu')).toBeTruthy()
    // Menu modal → phần còn lại aria-hidden khi đang mở.
    expect(screen.getByRole('button', { name: /^Ticket/, hidden: true }).textContent).toContain('đang lọc 1')
    await user.click(screen.getByRole('menuitem', { name: 'Bỏ lọc cột này' }))
    expect(onLocLoai).toHaveBeenLastCalledWith([])
  })

  test('khoá sắp không phải kiểu "sap" (vd loại lỗi) → lỗi kiểu + ném lỗi lúc chạy', () => {
    const loi = vi.spyOn(console, 'error').mockImplementation(() => {})
    // @ts-expect-error loại lỗi là cột nhãn — không bao giờ là khoá sắp xếp
    const sai: KhoaSap = { id: 'loai', ten: 'Loại lỗi', kieu: 'loc' }
    expect(() =>
      render(
        <DsRoot>
          <div role="table">
            <div role="row">
              <TieuDeGop ten="Ticket" sap={{ khoa: [sai], dang: null, onDoi: () => {} }} />
            </div>
          </div>
        </DsRoot>,
      ),
    ).toThrow(/không sắp được/)
    loi.mockRestore()
  })
})

describe('ListView — nhóm theo', () => {
  test('tiêu đề nhóm = nhãn + số lượng; nhóm rỗng không hiện; dòng nằm đúng nhóm', () => {
    render(<Mau nhom />)
    const nhom = screen.getAllByRole('rowgroup').filter((g) => g.hasAttribute('data-nhom'))
    expect(nhom.map((g) => g.getAttribute('data-nhom'))).toEqual(['P1', 'P2'])
    const dau = within(nhom[1]).getAllByRole('row')[0]
    expect(dau.textContent).toBe('P22')
    expect(within(nhom[1]).getAllByRole('row').slice(1).map((r) => r.getAttribute('data-khoa'))).toEqual(['TK-D102', 'TK-D103'])
  })

  test('bấm tiêu đề nhóm không mở bản ghi', () => {
    const onMo = vi.fn()
    render(<Mau nhom onMo={onMo} />)
    const nhom = screen.getAllByRole('rowgroup').find((g) => g.getAttribute('data-nhom') === 'P1')!
    fireEvent.click(within(nhom).getAllByRole('row')[0])
    expect(onMo).not.toHaveBeenCalled()
  })
})

test('NhanDau gon → data-gon + khung ôm chữ (w-auto thắng w-[190px])', () => {
  const { container } = render(<><NhanDau gon>a</NhanDau><NhanDau>b</NhanDau></>)
  const [gon, thuong] = container.querySelectorAll('[data-slot="list-view-nhan"]')
  expect(gon.hasAttribute('data-gon')).toBe(true)
  expect(gon.className).toContain('w-auto')
  expect(gon.className).not.toMatch(/(^| )w-\[190px\]/)
  expect(thuong.hasAttribute('data-gon')).toBe(false)
  expect(thuong.className).toMatch(/(^| )w-\[190px\]/)
})
