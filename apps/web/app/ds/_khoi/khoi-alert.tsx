import { Alert, AlertActions, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

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
        <Alert data-so="mac-dinh">
          <AlertTitle>Bản xem thử</AlertTitle>
          <AlertDescription>Dữ liệu trên trang là dữ liệu demo.</AlertDescription>
        </Alert>
        <Alert data-so="info" color="info">
          <AlertTitle>Đang đồng bộ ERP</AlertTitle>
          <AlertDescription>Số liệu tồn kho cập nhật mỗi 15 phút.</AlertDescription>
        </Alert>
        <Alert data-so="success" color="success">
          <AlertTitle>Đã lưu</AlertTitle>
          <AlertDescription>Ticket TK-DEMO-031 chuyển sang &quot;Đang xử lý&quot;.</AlertDescription>
        </Alert>
        <Alert data-so="warning" color="warning">
          <AlertTitle>Sắp hết hạn bảo hành</AlertTitle>
          <AlertDescription>3 thiết bị hết hạn trong 30 ngày tới.</AlertDescription>
          <AlertActions>
            <Button variant="outline" size="sm">Xem</Button>
          </AlertActions>
        </Alert>
        <Alert data-so="danger" color="danger">
          <AlertTitle>Không lưu được</AlertTitle>
          <AlertDescription>Bạn không có quyền sửa đơn của chi nhánh khác.</AlertDescription>
        </Alert>
      </div>
    </section>
  )
}
