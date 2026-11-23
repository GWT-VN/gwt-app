'use client'

/**
 * Hộp "Sửa luật" của màn Việc tự sinh v2 — Dialog + FormLayout/Field, Select (ưu tiên, team ≤ 10) / Combobox
 * (team > 10), ô số có đơn vị (InputGroup). Bản nháp chỉ ghi khi bấm Lưu (chỉnh nhầm còn Huỷ được) — giữ luật của
 * LuatTuSinh cũ. Ô ngưỡng / cửa sổ chỉ hiện ở luật đọc trục thời gian đó (GIAI_THICH).
 */
import { useId, useRef, useState, type FormEvent } from 'react'
import { flushSync } from 'react-dom'
import { useRouter } from 'next/navigation'
import { suaLuat, type LuatTuSinh, type NenTang } from '@/app/work/actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { focusLoiDau, FormGrid, FormLayout } from '@/components/ui/form-layout'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { thongBao } from '@/components/ui/sonner'
import { UU, type Uu } from './chung'

/** Mỗi luật đọc sự kiện theo một trục thời gian khác nhau — nói rõ bằng tiếng Việt (chép từ LuatTuSinh cũ). */
const GIAI_THICH: Record<string, { nguong?: string; cuaSo?: string }> = {
  ticket_khong_nguoi: { nguong: 'Ticket phải mở quá bao nhiêu giờ mà chưa ai nhận.' },
  bao_tri_toi_han: { cuaSo: 'Nhìn lượt bảo trì tới hạn trong khoảng ± bao nhiêu ngày.' },
  bh_cho_kich_hoat: { cuaSo: 'Chỉ xét máy lắp trong bao nhiêu ngày gần đây (bỏ trống = mọi máy).' },
}

type TruongSo = 'han_ngay' | 'nguong_gio' | 'cua_so_ngay' | 'max_moi_lan'
/** [nhỏ nhất, lớn nhất, bắt buộc] — khớp min/max của ô số bản cũ. */
const GIOI_HAN: Record<TruongSo, [number, number, boolean]> = {
  han_ngay: [0, 365, true],
  nguong_gio: [0, 720, false],
  cua_so_ngay: [1, 365, false],
  max_moi_lan: [1, 200, true],
}

type Nhap = Record<TruongSo, string> & { priority: Uu; team_key: string | null }

const chu = (n: number | null) => (n == null ? '' : String(n))
const so = (s: string) => (s.trim() === '' ? null : Number(s))

function kiem(f: Nhap, co: Record<TruongSo, boolean>): Partial<Record<TruongSo, string>> {
  const loi: Partial<Record<TruongSo, string>> = {}
  for (const k of Object.keys(GIOI_HAN) as TruongSo[]) {
    if (!co[k]) continue
    const [nho, lon, buoc] = GIOI_HAN[k]
    const n = so(f[k])
    if (n === null) {
      if (buoc) loi[k] = 'Nhập một số.'
    } else if (!Number.isInteger(n) || n < nho || n > lon) loi[k] = `Nhập số nguyên từ ${nho} đến ${lon}.`
  }
  return loi
}

export function SuaLuat({ l, nenTang, onDong }: { l: LuatTuSinh; nenTang: NenTang; onDong: () => void }) {
  const router = useRouter()
  const id = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const [f, setF] = useState<Nhap>({
    priority: String(l.priority) as Uu,
    han_ngay: chu(l.han_ngay),
    nguong_gio: chu(l.nguong_gio),
    cua_so_ngay: chu(l.cua_so_ngay),
    max_moi_lan: chu(l.max_moi_lan),
    team_key: l.team_key,
  })
  const [loiO, setLoiO] = useState<Partial<Record<TruongSo, string>>>({})
  const [loi, setLoi] = useState<string | null>(null)
  const [dang, setDang] = useState(false)
  const gt = GIAI_THICH[l.key] ?? {}
  const co = { han_ngay: true, nguong_gio: !!gt.nguong, cua_so_ngay: !!gt.cuaSo, max_moi_lan: true }

  async function luu(e: FormEvent) {
    e.preventDefault()
    if (dang) return
    const moi = kiem(f, co)
    if (Object.keys(moi).length) {
      flushSync(() => setLoiO(moi))
      if (formRef.current) focusLoiDau(formRef.current)
      return
    }
    setLoiO({})
    setDang(true)
    setLoi(null)
    const kq = await suaLuat(l.key, {
      priority: Number(f.priority),
      han_ngay: so(f.han_ngay),
      max_moi_lan: so(f.max_moi_lan),
      nguong_gio: co.nguong_gio ? so(f.nguong_gio) : l.nguong_gio,
      cua_so_ngay: co.cua_so_ngay ? so(f.cua_so_ngay) : l.cua_so_ngay,
      team_key: f.team_key,
    })
    setDang(false)
    if (!kq.ok) return setLoi(kq.loi)
    thongBao.xong(`${l.name}: đã lưu luật`)
    router.refresh()
    onDong()
  }

  /** Ô số có đơn vị + nhãn / mô tả / lỗi. */
  const oSo = (k: TruongSo, nhan: string, donVi: string, moTa?: string) => {
    const idO = `${id}-${k}`
    const idMoTa = moTa ? `${idO}-mo-ta` : undefined
    const idLoi = loiO[k] ? `${idO}-loi` : undefined
    return (
      <Field data-invalid={!!loiO[k] || undefined}>
        <FieldLabel htmlFor={idO} required={GIOI_HAN[k][2]}>
          {nhan}
        </FieldLabel>
        <InputGroup>
          <InputGroupInput
            id={idO}
            inputMode="numeric"
            value={f[k]}
            onChange={(e) => setF((x) => ({ ...x, [k]: e.target.value }))}
            aria-required={GIOI_HAN[k][2] || undefined}
            aria-invalid={!!loiO[k] || undefined}
            aria-describedby={[idLoi, idMoTa].filter(Boolean).join(' ') || undefined}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupText>{donVi}</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        {loiO[k] && <FieldError id={idLoi}>{loiO[k]}</FieldError>}
        {moTa && <FieldDescription id={idMoTa}>{moTa}</FieldDescription>}
      </Field>
    )
  }

  const nhieuTeam = nenTang.teams.length > 10

  return (
    <Dialog open onOpenChange={(o) => !o && !dang && onDong()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sửa luật “{l.name}”</DialogTitle>
          <DialogDescription>Chỉ áp cho việc sinh từ lượt quét sau; việc đã sinh giữ nguyên.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <FormLayout id={`${id}-form`} ref={formRef} onSubmit={luu} aria-label={`Sửa luật ${l.name}`}>
            {loi && (
              <Alert color="danger">
                <AlertDescription>Chưa lưu được luật — {loi}</AlertDescription>
              </Alert>
            )}
            <FieldGroup>
              <FormGrid>
                <Field>
                  <FieldLabel htmlFor={`${id}-uu`}>Ưu tiên việc sinh ra</FieldLabel>
                  <Select value={f.priority} onValueChange={(v) => setF((x) => ({ ...x, priority: v as Uu }))}>
                    <SelectTrigger id={`${id}-uu`} data-autofocus>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UU.map((u) => (
                        <SelectItem key={u.gt} value={u.gt} textValue={u.chu}>
                          {u.nhan}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${id}-team`}>Việc thuộc team</FieldLabel>
                  {nhieuTeam ? (
                    <Combobox
                      id={`${id}-team`}
                      value={f.team_key}
                      onValueChange={(team_key) => setF((x) => ({ ...x, team_key }))}
                      options={nenTang.teams.map((t) => ({ gt: t.key, nhan: t.name }))}
                      placeholder="Chưa chọn team"
                      searchPlaceholder="Gõ tên team…"
                    />
                  ) : (
                    <Select
                      value={f.team_key ?? undefined}
                      onValueChange={(team_key) => setF((x) => ({ ...x, team_key }))}
                    >
                      <SelectTrigger id={`${id}-team`}>
                        <SelectValue placeholder="Chưa chọn team" />
                      </SelectTrigger>
                      <SelectContent>
                        {nenTang.teams.map((t) => (
                          <SelectItem key={t.key} value={t.key}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </Field>
                {oSo('han_ngay', 'Hạn = hôm nay +', 'ngày')}
                {oSo(
                  'max_moi_lan',
                  'Tối đa mỗi lượt',
                  'việc',
                  'Chặn đổ hàng chục việc lên đầu một người khi chạy lần đầu; phần còn lại lượt sau lấy tiếp.',
                )}
                {gt.nguong && oSo('nguong_gio', 'Ngưỡng', 'giờ', gt.nguong)}
                {gt.cuaSo && oSo('cua_so_ngay', 'Cửa sổ', 'ngày', gt.cuaSo)}
              </FormGrid>
            </FieldGroup>
          </FormLayout>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={dang}>
              Huỷ
            </Button>
          </DialogClose>
          <Button type="submit" form={`${id}-form`} loading={dang}>
            Lưu luật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
