'use client'

/**
 * Nút + hộp SỬA sổ kho (Đợt 3 — 04/11/2026). Trang chỉ vẽ các component này khi người xem có quyền 'kho.so.sua'
 * (hỏi bằng coTheSuaKho() ở _gac.ts — cùng cặp với Server Action), người khác thấy trang như cũ.
 *
 * Danh mục mã (vài trăm mục) truyền MỘT lần qua <KhuSuaKho>, các nút trong từng dòng đọc qua context — không nhân bản theo dòng.
 */
import { createContext, useContext, useMemo, useState, useTransition, type ReactNode } from 'react'
import type { MucChon } from '@/bang'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Combobox } from '@/components/ui/combobox'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import type { MucDanhMuc } from '@/lib/kho/doc'
import { LOAI } from '@/lib/kho/nhan'
import { chuanTen, thayDoiSua } from '@/lib/kho/sua'
import { boQuaDongKho, duyetDongKho, huyDongKho, suaDongKho } from './actions'

const NgucCanh = createContext<MucChon[]>([])

export function KhuSuaKho({ danhMuc, children }: { danhMuc: MucDanhMuc[]; children: ReactNode }) {
  const ds = useMemo(() => danhMuc.map((d) => ({ gt: d.ma, nhan: d.ten ?? d.ma })), [danhMuc])
  return <NgucCanh.Provider value={ds}>{children}</NgucCanh.Provider>
}
const useDanhMuc = () => useContext(NgucCanh)


function Nhan({ ten, children, rong = false }: { ten: string; children: ReactNode; rong?: boolean }) {
  return <label className={`block space-y-1 ${rong ? 'sm:col-span-2' : ''}`}><span className="text-xs font-medium text-muted-foreground">{ten}</span>{children}</label>
}

function HopNoi({ tieuDe, phu, onDong, children }: { tieuDe: string; phu?: ReactNode; onDong: () => void; children: ReactNode }) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onDong() }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{tieuDe}</DialogTitle>
          {phu && <DialogDescription>{phu}</DialogDescription>}
        </DialogHeader>
        <DialogBody className="space-y-3">{children}</DialogBody>
      </DialogContent>
    </Dialog>
  )
}


export type DongSuaDuoc = {
  id: number; ngay: string; loai: string; internal_code: string | null; raw_name: string; qty: number
  purpose: string | null; note: string | null; trang_thai: string
}

/** Nút Sửa / Huỷ ở cuối mỗi dòng nhật ký. Dòng đã huỷ / bỏ qua (rejected): không vẽ gì. */
export function NutSuaDong({ dong }: { dong: DongSuaDuoc }) {
  const [mo, setMo] = useState<'sua' | 'huy' | null>(null)
  if (dong.trang_thai === 'rejected') return null
  return (
    <div className="flex gap-1">
      <Button type="button" onClick={() => setMo('sua')} variant="outline" size="sm">Sửa</Button>
      <Button type="button" onClick={() => setMo('huy')} variant="outline" size="sm" className="text-destructive">Huỷ</Button>
      {mo === 'sua' && <HopSua dong={dong} onDong={() => setMo(null)} />}
      {mo === 'huy' && <HopHuy dong={dong} onDong={() => setMo(null)} />}
    </div>
  )
}

function HopSua({ dong, onDong }: { dong: DongSuaDuoc; onDong: () => void }) {
  const danhMuc = useDanhMuc()
  const [f, setF] = useState({ ngay: dong.ngay, loai: dong.loai, internal_code: dong.internal_code ?? '', qty: String(dong.qty),
    purpose: dong.purpose ?? '', note: dong.note ?? '' })
  const [lyDo, setLyDo] = useState('')
  const [loi, setLoi] = useState<string | null>(null)
  const [dang, batDau] = useTransition()
  const doi = thayDoiSua(dong, f)
  const soDoi = Object.keys(doi).length
  const dat = (k: keyof typeof f) => (v: string) => setF((x) => ({ ...x, [k]: v }))

  function luu() {
    setLoi(null)
    if (!soDoi) { setLoi('Chưa đổi gì.'); return }
    batDau(async () => {
      const r = await suaDongKho(dong.id, doi, lyDo)
      if (!r.ok) setLoi(r.error)
      else onDong()
    })
  }

  return (
    <HopNoi tieuDe={`Sửa dòng sổ #${dong.id}`} onDong={onDong}
      phu={<>Tên trong tin: <b>{dong.raw_name}</b>{dong.trang_thai === 'need_review' && ' · đang chờ duyệt — chọn mã là duyệt luôn'}</>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Nhan ten="Ngày"><Input type="date" value={f.ngay} onChange={(e) => dat('ngay')(e.target.value)} /></Nhan>
        <Nhan ten="Loại">
          <NativeSelect className="w-full" value={f.loai} onChange={(e) => dat('loai')(e.target.value)}>
            {LOAI.map((x) => <NativeSelectOption key={x} value={x}>{x}</NativeSelectOption>)}
          </NativeSelect>
        </Nhan>
        {/* Combobox DS: pop portal ra ngoài hộp (DialogContent cuộn overflow-y-auto sẽ cắt danh sách thả tại chỗ). */}
        <Nhan ten="Mã hàng" rong><Combobox aria-label="Mã hàng" value={f.internal_code || null} onValueChange={(gt) => dat('internal_code')(gt ?? '')}
          options={danhMuc} placeholder="Chọn mã hàng…" searchPlaceholder="Gõ mã hoặc tên để tìm…" /></Nhan>
        <Nhan ten={f.loai === 'Điều chỉnh' ? 'Số lượng (âm = giảm tồn)' : 'Số lượng'}>
          <Input inputMode="decimal" value={f.qty} onChange={(e) => dat('qty')(e.target.value)} />
        </Nhan>
        <Nhan ten="Lý do / cho ai"><Input value={f.purpose} onChange={(e) => dat('purpose')(e.target.value)} /></Nhan>
        <Nhan ten="Ghi chú" rong><Input value={f.note} onChange={(e) => dat('note')(e.target.value)} /></Nhan>
        <Nhan ten="Lý do sửa (ghi vào lịch sử)" rong>
          <Input value={lyDo} onChange={(e) => setLyDo(e.target.value)} placeholder="vd: anh kỹ thuật nhắn nhầm SL" />
        </Nhan>
      </div>
      <p className="text-[11px] text-muted-foreground">Sửa xong dòng bị khoá: bot không ghi đè dù tin Discord gốc bị sửa. Sheet tự cập nhật trong ~20 giây.</p>
      {loi && <Alert color="danger"><AlertDescription>{loi}</AlertDescription></Alert>}
      <div className="flex items-center justify-end gap-2">
        <span className="mr-auto text-xs text-muted-foreground">{soDoi ? `Đổi ${soDoi} trường` : 'Chưa đổi gì'}</span>
        <Button type="button" onClick={onDong} variant="outline" size="sm">Thôi</Button>
        <Button type="button" onClick={luu} disabled={dang || !soDoi} size="sm">{dang ? 'Đang lưu…' : 'Lưu'}</Button>
      </div>
    </HopNoi>
  )
}

function HopHuy({ dong, onDong }: { dong: DongSuaDuoc; onDong: () => void }) {
  const [lyDo, setLyDo] = useState('')
  const [loi, setLoi] = useState<string | null>(null)

  async function huy() {
    setLoi(null)
    const r = await huyDongKho(dong.id, lyDo)
    if (!r.ok) {
      setLoi(r.error)
      throw new Error(r.error)
    }
  }

  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => { if (!open) onDong() }}
      tieuDe={`Huỷ dòng sổ #${dong.id}?`}
      moTa={<>{dong.loai} <b>{dong.qty}</b> · {dong.raw_name}{dong.internal_code ? ` · ${dong.internal_code}` : ''}</>}
      hauQua={['Dòng huỷ không tính vào tồn và vẫn xuất hiện trong nhật ký và Lịch sử sửa.']}
      nutXacNhan="Huỷ dòng"
      nutHuy="Quay lại"
      pha
      loi={loi}
      khoaXacNhan={!lyDo.trim()}
      onXacNhan={huy}
    >
      <Nhan ten="Lý do huỷ (bắt buộc)">
        <Input data-autofocus required value={lyDo} onChange={(e) => setLyDo(e.target.value)} placeholder="Ví dụ: ghi trùng với tin hôm trước" />
      </Nhan>
    </ConfirmDialog>
  )
}


/** Ô chọn mã + "Nhớ tên" + Duyệt / Bỏ qua cho một dòng chờ duyệt. */
export function DuyetDong({ id, rawName, goiY }: { id: number; rawName: string; goiY: string | null }) {
  const danhMuc = useDanhMuc()
  const [ma, setMa] = useState(goiY ?? '')
  const [nho, setNho] = useState(true)
  const [loi, setLoi] = useState<string | null>(null)
  const [dang, batDau] = useTransition()

  function duyet() {
    setLoi(null)
    if (!ma) { setLoi('Chưa chọn mã.'); return }
    batDau(async () => {
      const r = await duyetDongKho(id, ma, nho ? chuanTen(rawName) : undefined)
      if (!r.ok) setLoi(r.error)
    })
  }
  function boQua() {
    setLoi(null)
    const ly = window.prompt(`Bỏ qua dòng “${rawName}” (không phải hàng kho)?\nLý do (không bắt buộc):`, '')
    if (ly === null) return
    batDau(async () => {
      const r = await boQuaDongKho(id, ly)
      if (!r.ok) setLoi(r.error)
    })
  }

  return (
    <div className="min-w-[260px] space-y-1.5">
      <Combobox aria-label={`Mã hàng cho ${rawName}`} value={ma || null} onValueChange={(gt) => setMa(gt ?? '')} options={danhMuc}
        placeholder="Chọn mã hàng…" />
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1 text-xs text-muted-foreground" title={`Bot nhớ “${chuanTen(rawName)}” = mã này, lần sau tự nhận`}>
          <Checkbox checked={nho} onCheckedChange={(c) => setNho(c === true)} /> Nhớ tên này cho lần sau
        </label>
        <span className="ml-auto flex gap-1">
          <Button type="button" onClick={duyet} disabled={dang || !ma} size="sm">{dang ? '…' : 'Duyệt'}</Button>
          <Button type="button" onClick={boQua} disabled={dang} variant="outline" size="sm">Bỏ qua</Button>
        </span>
      </div>
      {loi && <p className="text-xs text-destructive">{loi}</p>}
    </div>
  )
}
