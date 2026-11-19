'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { inter } from './font-inter'

const DsPortalContext = createContext<HTMLElement | null>(null)

/**
 * Vùng DS v2: token trong ds/tokens.css chỉ sống dưới [data-ds="v2"]. data-theme PHẢI nằm cùng phần tử với data-ds
 * (selector tối là [data-ds="v2"][data-theme="dark"]). Ô [data-ds-portal] ở cuối để Radix Portal (menu, dialog…)
 * render vào TRONG vùng thay vì document.body — ra ngoài vùng là mất token.
 * font-[family-name:var(--font-sans)]: Inter của DS; utility `font-sans` toàn app vẫn là Geist. Biến --font-inter
 * (inter.variable) gắn trên CHÍNH phần tử này → DsRoot tự đủ font, màn nào bọc DsRoot cũng có Inter.
 * font-feature-settings "cv11", "ss03": y body của ds/nguon/bundle.css (a một tầng…) — tokens không có khoá cho nó.
 */
export function DsRoot({
  theme = 'light',
  className,
  children,
}: {
  theme?: 'light' | 'dark'
  className?: string
  children: ReactNode
}) {
  const [portal, setPortal] = useState<HTMLElement | null>(null)
  return (
    <div
      data-ds="v2"
      data-theme={theme}
      className={cn(
        inter.variable,
        'bg-background text-foreground font-[family-name:var(--font-sans)] antialiased',
        '[font-feature-settings:"cv11","ss03"]',
        className,
      )}
      style={{ colorScheme: theme }}
    >
      <DsPortalContext.Provider value={portal}>{children}</DsPortalContext.Provider>
      <div data-ds-portal="" ref={setPortal} />
    </div>
  )
}

/** Ô portal của DsRoot gần nhất (null trước khi mount / ngoài vùng DS). Truyền vào `container` của Radix Portal. */
export function useDsPortal(): HTMLElement | null {
  return useContext(DsPortalContext)
}
