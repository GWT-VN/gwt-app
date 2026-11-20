import { Tabs, TabsContent, TabsCount, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BienThe, KhoiHang } from '../_khung/tam'

/* Demo dùng chung cho `KhoiTabs` (/ds/tron, cổng so khớp) và `KhoiTabsHang` (/ds) — dữ liệu demo. `data-so` = khoá so khớp. */

const caption = 'border-none border-current text-[12px] leading-[18px] text-muted-foreground'

function Segmented({ dem = true, tat = true }: { dem?: boolean; tat?: boolean }) {
  return (
    <Tabs defaultValue="tat-ca">
      <TabsList data-so="seg" aria-label="Lọc theo trạng thái">
        <TabsTrigger data-so="seg-chon" value="tat-ca">
          Tất cả {dem && <TabsCount data-so="seg-dem">128</TabsCount>}
        </TabsTrigger>
        <TabsTrigger data-so="seg-thuong" value="cho">
          Chờ xử lý {dem && <TabsCount>12</TabsCount>}
        </TabsTrigger>
        <TabsTrigger value="xong">Hoàn tất</TabsTrigger>
        {tat && (
          <TabsTrigger data-so="seg-tat" value="luu" disabled>
            Lưu trữ
          </TabsTrigger>
        )}
      </TabsList>
      <TabsContent data-so="panel" value="tat-ca">
        128 đơn (dữ liệu demo).
      </TabsContent>
      <TabsContent value="cho">12 đơn đang chờ xử lý.</TabsContent>
      <TabsContent value="xong">Đơn đã hoàn tất.</TabsContent>
    </Tabs>
  )
}

const NHOM = [
  ['mo', 'Đang mở', 19],
  ['toi', 'Của tôi', 5],
  ['qua-han', 'Quá hạn', 2],
  ['tat-ca', 'Tất cả', 22],
] as const
const NHOM_DAI = [
  ...NHOM,
  ['cho-kh', 'Chờ khách', 4],
  ['cho-linh-kien', 'Chờ linh kiện', 3],
  ['bao-hanh', 'Bảo hành', 7],
  ['da-dong', 'Đã đóng', 140],
] as const

function Pill({ nhom = NHOM, thuGon }: { nhom?: readonly (readonly [string, string, number])[]; thuGon?: boolean }) {
  return (
    <Tabs defaultValue="mo">
      <TabsList data-so="pill" variant="pill" thuGon={thuGon} aria-label="Nhóm ticket (pill)">
        {nhom.map(([v, ten, so], i) => (
          <TabsTrigger key={v} data-so={i < 2 ? `pill-${i + 1}` : undefined} value={v}>
            {ten}{' '}
            <TabsCount data-so={i === 0 ? 'pill-dem' : v === 'qua-han' ? 'pill-danger' : undefined} color={v === 'qua-han' ? 'danger' : undefined}>
              {so}
            </TabsCount>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

/**
 * #tabs — tái tạo ds/nguon/components/Tabs/preview.html: segmented (4 tab, tab cuối tắt, 3 panel) · chú thích · pill
 * (4 tab, "Quá hạn" số danger). Preview ép trạng thái hover/focus bằng class trên 2 nút mẫu; ở đây cổng đo bằng rê / Tab
 * thật lên tab thật (ds/so-khop/tabs.json).
 */
export function KhoiTabs() {
  return (
    <section id="tabs" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#tabs">Tabs</a>
      </h2>
      <div className="border-none border-current">
        <Segmented />
        <p className={`mt-5 mb-2 ${caption}`}>
          Biến thể <code>pill</code> — hàng tab màn dữ liệu (kiểu ChatGPT):
        </p>
        <Pill />
      </div>
    </section>
  )
}

/** #tabs dạng hàng cho /ds. */
export function KhoiTabsHang() {
  return (
    <KhoiHang neo="tabs">
      <BienThe ten="Segmented" moTa="Chuyển giữa 2–5 khung trong một thẻ / bảng nhỏ. Bấm, hoặc Tab vào rồi dùng ← → Home End.">
        <Segmented dem={false} tat={false} />
      </BienThe>
      <BienThe ten="Segmented có số đếm" moTa="Số đếm nằm trong tab nên được đọc kèm tên tab.">
        <Segmented tat={false} />
      </BienThe>
      <BienThe ten="Segmented có tab tắt" moTa="Tab tắt vẫn hiện, chữ mờ; phím mũi tên bỏ qua nó.">
        <Segmented />
      </BienThe>
      <BienThe ten="Pill" moTa="Hàng tab của màn dữ liệu (ticket, đơn). Số cần chú ý tô đỏ (Quá hạn).">
        <Pill />
      </BienThe>
      <BienThe ten="Pill tràn" moTa="Hàng dài hơn chỗ: cuộn ngang, mép phải mờ dần để không cắt cụt chữ.">
        <div className="max-w-90 border-none border-current">
          <Pill nhom={NHOM_DAI} />
        </div>
      </BienThe>
      <BienThe ten="Pill thu gọn" moTa='Tab không vừa gom vào nút "Thêm". Tab đang chọn luôn hiện; chọn từ menu thì tab đó hiện ra.'>
        <div className="max-w-110 border-none border-current">
          <Pill nhom={NHOM_DAI} thuGon />
        </div>
      </BienThe>
    </KhoiHang>
  )
}
