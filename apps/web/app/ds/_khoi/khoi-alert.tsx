import { Fragment, type ReactNode } from 'react'
import { Alert, AlertActions, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { BienThe, KhoiHang } from '../_khung/tam'

/** Một biến thể: tên hàng (prop thật) + mô tả + demo — dùng chung cho `KhoiAlert` (/ds/tron) và `KhoiAlertHang` (/ds). */
type Mau = { ten: string; moTa: string; demo: ReactNode }

const MAU: Mau[] = [
  {
    ten: 'variant="default"',
    moTa: 'Mặc định (shadcn) = color secondary — ghi chú trung tính.',
    demo: (
      <Alert data-so="mac-dinh">
        <AlertTitle>Bản xem thử</AlertTitle>
        <AlertDescription>Dữ liệu trên trang là dữ liệu demo.</AlertDescription>
      </Alert>
    ),
  },
  {
    ten: 'color="info" (GWT)',
    moTa: 'Thông tin về hệ thống, tiến trình.',
    demo: (
      <Alert data-so="info" color="info">
        <AlertTitle>Đang đồng bộ ERP</AlertTitle>
        <AlertDescription>Số liệu tồn kho cập nhật mỗi 15 phút.</AlertDescription>
      </Alert>
    ),
  },
  {
    ten: 'color="success" (GWT)',
    moTa: 'Xác nhận thao tác đã xong.',
    demo: (
      <Alert data-so="success" color="success">
        <AlertTitle>Đã lưu</AlertTitle>
        <AlertDescription>Ticket TK-DEMO-031 chuyển sang &quot;Đang xử lý&quot;.</AlertDescription>
      </Alert>
    ),
  },
  {
    ten: 'color="warning" + AlertActions',
    moTa: 'Cần để ý sớm; nút hành động sát mép phải.',
    demo: (
      <Alert data-so="warning" color="warning">
        <AlertTitle>Sắp hết hạn bảo hành</AlertTitle>
        <AlertDescription>3 thiết bị hết hạn trong 30 ngày tới.</AlertDescription>
        <AlertActions>
          <Button variant="outline" size="sm">Xem</Button>
        </AlertActions>
      </Alert>
    ),
  },
  {
    ten: 'variant="destructive"',
    moTa: 'Lỗi chặn thao tác (= color danger) — trình đọc màn hình đọc ngay khi hiện.',
    demo: (
      <Alert data-so="danger" variant="destructive">
        <AlertTitle>Không lưu được</AlertTitle>
        <AlertDescription>Bạn không có quyền sửa đơn của chi nhánh khác.</AlertDescription>
      </Alert>
    ),
  },
]

/**
 * #alert — tái tạo 5 alert của ds/nguon/components/Alert/preview.html (gap 10px = style inline của preview);
 * `data-so` = khoá so khớp (ds/so-khop/alert.json nhắm `#alert > div`).
 */
export function KhoiAlert() {
  return (
    <section id="alert" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#alert">Alert</a>
      </h2>
      <div className="flex flex-col gap-[10px]">
        {MAU.map((m) => (
          <Fragment key={m.ten}>{m.demo}</Fragment>
        ))}
      </div>
    </section>
  )
}

/** #alert dạng hàng cho /ds — mỗi màu một hàng. */
export function KhoiAlertHang() {
  return (
    <KhoiHang neo="alert">
      {MAU.map((m) => (
        <BienThe key={m.ten} ten={m.ten} moTa={m.moTa}>
          {m.demo}
        </BienThe>
      ))}
    </KhoiHang>
  )
}
