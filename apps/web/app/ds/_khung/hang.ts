import type { ComponentType } from 'react'
import { HANG_CARD } from './hang-card'
import { HANG_FORM_A } from './hang-form-a'
import { HANG_FORM_B } from './hang-form-b'
import { HANG_NEN } from './hang-nen'
import { HANG_OVERLAY } from './hang-overlay'
import { HANG_T1 } from './dk-t1'
import { HANG_T2 } from './dk-t2'
import { HANG_T3 } from './dk-t3'
import { HANG_T4 } from './dk-t4'
import { HANG_T5 } from './dk-t5'
import { HANG_T6 } from './dk-t6'
import { HANG_T7 } from './dk-t7'
import { HANG_T8 } from './dk-t8'
import { HANG_T9 } from './dk-t9'
import { HANG_T10 } from './dk-t10'
import { HANG_T11 } from './dk-t11'
import { HANG_T12 } from './dk-t12'
import { HANG_T13 } from './dk-t13'
import { HANG_L7_3 } from './dk-l7-3'
import { HANG_L7_4 } from './dk-l7-4'
import { HANG_SC_1 } from './dk-sc-1'
import { HANG_SC_2 } from './dk-sc-2'
import { HANG_SC_3 } from './dk-sc-3'
import { HANG_SC_4 } from './dk-sc-4'
import { HANG_SC_5 } from './dk-sc-5'
import { HANG_SC_6 } from './dk-sc-6'
import { HANG_SC_7 } from './dk-sc-7'
import { HANG_SC_8 } from './dk-sc-8'

/**
 * neo → bản hàng biến thể của khối (KhoiHang/BienThe trong `tam.tsx`). Có thì /ds dùng; không thì /ds dùng khối cũ.
 * /ds/tron (cổng so khớp) LUÔN dùng khối cũ. Tách 5 file theo nhóm để nhiều người sửa song song không đụng nhau.
 */
export const HANG: Record<string, ComponentType> = { ...HANG_NEN, ...HANG_OVERLAY, ...HANG_FORM_A, ...HANG_FORM_B, ...HANG_CARD,
  ...HANG_T1, ...HANG_T2, ...HANG_T3, ...HANG_T4, ...HANG_T5, ...HANG_T6, ...HANG_T7, ...HANG_T8, ...HANG_T9, ...HANG_T10, ...HANG_T11, ...HANG_T12, ...HANG_T13, ...HANG_L7_3, ...HANG_L7_4,
  ...HANG_SC_1, ...HANG_SC_2, ...HANG_SC_3, ...HANG_SC_4, ...HANG_SC_5, ...HANG_SC_6, ...HANG_SC_7, ...HANG_SC_8,
}
