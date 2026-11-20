import type { ComponentType } from 'react'
import { HANG_CARD } from './hang-card'
import { HANG_FORM_A } from './hang-form-a'
import { HANG_FORM_B } from './hang-form-b'
import { HANG_NEN } from './hang-nen'
import { HANG_OVERLAY } from './hang-overlay'

/**
 * neo → bản hàng biến thể của khối (KhoiHang/BienThe trong `tam.tsx`). Có thì /ds dùng; không thì /ds dùng khối cũ.
 * /ds/tron (cổng so khớp) LUÔN dùng khối cũ. Tách 5 file theo nhóm để nhiều người sửa song song không đụng nhau.
 */
export const HANG: Record<string, ComponentType> = { ...HANG_NEN, ...HANG_OVERLAY, ...HANG_FORM_A, ...HANG_FORM_B, ...HANG_CARD }
