'use client'

import { useState, useTransition, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { BookOpen, GearSix, Headset, ListChecks, Package, Receipt, ShoppingCart, Users, type Icon } from '@phosphor-icons/react'
import { dangXuat } from '@/app/auth/actions'
import { DsRoot } from '@/components/ui/ds-root'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { KhungApp, type Khu } from '@/components/ui/sidebar'
import { danhDauDangO, khuCuaDuong, type IdKhu, type KhuBanDo } from '@/lib/khung/ban-do-menu'
import { useThemeMay } from './ManV2'

const ICON: Record<IdKhu, Icon> = {
  viec: ListChecks,
  cskh: Headset,
  sales: ShoppingCart,
  kho: Package,
  wiki: BookOpen,
  'quan-tri': GearSix,
  'nhan-su': Users,
  'ke-toan': Receipt,
}

/**
 * Khung điều hướng v2 của cả app (phương án F, CEO duyệt 23/11): KhungApp DS trong DsRoot, theme theo máy.
 * - Khu đang chọn = khu chứa trang đang mở; bấm icon khu chỉ đổi panel menu (chưa đi trang), đi trang thì về khu của trang.
 * - Trang cũ nằm trong `[data-man-cu]` (app/globals.css): trả lại font, cỡ chữ, khoảng cách, bo góc, viền của app cũ mà
 *   vùng DS `[data-ds="v2"]` khai đè — bỏ lớp này là mọi màn cũ đổi giao diện.
 */
export function KhungGwt({ khu, ten, email, children }: { khu: KhuBanDo[]; ten: string; email: string | null; children: ReactNode }) {
  const pathname = usePathname()
  const [chon, setChon] = useState<IdKhu>(() => khuCuaDuong(pathname, khu))
  // Đi trang → panel về khu của trang (chỉnh state ngay lúc render theo đường dẫn trước, không qua effect).
  const [duongTruoc, setDuongTruoc] = useState(pathname)
  if (pathname !== duongTruoc) {
    setDuongTruoc(pathname)
    setChon(khuCuaDuong(pathname, khu))
  }
  const theme = useThemeMay()
  const [, chuyen] = useTransition()

  const dsKhu: Khu[] = khu.map((k) => ({ id: k.id, ten: k.ten, icon: ICON[k.id], mau: k.mau, sapCo: k.sapCo, day: k.day }))
  const k = khu.find((x) => x.id === chon)

  return (
    <DsRoot theme={theme} className="h-dvh">
      <KhungApp
        khu={dsKhu}
        khuDangChon={chon}
        onChonKhu={(id) => setChon(id as IdKhu)}
        menu={k ? danhDauDangO(k.menu, pathname) : []}
        nguoiDung={{
          ten,
          phu: email ?? undefined,
          menu: <DropdownMenuItem onSelect={() => chuyen(() => dangXuat())}>Đăng xuất</DropdownMenuItem>,
        }}
      >
        <div data-man-cu="">{children}</div>
      </KhungApp>
    </DsRoot>
  )
}
