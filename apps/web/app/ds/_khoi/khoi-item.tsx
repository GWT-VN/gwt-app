'use client'

import { Fragment } from 'react'
import { Bell, CaretRight, Package, ShieldCheck, Truck, Wrench } from '@phosphor-icons/react/ssr'
import { Button } from '@/components/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item'
import { BienThe, KhoiHang } from '../_khung/tam'

/** Demo không PII. `data-so` để đo. */
function CacBienThe() {
  return (
    <>
      <BienThe ten="variant" moTa="default (trong suốt) · outline (viền --border) · muted (nền muted 50%).">
        <div className="flex max-w-[560px] flex-col gap-4">
          {(['default', 'outline', 'muted'] as const).map((v) => (
            <Item key={v} variant={v} data-so={v}>
              <ItemContent>
                <ItemTitle>Bảo hành máy NX-2210</ItemTitle>
                <ItemDescription>Còn 4 tháng — hết hạn 21/03/2027. Gia hạn trước 30 ngày để giữ giá cũ.</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button variant="outline" size="sm">
                  Gia hạn
                </Button>
              </ItemActions>
            </Item>
          ))}
        </div>
      </BienThe>
      <BienThe ten="Media icon + cả dòng là link" moTa="asChild với <a>: rê sáng nền accent, Tab tới thấy vòng focus cả dòng.">
        <div className="max-w-[560px]">
          <Item variant="outline" size="sm" asChild data-so="link">
            <a href="#item">
              <ItemMedia variant="icon" data-so="media">
                <Bell aria-hidden="true" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Ticket TK-1185 có phản hồi mới</ItemTitle>
                <ItemDescription>Khách xác nhận máy đã chạy lại sau khi thay cảm biến.</ItemDescription>
              </ItemContent>
              <ItemActions>
                <CaretRight aria-hidden="true" className="size-4 text-muted-foreground" />
              </ItemActions>
            </a>
          </Item>
        </div>
      </BienThe>
      <BienThe ten="Nhóm" moTa='ItemGroup (role list) + ItemSeparator; mỗi Item trong nhóm mang role="listitem".'>
        <ItemGroup aria-label="Việc trong ngày" className="max-w-[560px]" data-so="nhom">
          {[
            { Icon: Truck, ten: 'Giao 3 máy cho đơn DH-1024', mo: 'Kho Đà Nẵng · trước 16:00' },
            { Icon: Wrench, ten: 'Lắp đặt máy NX-2210', mo: 'Kỹ thuật · ca chiều' },
            { Icon: ShieldCheck, ten: 'Duyệt bảo hành BH-0317', mo: 'Chờ ảnh tem bảo hành' },
          ].map(({ Icon, ten, mo }, i) => (
            <Fragment key={ten}>
              {i > 0 && <ItemSeparator />}
              <Item role="listitem" size="sm">
                <ItemMedia variant="icon">
                  <Icon aria-hidden="true" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{ten}</ItemTitle>
                  <ItemDescription>{mo}</ItemDescription>
                </ItemContent>
              </Item>
            </Fragment>
          ))}
        </ItemGroup>
      </BienThe>
      <BienThe ten="Chỉ tiêu đề" moTa="Không mô tả → ô media căn giữa dòng (có mô tả thì bám đỉnh).">
        <Item variant="outline" size="sm" className="max-w-[560px]">
          <ItemMedia variant="icon">
            <Package aria-hidden="true" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Đơn DH-1024 đã đóng gói</ItemTitle>
          </ItemContent>
          <ItemActions>
            <Button variant="ghost" size="sm">
              Xem đơn
            </Button>
          </ItemActions>
        </Item>
      </BienThe>
    </>
  )
}

/** #item trần (/ds/tron). Chưa có trong artifact → không có cổng so khớp riêng. */
export function KhoiItem() {
  return (
    <section id="item" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#item">Item</a>
      </h2>
      <div className="divide-y divide-(--border)">
        <CacBienThe />
      </div>
    </section>
  )
}

/** #item dạng hàng (/ds). */
export function KhoiItemHang() {
  return (
    <KhoiHang neo="item">
      <CacBienThe />
    </KhoiHang>
  )
}
