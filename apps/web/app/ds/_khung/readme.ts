import { readFileSync } from 'node:fs'
import path from 'node:path'
import { boDau } from '@/bang/timkiem'

/** Đọc file chép nguyên byte từ artifact trong ds/nguon/ (cwd = apps/web cả lúc dev lẫn lúc test). */
export function docNguon(rel: string): string {
  return readFileSync(path.join(process.cwd(), 'ds/nguon', rel), 'utf8')
}

/** Chia README theo tiêu đề `## `: `dau` = phần trước tiêu đề đầu tiên; `muc` = tiêu đề → thân (bỏ dòng tiêu đề). */
export function chiaMuc(md: string): { dau: string; muc: Map<string, string> } {
  const [dau, ...con] = md.split(/^## /m)
  return {
    dau: dau.trim(),
    muc: new Map(
      con.map((c) => {
        const i = c.indexOf('\n')
        return i < 0 ? [c.trim(), ''] : [c.slice(0, i).trim(), c.slice(i + 1).trim()]
      }),
    ),
  }
}

/** Neo `#id` của một tiêu đề: không dấu, chữ thường, cụm ký tự khác chữ/số thành một gạch. */
export function neoTieuDe(s: string): string {
  return boDau(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Trang chữ của /ds ← mục README dự án (ds/nguon/README.md). Mỗi mục README thuộc ĐÚNG một trang (test chốt, artifact
 * đổi tên mục là test đỏ). Mục 4 nền token (Màu, Chữ, Khoảng cách, Viền) là luật DÙNG token → ở trang Nguyên tắc; bảng
 * giá trị token ở các trang nền (/ds/mau…).
 */
export const TAI_LIEU: Record<string, { tieuDe: string; muc: string[] }> = {
  'nguyen-tac': {
    tieuDe: 'Nguyên tắc dùng',
    muc: [
      'Nguyên tắc dùng',
      'Màu',
      'Chữ',
      'Khoảng cách, kích thước control',
      'Viền, bo góc, bóng',
      'Focus và trạng thái',
      'Chuyển động',
      'Icon và logo',
    ],
  },
  'giong-van': { tieuDe: 'Nội dung và giọng văn', muc: ['Nội dung và giọng văn'] },
  'anh-xa': { tieuDe: 'Ánh xạ token shadcn → OpenAI', muc: ['Ánh xạ token shadcn → OpenAI'] },
  'tuong-phan': { tieuDe: 'Độ tương phản đã đo', muc: ['Độ tương phản đã đo'] },
  gwt: {
    tieuDe: 'Riêng GWT',
    muc: ['Phần mở rộng riêng của GWT', 'Tích hợp vào gwt-app (rework/v2.0.0)', 'Quyết định còn mở'],
  },
}
