import type { Icon } from '@phosphor-icons/react'
import {
  ArrowsHorizontal,
  ArrowsLeftRight,
  ChatText,
  CircleHalf,
  Compass,
  CornersOut,
  Devices,
  House,
  Palette,
  PuzzlePiece,
  Ruler,
  SquaresFour,
  Stack,
  TextAa,
} from '@phosphor-icons/react/ssr'

export type Theme = 'light' | 'dark'

/**
 * Các trang của /ds theo thứ tự cột trái. `tuKhoa` = tên tiếng Anh như artifact (Overview, Colors…) để gõ cách nào cũng
 * tìm ra. Trang nền token (mau…moc-man-hinh) do `app/ds/_nen/*` vẽ; trang chữ lấy từ README dự án (`readme.ts`).
 */
export const TRANG: { slug: string; ten: string; icon: Icon; tuKhoa: string; moTa: string }[] = [
  { slug: 'tong-quan', ten: 'Tổng quan', icon: House, tuKhoa: 'overview', moTa: 'Hệ thiết kế là gì, lấy từ đâu' },
  {
    slug: 'nguyen-tac',
    ten: 'Nguyên tắc dùng',
    icon: Compass,
    tuKhoa: 'principles usage focus motion chuyen dong icon logo',
    moTa: 'Gọi token theo vai trò, không số trần; luật dùng màu, chữ, khoảng cách, viền; focus, chuyển động, icon',
  },
  {
    slug: 'giong-van',
    ten: 'Nội dung và giọng văn',
    icon: ChatText,
    tuKhoa: 'content voice tone copy',
    moTa: 'Nhãn nút, câu lỗi, hộp xác nhận, dữ liệu demo, số tiền, ngày',
  },
  { slug: 'mau', ten: 'Màu', icon: Palette, tuKhoa: 'colors color', moTa: 'Bảng màu và token màu theo vai trò' },
  { slug: 'chu', ten: 'Chữ', icon: TextAa, tuKhoa: 'typography font', moTa: 'Font Inter, cỡ chữ, tiêu đề' },
  { slug: 'khoang-cach', ten: 'Khoảng cách', icon: ArrowsHorizontal, tuKhoa: 'spacing', moTa: 'Thang 4px' },
  { slug: 'bo-goc', ten: 'Bo góc', icon: CornersOut, tuKhoa: 'corner radius', moTa: 'Thang radius' },
  { slug: 'bong', ten: 'Bóng', icon: Stack, tuKhoa: 'shadows shadow elevation', moTa: 'Bóng lớp nổi' },
  { slug: 'co-control', ten: 'Cỡ control', icon: Ruler, tuKhoa: 'control size', moTa: 'Chiều cao, gutter control' },
  { slug: 'moc-man-hinh', ten: 'Mốc màn hình', icon: Devices, tuKhoa: 'breakpoint responsive', moTa: 'Breakpoint' },
  {
    slug: 'anh-xa',
    ten: 'Ánh xạ token',
    icon: ArrowsLeftRight,
    tuKhoa: 'mapping shadcn openai',
    moTa: 'Mỗi biến shadcn trỏ tới token OpenAI nào, vì sao',
  },
  {
    slug: 'tuong-phan',
    ten: 'Độ tương phản',
    icon: CircleHalf,
    tuKhoa: 'contrast wcag',
    moTa: 'Tỉ lệ WCAG đã đo, cặp nào chưa đạt',
  },
  {
    slug: 'gwt',
    ten: 'Riêng GWT',
    icon: PuzzlePiece,
    tuKhoa: 'gwt extension integration tich hop quyet dinh decisions',
    moTa: 'Phần mở rộng của GWT, tích hợp vào gwt-app, quyết định còn mở',
  },
  { slug: 'components', ten: 'Components', icon: SquaresFour, tuKhoa: 'thanh phan', moTa: 'Mọi component đã dựng' },
]

/** Đường dẫn một trang /ds, giữ `?theme=dark`. `components` = `/ds` (giữ mọi link `#neo` đã gửi). */
export function duongDan(slug: string, theme: Theme, neo?: string): string {
  return `${slug === 'components' ? '/ds' : `/ds/${slug}`}${theme === 'dark' ? '?theme=dark' : ''}${neo ? `#${neo}` : ''}`
}

/** Mục lục component: nhóm → [tên, neo, đã dựng]. Dữ liệu thuần (truyền được sang client), dựng ở `khoi.ts`. */
export type NhomMuc = { ten: string; lat: number; muc: { ten: string; neo: string; daDung: boolean }[] }
