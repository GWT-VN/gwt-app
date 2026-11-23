// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem components/ui/THIRD-PARTY-NOTICES.md
import { useSyncExternalStore } from 'react'

const MOBILE_BREAKPOINT = 768
const TRUY_VAN = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function dangKy(bao: () => void) {
  const mql = window.matchMedia(TRUY_VAN)
  mql.addEventListener('change', bao)
  return () => mql.removeEventListener('change', bao)
}

/**
 * `useIsMobile` của shadcn (mốc 768 = 767px trở xuống là điện thoại, như `max-[767px]` của KhungApp). Viết bằng
 * `useSyncExternalStore` thay `useState` + `useEffect` của shadcn: cùng kết quả, không setState trong effect (lint React
 * Compiler). Server + lần hydrate đầu = `false` (bản shadcn cũng trả `false` khi chưa đo).
 */
export function useIsMobile() {
  return useSyncExternalStore(
    dangKy,
    () => window.innerWidth < MOBILE_BREAKPOINT,
    () => false,
  )
}
