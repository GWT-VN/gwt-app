import type { ComponentType } from 'react'
import { KhoiKanbanBoard, KhoiKanbanBoardHang } from '../_khoi/khoi-kanban-board'

/**
 * Đăng ký khối của Task 13 lát 4–6 (KanbanBoard) — CHỈ agent Task 13 sửa file này.
 * KHOI_T13: tên component (PascalCase, như trong NHOM) → khối trần `Khoi<Ten>` (/ds/tron + cổng so khớp).
 * HANG_T13: neo (kebab) → bản hàng biến thể `Khoi<Ten>Hang` (/ds). Import từ `../_khoi/khoi-<neo>`.
 */
export const KHOI_T13: Record<string, ComponentType> = { KanbanBoard: KhoiKanbanBoard }
export const HANG_T13: Record<string, ComponentType> = { 'kanban-board': KhoiKanbanBoardHang }
