'use client'

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { updateTicket } from '@/app/actions'
import { datCsTheoDoi } from '@/app/ticket/dau-ticket-actions'
import type { Staff } from '@/lib/nen-tang/nhan-su-luat'
import { ganCsTheoDoi, ganKyThuat } from '@/app/ticket/nguoi-actions'
import { CS_THEO_DOI, ngayVNHienThi, soNgayMo } from '@/lib/loi/ngayTicket'
import type { NguoiDs } from '@/lib/loi/nguoiTicket'
import { ChonNguoi } from '@/components/ticket/ChonNguoi'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { PageHeader } from '@/components/ui/page-header'

const TRANG_THAI = [
  { key: 'Open', label: 'Đang mở' },
  { key: 'Done', label: 'Đã xong' },
  { key: 'Cancel', label: 'Đã huỷ' },
]
const nhanTT = (k: string) => TRANG_THAI.find((s) => s.key === k)?.label ?? k

type KQ = { ok: true } | { ok: false; error: string }

/**
 * Thanh đầu trang ticket: mã · loại · model · tỉnh; 4 ô sửa nhanh (chọn là lưu ngay)
 * Trạng thái · Khẩn · CS theo dõi · Kỹ thuật; tóm tắt "Mở N ngày · K lần lỗi · lần cuối".
 * Có `dsCs` / `dsKt` (DB đã áp migration 18/11) → chọn từ danh sách (thêm / xoá người ở trang /danh-sach-nguoi, admin);
 * không có → như 17/11 (4 tên cố định, kỹ thuật theo tài khoản nhân viên).
 */
export function DauTicket({
  code, loai, model, tinh, state, khan, csTheoDoi, ktId, staff,
  ngayDau, soLan, ngayCuoi, homNay, choSua, choCs, coCotMoi = true, dsCs = null, dsKt = null, ktHoSo = null, quanTri = false,
  duongDan, meta,
}: {
  code: string; loai: string | null; model: string | null; tinh: string | null
  state: string; khan: boolean; csTheoDoi: string | null; ktId: string | null; staff: Staff[]
  // 'YYYY-MM-DD': ngày khách báo lần 1 / lần gần nhất; hôm nay theo giờ VN.
  ngayDau: string | null; soLan: number; ngayCuoi: string | null; homNay: string
  choSua: boolean
  // Sửa được CS theo dõi (có quyền + DB đã có cột).
  choCs: boolean
  // false = DB chưa có cột cs_theo_doi → ẩn ô CS theo dõi.
  coCotMoi?: boolean
  // Danh sách người (18/11); null = chưa áp migration → giao diện cũ.
  dsCs?: NguoiDs[] | null; dsKt?: NguoiDs[] | null
  // Kỹ thuật theo hồ sơ thợ (tickets.kt_ho_so).
  ktHoSo?: string | null
  // Được thêm / xoá người (vai trò "Sửa danh sách người", 19/11) → hiện link "Quản lý danh sách →".
  quanTri?: boolean
  duongDan?: ReactNode
  meta?: ReactNode[]
}) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const router = useRouter()

  async function luu(fn: () => Promise<KQ>) {
    setBusy(true); setErr(null)
    const r = await fn()
    setBusy(false)
    if (!r.ok) setErr(r.error); else router.refresh()
  }

  const dangMo = state === 'Open'
  const tenKt = dsKt
    ? (ktHoSo ? dsKt.find((x) => x.id === ktHoSo)?.ten ?? '—' : null)
    : (ktId ? staff.find((s) => s.id === ktId)?.ten ?? '—' : null)
  const csId = dsCs && csTheoDoi ? dsCs.find((x) => x.ten === csTheoDoi)?.id ?? null : null

  return (
    <div className="space-y-3">
      {duongDan}
      <div role="group" aria-label="Trạng thái ticket" className="flex flex-wrap items-center gap-2">
        {choSua ? (
          <div className="w-fit">
            <NativeSelect aria-label="Trạng thái" size="sm" value={state} disabled={busy}
              onChange={(e) => luu(() => updateTicket(code, { state: e.target.value }))}>
              {TRANG_THAI.map((s) => <NativeSelectOption key={s.key} value={s.key}>{s.label}</NativeSelectOption>)}
            </NativeSelect>
          </div>
        ) : <Badge variant="soft" color={dangMo ? 'warning' : state === 'Done' ? 'success' : 'secondary'}>{nhanTT(state)}</Badge>}
        {dangMo && (choSua ? (
          <Button variant={khan ? 'destructive' : 'outline'} size="sm" aria-pressed={khan} disabled={busy}
            onClick={() => luu(() => updateTicket(code, { khan: !khan }))}>
            Khẩn
          </Button>
        ) : khan && <Badge variant="soft" color="danger">Khẩn</Badge>)}
      </div>

      <PageHeader tieuDe={`${code} · ${loai ?? 'Ticket'}`} meta={meta ?? [model, tinh].filter(Boolean)} />

      <div className="flex flex-wrap items-start gap-x-5 gap-y-2">
        {coCotMoi && (
          <div className="flex items-start gap-1.5 text-muted-foreground">
            <span className="py-1">CS theo dõi</span>
            {choCs && dsCs ? (
              <ChonNguoi loai="cs" ds={dsCs} dangGan={csId} disabled={busy}
                onChon={(id) => ganCsTheoDoi(code, id)} />
            ) : choCs ? (
              <NativeSelect size="sm" aria-label="Chọn CS theo dõi" value={csTheoDoi ?? ''} disabled={busy}
                onChange={(e) => luu(() => datCsTheoDoi(code, e.target.value || null))}>
                <NativeSelectOption value="">— Chưa gán —</NativeSelectOption>
                {CS_THEO_DOI.map((t) => <NativeSelectOption key={t} value={t}>{t}</NativeSelectOption>)}
              </NativeSelect>
            ) : <span className={`py-1 ${csTheoDoi ? 'text-foreground' : 'text-(--color-text-warning)'}`}>{csTheoDoi ?? 'chưa gán'}</span>}
          </div>
        )}

        {/* Một link "Sửa danh sách" cho cả hai ô (Hiệp 19/11/2026), đặt ở ô Kỹ thuật. */}
        <div className="flex items-start gap-1.5 text-muted-foreground">
          <span className="py-1">Kỹ thuật</span>
          {choSua && dsKt ? (
            <ChonNguoi loai="kt" ds={dsKt} dangGan={ktHoSo} disabled={busy} quanTri={quanTri}
              onChon={(id) => ganKyThuat(code, id)} />
          ) : choSua ? (
            <NativeSelect size="sm" aria-label="Chọn kỹ thuật" value={ktId ?? ''} disabled={busy}
              onChange={(e) => luu(() => updateTicket(code, { ky_thuat: e.target.value || null }))}>
              <NativeSelectOption value="">— Chưa gán —</NativeSelectOption>
              {staff.map((s) => <NativeSelectOption key={s.id} value={s.id}>{s.ten}</NativeSelectOption>)}
            </NativeSelect>
          ) : <span className={`py-1 ${tenKt ? 'text-foreground' : 'text-muted-foreground'}`}>{tenKt ?? 'chưa gán'}</span>}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {dangMo && ngayDau
          ? <span className="font-medium text-foreground">Mở {soNgayMo(ngayDau, homNay)} ngày</span>
          : <span className="font-medium text-foreground">{nhanTT(state)}</span>}
        {' · '}{soLan} lần lỗi
        {ngayCuoi && <> · lần cuối {ngayVNHienThi(ngayCuoi)}</>}
      </p>

      {err && <Alert color="danger"><AlertDescription>{err}</AlertDescription></Alert>}
    </div>
  )
}
