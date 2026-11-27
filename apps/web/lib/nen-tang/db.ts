import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Hai client TÁCH BIỆT — đừng trộn lẫn:
 *
 *  1. authClient()  — anon key + session cookie. CHỈ để biết "ai đang đăng nhập".
 *                     Không đọc được bảng CSKH (RLS 0 policy chặn anon/authenticated).
 *
 *  2. dataClient()  — service_role, BỎ QUA RLS. Chỉ gọi SAU KHI đã xác thực nhân viên.
 *                     Key này KHÔNG BAO GIỜ được xuống trình duyệt.
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function authClient() {
  const store = await cookies()
  return createServerClient(URL, ANON, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options))
        } catch {
          // gọi từ Server Component -> bỏ qua, proxy đã refresh session
        }
      },
    },
  })
}

/** service_role — chỉ dùng trong Server Action / Route Handler, sau requireStaff(). */
export function dataClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error(
      'Thiếu SUPABASE_SERVICE_ROLE_KEY. Điền vào .env.local (xem .env.example). ' +
        'KHÔNG commit file .env.local.'
    )
  }
  return createClient(URL, key, { auth: { persistSession: false } })
}

/**
 * service_role của GWT-Masterdata (DB THỨ HAI, khác `dataClient`) — CSKH v2 đọc/ghi bảng `customer_care.*` khi
 * `CSKH_NGUON=md`. Như `dataClient`: chỉ server, sau requireStaff(); env không có tiền tố NEXT_PUBLIC → không xuống trình duyệt.
 */
export function mdClient() {
  const url = process.env.MD_SUPABASE_URL
  const key = process.env.MD_SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'Thiếu MD_SUPABASE_URL / MD_SUPABASE_SERVICE_ROLE_KEY (Supabase GWT-Masterdata, khác DB của app). ' +
        'Điền vào .env.local (xem .env.example) hoặc bỏ CSKH_NGUON=md. KHÔNG commit file .env.local.'
    )
  }
  return createClient(url, key, { auth: { persistSession: false } })
}
