'use client'

import { CaretLeft, CaretRight, ClipboardText, Copy, MagnifyingGlassMinus, MagnifyingGlassPlus } from '@phosphor-icons/react/ssr'
import { Button } from '@/components/ui/button'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '@/components/ui/button-group'
import { BienThe, KhoiHang } from '../_khung/tam'

/** Demo không PII. `data-so` để đo. */
function CacBienThe() {
  return (
    <>
      <BienThe ten="Ngang (outline)" moTa="Ba nút liền: góc trong vuông, hai viền kề nhau gộp thành một vạch 1px.">
        <ButtonGroup aria-label="Thao tác bài viết" data-so="ngang">
          <Button variant="outline">Lưu nháp</Button>
          <Button variant="outline">Xem trước</Button>
          <Button variant="outline">Gửi duyệt</Button>
        </ButtonGroup>
      </BienThe>
      <BienThe ten="Có vạch ngăn" moTa="Nút đặc (secondary) không có viền → ButtonGroupSeparator kẻ vạch màu --input.">
        <ButtonGroup aria-label="Bộ nhớ tạm" data-so="vach">
          <Button variant="secondary">
            <Copy aria-hidden="true" />
            Sao chép
          </Button>
          <ButtonGroupSeparator />
          <Button variant="secondary">
            <ClipboardText aria-hidden="true" />
            Dán
          </Button>
        </ButtonGroup>
      </BienThe>
      <BienThe ten="Ô chữ + lồng cụm" moTa="ButtonGroupText giữa hai nút; cụm lồng cụm cách nhau 8.">
        <ButtonGroup data-so="long">
          <ButtonGroup aria-label="Chuyển trang">
            <Button variant="outline" size="icon" aria-label="Trang trước">
              <CaretLeft aria-hidden="true" />
            </Button>
            <ButtonGroupText data-so="chu">Trang 3 / 12</ButtonGroupText>
            <Button variant="outline" size="icon" aria-label="Trang sau">
              <CaretRight aria-hidden="true" />
            </Button>
          </ButtonGroup>
          <ButtonGroup aria-label="Phóng to thu nhỏ">
            <Button variant="outline" size="icon" aria-label="Thu nhỏ">
              <MagnifyingGlassMinus aria-hidden="true" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Phóng to">
              <MagnifyingGlassPlus aria-hidden="true" />
            </Button>
          </ButtonGroup>
        </ButtonGroup>
      </BienThe>
      <BienThe ten='orientation="vertical"' moTa="Xếp dọc: góc trên/dưới bên trong vuông.">
        <ButtonGroup orientation="vertical" aria-label="Thu phóng bản đồ" data-so="doc">
          <Button variant="outline" size="icon" aria-label="Phóng to">
            <MagnifyingGlassPlus aria-hidden="true" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Thu nhỏ">
            <MagnifyingGlassMinus aria-hidden="true" />
          </Button>
        </ButtonGroup>
      </BienThe>
    </>
  )
}

/** #button-group trần (/ds/tron). Chưa có trong artifact → không có cổng so khớp riêng. */
export function KhoiButtonGroup() {
  return (
    <section id="button-group" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#button-group">ButtonGroup</a>
      </h2>
      <div className="divide-y divide-(--border)">
        <CacBienThe />
      </div>
    </section>
  )
}

/** #button-group dạng hàng (/ds). */
export function KhoiButtonGroupHang() {
  return (
    <KhoiHang neo="button-group">
      <CacBienThe />
    </KhoiHang>
  )
}
