import { BookOpen, Package, Wrench } from '@phosphor-icons/react/ssr'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { BienThe, KhoiHang } from '../_khung/tam'

const HUONG_DAN = [
  { ten: 'Lắp đặt máy lọc', mo: 'Các bước lắp tại nhà khách, kiểm áp lực nước.', icon: Wrench },
  { ten: 'Thay lõi định kỳ', mo: 'Lịch thay theo dòng máy, mã lõi tương ứng.', icon: Package },
  { ten: 'Sổ tay bảo hành', mo: 'Điều kiện bảo hành, hồ sơ cần chụp.', icon: BookOpen },
]

/** Demo không PII. Link trỏ neo `#navigation-menu` (không rời trang). `viewport` = bảng con dùng khung chung. */
function Menu({ viewport = true }: { viewport?: boolean }) {
  return (
    // Khổ hẹp: gốc không vượt khung, hàng mục xuống dòng → bảng con (rộng = gốc) không tràn mép phải.
    <NavigationMenu viewport={viewport} aria-label="Wiki (demo)" className="max-w-full">
      <NavigationMenuList className="flex-wrap justify-start">
        <NavigationMenuItem>
          <NavigationMenuTrigger data-so="trigger">Hướng dẫn</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="m-0 grid w-[min(400px,calc(100cqw-var(--spacing)*4.5))] list-none gap-1 p-0">
              {HUONG_DAN.map(({ ten, mo, icon: I }) => (
                <li key={ten}>
                  <NavigationMenuLink href="#navigation-menu" data-so="link">
                    <span className="flex items-center gap-2 font-medium">
                      <I aria-hidden="true" />
                      {ten}
                    </span>
                    <span className="text-[12px] leading-[18px] text-muted-foreground">{mo}</span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Sản phẩm</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="m-0 grid w-[min(240px,calc(100cqw-var(--spacing)*4.5))] list-none gap-1 p-0">
              {['Máy lọc RO', 'Máy lọc tổng', 'Lõi lọc'].map((x) => (
                <li key={x}>
                  <NavigationMenuLink href="#navigation-menu">{x}</NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#navigation-menu" className={navigationMenuTriggerStyle()} data-so="link-don">
            Hỏi đáp
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function CacBienThe() {
  return (
    <>
      <BienThe
        ten="Có viewport (mặc định)"
        moTa="Rê hoặc bấm trigger mở bảng con; Tab / ← → giữa các mục, ↓ vào bảng, Esc đóng. Bảng con dùng chung một khung menu DS."
      >
        <div className="@container min-h-64">
          <Menu />
        </div>
      </BienThe>
      <BienThe ten="viewport={false}" moTa="Mỗi bảng con tự mang khung, mở ngay dưới trigger của nó.">
        <div className="@container min-h-64">
          <Menu viewport={false} />
        </div>
      </BienThe>
    </>
  )
}

/** #navigation-menu trần (/ds/tron). Chưa có trong artifact → không có cổng so khớp. */
export function KhoiNavigationMenu() {
  return (
    <section id="navigation-menu" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#navigation-menu">NavigationMenu</a>
      </h2>
      <div className="divide-y divide-(--border)">
        <CacBienThe />
      </div>
    </section>
  )
}

/** #navigation-menu dạng hàng (/ds). */
export function KhoiNavigationMenuHang() {
  return (
    <KhoiHang neo="navigation-menu">
      <CacBienThe />
    </KhoiHang>
  )
}
