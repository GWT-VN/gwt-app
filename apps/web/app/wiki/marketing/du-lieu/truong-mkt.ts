// Trường lọc + tab của 3 bảng Wiki › Marketing › Dữ liệu (khuôn Ticket F — docs/rework/2026-11-27-dong-bo-bang-khuon-f.md).
// File THƯỜNG (không 'use client'): lib/tab-view.ts đọc khoá lọc, BangMkt (client) lọc trong bộ nhớ bằng `apLoc` — dữ liệu
// marketing đọc qua REST riêng (lib/marketing/supabase-mkt, ≤ 500 dòng/bảng), không qua bang/locDb.
import type { KieuTruong } from '@/bang/locTruong'
import { cat5a, platformLabel } from '@/lib/marketing/format'
import type { AnalysisRow, HookItem, IdeaRow } from '@/lib/marketing/supabase-mkt'

/** Trường lọc chạy trong bộ nhớ: `lay` = giá trị thô, `nhan` = chữ hiện của giá trị (mặc định chính nó). */
export type TruongMkt<T> = { id: string; ten: string; kieu: KieuTruong; lay: (r: T) => string | null; nhan?: (g: string) => string }

const khoaLoc = (truong: { id: string }[]) => ['q', ...truong.map((x) => x.id), 'cot', 'chieu']

// ── Phân tích video (video_analyses) ──
export const TRUONG_VIDEO: TruongMkt<AnalysisRow>[] = [
  { id: 'tuyen', ten: 'Tuyến', kieu: 'chon', lay: (r) => cat5a(r.content_category) },
  { id: 'nen_tang', ten: 'Nền tảng', kieu: 'chon', lay: (r) => r.platform?.toLowerCase() ?? null, nhan: platformLabel },
  { id: 'viral', ten: 'Viral', kieu: 'chon', lay: (r) => (r.is_viral ? 'co' : 'chua'), nhan: (g) => (g === 'co' ? 'Viral' : 'Chưa') },
]
export const KHOA_LOC_VIDEO = khoaLoc(TRUONG_VIDEO)
/** Tab cố định = các nút lọc tuyến 5A cũ (Tất cả · A1…A5, có số đếm). */
export const TAB_VIDEO = [
  { v: 'tat-ca', ten: 'Tất cả', loc: '' },
  ...['A1', 'A2', 'A3', 'A4', 'A5'].map((a) => ({ v: a.toLowerCase(), ten: a, loc: `tuyen=${a}` })),
]

// ── Kho hook / CTA (hook_library) ──
export const TEN_LOAI_HOOK: Record<string, string> = { hook: 'Hook', cta: 'Kêu gọi (CTA)', question: 'Câu hỏi', closing: 'Câu kết' }
export const tenLoaiHook = (k: string | null) => (k && TEN_LOAI_HOOK[k]) || k || 'khác'
export const TRUONG_HOOK: TruongMkt<HookItem>[] = [
  { id: 'loai', ten: 'Loại', kieu: 'chon', lay: (r) => r.kind, nhan: tenLoaiHook },
  { id: 'phong_cach', ten: 'Phong cách', kieu: 'chon', lay: (r) => r.hook_style },
]
export const KHOA_LOC_HOOK = khoaLoc(TRUONG_HOOK)
/** Tab cố định = các nút lọc loại câu cũ. Loại lạ (ngoài 4 loại) vẫn lọc được ở Lọc ▸ Loại. */
export const TAB_HOOK = [
  { v: 'tat-ca', ten: 'Tất cả', loc: '' },
  ...Object.entries(TEN_LOAI_HOOK).map(([k, ten]) => ({ v: k, ten, loc: `loai=${k}` })),
]

// ── Ý tưởng video (video_ideas) ──
export const TRUONG_Y_TUONG: TruongMkt<IdeaRow>[] = [
  { id: 'trang_thai', ten: 'Trạng thái', kieu: 'chon', lay: (r) => r.status || 'idea' },
  { id: 'nen_tang', ten: 'Nguồn', kieu: 'chon', lay: (r) => r.source_platform?.toLowerCase() ?? null, nhan: platformLabel },
]
export const KHOA_LOC_Y_TUONG = khoaLoc(TRUONG_Y_TUONG)
/** Trạng thái lấy từ dữ liệu (không cố định) → nút lọc trạng thái cũ chuyển sang Lọc ▸ Trạng thái. */
export const TAB_Y_TUONG = [{ v: 'tat-ca', ten: 'Tất cả', loc: '' }]
