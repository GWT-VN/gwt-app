'use client'

import { useRef, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { isoNgay } from '@/bang/ngay'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox, ChoiceLabel } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-picker'
import { Field, FieldDescription, FieldError, FieldLabel, FieldLegend, FieldMeta, FieldSet } from '@/components/ui/field'
import { FileDrop, FileItem, FileList } from '@/components/ui/file-upload'
import {
  focusLoiDau,
  FormFooter,
  FormGrid,
  FormLayout,
  FormRequiredNote,
  FormSection,
} from '@/components/ui/form-layout'
import { OTien } from '@/components/ui/input-affix'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch, SwitchRow } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { kiemTep } from '@/lib/tep'

/** Loại việc (demo) — 4 mục ≤ 10 → Select (CHUAN-FILTER). */
const LOAI = [
  ['bao-duong', 'Bảo dưỡng'],
  ['sua-chua', 'Sửa chữa'],
  ['lap-dat', 'Lắp đặt'],
  ['khao-sat', 'Khảo sát'],
] as const

const MUC = [
  ['thap', 'Thấp'],
  ['thuong', 'Thường'],
  ['gap', 'Gấp'],
] as const

const KENH = [
  ['app', 'Trong app'],
  ['email', 'Email'],
  ['zalo', 'Zalo'],
] as const

const ACCEPT = 'image/*,.pdf,.xlsx,.docx'
const TOI_DA_MB = 10
const GHI_CHU_TOI_DA = 500
/** Giả lập máy chủ: lần lưu hợp lệ ĐẦU TIÊN báo lỗi (để thấy Alert), các lần sau lưu được. */
const CHO_LUU_MS = 1200

type Tep = { id: number; ten: string; kichThuoc: number; loi?: string }
type Truong = 'ten' | 'loai' | 'ngay'

/**
 * Form mẫu của khối (dữ liệu demo) — tái tạo form trong ds/nguon/components/FormLayout/preview.html. `p` = tiền tố id
 * (hai form cùng trang); `batDauLoi` = mở ở trạng thái "đã bấm Lưu khi còn trống" như form thứ hai của preview (không
 * cướp focus lúc mở); `dau` = giá trị ban đầu của Loại / Ngày hẹn (test dùng, khỏi mở pop trong jsdom).
 */
export function FormMau({
  p,
  batDauLoi = false,
  dau,
}: {
  p: string
  batDauLoi?: boolean
  dau?: { loai?: string; ngay?: string }
}) {
  const homNay = isoNgay(new Date())
  const [ten, setTen] = useState('')
  const [loai, setLoai] = useState(dau?.loai ?? '')
  const [ngay, setNgay] = useState<string | null>(dau?.ngay ?? null)
  const [tien, setTien] = useState<number | null>(null)
  const [muc, setMuc] = useState('thuong')
  const [bao, setBao] = useState({ app: true, email: false, zalo: false })
  const [ghiChu, setGhiChu] = useState('')
  const [tep, setTep] = useState<Tep[]>([])
  const [baoNgay, setBaoNgay] = useState(true)
  const [daGui, setDaGui] = useState(batDauLoi)
  /** Ô đã sửa rồi rời → hiện lỗi ô đó dù chưa bấm Lưu. */
  const [daRoi, setDaRoi] = useState<ReadonlySet<Truong>>(new Set())
  const daSua = useRef(new Set<Truong>())
  const [dangLuu, setDangLuu] = useState(false)
  const [loiMay, setLoiMay] = useState(false)
  const [daLuu, setDaLuu] = useState(false)
  const lanLuu = useRef(0)

  const loi: Record<Truong, string | null> = {
    ten: ten.trim() ? null : 'Nhập tiêu đề để người khác biết việc gì.',
    loai: loai ? null : 'Chọn một loại.',
    ngay: ngay && ngay >= homNay ? null : 'Chọn ngày hẹn từ hôm nay trở đi.',
  }
  const hien = (t: Truong) => (daGui || daRoi.has(t) ? loi[t] : null)
  const sua = (t: Truong) => {
    daSua.current.add(t)
    setDaLuu(false)
  }
  const roi = (t: Truong) => {
    if (daSua.current.has(t) && !daRoi.has(t)) setDaRoi(new Set(daRoi).add(t))
  }
  const huy = () => {
    setTen('')
    setLoai(dau?.loai ?? '')
    setNgay(dau?.ngay ?? null)
    setTien(null)
    setMuc('thuong')
    setBao({ app: true, email: false, zalo: false })
    setGhiChu('')
    setTep([])
    setBaoNgay(true)
    setDaGui(false)
    setDaRoi(new Set())
    daSua.current.clear()
    setLoiMay(false)
    setDaLuu(false)
  }

  const coLoi = Object.values(loi).some(Boolean)
  const trangThai = dangLuu
    ? 'Đang lưu…'
    : daGui && coLoi
      ? 'Còn trường bắt buộc chưa điền.'
      : daLuu
        ? 'Đã lưu (demo).'
        : 'Chưa lưu'

  const id = (s: string) => `${p}-${s}`
  const loiTen = hien('ten')
  const loiLoai = hien('loai')
  const loiNgay = hien('ngay')

  return (
    <FormLayout
      data-so="form"
      onSubmit={(e) => {
        e.preventDefault()
        const form = e.currentTarget
        // flushSync: lỗi render xong ngay → focusLoiDau thấy aria-invalid mới.
        flushSync(() => setDaGui(true))
        if (coLoi) return focusLoiDau(form)
        setLoiMay(false)
        setDangLuu(true)
        setTimeout(() => {
          setDangLuu(false)
          if (lanLuu.current++ === 0) setLoiMay(true)
          else setDaLuu(true)
        }, CHO_LUU_MS)
      }}
    >
      {loiMay && (
        <Alert color="danger">
          <AlertTitle>Chưa lưu được</AlertTitle>
          <AlertDescription>
            Máy chủ không phản hồi (lỗi giả của demo). Dữ liệu vẫn giữ nguyên — bấm Lưu để thử lại.
          </AlertDescription>
        </Alert>
      )}
      <FormSection data-so="khoi-1" tieuDe="Thông tin chung">
        <FormRequiredNote />
        <FormGrid data-so="luoi">
          <Field data-so="f-ten">
            <FieldLabel htmlFor={id('ten')} required>
              Tiêu đề
            </FieldLabel>
            <Input
              data-so="ten"
              id={id('ten')}
              placeholder="VD: Bảo dưỡng định kỳ"
              aria-required
              value={ten}
              onChange={(e) => {
                setTen(e.target.value)
                sua('ten')
              }}
              onBlur={() => roi('ten')}
              aria-invalid={!!loiTen || undefined}
              aria-describedby={loiTen ? id('ten-e') : undefined}
            />
            {loiTen && (
              <FieldError data-so="ten-loi" id={id('ten-e')}>
                {loiTen}
              </FieldError>
            )}
          </Field>
          <Field data-so="f-loai">
            <FieldLabel htmlFor={id('loai')} required>
              Loại
            </FieldLabel>
            <Select
              value={loai}
              onValueChange={(v) => {
                setLoai(v)
                sua('loai')
              }}
            >
              <SelectTrigger
                data-so="loai"
                id={id('loai')}
                aria-required
                aria-invalid={!!loiLoai || undefined}
                aria-describedby={loiLoai ? id('loai-e') : undefined}
                onBlur={() => roi('loai')}
              >
                <SelectValue placeholder="Chọn loại" />
              </SelectTrigger>
              <SelectContent>
                {LOAI.map(([gt, nhan]) => (
                  <SelectItem key={gt} value={gt}>
                    {nhan}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {loiLoai && <FieldError id={id('loai-e')}>{loiLoai}</FieldError>}
          </Field>
          <Field data-so="f-ngay">
            <FieldLabel htmlFor={id('ngay')} required>
              Ngày hẹn
            </FieldLabel>
            <DatePicker
              id={id('ngay')}
              value={ngay}
              onValueChange={(v) => {
                setNgay(v)
                sua('ngay')
              }}
              min={homNay}
              required
              aria-invalid={!!loiNgay}
              aria-describedby={id('ngay-m')}
              onBlur={() => roi('ngay')}
            />
            {loiNgay ? (
              <FieldError data-so="ngay-loi" id={id('ngay-m')}>
                {loiNgay}
              </FieldError>
            ) : (
              <FieldDescription data-so="ngay-goi-y" id={id('ngay-m')}>
                Không chọn được ngày đã qua.
              </FieldDescription>
            )}
          </Field>
          <Field data-so="f-tien">
            <FieldLabel htmlFor={id('tien')}>Chi phí dự kiến</FieldLabel>
            <OTien id={id('tien')} placeholder="0" value={tien} onValueChange={setTien} aria-describedby={id('tien-h')} />
            <FieldDescription id={id('tien-h')}>Gõ số, dấu chấm tự thêm.</FieldDescription>
          </Field>
          <RadioGroup asChild orientation="horizontal" value={muc} onValueChange={setMuc}>
            <FieldSet data-so="muc">
              <FieldLegend>Mức độ</FieldLegend>
              {MUC.map(([gt, nhan]) => (
                <ChoiceLabel key={gt}>
                  <RadioGroupItem value={gt} />
                  {nhan}
                </ChoiceLabel>
              ))}
            </FieldSet>
          </RadioGroup>
          <FieldSet data-so="bao" orientation="horizontal">
            <FieldLegend>Báo qua</FieldLegend>
            {KENH.map(([k, nhan]) => (
              <ChoiceLabel key={k}>
                <Checkbox checked={bao[k]} onCheckedChange={(c) => setBao({ ...bao, [k]: c === true })} />
                {nhan}
              </ChoiceLabel>
            ))}
          </FieldSet>
          <Field data-so="f-ghi-chu" data-span="full">
            <FieldLabel htmlFor={id('gc')}>Ghi chú</FieldLabel>
            <Textarea
              id={id('gc')}
              placeholder="Nội dung cần lưu ý…"
              maxLength={GHI_CHU_TOI_DA}
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              aria-describedby={id('gc-h')}
            />
            <FieldMeta dem={ghiChu.length} toiDa={GHI_CHU_TOI_DA}>
              <FieldDescription id={id('gc-h')}>Không ghi số điện thoại, mật khẩu.</FieldDescription>
            </FieldMeta>
          </Field>
          <Field data-so="f-tep" data-span="full">
            <FieldLabel id={id('tep-nhan')} htmlFor={id('tep')}>
              Đính kèm
            </FieldLabel>
            <div className="flex flex-col gap-2 border-none border-current">
              <FileDrop
                id={id('tep')}
                aria-labelledby={id('tep-nhan')}
                accept={ACCEPT}
                goiY={`Ảnh, PDF, Excel, Word · tối đa ${TOI_DA_MB} MB mỗi tệp`}
                onChonTep={(ds) =>
                  setTep((cu) => [
                    ...cu,
                    ...ds.map((t, i) => ({
                      id: Date.now() + i,
                      ten: t.name,
                      kichThuoc: t.size,
                      loi: kiemTep(t, { accept: ACCEPT, toiDaMB: TOI_DA_MB }) ?? undefined,
                    })),
                  ])
                }
              />
              <FileList>
                {tep.map((t) => (
                  <FileItem
                    key={t.id}
                    ten={t.ten}
                    kichThuoc={t.kichThuoc}
                    trangThai={t.loi ? 'loi' : 'xong'}
                    loi={t.loi}
                    onBo={() => setTep((cu) => cu.filter((x) => x.id !== t.id))}
                  />
                ))}
              </FileList>
            </div>
          </Field>
        </FormGrid>
      </FormSection>
      <FormSection data-so="khoi-2" tieuDe="Thông báo">
        <SwitchRow data-so="hang-bao" nhan="Báo người phụ trách ngay khi lưu" moTa="Tắt nếu chỉ lưu nháp.">
          <Switch checked={baoNgay} onCheckedChange={setBaoNgay} />
        </SwitchRow>
      </FormSection>
      <FormFooter data-so="chan" trangThai={trangThai}>
        <Button data-so="huy" variant="outline" disabled={dangLuu} onClick={huy}>
          Huỷ
        </Button>
        <Button data-so="luu" type="submit" loading={dangLuu}>
          Lưu
        </Button>
      </FormFooter>
    </FormLayout>
  )
}

/** Nhãn mục của preview (`.ds-nhan`, khung trình bày — không phải component): 12/16 500 muted, cách dưới 8. */
function Nhan({ children }: { children: ReactNode }) {
  return <p className="mb-2 border-none border-current text-[12px] leading-[16px] font-medium text-muted-foreground">{children}</p>
}

/**
 * Thẻ bọc form của preview (`.ui-card.ui-card-pad`: viền 1px border, bo radius-xl, nền card, đệm 16). DS chưa có
 * component Card → dựng tối thiểu tại khối, chỉ để trình bày.
 */
const the = 'rounded-(--radius-xl) border border-solid border-(--border) bg-(--card) p-4 text-(--card-foreground)'

/**
 * #form-layout — tái tạo ds/nguon/components/FormLayout/preview.html: khung rộng tối đa 880, hai mục cách 28. Mục 1
 * form trống; mục 2 mở ở trạng thái "đã bấm Lưu khi còn trống". Cả hai tương tác thật: kiểm khi bấm Lưu / rời ô đã sửa,
 * lưu lỗi → focus ô lỗi đầu; lần lưu hợp lệ đầu tiên giả lỗi máy chủ (Alert đầu form, giữ dữ liệu), lần sau lưu được.
 * Khổ ≤ 640 lưới 1 cột. Dữ liệu demo. `data-mau` + `data-so` = khoá so khớp (ds/so-khop/formlayout.json).
 */
export function KhoiFormLayout() {
  return (
    <section id="form-layout" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#form-layout">FormLayout</a>
      </h2>
      <div className="max-w-220 border-none border-current">
        <div data-mau="1" className="mb-7 border-none border-current">
          <Nhan>Form ghép từ component DS (trống)</Nhan>
          <div data-so="the" className={the}>
            <FormMau p="ds-fl1" />
          </div>
        </div>
        <div data-mau="2" className="mb-7 border-none border-current">
          <Nhan>Bấm Lưu khi còn trống: lỗi từng trường, focus về ô lỗi đầu tiên</Nhan>
          <div data-so="the" className={the}>
            <FormMau p="ds-fl2" batDauLoi />
          </div>
        </div>
      </div>
    </section>
  )
}
