'use client'

import { ChonLoaiTicket } from '@/components/ticket/ChonLoaiTicket'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox, ChoiceLabel } from '@/components/ui/checkbox'
import { Field, FieldDescription, FieldLabel, FieldSet, FieldLegend } from '@/components/ui/field'
import { FormFooter, FormGrid, FormLayout, FormRequiredNote, FormSection } from '@/components/ui/form-layout'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { useId, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createTicket, machinesOfCustomer, type Machine } from '@/app/actions'
import { ganKyThuat } from '@/app/ticket/nguoi-actions'
import type { NguoiDs } from '@/lib/loi/nguoiTicket'
import type { Staff } from '@/lib/nen-tang/nhan-su-luat'
import { KhachPicker } from '@/components/KhachPicker'
import { KhachMayTraCuu } from '@/components/loi/KhachMayTraCuu'
import { DongMayNhap } from '@/components/loi/DongMayNhap'
import { dongDuDieuKien, duongDanSauTao, dongLechKhach } from '@/lib/loi/traCuuForm'
import { chuanHoaSerial } from '@/lib/loi/serial'
import type { DongMayInput, KetQuaTraSerial, LoiDanhMuc } from '@/lib/loi/kieu'

const HOM_NAY = () => new Date().toISOString().slice(0, 10)
const STATES = [{ k: 'Open', l: 'Đang mở' }, { k: 'Done', l: 'Đã xong' }, { k: 'Cancel', l: 'Đã huỷ' }]

/** Form tạo ticket đầy đủ: khách -> máy của khách + ngày/trạng thái/khẩn/ghi chú/người xử lý. */
export function TaoTicketForm({ loaiList, staff, meId, dsLoi, dsKt = null }: {
  loaiList: string[]; staff: Staff[]; meId?: string; dsLoi: LoiDanhMuc[]
  // Hồ sơ thợ (18/11): có → Kỹ thuật chọn theo thợ (gồm CTV); null → theo tài khoản nhân viên như cũ.
  dsKt?: NguoiDs[] | null
}) {
  const [khachId, setKhachId] = useState('')
  const [may, setMay] = useState<Machine[] | null>(null)   // null = chưa chọn khách
  const [dangTaiMay, setDangTaiMay] = useState(false)
  const [dong, setDong] = useState<DongMayInput[]>([{}])
  const [ketQua, setKetQua] = useState<Record<string, KetQuaTraSerial>>({})   // theo serial đã chuẩn hoá
  const [khachNhan, setKhachNhan] = useState<string | null>(null)   // tên khách chọn từ tra nhanh
  const [loai, setLoai] = useState('')
  const [moTa, setMoTa] = useState('')
  const [ngay, setNgay] = useState(HOM_NAY())
  const [state, setState] = useState('Open')
  const [khan, setKhan] = useState(false)
  const [note, setNote] = useState('')
  const [cs, setCs] = useState(meId ?? '')   // mặc định người tạo; bỏ trống server vẫn auto gán mình
  const [kt, setKt] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const router = useRouter()
  const id = useId()

  async function chonKhach(id: string) {
    setKhachId(id); setMay(null); setDangTaiMay(true)
    const ds = await machinesOfCustomer(id)
    setMay(ds); setDangTaiMay(false)
  }

  function datSerialDong1(serial: string) {
    setDong((d) => d.map((x, i) => (i === 0 ? { ...x, serial } : x)))
  }

  async function chonTuTraNhanh(m: { customer_id: string; serial: string }, nhan?: string) {
    setKhachNhan(nhan ?? null)
    if (m.serial) datSerialDong1(m.serial)
    await chonKhach(m.customer_id)
  }

  const lechKhach = dongLechKhach(dong, ketQua, khachId)

  async function luu() {
    setBusy(true); setErr(null)
    const r = await createTicket({
      customer_id: khachId || undefined,
      // Serial do server giải từ dòng máy (có trong installed_base mới ghi vào tickets.serial).
      dong_may: dong.filter((d) => chuanHoaSerial(d.serial ?? '') || d.mo_ta?.trim())
        .map((d) => ({ ...d, serial: chuanHoaSerial(d.serial ?? '') || undefined, mo_ta: d.mo_ta?.trim() || undefined })),
      ticket_type: loai.trim(),
      description: moTa.trim(),
      created_at: ngay,
      state, khan,
      last_note: note.trim() || undefined,
      cs_phu_trach: cs || null,
      ky_thuat: dsKt ? null : kt || null,
    })
    if (!r.ok) { setBusy(false); setErr(r.error); return }
    // Kỹ thuật theo hồ sơ thợ: gán sau khi tạo (ghi kt_ho_so + tài khoản của thợ nếu có). Lỗi thì vẫn sang trang
    // ticket — ô Kỹ thuật ở đó hiện "chưa gán", chọn lại được; không để form gửi lại sinh ticket trùng.
    if (dsKt && kt) await ganKyThuat(r.code, kt)
    // Ticket đã tồn tại: luôn sang trang ticket (không để form gửi lại → trùng ticket); busy giữ nguyên.
    router.push(duongDanSauTao(r.code, 'canhBao' in r ? r.canhBao : undefined))
  }

  const chuaDuDieuKien = !khachId || !loai.trim() || !moTa.trim()
    || !dongDuDieuKien(dong, Object.fromEntries(Object.entries(ketQua).map(([k, v]) => [k, v.loai])))

  return (
    <FormLayout onSubmit={(e) => e.preventDefault()}>
      {err && <Alert color="danger"><AlertDescription>{err}</AlertDescription></Alert>}
      <FormSection tieuDe="Khách hàng và máy">
        <FormRequiredNote />
        <FieldSet>
          <FieldLegend>Tra nhanh theo tên/SĐT khách</FieldLegend>
          <KhachMayTraCuu onChonMay={(m) => chonTuTraNhanh(m)} />
        </FieldSet>
        <FieldSet>
          <FieldLegend required>Khách hàng</FieldLegend>
          <KhachPicker onPick={(id) => { setKhachNhan(null); chonKhach(id) }} />
          {khachNhan && <FieldDescription>Đã chọn từ tra nhanh: {khachNhan}</FieldDescription>}
        </FieldSet>
        <FieldSet>
          <FieldLegend>Máy báo lỗi (serial)</FieldLegend>
          <FieldDescription>Chưa có serial thì bỏ trống — thợ kiểm tra xong, vào ticket bấm <strong>Sửa dòng</strong> ở Máy &amp; lỗi để bổ sung.</FieldDescription>
          {may !== null && may.length === 0 && (
            <Alert color="warning">
              <AlertDescription>
                Khách này <strong>chưa có máy nào được kích hoạt</strong>. Vẫn lưu được với serial chưa đăng ký; hoặc{' '}
                <Link href="/dang-ky-bh" className="font-medium underline">Đăng ký bảo hành</Link>{' '}cho máy.
              </AlertDescription>
            </Alert>
          )}
          {may !== null && may.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {may.map((m) => (
                <Button key={m.serial} size="sm" variant="outline" onClick={() => datSerialDong1(m.serial)}>
                  {m.product_name ?? m.internal_code} · {m.serial}{m.warranty_activated ? '' : ' (chưa kích hoạt)'}
                </Button>
              ))}
            </div>
          )}
          {lechKhach.map((l) => (
            <Alert key={l.serial} color="warning">
              <AlertDescription>
                Serial <span className="font-mono">{l.serial}</span> đang gắn với khách <strong>{l.khach}</strong>, không phải khách đã chọn. Kiểm tra lại trước khi tạo.
              </AlertDescription>
            </Alert>
          ))}
          {dangTaiMay && <FieldDescription role="status">Đang tải máy của khách…</FieldDescription>}
          <DongMayNhap dong={dong} onChange={setDong} dsLoi={dsLoi}
            onKetQua={(_, k) => { if (k) setKetQua((o) => ({ ...o, [k.serial]: k })) }} />
        </FieldSet>
      </FormSection>

      <FormSection tieuDe="Thông tin ticket">
        <FormGrid>
          <Field>
            <FieldLabel htmlFor={`${id}-loai`} required>Loại ticket</FieldLabel>
            <ChonLoaiTicket id={`${id}-loai`} required value={loai} onChange={setLoai} loaiList={loaiList} />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-ngay`}>Ngày tạo</FieldLabel>
            <Input id={`${id}-ngay`} type="date" value={ngay} max={HOM_NAY()} onChange={(e) => setNgay(e.target.value)} />
          </Field>
          <Field data-span="full">
            <FieldLabel htmlFor={`${id}-mo-ta`} required>Mô tả sự cố</FieldLabel>
            <Textarea id={`${id}-mo-ta`} required value={moTa} onChange={(e) => setMoTa(e.target.value)} rows={3}
              placeholder="Khách báo lỗi gì…" />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-trang-thai`}>Trạng thái</FieldLabel>
            <NativeSelect id={`${id}-trang-thai`} value={state} onChange={(e) => setState(e.target.value)}>
              {STATES.map((s) => <NativeSelectOption key={s.k} value={s.k}>{s.l}</NativeSelectOption>)}
            </NativeSelect>
          </Field>
          <ChoiceLabel nhan="Khẩn" className="self-end pb-1.5">
            <Checkbox checked={khan} onCheckedChange={(value) => setKhan(value === true)} />
          </ChoiceLabel>
        </FormGrid>
      </FormSection>

      <FormSection tieuDe="Phân công và xử lý">
        <FormGrid>
          <Field>
            <FieldLabel htmlFor={`${id}-cs`}>CS phụ trách</FieldLabel>
            <NativeSelect id={`${id}-cs`} value={cs} onChange={(e) => setCs(e.target.value)}>
              <NativeSelectOption value="">— Chưa gán —</NativeSelectOption>
              {staff.map((s) => <NativeSelectOption key={s.id} value={s.id}>{s.ten}</NativeSelectOption>)}
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-kt`}>Kỹ thuật phụ trách</FieldLabel>
            <NativeSelect id={`${id}-kt`} value={kt} onChange={(e) => setKt(e.target.value)}
              aria-describedby={dsKt ? `${id}-kt-mo-ta` : undefined}>
              <NativeSelectOption value="">— Chưa gán —</NativeSelectOption>
              {dsKt
                ? dsKt.filter((x) => x.hoat_dong).map((x) => <NativeSelectOption key={x.id} value={x.id}>{x.ten}{x.la_ctv ? ' (CTV)' : ''}</NativeSelectOption>)
                : staff.map((s) => <NativeSelectOption key={s.id} value={s.id}>{s.ten}</NativeSelectOption>)}
            </NativeSelect>
            {dsKt && <FieldDescription id={`${id}-kt-mo-ta`}>Thiếu thợ? Thêm ở ô Kỹ thuật trên trang ticket sau khi tạo.</FieldDescription>}
          </Field>
          <Field data-span="full">
            <FieldLabel htmlFor={`${id}-ghi-chu`}>Ghi chú xử lý (tuỳ chọn)</FieldLabel>
            <Textarea id={`${id}-ghi-chu`} value={note} onChange={(e) => setNote(e.target.value)} rows={2}
              placeholder="Đã xử lý gì, kết quả…" />
          </Field>
        </FormGrid>
      </FormSection>

      <FormFooter trangThai={busy ? 'Đang tạo…' : undefined}>
        <Button onClick={luu} loading={busy} disabled={busy || chuaDuDieuKien}>
          Tạo ticket
        </Button>
      </FormFooter>
    </FormLayout>
  )
}
