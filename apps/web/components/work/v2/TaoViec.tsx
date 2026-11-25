'use client'

/**
 * Hộp "Tạo việc" v2 (canvas WorkTaoViec, CEO duyệt 23/11) — chỉ ghép component DS: Dialog + FormLayout/Field, Input,
 * Textarea, DateTimePicker (Hạn), Select (Ưu tiên, Team ≤ 10 — chữ trơn, không badge) / Combobox (Team > 10), người = mỗi
 * người một dòng [avatar tên … vai ▾ (DropdownMenu)][✕] + "+ Thêm người" (Popover + ComboboxPanel, gõ để tìm),
 * ConfirmDialog khi bỏ dở. CEO 25/11: bỏ chip pill 28 + badge trong ô chọn → mọi dòng cao 32 như ô nhập.
 *
 * Luật giữ từ FormTaoViec cũ: người đầu tiên thêm vào = Chính (owner), người sau = Làm cùng (doer); không chọn ai → gửi
 * `assignees` rỗng, RPC `work_tao_viec` tự gán người tạo làm Chính.
 * Bỏ so với canvas: "Nhắc" (taoViec chưa có tham số nhắc) và "Gắn thêm" khách/ticket/đơn (ganErp cần id việc → phải ghi
 * hai bước sau khi tạo, lỗi giữa chừng khó báo; gắn ở XemNhanh sau khi tạo).
 */
import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { useRouter } from 'next/navigation'
import { CaretDown, Plus, X } from '@phosphor-icons/react/ssr'
import type { MucChon } from '@/bang/OChonGoiY'
import { taoViec, type NenTang } from '@/app/work/actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, chuCaiDau } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox, ChoiceLabel } from '@/components/ui/checkbox'
import { Combobox, ComboboxPanel } from '@/components/ui/combobox'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle } from '@/components/ui/field'
import { FormGrid, FormLayout } from '@/components/ui/form-layout'
import { cat, dongNguoi, dsNguoi, nguoi, nutThem } from '@/components/ui/inline-edit-styles'
import { Input } from '@/components/ui/input'
import { menuContent } from '@/components/ui/menu-styles'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { thongBao } from '@/components/ui/sonner'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { hanLuu, UU, VAI, type Uu } from './chung'

type Nguoi = { staff_id: string; role: string }
type Nhap = { title: string; description: string; priority: Uu; due: string | null; team: string | null; nguoi: Nguoi[] }
const TRONG: Nhap = { title: '', description: '', priority: '3', due: null, team: null, nguoi: [] }
/** Radix Select không nhận value rỗng → mục "Không team" mang mã riêng. */
const KHONG_TEAM = 'khong'

const daGo = (f: Nhap) =>
  !!(f.title.trim() || f.description.trim() || f.due || f.team || f.nguoi.length || f.priority !== TRONG.priority)

export function TaoViec({
  nenTang,
  trigger,
  onXong,
}: {
  nenTang: NenTang
  /**
   * Nút mở hộp (bọc bằng DialogTrigger asChild). Bỏ trống = nút "Tạo việc" mặc định — trang server nên dùng mặc định:
   * nút dựng ở server rồi qua asChild bị sao chép làm React cảnh báo thiếu `key` cho mảng con.
   */
  trigger?: ReactNode
  onXong?: (kq: { id: number; ref: string }) => void
}) {
  const router = useRouter()
  const id = useId()
  const [mo, setMo] = useState(false)
  const [hoiBo, setHoiBo] = useState(false)
  const [f, setF] = useState<Nhap>(TRONG)
  const [tiep, setTiep] = useState(false)
  const [thieuTieuDe, setThieuTieuDe] = useState(false)
  const [loi, setLoi] = useState<string | null>(null)
  const [dangTao, setDangTao] = useState(false)
  const [moThem, setMoThem] = useState(false)
  const tieuDeRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  // Chặn đồng bộ lần gửi thứ hai (Enter liên tiếp trước khi React vẽ lại nút loading).
  const chan = useRef(false)

  const sua = (p: Partial<Nhap>) => setF((x) => ({ ...x, ...p }))
  const tenCua = (sid: string) => nenTang.nhan_su.find((s) => s.id === sid)?.ten ?? 'Nhân sự'
  // gt = email (duy nhất): ComboboxPanel in `gt` làm mã đầu dòng → không để lộ uuid.
  const chuaChon: MucChon[] = nenTang.nhan_su
    .filter((s) => !f.nguoi.some((n) => n.staff_id === s.id))
    .map((s) => ({ gt: s.email || s.id, nhan: s.ten }))

  function dong() {
    setMo(false)
    setF(TRONG)
    setLoi(null)
    setThieuTieuDe(false)
  }

  async function gui(e: FormEvent) {
    e.preventDefault()
    const title = f.title.trim()
    if (!title) {
      flushSync(() => setThieuTieuDe(true))
      tieuDeRef.current?.focus()
      return
    }
    if (chan.current) return
    chan.current = true
    setDangTao(true)
    setLoi(null)
    const kq = await taoViec({
      title,
      description: f.description.trim() || null,
      priority: Number(f.priority),
      due: f.due ? hanLuu(f.due) : null,
      team_id: f.team ? Number(f.team) : null,
      assignees: f.nguoi,
    })
    chan.current = false
    setDangTao(false)
    // Lỗi: hiện trong hộp, giữ nguyên mọi thứ đã gõ.
    if (!kq.ok) return setLoi(kq.loi)
    thongBao.xong(`Đã tạo ${kq.duLieu.ref}`)
    onXong?.(kq.duLieu)
    router.refresh()
    if (tiep) {
      setF(TRONG)
      tieuDeRef.current?.focus()
    } else dong()
  }

  const idLoiTieuDe = `${id}-loi-tieu-de`
  const idNguoi = `${id}-nguoi`
  const idGoiYNguoi = `${id}-goi-y-nguoi`
  const nhieuTeam = nenTang.teams.length > 10

  return (
    <>
      <Dialog
        open={mo}
        onOpenChange={(o) => {
          if (o) return setMo(true)
          // Esc / bấm nền / ✕ / Huỷ: đang gửi thì giữ hộp; đã gõ gì thì hỏi trước khi bỏ.
          if (dangTao) return
          if (daGo(f)) setHoiBo(true)
          else dong()
        }}
      >
        <DialogTrigger asChild>
          {trigger ?? (
            <Button>
              <Plus aria-hidden="true" />
              Tạo việc
            </Button>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Tạo việc</DialogTitle>
          <DialogBody>
            <FormLayout id={`${id}-form`} ref={formRef} onSubmit={gui} aria-label="Tạo việc">
              {loi && (
                <Alert color="danger">
                  <AlertDescription>Chưa tạo được việc — {loi}</AlertDescription>
                </Alert>
              )}
              <FieldGroup>
                <Field data-invalid={thieuTieuDe || undefined}>
                  <FieldLabel htmlFor={`${id}-tieu-de`} required>
                    Tiêu đề
                  </FieldLabel>
                  <Input
                    ref={tieuDeRef}
                    id={`${id}-tieu-de`}
                    data-autofocus
                    value={f.title}
                    onChange={(e) => {
                      sua({ title: e.target.value })
                      if (e.target.value.trim()) setThieuTieuDe(false)
                    }}
                    onKeyDown={(e) => {
                      // Enter = Tạo việc (nút gửi nằm ở chân hộp, ngoài form → tự gửi thay vì trông vào gửi ngầm).
                      if (e.key !== 'Enter' || e.nativeEvent.isComposing) return
                      e.preventDefault()
                      formRef.current?.requestSubmit()
                    }}
                    placeholder="VD: Gửi lịch bảo trì tháng 12 cho khách"
                    aria-required
                    aria-invalid={thieuTieuDe || undefined}
                    aria-describedby={thieuTieuDe ? idLoiTieuDe : undefined}
                  />
                  {thieuTieuDe && <FieldError id={idLoiTieuDe}>Nhập tiêu đề việc để tạo.</FieldError>}
                </Field>

                <Field>
                  <FieldLabel htmlFor={`${id}-mo-ta`}>Mô tả</FieldLabel>
                  <Textarea
                    id={`${id}-mo-ta`}
                    rows={2}
                    value={f.description}
                    onChange={(e) => sua({ description: e.target.value })}
                    placeholder="Đường dẫn, việc cần lưu ý… (không bắt buộc)"
                  />
                </Field>

                <Field aria-labelledby={idNguoi} aria-describedby={idGoiYNguoi}>
                  <FieldTitle id={idNguoi}>Người làm</FieldTitle>
                  <div className={dsNguoi}>
                    {f.nguoi.map((n) => {
                      const ten = tenCua(n.staff_id)
                      return (
                        <div key={n.staff_id} className={dongNguoi}>
                          <span data-slot="nguoi" className={nguoi}>
                            <Avatar aria-hidden="true">
                              <AvatarFallback>{chuCaiDau(ten)}</AvatarFallback>
                            </Avatar>
                            <span className={cat}>{ten}</span>
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="xs" aria-label={`Vai của ${ten}: ${VAI[n.role]} — đổi vai`}>
                                {VAI[n.role]}
                                <CaretDown aria-hidden="true" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuLabel>Vai của {ten}</DropdownMenuLabel>
                              <DropdownMenuRadioGroup
                                value={n.role}
                                onValueChange={(role) =>
                                  sua({ nguoi: f.nguoi.map((x) => (x.staff_id === n.staff_id ? { ...x, role } : x)) })
                                }
                              >
                                {Object.entries(VAI).map(([v, chu]) => (
                                  <DropdownMenuRadioItem key={v} value={v}>
                                    {chu}
                                  </DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label={`Bỏ ${ten}`}
                            onClick={() => sua({ nguoi: f.nguoi.filter((x) => x.staff_id !== n.staff_id) })}
                          >
                            <X aria-hidden="true" />
                          </Button>
                        </div>
                      )
                    })}
                    <Popover open={moThem} onOpenChange={setMoThem}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="xs" className={nutThem} disabled={!chuaChon.length}>
                          <Plus aria-hidden="true" />
                          Thêm người
                        </Button>
                      </PopoverTrigger>
                      {/* Khung pop y OSuaNguoi (inline-edit.tsx): danh sách nhân sự > 10 → gõ để tìm (CHUAN-FILTER). */}
                      <PopoverContent
                        aria-label="Chọn người làm"
                        className={cn(
                          menuContent,
                          'w-auto min-w-[240px] max-w-[calc(100vw-16px)] max-h-(--radix-popover-content-available-height)',
                        )}
                      >
                        <ComboboxPanel
                          value={null}
                          options={chuaChon}
                          searchPlaceholder="Gõ tên hoặc email…"
                          onSelect={(m) => {
                            const s = nenTang.nhan_su.find((x) => (x.email || x.id) === m.gt)
                            if (s)
                              sua({
                                nguoi: [...f.nguoi, { staff_id: s.id, role: f.nguoi.length ? 'doer' : 'owner' }],
                              })
                            setMoThem(false)
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FieldDescription id={idGoiYNguoi}>
                    Người đầu là người chính; không chọn ai → bạn làm chính.
                  </FieldDescription>
                </Field>

                <FormGrid>
                  <Field>
                    <FieldLabel htmlFor={`${id}-han`}>Hạn</FieldLabel>
                    <DateTimePicker
                      id={`${id}-han`}
                      value={f.due}
                      onValueChange={(due) => sua({ due })}
                      placeholder="Chưa có hạn"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`${id}-uu`}>Ưu tiên</FieldLabel>
                    <Select value={f.priority} onValueChange={(v) => sua({ priority: v as Uu })}>
                      <SelectTrigger id={`${id}-uu`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UU.map((u) => (
                          <SelectItem key={u.gt} value={u.gt}>
                            {u.chu}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field data-span="full">
                    <FieldLabel htmlFor={`${id}-team`}>Team</FieldLabel>
                    {nhieuTeam ? (
                      <Combobox
                        id={`${id}-team`}
                        value={f.team}
                        onValueChange={(team) => sua({ team })}
                        options={nenTang.teams.map((t) => ({ gt: String(t.id), nhan: t.name }))}
                        placeholder="Không team"
                        searchPlaceholder="Gõ tên team…"
                      />
                    ) : (
                      <Select
                        value={f.team ?? KHONG_TEAM}
                        onValueChange={(v) => sua({ team: v === KHONG_TEAM ? null : v })}
                      >
                        <SelectTrigger id={`${id}-team`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={KHONG_TEAM}>Không team</SelectItem>
                          {nenTang.teams.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </Field>
                </FormGrid>

                <ChoiceLabel>
                  <Checkbox checked={tiep} onCheckedChange={(c) => setTiep(c === true)} />
                  Tạo tiếp việc khác sau khi lưu
                </ChoiceLabel>
              </FieldGroup>
            </FormLayout>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={dangTao}>
                Huỷ
              </Button>
            </DialogClose>
            <Button type="submit" form={`${id}-form`} loading={dangTao}>
              Tạo việc
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={hoiBo}
        onOpenChange={setHoiBo}
        tieuDe="Bỏ việc đang soạn?"
        moTa="Tiêu đề, người làm và các mục đã chọn sẽ mất."
        nutXacNhan="Bỏ việc"
        nutHuy="Soạn tiếp"
        pha
        onXacNhan={() => {
          setHoiBo(false)
          dong()
        }}
      />
    </>
  )
}
