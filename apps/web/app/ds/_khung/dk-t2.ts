import type { ComponentType } from 'react'
import { KhoiBanner, KhoiBannerHang } from '../_khoi/khoi-banner'
import { KhoiEmptyState, KhoiEmptyStateHang } from '../_khoi/khoi-empty-state'
import { KhoiSkeleton, KhoiSkeletonHang } from '../_khoi/khoi-skeleton'
import { KhoiStatCard, KhoiStatCardHang } from '../_khoi/khoi-stat-card'

/**
 * Đăng ký khối của Task 2 lát 4–6 (Skeleton, EmptyState, Banner, StatCard) — CHỈ agent Task 2 sửa file này.
 * KHOI_T2: tên component (PascalCase, như trong NHOM) → khối trần `Khoi<Ten>` (/ds/tron + cổng so khớp).
 * HANG_T2: neo (kebab) → bản hàng biến thể `Khoi<Ten>Hang` (/ds). Import từ `../_khoi/khoi-<neo>`.
 */
export const KHOI_T2: Record<string, ComponentType> = {
  Skeleton: KhoiSkeleton,
  EmptyState: KhoiEmptyState,
  Banner: KhoiBanner,
  StatCard: KhoiStatCard,
}
export const HANG_T2: Record<string, ComponentType> = {
  skeleton: KhoiSkeletonHang,
  'empty-state': KhoiEmptyStateHang,
  banner: KhoiBannerHang,
  'stat-card': KhoiStatCardHang,
}
