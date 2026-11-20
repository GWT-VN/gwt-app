import { Bell } from '@phosphor-icons/react/ssr'
import { Button } from '@/components/ui/button'
import { Count, CountNeo } from '@/components/ui/count'
import { BienThe, KhoiHang } from '../_khung/tam'

/* Demo dùng chung cho `KhoiCount` (/ds/tron, cổng so khớp) và `KhoiCountHang` (/ds). `data-so` = khoá so khớp. */

/** Nút chuông kèm số chưa đọc: tên nút đọc đủ số, chữ số trên nút `aria-hidden`. */
function Chuong({ so }: { so: number }) {
  return (
    <CountNeo data-so="neo">
      <Button
        data-so="nut"
        variant="ghost"
        size="icon"
        shape="rounded"
        aria-label={so > 0 ? `Thông báo, ${so} chưa đọc` : 'Thông báo'}
      >
        <Bell aria-hidden="true" />
        <Count so={so} />
      </Button>
    </CountNeo>
  )
}

/** #count — tái tạo ds/nguon/components/Count/preview.html: nút chuông ghost icon bo góc, 3 chưa đọc. */
export function KhoiCount() {
  return (
    <section id="count" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#count">Count</a>
      </h2>
      <div className="border-none border-current">
        <Chuong so={3} />
      </div>
    </section>
  )
}

/** #count dạng hàng cho /ds. */
export function KhoiCountHang() {
  return (
    <KhoiHang neo="count">
      <BienThe ten="Có số" moTa="Số chưa đọc ở góc trên phải nút. Trình đọc màn hình đọc tên nút: Thông báo, 3 chưa đọc.">
        <Chuong so={3} />
      </BienThe>
      <BienThe ten="Quá 9" moTa="Từ 10 trở lên hiện 9+ cho gọn.">
        <Chuong so={12} />
      </BienThe>
      <BienThe ten="Bằng 0" moTa="Không có thông báo mới thì không hiện số.">
        <Chuong so={0} />
      </BienThe>
      <BienThe ten="Trên nền khác" moTa="Viền quanh số lấy màu nền nơi đặt nút — đặt lại khi nút nằm trên thanh có màu.">
        <div className="inline-flex rounded-(--radius-md) bg-(--gray-100) p-2 [--ui-count-ring:var(--gray-100)] border-none border-current">
          <Chuong so={3} />
        </div>
      </BienThe>
    </KhoiHang>
  )
}
