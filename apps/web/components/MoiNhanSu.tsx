'use client'

import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { useState, useTransition } from 'react'
import { moiNhanSu } from '@/lib/nen-tang/nhan-su'
import { MatKhauVuaCap } from './MatKhauVuaCap'
import { HO_SO_VAI_TRO, NHAN_BO_PHAN, NHAN_VAI_TRO, VAI_TRO, apDungLoaiTruCapBac, type VaiTro } from '@/lib/nen-tang/vai-tro'

/** Không mời thẳng vào quyền quản trị — xem kiemTraLoiMoi(). */
const VAI_TRO_MOI_DUOC = VAI_TRO.filter((v) => v !== 'admin')

export function MoiNhanSu() {
  const [email, setEmail] = useState('')
  const [chon, setChon] = useState<VaiTro[]>([])
  const [loi, setLoi] = useState<string | null>(null)
  const [xong, setXong] = useState<string | null>(null)
  const [ghiChu, setGhiChu] = useState<string | null>(null)
  const [capMk, setCapMk] = useState<{ email: string; matKhau: string } | null>(null)
  const [dangChay, batDau] = useTransition()

  function gui() {
    setLoi(null)
    setXong(null)
    setGhiChu(null)
    setCapMk(null)
    const e = email.trim().toLowerCase()
    batDau(async () => {
      const r = await moiNhanSu(email, chon)
      if (!r.ok) { setLoi(r.error); return }
      setXong(`Đã thêm ${e} vào danh sách.`)
      if (r.matKhau) setCapMk({ email: e, matKhau: r.matKhau })
      else if (r.ghiChu) setGhiChu(r.ghiChu)
      setEmail('')
      setChon([])
    })
  }

  return (
    <Card className="space-y-3">
      <div>
        <p className="font-medium text-foreground">Mời người ngoài @gwt.vn</p>
        <p className="text-sm text-muted-foreground">
          Dành cho cộng tác viên lắp đặt và người dùng email cá nhân. Hệ thống tạo luôn tài khoản
          kèm <b>mật khẩu ban đầu</b> hiện ngay dưới đây để bạn gửi cho họ; lần đăng nhập đầu họ
          bắt buộc tự đổi. Gõ sai email là mời nhầm người lạ — kiểm lại trước khi bấm.
        </p>
      </div>

      {loi && <Alert color="danger"><AlertDescription>{loi}</AlertDescription></Alert>}
      {xong && <Alert color="success"><AlertDescription>{xong}</AlertDescription></Alert>}
      {ghiChu && <Alert color="info"><AlertDescription>{ghiChu}</AlertDescription></Alert>}
      {capMk && <MatKhauVuaCap email={capMk.email} matKhau={capMk.matKhau} />}

      <Input
        aria-label="Email người được mời"
        type="email"
        value={email}
        disabled={dangChay}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ctv.nam@gmail.com"
        className="w-full max-w-80"
      />

      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {VAI_TRO_MOI_DUOC.map((v) => (
          <label key={v} className="inline-flex items-center gap-1.5 text-sm text-foreground cursor-pointer select-none">
            <Checkbox
              checked={chon.includes(v)}
              disabled={dangChay}
              onCheckedChange={() =>
                setChon((truoc) =>
                  truoc.includes(v)
                    ? truoc.filter((x) => x !== v)
                    : apDungLoaiTruCapBac([...truoc, v])
                )
              }
            />
            {NHAN_VAI_TRO[v]}
            <span className="text-xs text-muted-foreground">({NHAN_BO_PHAN[HO_SO_VAI_TRO[v].boPhan]})</span>
          </label>
        ))}
      </div>

      <Button
        type="button"
        onClick={gui}
        loading={dangChay}
        disabled={!email.trim() || chon.length === 0}
      >
        {dangChay ? 'Đang thêm…' : 'Mời vào hệ thống'}
      </Button>
    </Card>
  )
}
