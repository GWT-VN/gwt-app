import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Gộp class kiểu shadcn: clsx lọc điều kiện, tailwind-merge bỏ utility trùng (class sau thắng). */
export function cn(...v: ClassValue[]): string {
  return twMerge(clsx(v))
}
