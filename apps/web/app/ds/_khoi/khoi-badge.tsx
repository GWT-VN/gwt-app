import { Badge, BadgeDot } from '@/components/ui/badge'

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
        <div className="flex flex-wrap items-center gap-2">
          <Badge data-so="nhap">Nháp</Badge>
          <Badge data-so="info" color="info"><BadgeDot />Đang giao</Badge>
          <Badge data-so="success" color="success"><BadgeDot />Hoàn tất</Badge>
          <Badge data-so="warning" color="warning"><BadgeDot />Chờ xử lý</Badge>
          <Badge data-so="danger" color="danger"><BadgeDot />Quá hạn</Badge>
          <Badge data-so="discovery" color="discovery">Mới</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge data-so="solid" variant="solid">Solid</Badge>
          <Badge data-so="solid-success" variant="solid" color="success">Đã thanh toán</Badge>
          <Badge data-so="solid-danger" variant="solid" color="danger">Lỗi</Badge>
          <Badge data-so="outline" variant="outline">Outline</Badge>
          <Badge data-so="md-info" size="md" color="info">Cỡ md 22px</Badge>
        </div>
        <p className="m-0 [font:var(--text-text-xs)] text-muted-foreground">
          Trạng thái luôn có CHỮ (và chấm) — không phân biệt chỉ bằng màu.
        </p>
      </div>
    </section>
  )
}
