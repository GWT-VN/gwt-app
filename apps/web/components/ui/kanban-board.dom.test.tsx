// @vitest-environment jsdom
import { useState } from 'react'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { ContextMenuItem } from './context-menu'
import { DsRoot } from './ds-root'
import { KanbanBoard, type CotKanban, type TheKanban } from './kanban-board'
import { thongBao } from './toast'

// Toast thật (Sonner) chạy hẹn giờ — ở đây chỉ cần biết bảng GỌI đúng thongBao + bấm được Hoàn tác.
vi.mock('./toast', () => ({ thongBao: { xong: vi.fn(), loi: vi.fn(), dangChay: vi.fn(), dong: vi.fn() } }))
const xong = vi.mocked(thongBao.xong)
const loi = vi.mocked(thongBao.loi)

const COT: CotKanban[] = [
  { id: 'moi', nhan: 'Mới', color: 'discovery' },
  { id: 'xu-ly', nhan: 'Đang xử lý', color: 'info' },
  { id: 'cho', nhan: 'Chờ', color: 'warning', hoiLyDo: true },
  { id: 'dong', nhan: 'Đóng', color: 'success' },
]
const THE: TheKanban[] = [
  { id: 'TK-D1', cot: 'moi', ten: 'TK-D1', noiDung: 'TK-D1 khách demo một' },
  { id: 'TK-D2', cot: 'moi', ten: 'TK-D2', noiDung: 'TK-D2 khách demo hai' },
  { id: 'TK-D3', cot: 'cho', lyDo: 'vật tư', ten: 'TK-D3', noiDung: 'TK-D3 khách demo ba' },
]

/** Bảng có state như màn thật: onChuyen đổi cột của thẻ. */
function Bang({ onChuyen, onMo = () => {} }: { onChuyen?: (id: string, cot: string, lyDo?: string) => unknown; onMo?: (id: string) => void }) {
  const [the, setThe] = useState(THE)
  return (
    <DsRoot>
      <KanbanBoard
        cot={COT}
        the={the}
        onMo={onMo}
        menuThe={(t) => <ContextMenuItem onSelect={() => onMo(t.id)}>Mở ticket</ContextMenuItem>}
        onChuyen={(id, cot, lyDo) => {
          onChuyen?.(id, cot, lyDo)
          setThe((ds) => ds.map((t) => (t.id === id ? { ...t, cot, lyDo } : t)))
        }}
      />
    </DsRoot>
  )
}

const the = (id: string) => screen.getByRole('button', { name: new RegExp(id) })
const cotCua = (id: string) => the(id).closest('[data-cot-id]')?.getAttribute('data-cot-id')

beforeEach(() => {
  xong.mockClear()
  loi.mockClear()
  // jsdom không có bố cục → cột i ở x = 260·i (rộng 250, cao 600), thẻ j trong cột ở y = 40 + 100·j. Bóng kéo
  // (DragOverlay) phủ đúng thẻ nguồn lúc nhấc như trình duyệt thật (jsdom không đo lại nó) → trả hộp của thẻ đang kéo.
  const hopCot = (el: Element) => [...el.parentElement!.children].indexOf(el)
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const the = this.closest('[data-the-id]') ?? (this.closest('[data-slot="kanban-bong"]') && document.querySelector('[data-keo]'))
    if (the) {
      const c = the.closest('[data-cot-id]')!
      const j = [...the.parentElement!.children].indexOf(the)
      return new DOMRect(hopCot(c) * 260 + 8, 40 + j * 100, 234, 90)
    }
    const c = this.closest('[data-cot-id]')
    return c ? new DOMRect(hopCot(c) * 260, 0, 250, 600) : new DOMRect(0, 0, 0, 0)
  })
})
afterEach(() => vi.restoreAllMocks())

const nhan = async (user: ReturnType<typeof userEvent.setup>, phim: string) => {
  await user.keyboard(phim)
  await act(() => new Promise((r) => setTimeout(r, 20))) // cảm biến gắn listener keydown sau setTimeout
}

describe('cấu tạo', () => {
  test('mỗi cột một vùng có tên + số thẻ; cột rỗng "Kéo thẻ vào đây"; thẻ tabIndex 0 có hướng dẫn kéo bằng phím', () => {
    render(<Bang />)
    const moi = screen.getByRole('region', { name: 'Mới' })
    expect(within(moi).getByText('2')).toBeTruthy()
    const dong = screen.getByRole('region', { name: 'Đóng' })
    expect(within(dong).getByText('Kéo thẻ vào đây')).toBeTruthy()
    expect(within(dong).getByText('0')).toBeTruthy()
    const t = the('TK-D1')
    expect(t.tabIndex).toBe(0)
    expect(t.getAttribute('aria-roledescription')).toBe('thẻ kéo được')
    const huongDan = document.getElementById(t.getAttribute('aria-describedby')!)
    expect(huongDan?.textContent).toMatch(/Space để nhấc thẻ/)
  })

  test('bấm thẻ hoặc Enter → onMo(id)', async () => {
    const user = userEvent.setup()
    const onMo = vi.fn()
    render(<Bang onMo={onMo} />)
    await user.click(the('TK-D1'))
    expect(onMo).toHaveBeenLastCalledWith('TK-D1')
    the('TK-D2').focus()
    await user.keyboard('{Enter}')
    expect(onMo).toHaveBeenLastCalledWith('TK-D2')
  })
})

describe('chuyển bằng bàn phím (dnd-kit KeyboardSensor)', () => {
  test('Space nhấc, → sang cột, Space thả → onChuyen + câu đọc tiếng Việt + toast Hoàn tác + focus theo thẻ', async () => {
    const user = userEvent.setup()
    const onChuyen = vi.fn()
    const onMo = vi.fn()
    render(<Bang onChuyen={onChuyen} onMo={onMo} />)
    the('TK-D1').focus()
    await nhan(user, ' ')
    expect(await screen.findByText(/Đã nhấc thẻ TK-D1/)).toBeTruthy()
    await nhan(user, '{ArrowRight}')
    expect(await screen.findByText(/Thẻ TK-D1 sẽ sang cột Đang xử lý/)).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Đang xử lý' }).hasAttribute('data-tren')).toBe(true)
    await nhan(user, ' ')
    expect(onChuyen).toHaveBeenCalledWith('TK-D1', 'xu-ly', undefined)
    await waitFor(() => expect(cotCua('TK-D1')).toBe('xu-ly'))
    expect(await screen.findByText(/Đã chuyển thẻ TK-D1 sang cột Đang xử lý/)).toBeTruthy()
    expect(xong).toHaveBeenCalledWith('TK-D1 → Đang xử lý', expect.objectContaining({ hoanTac: expect.any(Function) }))
    await waitFor(() => expect(document.activeElement).toBe(the('TK-D1')))
    expect(onMo).not.toHaveBeenCalled()
  })

  test('Enter cũng thả (không mở thẻ khi đang nhấc)', async () => {
    const user = userEvent.setup()
    const onChuyen = vi.fn()
    const onMo = vi.fn()
    render(<Bang onChuyen={onChuyen} onMo={onMo} />)
    the('TK-D1').focus()
    await nhan(user, ' ')
    await nhan(user, '{ArrowRight}')
    await nhan(user, '{Enter}')
    expect(onChuyen).toHaveBeenCalledWith('TK-D1', 'xu-ly', undefined)
    expect(onMo).not.toHaveBeenCalled()
  })

  test('Esc giữa chừng → về chỗ cũ, không gọi onChuyen', async () => {
    const user = userEvent.setup()
    const onChuyen = vi.fn()
    render(<Bang onChuyen={onChuyen} />)
    the('TK-D1').focus()
    await nhan(user, ' ')
    await nhan(user, '{ArrowRight}')
    await nhan(user, '{Escape}')
    expect(onChuyen).not.toHaveBeenCalled()
    expect(cotCua('TK-D1')).toBe('moi')
    expect(await screen.findByText(/Đã huỷ kéo\. Thẻ TK-D1 về chỗ cũ/)).toBeTruthy()
    expect(screen.queryByRole('region', { name: 'Đang xử lý' })?.hasAttribute('data-tren')).toBe(false)
  })

  test('thả lại đúng cột cũ → không gọi onChuyen', async () => {
    const user = userEvent.setup()
    const onChuyen = vi.fn()
    render(<Bang onChuyen={onChuyen} />)
    the('TK-D1').focus()
    await nhan(user, ' ')
    await nhan(user, '{ArrowRight}')
    await nhan(user, '{ArrowLeft}')
    await nhan(user, ' ')
    expect(onChuyen).not.toHaveBeenCalled()
    expect(await screen.findByText(/Đã thả thẻ TK-D1 ở chỗ cũ/)).toBeTruthy()
  })
})

describe('cột hỏi lý do (Chờ)', () => {
  test('thả vào Chờ → hộp hỏi lý do; Huỷ → không gọi onChuyen, thẻ ở chỗ cũ, focus về thẻ', async () => {
    const user = userEvent.setup()
    const onChuyen = vi.fn()
    render(<Bang onChuyen={onChuyen} />)
    the('TK-D1').focus()
    await nhan(user, ' ')
    await nhan(user, '{ArrowRight}')
    await nhan(user, '{ArrowRight}')
    await nhan(user, ' ')
    const hop = await screen.findByRole('dialog', { name: /Chuyển TK-D1 sang Chờ/ })
    // README Dialog: focus vào nút an toàn khi mở.
    await waitFor(() => expect(document.activeElement).toBe(within(hop).getByRole('button', { name: 'Huỷ' })))
    await user.click(within(hop).getByRole('button', { name: 'Huỷ' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(onChuyen).not.toHaveBeenCalled()
    expect(cotCua('TK-D1')).toBe('moi')
    await waitFor(() => expect(document.activeElement).toBe(the('TK-D1')))
  })

  test('chọn lý do → onChuyen(id, "cho", lý do); thiếu lý do → báo lỗi, không chuyển', async () => {
    const user = userEvent.setup()
    const onChuyen = vi.fn()
    render(<Bang onChuyen={onChuyen} />)
    the('TK-D2').focus()
    await nhan(user, ' ')
    await nhan(user, '{ArrowRight}')
    await nhan(user, '{ArrowRight}')
    await nhan(user, ' ')
    const hop = await screen.findByRole('dialog')
    await user.click(within(hop).getByRole('button', { name: 'Chuyển' }))
    expect(onChuyen).not.toHaveBeenCalled()
    const o = within(hop).getByRole('combobox', { name: 'Lý do chờ' })
    expect(o.getAttribute('aria-invalid')).toBe('true')
    expect(within(hop).getByText('Chọn lý do chờ')).toBeTruthy()
    await user.click(o)
    await user.click(await screen.findByRole('option', { name: 'Chờ KT' }))
    await user.click(within(hop).getByRole('button', { name: 'Chuyển' }))
    expect(onChuyen).toHaveBeenCalledWith('TK-D2', 'cho', 'KT')
    expect(xong).toHaveBeenCalledWith('TK-D2 → Chờ KT', expect.anything())
    await waitFor(() => expect(cotCua('TK-D2')).toBe('cho'))
    // thẻ dựng lại ở cột mới → focus theo thẻ (không rơi về body)
    await waitFor(() => expect(document.activeElement).toBe(the('TK-D2')))
  })
})

describe('menu "Chuyển sang…" (chuột phải / Shift+F10) cho người không kéo', () => {
  test('menu có mục của thẻ + mọi cột khác; chọn cột → onChuyen', async () => {
    const user = userEvent.setup()
    const onChuyen = vi.fn()
    render(<Bang onChuyen={onChuyen} />)
    fireEvent.contextMenu(the('TK-D1'), { clientX: 40, clientY: 60 })
    const menu = await screen.findByRole('menu')
    expect(within(menu).getByRole('menuitem', { name: 'Mở ticket' })).toBeTruthy()
    expect(within(menu).getByText('Chuyển sang…')).toBeTruthy()
    // Cột đang đứng không có trong danh sách chuyển.
    expect(within(menu).queryByRole('menuitem', { name: 'Mới' })).toBeNull()
    await user.click(within(menu).getByRole('menuitem', { name: 'Đóng' }))
    expect(onChuyen).toHaveBeenCalledWith('TK-D1', 'dong', undefined)
    await waitFor(() => expect(cotCua('TK-D1')).toBe('dong'))
    await waitFor(() => expect(document.activeElement).toBe(the('TK-D1')))
  })

  test('chọn cột Chờ từ menu → hỏi lý do', async () => {
    const user = userEvent.setup()
    const onChuyen = vi.fn()
    render(<Bang onChuyen={onChuyen} />)
    fireEvent.contextMenu(the('TK-D1'), { clientX: 40, clientY: 60 })
    await user.click(await screen.findByRole('menuitem', { name: 'Chờ' }))
    expect(await screen.findByRole('dialog', { name: /Chuyển TK-D1 sang Chờ/ })).toBeTruthy()
    expect(onChuyen).not.toHaveBeenCalled()
  })
})

describe('Hoàn tác + lỗi', () => {
  test('Hoàn tác trả thẻ về cột cũ kèm lý do cũ', async () => {
    const user = userEvent.setup()
    const onChuyen = vi.fn()
    render(<Bang onChuyen={onChuyen} />)
    fireEvent.contextMenu(the('TK-D3'), { clientX: 40, clientY: 60 })
    await user.click(await screen.findByRole('menuitem', { name: 'Đóng' }))
    await waitFor(() => expect(cotCua('TK-D3')).toBe('dong'))
    const { hoanTac } = xong.mock.calls[0][1] as { hoanTac: () => void }
    await act(async () => hoanTac())
    expect(onChuyen).toHaveBeenLastCalledWith('TK-D3', 'cho', 'vật tư')
    await waitFor(() => expect(cotCua('TK-D3')).toBe('cho'))
    expect(xong).toHaveBeenCalledTimes(1) // hoàn tác không đẻ thêm toast
  })

  test('onChuyen ném lỗi → toast lỗi có Thử lại, không báo xong', async () => {
    const user = userEvent.setup()
    const onChuyen = vi.fn().mockRejectedValueOnce(new Error('mất mạng'))
    render(
      <DsRoot>
        <KanbanBoard cot={COT} the={THE} onChuyen={onChuyen} onMo={() => {}} />
      </DsRoot>,
    )
    fireEvent.contextMenu(the('TK-D1'), { clientX: 40, clientY: 60 })
    await user.click(await screen.findByRole('menuitem', { name: 'Đóng' }))
    await waitFor(() => expect(loi).toHaveBeenCalledWith('TK-D1: chưa chuyển được sang Đóng — mất mạng', expect.objectContaining({ thuLai: expect.any(Function) })))
    expect(xong).not.toHaveBeenCalled()
  })
})
