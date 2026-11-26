'use client'

import { useId, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { taoNhomLoi, suaNhomLoi, xoaNhomLoi, type MucDo, type NhomLoiChiTiet } from '@/app/actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { FormFooter, FormGrid, FormLayout, FormRequiredNote, FormSection } from '@/components/ui/form-layout'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'

const MUC_DO: { v: MucDo; nhan: string }[] = [
  { v: 'an_toan', nhan: 'Rủi ro an toàn' },
  { v: 'nghiem_trong', nhan: 'Nghiêm trọng' },
  { v: 'thuong', nhan: 'Thường' },
  { v: 'nhe', nhan: 'Nhẹ' },
  { v: 'khong_loi', nhan: 'Không lỗi (dịch vụ)' },
]

export function NhomLoiForm({
  nhom, goiYMau, goiYTen, goiYTickets,
}: {
  nhom?: NhomLoiChiTiet
  goiYMau?: string
  goiYTen?: string
  goiYTickets?: string[]
}) {
  const router = useRouter()
  const id = useId()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [xacNhanXoa, setXacNhanXoa] = useState(false)
  const [loiXoa, setLoiXoa] = useState<string | null>(null)

  async function luu(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const duLieu = new FormData(event.currentTarget)
    const input = {
      ten: String(duLieu.get('ten') ?? ''),
      muc_do: duLieu.get('muc_do') as MucDo,
      bao_hang: duLieu.has('bao_hang'),
      mau_mo_ta: String(duLieu.get('mau_mo_ta') ?? ''),
      mau_may: String(duLieu.get('mau_may') ?? '') || undefined,
      mo_ta: String(duLieu.get('mo_ta') ?? '') || undefined,
      thu_tu: Number(duLieu.get('thu_tu')) || 100,
    }
    setBusy(true)
    setErr(null)
    try {
      const r = nhom
        ? await suaNhomLoi(nhom.code, input)
        : await taoNhomLoi({ code: String(duLieu.get('code') ?? ''), ...input })
      if (!r.ok) {
        setErr(r.error)
        return
      }
      router.push(`/nhom-loi/${'code' in r ? r.code : nhom?.code}`)
      router.refresh()
    } catch {
      setErr('Không lưu được nhóm lỗi. Hãy thử lại.')
    } finally {
      setBusy(false)
    }
  }

  async function xoa() {
    if (!nhom) return
    setLoiXoa(null)
    const r = await xoaNhomLoi(nhom.code)
    if (!r.ok) {
      setLoiXoa(r.error)
      throw new Error(r.error)
    }
    router.push('/nhom-loi')
    router.refresh()
  }

  return (
    <FormLayout noValidate={false} onSubmit={luu} aria-busy={busy}>
      {err && <Alert color="danger"><AlertDescription>{err}</AlertDescription></Alert>}
      {!nhom && !!goiYTickets?.length && (
        <Alert color="info">
          <AlertDescription>
            Gợi ý từ {goiYTickets.length} ticket cùng triệu chứng. Mẫu và tên đã được điền sẵn.
          </AlertDescription>
        </Alert>
      )}
      <FormSection tieuDe={nhom ? `Sửa nhóm ${nhom.code}` : 'Thông tin nhóm'}>
        <FormRequiredNote />
        <FormGrid>
          <Field>
            <FieldLabel htmlFor={`${id}-code`} required={!nhom}>Mã nhóm{nhom && ' (không đổi)'}</FieldLabel>
            <Input id={`${id}-code`} name="code" defaultValue={nhom?.code} disabled={!!nhom} required={!nhom}
              placeholder="VD: RO-RI-CHUNG" className="font-mono uppercase" />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-thu-tu`}>Thứ tự đọc (nhỏ = ưu tiên)</FieldLabel>
            <Input id={`${id}-thu-tu`} name="thu_tu" defaultValue={nhom?.thu_tu ?? 100} inputMode="numeric" />
          </Field>
          <Field data-span="full">
            <FieldLabel htmlFor={`${id}-ten`} required>Tên nhóm</FieldLabel>
            <Input id={`${id}-ten`} name="ten" defaultValue={nhom?.ten ?? goiYTen}
              placeholder="VD: Rò rỉ nước (máy khác CTS10)" required />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-muc-do`}>Mức độ</FieldLabel>
            <NativeSelect id={`${id}-muc-do`} name="muc_do" defaultValue={nhom?.muc_do ?? 'thuong'}>
              {MUC_DO.map((m) => <NativeSelectOption key={m.v} value={m.v}>{m.nhan}</NativeSelectOption>)}
            </NativeSelect>
          </Field>
          <Field orientation="horizontal" className="sm:self-end sm:mb-1.5">
            <Checkbox id={`${id}-bao-hang`} name="bao_hang" defaultChecked={nhom?.bao_hang} />
            <FieldLabel htmlFor={`${id}-bao-hang`}>Gửi báo cáo hãng (công ty mẹ)</FieldLabel>
          </Field>
          <Field data-span="full">
            <FieldLabel htmlFor={`${id}-mau-mo-ta`} required>Mẫu mô tả (regex)</FieldLabel>
            <Textarea id={`${id}-mau-mo-ta`} name="mau_mo_ta" defaultValue={nhom?.mau_mo_ta ?? goiYMau}
              rows={2} placeholder="rò rỉ|rò nước|chảy nước" required className="font-mono"
              aria-describedby={`${id}-mau-mo-ta-help`} />
            <FieldDescription id={`${id}-mau-mo-ta-help`}>
              Dùng dấu <code>|</code> để phân cách từ khoá. Ticket có mô tả chứa một trong các từ sẽ tự vào nhóm,
              không phân biệt hoa thường.
            </FieldDescription>
          </Field>
          <Field data-span="full">
            <FieldLabel htmlFor={`${id}-mau-may`}>Mẫu model (regex)</FieldLabel>
            <Input id={`${id}-mau-may`} name="mau_may" defaultValue={nhom?.mau_may ?? ''}
              placeholder="VD: CTD50|CTS10" className="font-mono" aria-describedby={`${id}-mau-may-help`} />
            <FieldDescription id={`${id}-mau-may-help`}>Nếu điền, hệ thống chỉ gom khi máy khớp model.</FieldDescription>
          </Field>
          <Field data-span="full">
            <FieldLabel htmlFor={`${id}-mo-ta`}>Mô tả nhóm</FieldLabel>
            <Input id={`${id}-mo-ta`} name="mo_ta" defaultValue={nhom?.mo_ta ?? ''} />
          </Field>
        </FormGrid>
      </FormSection>
      <FormFooter>
        {nhom && (
          <Button type="button" variant="outline" disabled={busy} onClick={() => {
            setLoiXoa(null)
            setXacNhanXoa(true)
          }}>
            Xoá nhóm
          </Button>
        )}
        <Button type="submit" loading={busy}>
          {busy ? 'Đang lưu…' : nhom ? 'Lưu thay đổi' : 'Tạo nhóm'}
        </Button>
      </FormFooter>
      {nhom && (
        <ConfirmDialog
          open={xacNhanXoa}
          onOpenChange={setXacNhanXoa}
          tieuDe={`Xoá nhóm “${nhom.ten}”?`}
          moTa="Các gán tay của nhóm cũng bị xoá theo."
          nutXacNhan="Xoá nhóm"
          pha
          loi={loiXoa}
          onXacNhan={xoa}
        />
      )}
    </FormLayout>
  )
}