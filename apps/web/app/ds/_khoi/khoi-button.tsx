import { Fragment, type ReactNode } from 'react'
import { DotsThree, Plus } from '@phosphor-icons/react/ssr'
import { Button } from '@/components/ui/button'
import { BienThe, KhoiHang } from '../_khung/tam'

/** Một biến thể: tên hàng (prop thật) + mô tả + demo — dùng chung cho `KhoiButton` (/ds/tron) và `KhoiButtonHang` (/ds). */
type Mau = { ten: string; moTa: string; demo: ReactNode }

const BIEN_THE: Mau[] = [
  { ten: 'variant="default"', moTa: 'Hành động chính của màn — một nút mỗi khu.', demo: <Button data-so="default">Lưu thay đổi</Button> },
  { ten: 'variant="secondary"', moTa: 'Hành động phụ đứng cạnh nút chính.', demo: <Button data-so="secondary" variant="secondary">Xuất Excel</Button> },
  { ten: 'variant="outline"', moTa: 'Thao tác trung tính: lọc, chọn cột.', demo: <Button data-so="outline" variant="outline">Bộ lọc</Button> },
  { ten: 'variant="ghost"', moTa: 'Huỷ, thao tác ít nổi trên thanh công cụ.', demo: <Button data-so="ghost" variant="ghost">Huỷ</Button> },
  { ten: 'variant="destructive"', moTa: 'Xoá, hành động không lùi được.', demo: <Button data-so="destructive" variant="destructive">Xoá đơn</Button> },
  { ten: 'variant="link"', moTa: 'Điều hướng trong câu hoặc ô bảng.', demo: <Button data-so="link" variant="link">Xem chi tiết</Button> },
]

const TRANG_THAI: Mau[] = [
  {
    ten: 'Rê chuột / Tab',
    moTa: 'Rê chuột hoặc bấm Tab để thấy nền và viền đổi.',
    demo: (
      <>
        <Button>Hover</Button>
        <Button>Focus</Button>
      </>
    ),
  },
  { ten: 'disabled', moTa: 'Thiếu quyền hoặc chưa đủ điều kiện.', demo: <Button data-so="disabled" disabled>Disabled</Button> },
  { ten: 'loading', moTa: 'Đang gửi: hiện vòng quay, chặn bấm hai lần, giữ nguyên màu.', demo: <Button data-so="loading" loading>Đang lưu</Button> },
  {
    ten: 'variant="outline" disabled',
    moTa: 'Nút viền bị tắt.',
    demo: <Button data-so="outline-disabled" variant="outline" disabled>Outline disabled</Button>,
  },
]

const KICH_CO: Mau[] = [
  { ten: 'size="sm"', moTa: '28px — thanh công cụ, chỗ chật.', demo: <Button data-so="sm" size="sm"><Plus />Thêm (sm 28)</Button> },
  { ten: 'size="default"', moTa: '32px — mặc định.', demo: <Button data-so="md">Thêm (md 32)</Button> },
  { ten: 'size="lg"', moTa: '36px — nút chính của form lớn.', demo: <Button data-so="lg" size="lg">Thêm (lg 36)</Button> },
  {
    ten: 'size="icon"',
    moTa: 'Chỉ có icon — bắt buộc đặt tên để trình đọc màn hình đọc được.',
    demo: <Button data-so="icon" size="icon" variant="outline" aria-label="Thêm"><Plus /></Button>,
  },
  {
    ten: 'shape="rounded" size="sm"',
    moTa: 'Bo vuông — nút trong bảng.',
    demo: <Button data-so="rounded-sm" size="sm" shape="rounded" variant="outline">Rounded (trong bảng)</Button>,
  },
  {
    ten: 'size="icon-sm" shape="rounded"',
    moTa: 'Nút ⋯ trên dòng bảng.',
    demo: (
      <Button data-so="icon-sm-rounded" size="icon-sm" shape="rounded" variant="ghost" aria-label="Thêm thao tác">
        <DotsThree />
      </Button>
    ),
  },
]

/** Cỡ shadcn artifact chưa có (R19) — chỉ hiện ở /ds, không ở /ds/tron (cổng so khớp). */
const CO_SHADCN: Mau[] = [
  { ten: 'size="xs"', moTa: '24px, chữ 12 — chip, ô nhập (như InputGroupButton). Artifact chưa có.', demo: <Button size="xs" variant="outline"><Plus />Thêm (xs 24)</Button> },
  {
    ten: 'size="icon-xs" · "icon-lg"',
    moTa: 'Nút icon 24px / 36px. Artifact chưa có.',
    demo: (
      <>
        <Button size="icon-xs" variant="ghost" aria-label="Thêm (nhỏ)"><Plus /></Button>
        <Button size="icon-lg" variant="outline" aria-label="Thêm (lớn)"><Plus /></Button>
      </>
    ),
  },
]

const hien = (ds: Mau[]) => ds.map((m) => <Fragment key={m.ten}>{m.demo}</Fragment>)

/**
 * #button — tái tạo 3 hàng của ds/nguon/components/Button/preview.html; `data-so` = khoá so khớp (ds/so-khop/button.json
 * nhắm `#button > div …` → giữ nguyên cấu trúc DOM). Hàng 2 không ép hover/focus bằng class — tạo bằng tương tác thật.
 */
export function KhoiButton() {
  return (
    <section id="button" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#button">Button</a>
      </h2>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">{hien(BIEN_THE)}</div>
        <div className="flex flex-wrap items-center gap-2">{hien(TRANG_THAI)}</div>
        <div className="flex flex-wrap items-center gap-2">{hien(KICH_CO)}</div>
        <p className="m-0 [font:var(--text-text-xs)] text-muted-foreground">
          Hàng 2: trỏ chuột / Tab để thấy hover, focus thật (không ép bằng class).
        </p>
      </div>
    </section>
  )
}

/** #button dạng hàng cho /ds — mỗi biến thể / trạng thái / cỡ một hàng. */
export function KhoiButtonHang() {
  return (
    <KhoiHang neo="button">
      {[...BIEN_THE, ...TRANG_THAI, ...KICH_CO, ...CO_SHADCN].map((m) => (
        <BienThe key={m.ten} ten={m.ten} moTa={m.moTa}>
          <div className="flex flex-wrap items-center gap-2">{m.demo}</div>
        </BienThe>
      ))}
    </KhoiHang>
  )
}
