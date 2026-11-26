'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  taoKyThuat, suaKyThuat, capTaiKhoanKyThuat, thuTaiKhoanKyThuat,
  type KyThuat, type TrangThaiTaiKhoanKT,
} from '@/app/actions'
import { ChonTinh } from '@/components/ChonTinh'
import { xoaNguoi } from '@/app/ticket/nguoi-actions'
import { chuanTenNguoi } from '@/lib/loi/nguoiTicket'
import { XacNhanXoa } from '@/components/ticket/XacNhanXoa'

/**
 * Quản lý danh sách kỹ thuật (nhân viên + CTV): thêm/sửa/khoá/xoá. Là tab Kỹ thuật của /danh-sach-nguoi — chỗ DUY NHẤT
 * sửa danh sách thợ (Hiệp 19/11/2026). Xoá = ngừng dùng (giữ lịch sử ticket, lịch): hỏi lại ngay trong dòng, cho chuyển
 * ticket đang mở sang thợ khác. `dsKt` gồm cả thợ đã xoá để gõ lại đúng tên thì KHÔI PHỤC hồ sơ cũ.
 * Cột "Đăng nhập" chỉ ADMIN thấy: cấp/thu quyền đăng nhập cho KT (email ngoài).
 * Cấp quyền tạo mật khẩu tạm — hiện 1 lần để admin chuyển cho kỹ thuật.
 */
export function RosterKyThuat({
  dsKt, trangThai, choTaiKhoanKT, soTicket = {}, soLichHen = {},
}: {
  dsKt: KyThuat[]; trangThai: Record<string, TrangThaiTaiKhoanKT>
  /** id thợ → số ticket ĐANG MỞ gán cho thợ đó */
  soTicket?: Record<string, number>
  /** id thợ → số chuyến hẹn từ hôm nay trở đi */
  soLichHen?: Record<string, number>
  /** Cấp / thu tài khoản đăng nhập cho kỹ thuật — cs.ky_thuat.tai_khoan */
  choTaiKhoanKT: boolean
}) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [suaId, setSuaId] = useState<string | null>(null)
  const [xoaId, setXoaId] = useState<string | null>(null)
  const [matKhau, setMatKhau] = useState<{ id: string; mk: string } | null>(null)

  // form thêm mới
  const [ten, setTen] = useState('')
  const [sdt, setSdt] = useState('')
  const [vung, setVung] = useState('')
  const [tinh, setTinh] = useState('')
  const [email, setEmail] = useState('')
  const [ctv, setCtv] = useState(false)

  // buffer sửa
  const [eTen, setETen] = useState(''); const [eSdt, setESdt] = useState('')
  const [eVung, setEVung] = useState(''); const [eTinh, setETinh] = useState('')
  const [eEmail, setEEmail] = useState('')
  const [eCtv, setECtv] = useState(false); const [eHd, setEHd] = useState(true)

  const dangDung = dsKt.filter((k) => k.hoat_dong)
  const kiemTen = ten.trim() ? chuanTenNguoi(ten, dsKt) : null
  const trungCu = kiemTen?.ok ? (kiemTen.trung as KyThuat | null) : null
  const trungTen = trungCu?.hoat_dong ? trungCu : null
  const khoiPhuc = trungCu && !trungCu.hoat_dong ? trungCu : null

  async function them() {
    if (!ten.trim()) { setErr('Nhập tên kỹ thuật.'); return }
    if (trungTen) { setErr(`Đã có "${trungTen.ten}" trong danh sách.`); return }
    setBusy('them'); setErr(null)
    // Gõ lại đúng tên thợ đã xoá → bật lại hồ sơ cũ (giữ lịch sử); ô nào gõ thì cập nhật, ô trống giữ giá trị cũ.
    // suaKyThuat ghi ĐÈ cả hồ sơ nên phải gửi đủ mọi trường.
    const r = khoiPhuc ? await suaKyThuat(khoiPhuc.id, {
      ten: khoiPhuc.ten, sdt: sdt || khoiPhuc.sdt || undefined, vung: vung || khoiPhuc.vung || undefined,
      tinh: tinh || khoiPhuc.tinh || undefined, email: email || khoiPhuc.email || undefined,
      la_ctv: ctv || khoiPhuc.la_ctv, hoat_dong: true,
    }) : await taoKyThuat({ ten, sdt: sdt || undefined, vung: vung || undefined, tinh: tinh || undefined, email: email || undefined, la_ctv: ctv })
    setBusy(null)
    if (!r.ok) { setErr(r.error); return }
    setTen(''); setSdt(''); setVung(''); setTinh(''); setEmail(''); setCtv(false); router.refresh()
  }
  function moSua(k: KyThuat) {
    setSuaId(k.id); setErr(null)
    setETen(k.ten); setESdt(k.sdt ?? ''); setEVung(k.vung ?? ''); setETinh(k.tinh ?? '')
    setEEmail(k.email ?? ''); setECtv(k.la_ctv); setEHd(k.hoat_dong)
  }
  async function luuSua(id: string) {
    if (!eTen.trim()) { setErr('Nhập tên kỹ thuật.'); return }
    setBusy(id); setErr(null)
    const r = await suaKyThuat(id, { ten: eTen, sdt: eSdt || undefined, vung: eVung || undefined, tinh: eTinh || undefined, email: eEmail || undefined, la_ctv: eCtv, hoat_dong: eHd })
    setBusy(null)
    if (!r.ok) { setErr(r.error); return }
    setSuaId(null); router.refresh()
  }
  async function xoa(id: string, chuyenSang: string | null) {
    setBusy(id); setErr(null)
    const r = await xoaNguoi('kt', id, chuyenSang); setBusy(null)
    if (!r.ok) { setErr(r.error); return }
    setXoaId(null); router.refresh()
  }
  async function cap(id: string) {
    setBusy(id); setErr(null); setMatKhau(null)
    const r = await capTaiKhoanKyThuat(id); setBusy(null)
    if (!r.ok) { setErr(r.error); return }
    if (r.mat_khau_tam) setMatKhau({ id, mk: r.mat_khau_tam })
    router.refresh()
  }
  async function thu(id: string) {
    if (!window.confirm('Thu quyền đăng nhập của kỹ thuật này?')) return
    setBusy(id); setErr(null)
    const r = await thuTaiKhoanKyThuat(id); setBusy(null)
    if (!r.ok) { setErr(r.error); return }
    router.refresh()
  }


  return (
    <div className="space-y-3">
      {err && <Alert color="danger"><AlertDescription>{err}</AlertDescription></Alert>}

      {/* Thêm mới */}
      <Card className="space-y-2">
        <p className="text-sm font-medium text-foreground">Thêm kỹ thuật</p>
        <div className="flex flex-wrap gap-2">
          <Input value={ten} onChange={(e) => setTen(e.target.value)} aria-label="Tên" placeholder="Tên" className="w-full sm:w-40" />
          <Input value={sdt} onChange={(e) => setSdt(e.target.value)} aria-label="SĐT" placeholder="SĐT" className="w-full sm:w-40" />
          <Input value={vung} onChange={(e) => setVung(e.target.value)} aria-label="Vùng (vd: bắc/nam)" placeholder="Vùng (vd: bắc/nam)" className="w-full sm:w-40" />
          {/* Tỉnh phụ trách — dùng ô gõ-để-tìm chung `ChonTinh` (64 tỉnh, luật CEO chốt 22/08).
              KHÁC ô "Vùng" bên cạnh: vùng chỉ để tính lịch tránh ngày nghỉ, tỉnh để điều phối. */}
          <ChonTinh value={tinh} onChange={setTinh} className="rounded-(--radius-md) border px-3 py-1.5 text-sm bg-card w-full sm:w-44" />
          <Input value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email (để cấp đăng nhập)" placeholder="Email (để cấp đăng nhập)" className="w-full sm:w-56" />
          <label className="flex items-center gap-1.5 text-sm text-muted-foreground"><Checkbox checked={ctv} onCheckedChange={(checked) => setCtv(checked === true)} /> CTV</label>
          <Button size="sm" onClick={them} disabled={busy === 'them' || !!trungTen}>{busy === 'them' ? '…' : khoiPhuc ? 'Khôi phục' : 'Thêm'}</Button>
        </div>
        {trungTen && <p className="text-xs text-(--color-text-warning)">Đã có <strong>{trungTen.ten}</strong> trong danh sách.</p>}
        {khoiPhuc && <p className="text-xs text-muted-foreground"><strong>{khoiPhuc.ten}</strong> đã xoá trước đây. Bấm Khôi phục để đưa lại hồ sơ cũ (ô nào điền sẽ cập nhật).</p>}
      </Card>

      {/* Danh sách */}
      <ul className="space-y-2">
        {dangDung.map((k) => {
          const tt = k.email ? trangThai[k.email.trim().toLowerCase()] : undefined
          const dangSua = suaId === k.id
          const nTk = soTicket[k.id] ?? 0
          return (
            <li key={k.id}><Card>
              {xoaId === k.id ? (
                <XacNhanXoa ten={k.ten} soTicket={nTk} soLichHen={soLichHen[k.id] ?? 0} coTaiKhoan={!!tt?.hoat_dong}
                  nguoiNhan={dangDung.filter((y) => y.id !== k.id)} busy={busy === k.id}
                  onXoa={(nhan) => xoa(k.id, nhan)} onHuy={() => setXoaId(null)} />
              ) : dangSua ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Input value={eTen} onChange={(e) => setETen(e.target.value)} aria-label="Tên" placeholder="Tên" className="w-full sm:w-40" />
                  <Input value={eSdt} onChange={(e) => setESdt(e.target.value)} aria-label="SĐT" placeholder="SĐT" className="w-full sm:w-40" />
                  <Input value={eVung} onChange={(e) => setEVung(e.target.value)} aria-label="Vùng" placeholder="Vùng" className="w-full sm:w-40" />
                  <ChonTinh value={eTinh} onChange={setETinh} className="rounded-(--radius-md) border px-3 py-1.5 text-sm bg-card w-full sm:w-44" />
                  <Input value={eEmail} onChange={(e) => setEEmail(e.target.value)} aria-label="Email" placeholder="Email" className="w-full sm:w-56" />
                  <label className="flex items-center gap-1.5 text-sm text-muted-foreground"><Checkbox checked={eCtv} onCheckedChange={(checked) => setECtv(checked === true)} /> CTV</label>
                  <Button size="sm" onClick={() => luuSua(k.id)} disabled={busy === k.id}>Lưu</Button>
                  <Button size="sm" variant="ghost" onClick={() => setSuaId(null)}>Huỷ</Button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-foreground">{k.ten}</span>
                    {k.la_ctv && <Badge className="ml-1.5" color="info">CTV</Badge>}
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {[k.sdt, k.vung, k.tinh, k.email].filter(Boolean).join(' · ') || '—'}
                    </div>
                    {choTaiKhoanKT && (
                      <div className="mt-1 text-xs">
                        {tt?.hoat_dong
                          ? <span className="text-(--color-text-success)">● Có tài khoản đăng nhập</span>
                          : k.email
                            ? <span className="text-muted-foreground">○ Chưa cấp đăng nhập</span>
                            : <span className="text-muted-foreground">Thêm email để cấp đăng nhập</span>}
                        {matKhau?.id === k.id && (
                          <span className="ml-2 text-(--color-text-warning)">Mật khẩu tạm: <code className="font-mono bg-(--color-background-warning-surface) px-1 rounded select-all">{matKhau.mk}</code> (đưa cho kỹ thuật, chỉ hiện 1 lần)</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">{nTk} ticket đang mở</span>
                    {choTaiKhoanKT && k.email && !tt?.hoat_dong && <Button size="sm" variant="ghost" onClick={() => cap(k.id)} disabled={busy === k.id}>cấp đăng nhập</Button>}
                    {choTaiKhoanKT && tt?.hoat_dong && <Button size="sm" variant="ghost" onClick={() => thu(k.id)} disabled={busy === k.id}>thu quyền</Button>}
                    <Button size="sm" variant="ghost" onClick={() => moSua(k)}>sửa</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setErr(null); setXoaId(k.id) }} disabled={busy === k.id}>xoá</Button>
                  </div>
                </div>
              )}
            </Card></li>
          )
        })}
        {dangDung.length === 0 && <li className="text-sm text-muted-foreground">Chưa có kỹ thuật nào.</li>}
      </ul>
    </div>
  )
}
