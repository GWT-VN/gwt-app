'use client'

// Hàng tab của bảng danh sách — khuôn Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md mục 2): tab CỐ ĐỊNH
// (bộ lọc chọn sẵn, tab đầu = "Tất cả") + tab TỰ TẠO (CEO 26/11 "Cho phép tạo thêm tab phân loại"). Học HÀNH VI Twenty
// ("+ Add view", menu view); giao diện DS: Tabs pill `thuGon` (+N Thêm), SavedView (popover tên + chia sẻ), ContextMenu /
// DropdownMenu, ConfirmDialog.
// - Tab tự tạo = bang_view khoá `bang` (lib/tab-view.ts), URL `?tab=<id>` + query đã lưu (lọc, tìm, sắp, cột).
// - Tab tự tạo sửa được: đổi bộ lọc / sắp / cột là TỰ LƯU vào tab, không nút "Lưu" (CEO 27/11: "mặc định nó hiện luôn ko
//   cần phải bấm lưu. chỉ có xóa đi thôi"). Tab cố định / tab chung không có quyền: đổi lọc chỉ là xem tạm.
// - Tab cố định không sửa / xoá / đổi tên; tab chung chỉ người có quyền view chung mới thấy mục sửa.
import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { DotsThree, PencilSimple, Plus, Trash } from '@phosphor-icons/react/ssr'
import { capNhatTabView, doiTenTabView, luuTabView, xoaTabView, type TabView } from '@/app/actions'
import { KHOA_COT, locCua, queryTab } from '@/bang/tabView'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SavedView } from '@/components/ui/saved-view'
import { thongBao } from '@/components/ui/sonner'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TAB_VIEW, type BangTab } from '@/lib/tab-view'

/** Tab cố định: `v` vào URL `?view=` (tab đầu không ghi), `loc` = query bộ lọc chọn sẵn; `nguy`: bỏ dùng (27/11 không còn số đếm trên tab). */
export type TabCoDinh = { v: string; ten: string; loc: string; nguy?: boolean }

const CHU_TAB = {
  nhanTen: 'Tên tab',
  loiTrong: 'Đặt tên cho tab.',
  moTaChiaSe: 'Tắt thì chỉ mình bạn thấy.',
  xong: false as const,
}

type Muc = ComponentType<{ onSelect?: (e: Event) => void; variant?: 'default' | 'destructive'; children: ReactNode }>

export function useHangTab({
  bang,
  coDinh,
  tabRieng = [],
  quyenTabChung = false,
  dieuKien,
  nhan,
  khu,
  viDuTen,
}: {
  bang: BangTab
  coDinh: readonly TabCoDinh[]
  tabRieng?: TabView[]
  quyenTabChung?: boolean
  /** Tóm tắt điều kiện đang áp (chip trong popover lưu). */
  dieuKien: { nhan: string; giaTri: string }[]
  /** Danh từ của bản ghi: "ticket", "khách"… (nhãn đọc màn hình, câu xác nhận xoá). */
  nhan: string
  /** Tên khu cho dòng chia sẻ của SavedView. */
  khu: string
  /** Placeholder tên tab, vd "VD: Chờ linh kiện Hà Nội". */
  viDuTen: string
}) {
  const sp = new URLSearchParams(useSearchParams().toString())
  const pathname = usePathname()
  const router = useRouter()
  const di = (q: string) => router.replace(`${pathname}?${q}`, { scroll: false })

  const khoaLoc = TAB_VIEW[bang].khoaLoc
  const moiKhoa = [...khoaLoc, ...KHOA_COT]
  const dau = coDinh[0].v
  const rieng = tabRieng.find((x) => x.id === sp.get('tab')) ?? null
  const value = rieng ? `t:${rieng.id}` : (coDinh.find((x) => x.v === sp.get('view'))?.v ?? dau)
  const khoa = rieng ? moiKhoa : khoaLoc
  const goc = rieng ? rieng.loc : (coDinh.find((x) => x.v === value)?.loc ?? '')
  const daDoi = locCua(sp, khoa) !== locCua(new URLSearchParams(goc), khoa)
  const hienTai = locCua(sp, moiKhoa)

  const mo = (v: string) => {
    const t = v.startsWith('t:') ? tabRieng.find((x) => `t:${x.id}` === v) : null
    if (t) {
      const q = new URLSearchParams(queryTab(sp, t.loc, null, moiKhoa))
      q.set('tab', t.id)
      return di(q.toString())
    }
    const x = coDinh.find((y) => y.v === v)!
    // Rời tab tự tạo → bỏ cả cột của nó (tab cố định dùng cột mặc định / đang chỉnh tay).
    di(queryTab(sp, x.loc, v === dau ? null : v, rieng ? moiKhoa : khoaLoc))
  }

  const luuMoi = async (ten: string, chung: boolean) => {
    const r = await luuTabView(bang, ten, hienTai, chung)
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
      const r = await capNhatTabView(bang, idTuLuu, hienTai)
      if (!r.ok) return thongBao.loi(`Không lưu được tab: ${r.error}`)
      router.refresh()
    }, 600)
    return () => clearTimeout(h)
  }, [bang, idTuLuu, hienTai, router])

  const [doiTen, setDoiTen] = useState<{ t: TabView; ten: string } | null>(null)
  const [xoa, setXoa] = useState<TabView | null>(null)

  const luuTen = async () => {
    if (!doiTen) return
    const r = await doiTenTabView(bang, doiTen.t.id, doiTen.ten)
    if (!r.ok) return thongBao.loi(r.error)
    setDoiTen(null)
    router.refresh()
  }

  // Mục menu của một tab tự tạo — cùng nội dung cho chuột phải (ContextMenu) và nút "…" (DropdownMenu).
  const mucMenu = (t: TabView, M: Muc, Sep: ComponentType) => (
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
  // Không số đếm trên tab (khuôn F — CEO 27/11 "bỏ hết bộ đếm label"): bộ đếm duy nhất là phân trang dưới bảng.

  // Nút sau tab cuối (Twenty "+ Add view"): "…" thao tác tab tự tạo đang chọn, "+" thêm tab.
  const cuoi = (
    <>
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
      <SavedView
        dieuKien={dieuKien}
        query={hienTai}
        khu={khu}
        trigger={
          <Button variant="ghost" size="icon-sm" aria-label="Thêm tab" title="Thêm tab (lưu bộ lọc đang xem)">
            <Plus aria-hidden="true" />
          </Button>
        }
        chu={{ ...CHU_TAB, tieuDe: 'Thêm tab', placeholder: viDuTen, chiaSe: quyenTabChung && 'Dùng chung cho mọi người' }}
        onLuu={(v) => void luuMoi(v.ten, v.chiaSe)}
      />
    </>
  )

  const tabs = (
    <div className="flex min-w-0 items-center gap-1 border-none border-current">
      {/* flex-1: khung thu gọn đo theo chỗ có sẵn — co theo nội dung thì tab ẩn đi là khung co lại, không bung ra được nữa. */}
      <Tabs value={value} onValueChange={mo} className="min-w-0 flex-1">
        <TabsList variant="pill" thuGon aria-label={`Tab ${nhan}`} cuoi={cuoi}>
          {coDinh.map((x) => (
            <TabsTrigger key={x.v} value={x.v}>
              {x.ten}
            </TabsTrigger>
          ))}
          {tabRieng.map((t) => {
            const nut = (
              <TabsTrigger key={t.id} value={`t:${t.id}`} title={t.chung ? `${t.ten} · dùng chung` : t.ten}>
                {t.ten}
              </TabsTrigger>
            )
            // ContextMenuTrigger asChild ghi `data-state="closed"` đè `data-state="active"` của tab → tab đang chọn mất
            // kiểu active (CEO 27/11 "view tạo ra còn ko có trạng thái active"). Bọc span `contents` nhận thuộc tính đó.
            return t.suaDuoc ? (
              <ContextMenu key={t.id}>
                <ContextMenuTrigger asChild>
                  <span className="contents">{nut}</span>
                </ContextMenuTrigger>
                <ContextMenuContent>{mucMenu(t, ContextMenuItem as Muc, ContextMenuSeparator)}</ContextMenuContent>
              </ContextMenu>
            ) : (
              nut
            )
          })}
        </TabsList>
      </Tabs>
      <ConfirmDialog
        open={!!doiTen}
        onOpenChange={(o) => !o && setDoiTen(null)}
        tieuDe="Đổi tên tab"
        nutXacNhan="Lưu"
        khoaXacNhan={!doiTen?.ten.trim()}
        onXacNhan={luuTen}
      >
        <Field>
          <FieldLabel htmlFor={`doi-ten-tab-${bang}`}>Tên tab</FieldLabel>
          <Input
            id={`doi-ten-tab-${bang}`}
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
        moTa={xoa?.chung ? `Tab dùng chung — mọi người sẽ không thấy tab này nữa. Dữ liệu ${nhan} không bị ảnh hưởng.` : `Dữ liệu ${nhan} không bị ảnh hưởng, chỉ mất tab.`}
        color="danger"
        pha
        nutXacNhan="Xoá tab"
        onXacNhan={async () => {
          if (!xoa) return
          const r = await xoaTabView(bang, xoa.id)
          if (!r.ok) return thongBao.loi(r.error)
          thongBao.xong(`Đã xoá tab “${xoa.ten}”`)
          const dangXem = xoa.id === rieng?.id
          setXoa(null)
          if (!dangXem) return router.refresh()
          di(queryTab(sp, '', null, moiKhoa))
          // Tab vừa xoá (nơi focus trả về) biến mất → focus về tab đầu.
          requestAnimationFrame(() => document.querySelector<HTMLElement>(`[role="tab"][data-value="${dau}"]`)?.focus())
        }}
      />
    </div>
  )

  return { tabs, value }
}
