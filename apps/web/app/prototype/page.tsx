// PROTOTYPE — mục lục: bấm thẳng tới từng phần cần duyệt. Duyệt ở đây; CHỐT rồi mới đẩy vào artifact DS.
// Nhánh bỏ đi prototype/v2-khung — KHÔNG merge.
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Inter } from 'next/font/google'
import './khung/_proto/tokens.css'
import './khung/_proto/ui.css'

const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-inter', display: 'swap' })
export const metadata = { title: 'Prototype · Mục lục' }

type Muc = { ten: string; href: string; ghi?: string }
const NHOM: { ten: string; tt: 'chot' | 'duyet'; muc: Muc[] }[] = [
  { ten: 'Form', tt: 'chot', muc: [
    { ten: 'Form mẫu (ghép đủ component)', href: '/prototype/form#form', ghi: 'Bấm Lưu khi trống để xem lỗi' },
    { ten: 'DatePicker — kiểu Airbnb', href: '/prototype/form#datepicker' },
    { ten: 'DateRangePicker — kiểu Airbnb', href: '/prototype/form#daterange', ghi: 'Bấm ngày đầu rồi rê chuột' },
    { ten: 'Ô tiền · đơn vị (InputAffix)', href: '/prototype/form#o-tien' },
    { ten: 'Radio · Checkbox · Switch', href: '/prototype/form#radio-switch' },
    { ten: 'FileUpload', href: '/prototype/form#fileupload', ghi: 'Kéo tệp vào vùng thả' },
    { ten: 'Cả nhóm Form — theme tối', href: '/prototype/form?theme=dark' },
  ] },
  { ten: 'Toàn app (tìm toàn cục · thông báo · tổng quan)', tt: 'chot', muc: [
    { ten: 'Tìm toàn cục — Ctrl K', href: '/prototype/toanapp#tim', ghi: 'Bấm "Tìm…" rồi gõ: sen vang · TK-2611-04 · HO-1123 · đuôi SĐT. ↑↓ chọn, Enter mở' },
    { ten: 'Tìm toàn cục trong khung F', href: '/prototype/khung?variant=F', ghi: 'Bấm 🔍 hoặc Ctrl K → gõ TK-2611-020 → Enter: mở đúng trang ticket' },
    { ten: 'Thông báo trong app — chuông', href: '/prototype/toanapp#thongbao', ghi: 'Bấm chuông (số đỏ = chưa đọc) → tab Chưa đọc → bấm 1 dòng. Bấm "Giả lập thông báo mới đến" để thấy số tăng' },
    { ten: 'Chuông thông báo trong khung F', href: '/prototype/khung?variant=F', ghi: 'Bấm 🔔 cạnh 🔍 → bấm dòng "Hiệp nhắc bạn…": mở đúng TK-2611-042' },
    { ten: 'Cấu hình thông báo — ma trận', href: '/prototype/toanapp#cauhinh', ghi: 'Tắt ô Trong app ở “Được @nhắc” → chuông mục trên bớt 1. Bỏ tick Discord kênh → ô chọn kênh mờ' },
    { ten: 'StatCard — màn Tổng quan', href: '/prototype/toanapp#stat', ghi: 'Màu theo nghĩa: quá hạn giảm = xanh, khách hỏi lại tăng = đỏ' },
    { ten: 'Cả nhóm — theme tối', href: '/prototype/toanapp?theme=dark' },
  ] },
  { ten: 'Phản hồi (xác nhận · trống · tải · thông báo)', tt: 'chot', muc: [
    { ten: 'Luật chọn kiểu phản hồi', href: '/prototype/phanhoi#chon' },
    { ten: 'ConfirmDialog', href: '/prototype/phanhoi#confirm', ghi: 'Bấm "Xoá phiếu chi…" → bấm Xoá khi trống để xem lỗi. "Gộp khách…": gõ mã mới bấm được' },
    { ten: 'EmptyState — 4 lý do', href: '/prototype/phanhoi#empty', ghi: 'Bấm "Thử lại" ở ô lỗi' },
    { ten: 'Skeleton · nút đang chạy', href: '/prototype/phanhoi#skeleton', ghi: 'Bấm "Tải lại" / "Lưu thay đổi"' },
    { ten: 'Banner', href: '/prototype/phanhoi#banner' },
    { ten: 'Toast (thành công · lỗi · đang chạy)', href: '/prototype/phanhoi#toast', ghi: 'Bấm 3 nút; lỗi không tự tắt' },
    { ten: 'Cả nhóm — theme tối', href: '/prototype/phanhoi?theme=dark' },
  ] },
  { ten: 'Trang chi tiết (khung chung)', tt: 'chot', muc: [
    { ten: 'Trang mẫu ghép đủ', href: '/prototype/chitiet#trang', ghi: 'Bấm "Đổi trạng thái" → dòng Hoạt động tự ghi. Gõ ghi chú → Ctrl + Enter' },
    { ten: 'PageHeader (breadcrumb · ‹ › · hành động)', href: '/prototype/chitiet#page-header', ghi: 'Tiêu đề dài: tối đa 2 dòng rồi cắt' },
    { ten: 'PropertyList', href: '/prototype/chitiet#property-list', ghi: 'Bấm giá trị để sửa tại chỗ' },
    { ten: 'Timeline', href: '/prototype/chitiet#timeline', ghi: 'Bấm "Hiện … cũ hơn"; rê lên giờ xem ngày đủ' },
    { ten: 'Composer', href: '/prototype/chitiet#composer', ghi: '3 trạng thái: thường · gửi lỗi · ticket đã đóng' },
    { ten: 'Cả trang — theme tối', href: '/prototype/chitiet?theme=dark' },
  ] },
  { ten: 'Xem dữ liệu — bổ sung', tt: 'chot', muc: [
    { ten: 'FilterBar + Lưu bộ lọc', href: '/prototype/bang?variant=B', ghi: 'Bấm tiêu đề cột "Loại lỗi" → tick 1 loại' },
    { ten: 'Thanh hàng loạt + Phân trang', href: '/prototype/bang?variant=B', ghi: 'Tick ô đầu bảng → "Chọn tất cả 19" → sang trang 2' },
    { ten: 'Menu trạng thái — Chờ bắt buộc lý do', href: '/prototype/bang?variant=B', ghi: 'Bấm ô Trạng thái → "Chờ ›" → chọn lý do. Kanban (E): kéo thẻ vào cột Chờ' },
    { ten: 'Tag ưu tiên Gấp/Cao/Thường/Thấp · nhãn loại lỗi ôm chữ', href: '/prototype/bang?variant=A', ghi: 'Rê chuột lên tag để xem P1–P4 + nhóm lỗi' },
    { ten: 'Kéo độ rộng cột (vùng bấm 16px)', href: '/prototype/bang?variant=B', ghi: 'Rê chuột vào mép phải tiêu đề cột → vạch xanh → kéo' },
  ] },
  { ten: 'Bảng ticket — đã chốt', tt: 'chot', muc: [
    { ten: 'Danh sách 1 dòng', href: '/prototype/bang?variant=A' },
    { ten: 'Bảng', href: '/prototype/bang?variant=B' },
    { ten: 'Bảng nhóm theo trạng thái', href: '/prototype/bang?variant=C' },
    { ten: 'Danh sách + thẻ xem nhanh', href: '/prototype/bang?variant=D' },
    { ten: 'Kanban', href: '/prototype/bang?variant=E' },
  ] },
  { ten: 'Khung điều hướng — đã chốt', tt: 'chot', muc: [{ ten: 'Sidebar F + nút Bắp', href: '/prototype/khung?variant=F' }] },
]

export default function Page() {
  if (process.env.NODE_ENV === 'production') notFound()
  return (
    <div className={`proto ${inter.variable}`} style={{ ['--font-sans' as string]: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif', minHeight: '100vh', padding: '32px 16px', background: 'var(--muted)', color: 'var(--foreground)', font: '400 14px/20px var(--font-sans)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <header>
          <h1 style={{ margin: 0, font: '600 24px/28px var(--font-sans)' }}>Prototype GWT App v2</h1>
          <p className="ui-caption" style={{ margin: '4px 0 0' }}>Duyệt ở đây. Phần nào chốt mới đưa vào artifact DS.</p>
        </header>
        {NHOM.map((n) => (
          <section key={n.ten} className="ui-card" style={{ background: 'var(--background)', padding: 8 }} aria-labelledby={n.ten}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 8px 4px' }}>
              <h2 id={n.ten} style={{ margin: 0, font: '600 16px/24px var(--font-sans)' }}>{n.ten}</h2>
              <span className="ui-badge" data-color={n.tt === 'chot' ? 'success' : 'warning'}>{n.tt === 'chot' ? 'Đã chốt' : 'Chờ duyệt'}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {n.muc.map((m) => (
                <Link key={m.ten} href={m.href} className="ui-menu-item" style={{ justifyContent: 'space-between', textDecoration: 'none', padding: '8px' }}>
                  <span>{m.ten}{m.ghi && <span className="ui-caption" style={{ display: 'block' }}>{m.ghi}</span>}</span>
                  <span className="ui-caption" style={{ flexShrink: 0 }}>{m.href.replace('/prototype', '')}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
