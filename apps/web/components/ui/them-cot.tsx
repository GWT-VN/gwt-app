'use client'

import { useContext, useRef, useState } from 'react'
import { GearSix, Plus } from '@phosphor-icons/react/ssr'
import { boDau } from '@/bang/timkiem'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Command, CommandInput, CommandItem, CommandList, CommandSeparator, useGanMucSang } from './command'
import * as cs from './command-styles'
import { menuContent } from './menu-styles'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { TableHead } from './table'
import { BaoCotCtx } from './tieu-de-cot'
import type { CotBang } from './use-cot-bang'

const TUY_CHINH = '__tuy-chinh'

/**
 * ThemCot — ô "+" cuối hàng tiêu đề Bảng (học Twenty 26/11, docs/rework/2026-11-26-f-hoc-hanh-vi-twenty.md mục A). "Thêm
 * cột" = BỎ ẨN một cột đã khai báo (`CotBang`), không tạo trường mới. Bấm "+" → pop neo vào nút: ô "Tìm cột" (focus sẵn,
 * khớp không dấu theo tên như mọi ô tìm của DS) · danh sách cột đang ẩn (icon nếu cột khai `icon` + tên) · vạch ·
 * "Tuỳ chỉnh cột…" (mở ⚙ ở trang Cột hiển thị qua `onTuyChinh`). Chọn cột → hiện ở CUỐI bảng (`useCotBang().themCot`),
 * đóng pop, focus về "+". Không còn cột ẩn → dòng mờ "Mọi cột đang hiện".
 * Ghép từ Popover + Command của DS (cmdk: ↑/↓ di chuyển, Enter chọn, Esc / bấm ngoài đóng). Đặt sau `TieuDeCot` cuối
 * cùng; `<col>` rộng `RONG_THEM_COT`, mỗi dòng thân thêm một ô trống cuối. Trong `KeoCot` → câu đọc "Đã hiện cột …".
 */
export function ThemCot({
  cot,
  an,
  onHien,
  onTuyChinh,
}: {
  /** Mọi cột đã khai báo — danh sách lấy các cột đang ẩn trong đó, theo thứ tự mảng. */
  cot: CotBang[]
  /** id cột đang ẩn (`useCotBang().an`). */
  an: string[]
  /** Hiện cột (nối cuối) — `useCotBang().themCot`. */
  onHien: (id: string) => void
  /** "Tuỳ chỉnh cột…" — vd `caiDatRef.current?.mo('cot')` của `CaiDatHienThi`. Không truyền = không có mục này. */
  onTuyChinh?: () => void
}) {
  const [mo, setMo] = useState(false)
  const [go, setGo] = useState('')
  const [sang, setSang] = useState('')
  const goc = useRef<HTMLDivElement>(null)
  // Chuyển sang ⚙: không trả focus về "+" (focus ra ngoài ⚙ = ⚙ tự đóng).
  const sangCaiDat = useRef(false)
  const bao = useContext(BaoCotCtx)

  const dangAn = cot.filter((c) => !c.khoa && an.includes(c.id))
  const tu = boDau(go.trim())
  const ds = tu ? dangAn.filter((c) => boDau(c.ten).includes(tu)) : dangAn
  const khoa = [...ds.map((c) => c.id), ...(onTuyChinh ? [TUY_CHINH] : [])]
  // cmdk chỉ chọn lại mục đầu khi CHỮ đổi → giữ mục sáng ở đây, mất khỏi danh sách thì về mục đầu (xem combobox.tsx).
  const sangThat = khoa.includes(sang) ? sang : (khoa[0] ?? '')
  const ghiChu = !dangAn.length ? 'Mọi cột đang hiện' : !ds.length ? `Không có cột ẩn nào khớp "${go.trim()}"` : ''
  useGanMucSang(goc, sangThat)

  const doiMo = (o: boolean) => {
    setMo(o)
    if (!o) {
      setGo('')
      setSang('')
    }
  }

  return (
    <TableHead data-slot="them-cot">
      <Popover open={mo} onOpenChange={doiMo}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Thêm cột">
            <Plus aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          data-slot="them-cot-pop"
          aria-label="Thêm cột"
          className={cn(menuContent, 'w-[240px] max-w-[calc(100vw-16px)] max-h-(--radix-popover-content-available-height)')}
          onCloseAutoFocus={(e) => {
            if (!sangCaiDat.current) return
            sangCaiDat.current = false
            e.preventDefault()
          }}
        >
          <Command
            ref={goc}
            value={sangThat}
            onValueChange={setSang}
            shouldFilter={false}
            vimBindings={false}
            label="Tìm cột"
            className={cs.trongPopGoc}
          >
            <CommandInput value={go} onValueChange={setGo} placeholder="Tìm cột" wrapperClassName={cs.trongPopHangTim} />
            {/* Câu trạng thái NGOÀI listbox (listbox chỉ chứa option); có sẵn từ lúc mở nên lọc hết cũng được đọc. */}
            <div aria-live="polite" className={ghiChu ? cs.commandEmpty : 'border-none border-current'}>
              {ghiChu}
            </div>
            <CommandList label="Cột đang ẩn" className={cs.trongPopDs}>
              {ds.map((c) => (
                <CommandItem
                  key={c.id}
                  value={c.id}
                  onSelect={() => {
                    onHien(c.id)
                    bao?.(`Đã hiện cột ${c.ten} ở cuối bảng.`)
                    doiMo(false)
                  }}
                >
                  {c.icon}
                  <span className="min-w-0 truncate">{c.ten}</span>
                </CommandItem>
              ))}
              {onTuyChinh && (
                <>
                  <CommandSeparator alwaysRender />
                  <CommandItem
                    value={TUY_CHINH}
                    onSelect={() => {
                      sangCaiDat.current = true
                      doiMo(false)
                      onTuyChinh()
                    }}
                  >
                    <GearSix aria-hidden="true" />
                    Tuỳ chỉnh cột…
                  </CommandItem>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </TableHead>
  )
}
