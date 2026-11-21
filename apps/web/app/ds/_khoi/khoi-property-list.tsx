import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge, BadgeDot } from '@/components/ui/badge'
import { PropertyList, PropertyRow } from '@/components/ui/property-list'
import { BienThe, KhoiHang } from '../_khung/tam'

/*
 * Demo dùng chung cho `KhoiPropertyList` (/ds/tron) và `KhoiPropertyListHang` (/ds) — dữ liệu demo. Giá trị nhóm "Xử lý"
 * hiện TĨNH: ô sửa tại chỗ (InlineEdit) dựng ở Data view, ghép vào sau. `data-so` = khoá so khớp.
 */

const nguoi = (ten: string) => (
  <span className="inline-flex min-w-0 items-center gap-1.5 border-none border-current">
    <Avatar aria-hidden="true">
      <AvatarFallback>{ten[0]}</AvatarFallback>
    </Avatar>
    <span className="truncate border-none border-current">{ten}</span>
  </span>
)

const XU_LY = (
  <PropertyList data-so="dl-1">
    <PropertyRow nhan="Trạng thái">
      <Badge variant="soft" color="discovery">Mới</Badge>
    </PropertyRow>
    <PropertyRow nhan="Ưu tiên">
      <Badge variant="soft">Thường</Badge>
    </PropertyRow>
    <PropertyRow nhan="Loại lỗi">
      <Badge variant="outline">
        <BadgeDot />
        Chưa phân loại
      </Badge>
    </PropertyRow>
    <PropertyRow nhan="Chủ ticket">{nguoi('Minh')}</PropertyRow>
    <PropertyRow nhan="Người đang làm">{nguoi('Minh')}</PropertyRow>
    <PropertyRow nhan="Việc tiếp theo">Gọi khách xác nhận lỗi</PropertyRow>
    <PropertyRow nhan="Hạn">
      <span className="border-none border-current tabular-nums">15:00</span>
    </PropertyRow>
  </PropertyList>
)

const XEP_DOC = (
  <PropertyList data-so="dl-2" layout="stack">
    <PropertyRow nhan="Địa chỉ lắp">Tầng 2, 18 Đường Demo, P. Bến Nghé, TP.HCM</PropertyRow>
    <PropertyRow nhan="Ngày lắp">12/03/2025</PropertyRow>
    <PropertyRow nhan="Hạn bảo hành">12/03/2027</PropertyRow>
    <PropertyRow nhan="Ghi chú lắp đặt">{null}</PropertyRow>
  </PropertyList>
)

/** Nhãn mục kiểu `.ds-nhan` của preview (500 12/16 muted, cách dưới 8). */
const nhan = (chu: string) => (
  <div className="mb-2 border-none border-current text-[12px] leading-[16px] font-medium text-muted-foreground">{chu}</div>
)

/**
 * #property-list — tái tạo ds/nguon/components/PropertyList/preview.html (khung rộng tối đa 720, hai mục cách 28):
 * 2 cột rộng tối đa 340 · xếp dọc rộng tối đa 300 có ô trống "Chưa có".
 */
export function KhoiPropertyList() {
  return (
    <section id="property-list" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#property-list">PropertyList</a>
      </h2>
      <div className="max-w-[720px] border-none border-current">
        <div className="mb-7 border-none border-current">
          {nhan('Mặc định — 2 cột')}
          <div className="max-w-[340px] border-none border-current">{XU_LY}</div>
        </div>
        <div className="mb-7 border-none border-current">
          {nhan('Xếp dọc — cột hẹp / thẻ xem nhanh')}
          <div className="max-w-[300px] border-none border-current">{XEP_DOC}</div>
        </div>
      </div>
    </section>
  )
}

/** #property-list dạng hàng cho /ds. */
export function KhoiPropertyListHang() {
  return (
    <KhoiHang neo="property-list">
      <BienThe ten="Hai cột" moTa="Nhãn bên trái, giá trị bên phải. Mỗi dòng cao ít nhất bằng ô sửa nên bấm sửa không nhảy dòng.">
        <div className="max-w-[340px] border-none border-current">{XU_LY}</div>
      </BienThe>
      <BienThe ten="Nhóm có tiêu đề" moTa="Nhiều nhóm thuộc tính liền nhau, mỗi nhóm một tiêu đề nhỏ.">
        <div className="max-w-[340px] border-none border-current">
          <PropertyList tieuDe="Xử lý">
            <PropertyRow nhan="Trạng thái">
              <Badge variant="soft" color="discovery">Mới</Badge>
            </PropertyRow>
            <PropertyRow nhan="Hạn">15:00</PropertyRow>
          </PropertyList>
          <PropertyList tieuDe="Khách & máy">
            <PropertyRow nhan="Khách">Công ty Demo An Phát</PropertyRow>
            <PropertyRow nhan="Máy">CTD50</PropertyRow>
            <PropertyRow nhan="Serial">{null}</PropertyRow>
          </PropertyList>
        </div>
      </BienThe>
      <BienThe ten="Xếp dọc" moTa="Cột hẹp hoặc thẻ xem nhanh: nhãn nằm trên giá trị.">
        <div className="max-w-[300px] border-none border-current">{XEP_DOC}</div>
      </BienThe>
      <BienThe ten="Ô trống" moTa='Chưa có dữ liệu thì ghi "Chưa có" màu nhạt, không để trắng.'>
        <div className="max-w-[340px] border-none border-current">
          <PropertyList>
            <PropertyRow nhan="Serial">{null}</PropertyRow>
            <PropertyRow nhan="Ghi chú lắp đặt">{''}</PropertyRow>
          </PropertyList>
        </div>
      </BienThe>
    </KhoiHang>
  )
}
