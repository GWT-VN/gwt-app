import type { ComponentType } from 'react'
import { KhoiTable, KhoiTableHang } from '../_khoi/khoi-table'

/**
 * Đăng ký khối của Task 7 lát 4–6 (Table) — CHỈ agent Task 7 sửa file này.
 * KHOI_T7: tên component (PascalCase, như trong NHOM) → khối trần `Khoi<Ten>` (/ds/tron + cổng so khớp).
 * HANG_T7: neo (kebab) → bản hàng biến thể `Khoi<Ten>Hang` (/ds). Import từ `../_khoi/khoi-<neo>`.
 */
export const KHOI_T7: Record<string, ComponentType> = { Table: KhoiTable }
export const HANG_T7: Record<string, ComponentType> = { table: KhoiTableHang }
