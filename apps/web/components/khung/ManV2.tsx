'use client'

import { useSyncExternalStore, type ReactNode } from 'react'
import { DsRoot } from '@/components/ui/ds-root'

const toiQuery = '(prefers-color-scheme: dark)'
function ngheTheme(f: () => void) {
  const m = window.matchMedia(toiQuery)
  m.addEventListener('change', f)
  return () => m.removeEventListener('change', f)
}

/** Theme theo máy (sáng/tối hệ điều hành). Server + lần hydrate đầu = sáng, đổi sau hydrate. */
export function useThemeMay(): 'light' | 'dark' {
  return useSyncExternalStore(ngheTheme, () => window.matchMedia(toiQuery).matches, () => false) ? 'dark' : 'light'
}

/**
 * Vỏ của màn đã dựng lại bằng DS v2 nằm trong khung: màn trong khung bị bọc `[data-man-cu]` (trả thang của app cũ), nên
 * màn mới mở lại vùng DS của riêng nó — token, Inter, ô portal — theo theme máy, cao đầy vùng nội dung.
 */
export function ManV2({ children }: { children: ReactNode }) {
  return (
    <DsRoot theme={useThemeMay()} className="min-h-full">
      {children}
    </DsRoot>
  )
}
