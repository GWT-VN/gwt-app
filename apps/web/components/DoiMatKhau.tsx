'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { createBrowserClient } from '@supabase/ssr'
import { useState } from 'react'
import { doiMatKhauBatBuoc } from '@/app/auth/actions'

function taoClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

/**
 * Tự đổi mật khẩu cho người ĐANG đăng nhập (kể cả kỹ thuật vừa được cấp mật khẩu tạm).
 *
 * HAI đường, cố ý khác nhau:
 *
 *  - mặc định (link "quên mật khẩu") — gọi thẳng supabase.auth.updateUser ở trình
 *    duyệt. Bắt buộc phải vậy: link recovery chỉ tạo phiên tạm phía client, server
 *    không nhìn thấy nên không đổi hộ được.
 *  - batBuoc (mật khẩu admin cấp, đăng nhập lần đầu) — gọi Server Action để đặt mật
 *    khẩu VÀ hạ cờ phai_doi_mat_khau trong một lượt. Xong thì làm mới phiên, nếu
 *    không cookie còn cờ cũ và proxy lại đá về đúng màn này.
 */
export function DoiMatKhau({
  nhan = 'Đổi mật khẩu',
  onXong,
  batBuoc = false,
}: { nhan?: string; onXong?: () => void; batBuoc?: boolean }) {
  const [mk, setMk] = useState('')
  const [mk2, setMk2] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  const toiThieu = batBuoc ? 8 : 6

  async function luu(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    if (mk.length < toiThieu) { setErr(`Mật khẩu tối thiểu ${toiThieu} ký tự.`); return }
    if (mk !== mk2) { setErr('Hai lần nhập chưa khớp.'); return }
    setBusy(true)

    if (batBuoc) {
      const r = await doiMatKhauBatBuoc(mk)
      if (!r.ok) { setBusy(false); setErr(r.error); return }
      // Đổi mật khẩu xong, Supabase HUỶ phiên đang chạy (đo được khi thử tay:
      // trang sau đó không còn nhận ra người dùng). Nên không cố giữ phiên nữa —
      // đăng xuất hẳn cho sạch rồi mời đăng nhập lại bằng mật khẩu mới. Cách này
      // còn có cái lợi: người dùng gõ lại mật khẩu vừa đặt, nhớ được ngay.
      setOk(true); setMk(''); setMk2('')
      await taoClient().auth.signOut()
      window.location.assign('/login?doi_mk=ok')
      return
    }

    const { error } = await taoClient().auth.updateUser({ password: mk })
    setBusy(false)
    if (error) { setErr(error.message); return }
    setOk(true); setMk(''); setMk2(''); onXong?.()
  }

  return (
    <form onSubmit={luu} className="space-y-2 max-w-sm">
      <Input type="password" value={mk} onChange={(e) => setMk(e.target.value)} aria-label="Mật khẩu mới" placeholder="Mật khẩu mới"
        autoComplete="new-password" />
      <Input type="password" value={mk2} onChange={(e) => setMk2(e.target.value)} aria-label="Nhập lại mật khẩu mới" placeholder="Nhập lại mật khẩu mới"
        autoComplete="new-password" />
      <div className="flex items-center gap-2">
        <Button type="submit" loading={busy}>{busy ? 'Đang lưu…' : nhan}</Button>
        {ok && <span role="status" className="text-sm text-(--color-text-success)">Đã đổi mật khẩu.</span>}
        {err && <span role="alert" className="text-sm text-(--color-text-danger)">{err}</span>}
      </div>
    </form>
  )
}
