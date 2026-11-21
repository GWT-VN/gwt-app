import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { BienThe, KhoiHang } from '../_khung/tam'

/* Demo dùng chung cho `KhoiBreadcrumb` (/ds/tron) và `KhoiBreadcrumbHang` (/ds) — dữ liệu demo. `data-so` = khoá so khớp. */

const duongDan = (ma: string) => (
  <Breadcrumb data-so="nav">
    <BreadcrumbList data-so="ol">
      <BreadcrumbItem data-so="li-1">
        <BreadcrumbLink data-so="a-1" href="#breadcrumb">
          CSKH
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem data-so="li-2">
        <BreadcrumbLink data-so="a-2" href="#breadcrumb">
          Ticket
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem data-so="li-3">
        <BreadcrumbPage data-so="trang">{ma}</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
)

/** #breadcrumb — tái tạo ds/nguon/components/Breadcrumb/preview.html: khu → danh sách → mã bản ghi đang xem. */
export function KhoiBreadcrumb() {
  return (
    <section id="breadcrumb" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#breadcrumb">Breadcrumb</a>
      </h2>
      <div className="border-none border-current">{duongDan('TK-2611-045')}</div>
    </section>
  )
}

/** #breadcrumb dạng hàng cho /ds. */
export function KhoiBreadcrumbHang() {
  return (
    <KhoiHang neo="breadcrumb">
      <BienThe ten="Ba cấp" moTa="Khu → danh sách → bản ghi đang xem. Mục cuối là chữ, không bấm được.">
        {duongDan('TK-2611-045')}
      </BienThe>
      <BienThe ten="Chỗ hẹp" moTa="Mã bản ghi dài bị cắt bằng dấu ba chấm, hai mục trước giữ nguyên.">
        <div className="max-w-[240px] border-none border-current">{duongDan('TK-2611-045-DEMO-BAO-HANH-LAN-2')}</div>
      </BienThe>
      <BienThe
        ten="BreadcrumbSeparator · BreadcrumbEllipsis"
        moTa="Phần shadcn: dấu phân cách là phần tử (ẩn với trình đọc), mục giữa thu gọn thành …. Mặc định không cần — dấu “/” tự vẽ."
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#breadcrumb">CSKH</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>TK-2611-045</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </BienThe>
    </KhoiHang>
  )
}
