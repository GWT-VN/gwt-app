import { Fragment, type ReactNode } from 'react'
import { Badge, BadgeDot } from '@/components/ui/badge'
import { BienThe, KhoiHang } from '../_khung/tam'

/** Một biến thể: tên hàng (prop thật) + mô tả + demo — dùng chung cho `KhoiBadge` (/ds/tron) và `KhoiBadgeHang` (/ds). */
type Mau = { ten: string; moTa: string; demo: ReactNode }

const MAU_SOFT: Mau[] = [
  { ten: 'color="secondary"', moTa: 'Mặc định — trạng thái trung tính (nháp).', demo: <Badge data-so="nhap">Nháp</Badge> },
  { ten: 'color="info"', moTa: 'Đang diễn ra.', demo: <Badge data-so="info" color="info"><BadgeDot />Đang giao</Badge> },
  { ten: 'color="success"', moTa: 'Đã xong, đạt.', demo: <Badge data-so="success" color="success"><BadgeDot />Hoàn tất</Badge> },
  { ten: 'color="warning"', moTa: 'Chờ, cần để ý.', demo: <Badge data-so="warning" color="warning"><BadgeDot />Chờ xử lý</Badge> },
  { ten: 'color="danger"', moTa: 'Quá hạn, lỗi.', demo: <Badge data-so="danger" color="danger"><BadgeDot />Quá hạn</Badge> },
  { ten: 'color="discovery"', moTa: 'Mới, tính năng mới.', demo: <Badge data-so="discovery" color="discovery">Mới</Badge> },
]

const KIEU: Mau[] = [
  { ten: 'variant="solid"', moTa: 'Nền đặc xám — nổi hơn kiểu nền nhạt.', demo: <Badge data-so="solid" variant="solid">Solid</Badge> },
  {
    ten: 'variant="solid" color="success"',
    moTa: 'Đặc xanh — kết quả chốt (đã thanh toán).',
    demo: <Badge data-so="solid-success" variant="solid" color="success">Đã thanh toán</Badge>,
  },
  {
    ten: 'variant="solid" color="danger"',
    moTa: 'Đặc đỏ — lỗi cần xử lý ngay.',
    demo: <Badge data-so="solid-danger" variant="solid" color="danger">Lỗi</Badge>,
  },
  { ten: 'variant="outline"', moTa: 'Viền xám — nhãn phụ ít nổi.', demo: <Badge data-so="outline" variant="outline">Outline</Badge> },
  { ten: 'size="md"', moTa: '22px — đứng cạnh chữ 14px.', demo: <Badge data-so="md-info" size="md" color="info">Cỡ md 22px</Badge> },
]

const hien = (ds: Mau[]) => ds.map((m) => <Fragment key={m.ten}>{m.demo}</Fragment>)

/**
 * #badge — tái tạo 2 hàng của ds/nguon/components/Badge/preview.html; `data-so` = khoá so khớp (ds/so-khop/badge.json
 * nhắm `#badge > div` → giữ nguyên cấu trúc DOM).
 */
export function KhoiBadge() {
  return (
    <section id="badge" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#badge">Badge</a>
      </h2>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">{hien(MAU_SOFT)}</div>
        <div className="flex flex-wrap items-center gap-2">{hien(KIEU)}</div>
        <p className="m-0 [font:var(--text-text-xs)] text-muted-foreground">
          Trạng thái luôn có CHỮ (và chấm) — không phân biệt chỉ bằng màu.
        </p>
      </div>
    </section>
  )
}

/** #badge dạng hàng cho /ds — mỗi màu / kiểu / cỡ một hàng, thêm hàng BadgeDot có màu (mẫu outline xám + chấm màu). */
export function KhoiBadgeHang() {
  return (
    <KhoiHang neo="badge">
      {[...MAU_SOFT, ...KIEU].map((m) => (
        <BienThe key={m.ten} ten={m.ten} moTa={m.moTa}>
          <div className="flex flex-wrap items-center gap-2">{m.demo}</div>
        </BienThe>
      ))}
      <BienThe ten='BadgeDot color="…"' moTa="Chấm màu trong nhãn viền — trạng thái luôn có chữ, không chỉ dựa vào màu.">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline"><BadgeDot color="success" />Đang chạy</Badge>
          <Badge variant="outline"><BadgeDot color="danger" />Dừng</Badge>
        </div>
      </BienThe>
    </KhoiHang>
  )
}
