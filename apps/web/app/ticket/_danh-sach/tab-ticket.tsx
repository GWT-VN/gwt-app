'use client'

// Hàng tab của danh sách ticket F: 4 tab cố định (VIEW_F, bộ lọc chọn sẵn) + tab tự tạo (CEO 26/11 "Cho phép tạo thêm tab
// phân loại" · "view thứ 5 thì tùy customize"). Học HÀNH VI Twenty ("+ Add view", "Save as new view", menu view), giao diện
// DS: Tabs pill `thuGon` (+N Thêm), SavedView (popover tên + chia sẻ), ContextMenu / DropdownMenu, ConfirmDialog.
// - Tab tự tạo = bang_view 'ticket_tab' (actions.ts listTicketTab…), URL `?tab=<id>` + query đã lưu (lọc, tìm, sắp, cột).
// - Tab tự tạo sửa được: đổi bộ lọc / sắp / cột là TỰ LƯU vào tab, không nút "Lưu" (CEO 27/11: "mặc định nó hiện luôn ko
//   cần phải bấm lưu. chỉ có xóa đi thôi"). Tab cố định / tab chung không có quyền: đổi lọc chỉ là xem tạm.
// - 4 tab cố định không sửa / xoá / đổi tên; tab chung chỉ người có quyền view chung mới thấy mục sửa.
import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { DotsThree, PencilSimple, Plus, Trash } from '@phosphor-icons/react/ssr'
import { capNhatTicketTab, doiTenTicketTab, luuTicketTab, xoaTicketTab, type TicketTab } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SavedView } from '@/components/ui/saved-view'
import { thongBao } from '@/components/ui/sonner'
import { Tabs, TabsCount, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { docViewF, KHOA_COT, KHOA_LOC, locCua, queryTab, VIEW_F } from './truong-f'

const MOI_KHOA = [...KHOA_LOC, ...KHOA_COT]
const CHU_TAB = {
  nhanTen: 'Tên tab',
  placeholder: 'VD: Chờ linh kiện Hà Nội',
  loiTrong: 'Đặt tên cho tab.',
  moTaChiaSe: 'Tắt thì chỉ mình bạn thấy.',
  xong: false as const,
}

type Muc = ComponentType<{ onSelect?: (e: Event) => void; variant?: 'default' | 'destructive'; children: ReactNode }>

export function useTabTicket({
  tabRieng = [],
  demTab = {},
  quyenTabChung = false,
  dieuKien,
}: {
  tabRieng?: TicketTab[]
  demTab?: Record<string, number>
  quyenTabChung?: boolean
  /** Tóm tắt điều kiện đang áp (chip trong popover lưu). */
  dieuKien: { nhan: string; giaTri: string }[]
}) {
  const sp = new URLSearchParams(useSearchParams().toString())
  const pathname = usePathname()
  const router = useRouter()
  const di = (q: string) => router.replace(`${pathname}?${q}`, { scroll: false })

  const rieng = tabRieng.find((x) => x.id === sp.get('tab')) ?? null
  const value = rieng ? `t:${rieng.id}` : docViewF(sp.get('view'))
  const khoa = rieng ? MOI_KHOA : KHOA_LOC
  const goc = rieng ? rieng.loc : (VIEW_F.find((x) => x.v === value)?.loc ?? '')
  const daDoi = locCua(sp, khoa) !== locCua(new URLSearchParams(goc), khoa)
  const hienTai = locCua(sp, MOI_KHOA)

  const mo = (v: string) => {
    const t = v.startsWith('t:') ? tabRieng.find((x) => `t:${x.id}` === v) : null
    if (t) {
      const q = new URLSearchParams(queryTab(sp, t.loc, null, MOI_KHOA))
      q.set('tab', t.id)
      return di(q.toString())
    }
    const x = VIEW_F.find((y) => y.v === v)!
    // Rời tab tự tạo → bỏ cả cột của nó (tab cố định dùng cột mặc định / đang chỉnh tay).
    di(queryTab(sp, x.loc, v === 'tat-ca' ? null : v, rieng ? MOI_KHOA : KHOA_LOC))
  }

  const luuMoi = async (ten: string, chung: boolean) => {
    const r = await luuTicketTab(ten, hienTai, chung)
    if (!r.ok) return thongBao.loi(r.error)
    thongBao.xong(`Đã tạo tab “${ten}”`)
    const q = new URLSearchParams(sp.toString())
    q.delete('view')
    q.delete('trang')
    q.set('tab', r.id)
    di(q.toString())
  }
  // Tự lưu: trễ 600ms để gõ tìm / bấm nhiều chip liên tiếp chỉ ghi một lần.
  const idTuLuu = rieng?.suaDuoc && daDoi ? rieng.id : null
  useEffect(() => {
    if (!idTuLuu) return
    const h = setTimeout(async () => {
      const r = await capNhatTicketTab(idTuLuu, hienTai)
      if (!r.ok) return thongBao.loi(`Không lưu được tab: ${r.error}`)
      router.refresh()
    }, 600)
    return () => clearTimeout(h)
  }, [idTuLuu, hienTai, router])

  const [doiTen, setDoiTen] = useState<{ t: TicketTab; ten: string } | null>(null)
  const [xoa, setXoa] = useState<TicketTab | null>(null)

  const luuTen = async () => {
    if (!doiTen) return
    const r = await doiTenTicketTab(doiTen.t.id, doiTen.ten)
    if (!r.ok) return thongBao.loi(r.error)
    setDoiTen(null)
    router.refresh()
  }

  const nutLuu = (trigger: ReactNode, tieuDe = 'Thêm tab') => (
    <SavedView
      dieuKien={dieuKien}
      query={hienTai}
      khu="CSKH"
      trigger={trigger}
      chu={{ ...CHU_TAB, tieuDe, chiaSe: quyenTabChung && 'Dùng chung cho mọi người' }}
      onLuu={(v) => void luuMoi(v.ten, v.chiaSe)}
    />
  )

  // Mục menu của một tab tự tạo — cùng nội dung cho chuột phải (ContextMenu) và nút "…" (DropdownMenu).
  const mucMenu = (t: TicketTab, M: Muc, Sep: ComponentType) => (
    <>
      <M onSelect={() => setDoiTen({ t, ten: t.ten })}>
        <PencilSimple aria-hidden="true" />
        Đổi tên
      </M>
      <Sep />
      <M variant="destructive" onSelect={() => setXoa(t)}>
        <Trash aria-hidden="true" />
        Xoá tab
      </M>
    </>
  )

  const tabs = (
    <div className="flex min-w-0 items-center gap-1 border-none border-current">
      {/* flex-1: khung thu gọn đo theo chỗ có sẵn — co theo nội dung thì tab ẩn đi là khung co lại, không bung ra được nữa. */}
      <Tabs value={value} onValueChange={mo} className="min-w-0 flex-1">
        <TabsList variant="pill" thuGon aria-label="Tab ticket">
          {VIEW_F.map((x) => {
            const n = demTab[x.v] ?? 0
            return (
              <TabsTrigger key={x.v} value={x.v}>
                {x.ten} <TabsCount color={x.v === 'khan' && n ? 'danger' : undefined}>{n}</TabsCount>
              </TabsTrigger>
            )
          })}
          {tabRieng.map((t) => {
            const nut = (
              <TabsTrigger key={t.id} value={`t:${t.id}`} title={t.chung ? `${t.ten} · dùng chung` : t.ten}>
                {t.ten} <TabsCount>{demTab[`t:${t.id}`] ?? 0}</TabsCount>
              </TabsTrigger>
            )
            return t.suaDuoc ? (
              <ContextMenu key={t.id}>
                <ContextMenuTrigger asChild>{nut}</ContextMenuTrigger>
                <ContextMenuContent>{mucMenu(t, ContextMenuItem as Muc, ContextMenuSeparator)}</ContextMenuContent>
              </ContextMenu>
            ) : (
              nut
            )
          })}
        </TabsList>
      </Tabs>
      {rieng?.suaDuoc && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Thao tác tab ${rieng.ten}`}>
              <DotsThree aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">{mucMenu(rieng, DropdownMenuItem as Muc, DropdownMenuSeparator)}</DropdownMenuContent>
        </DropdownMenu>
      )}
      {nutLuu(
        <Button variant="ghost" size="icon-sm" aria-label="Thêm tab" title="Thêm tab (lưu bộ lọc đang xem)">
          <Plus aria-hidden="true" />
        </Button>,
      )}
      <ConfirmDialog
        open={!!doiTen}
        onOpenChange={(o) => !o && setDoiTen(null)}
        tieuDe="Đổi tên tab"
        nutXacNhan="Lưu"
        khoaXacNhan={!doiTen?.ten.trim()}
        onXacNhan={luuTen}
      >
        <Field>
          <FieldLabel htmlFor="doi-ten-tab">Tên tab</FieldLabel>
          <Input
            id="doi-ten-tab"
            maxLength={40}
            value={doiTen?.ten ?? ''}
            onChange={(e) => setDoiTen((d) => d && { ...d, ten: e.target.value })}
            // Enter = Lưu (trừ lúc bộ gõ tiếng Việt đang ghép chữ).
            onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229 && doiTen?.ten.trim() && void luuTen()}
          />
        </Field>
      </ConfirmDialog>
      <ConfirmDialog
        open={!!xoa}
        onOpenChange={(o) => !o && setXoa(null)}
        tieuDe={`Xoá tab “${xoa?.ten ?? ''}”?`}
        moTa={xoa?.chung ? 'Tab dùng chung — mọi người sẽ không thấy tab này nữa. Ticket không bị ảnh hưởng.' : 'Ticket không bị ảnh hưởng, chỉ mất tab.'}
        color="danger"
        pha
        nutXacNhan="Xoá tab"
        onXacNhan={async () => {
          if (!xoa) return
          const r = await xoaTicketTab(xoa.id)
          if (!r.ok) return thongBao.loi(r.error)
          thongBao.xong(`Đã xoá tab “${xoa.ten}”`)
          const dangXem = xoa.id === rieng?.id
          setXoa(null)
          if (!dangXem) return router.refresh()
          di(queryTab(sp, '', null, MOI_KHOA))
          // Tab vừa xoá (nơi focus trả về) biến mất → focus về "Tất cả".
          requestAnimationFrame(() => document.querySelector<HTMLElement>('[role="tab"][data-value="tat-ca"]')?.focus())
        }}
      />
    </div>
  )

  return { tabs, value }
}
