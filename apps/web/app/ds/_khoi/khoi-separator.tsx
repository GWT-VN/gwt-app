import { Separator } from '@/components/ui/separator'
import { BienThe, KhoiHang } from '../_khung/tam'

/** Demo không PII. Khối server: chỉ phần tử tĩnh. */
function CacBienThe() {
  return (
    <>
      <BienThe ten="Ngang" moTa="Vạch 1px màu border, rộng trọn khung — ngăn hai phần nội dung.">
        <div className="flex max-w-80 flex-col gap-3 border-none border-current" data-so="ngang">
          <div className="border-none border-current">
            <div className="text-[14px] leading-[20px] font-medium">Đơn DH-1024</div>
            <div className="text-[12px] leading-[18px] text-muted-foreground">Tạo 20/11/2026</div>
          </div>
          <Separator />
          <div className="text-[14px] leading-[20px] border-none border-current">Giao trong 3 ngày làm việc.</div>
        </div>
      </BienThe>
      <BienThe ten="Dọc" moTa="Trong hàng flex: cao theo hàng, rộng 1px.">
        <div className="flex h-5 items-center gap-3 text-[14px] leading-[20px] border-none border-current" data-so="doc">
          <span className="border-none border-current">Sửa</span>
          <Separator orientation="vertical" />
          <span className="border-none border-current">Nhân bản</span>
          <Separator orientation="vertical" />
          <span className="border-none border-current">Lưu trữ</span>
        </div>
      </BienThe>
      <BienThe ten="Có nghĩa" moTa="decorative={false} → role separator, trình đọc màn hình báo ranh giới nhóm.">
        <div className="flex max-w-80 flex-col gap-3 border-none border-current" data-so="nghia">
          <span className="text-[14px] leading-[20px] border-none border-current">Nhóm Bán hàng</span>
          <Separator decorative={false} />
          <span className="text-[14px] leading-[20px] border-none border-current">Nhóm Kho</span>
        </div>
      </BienThe>
    </>
  )
}

/** #separator trần (/ds/tron). Chưa có trong artifact → không có cổng so khớp riêng. */
export function KhoiSeparator() {
  return (
    <section id="separator" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#separator">Separator</a>
      </h2>
      <div className="divide-y divide-(--border) border-none border-current">
        <CacBienThe />
      </div>
    </section>
  )
}

/** #separator dạng hàng (/ds). */
export function KhoiSeparatorHang() {
  return (
    <KhoiHang neo="separator">
      <CacBienThe />
    </KhoiHang>
  )
}
