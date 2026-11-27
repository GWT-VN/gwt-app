'use client'

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { themLanLoi, suaLanLoi, xoaLanLoi } from '@/app/ticket/lan-loi-actions'
import type { LanLoi } from '@/lib/loi/lanLoi'
import { ngayCuaLan, ngayVNHienThi, ngayVNHomNay } from '@/lib/loi/ngayTicket'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

/** 'YYYY-MM-DD' (ngày khách báo) hoặc ISO (ngày tạo) → dd/mm/yyyy giờ VN. */
const ngayVN = (s: string | null) => (s ? ngayVNHienThi(/^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ngayCuaLan(null, s)) : '')

type LanBao = {
  lan: number
  ngay: string | null
  moTa: string | null
  xuLy: string | null
}

export function MucLanLoi({ id, lan, ngay, moTa, xuLy, children }: LanBao & { id: string; children?: ReactNode }) {
  return (
    <AccordionItem value={id}>
      <AccordionTrigger>
        <span className="flex min-w-0 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-2">
            Lần {lan}
            {ngay && <span className="font-normal text-muted-foreground tabular-nums">· khách báo {ngayVN(ngay)}</span>}
            <Badge variant="soft" color={xuLy ? 'success' : 'warning'}>{xuLy ? 'Đã xử lý' : 'Chờ xử lý'}</Badge>
          </span>
          {moTa && <span className="truncate font-normal text-muted-foreground">{moTa}</span>}
        </span>
      </AccordionTrigger>
      <AccordionContent>{children}</AccordionContent>
    </AccordionItem>
  )
}

export function NoiDungLanLoi({ moTa, xuLy }: Pick<LanBao, 'moTa' | 'xuLy'>) {
  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-2">
      <div className="min-w-0">
        <span className="text-muted-foreground">Khách báo</span>
        <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{moTa || '—'}</p>
      </div>
      <div className="min-w-0">
        <span className="text-muted-foreground">Xử lý</span>
        <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{xuLy || 'chưa có'}</p>
      </div>
    </div>
  )
}

/** Hai ô nhập cạnh nhau cho một cặp. */
export function O2Cot({ moTa, setMoTa, xuLy, setXuLy, batBuoc = true }: {
  moTa: string; setMoTa: (s: string) => void; xuLy: string; setXuLy: (s: string) => void; batBuoc?: boolean
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <label className="block">
        <span className="text-muted-foreground">Mô tả khách báo{batBuoc && ' *'}</span>
        <Textarea value={moTa} onChange={(e) => setMoTa(e.target.value)} rows={4}
          className="mt-1" />
      </label>
      <label className="block">
        <span className="text-muted-foreground">Tóm tắt xử lý</span>
        <Textarea value={xuLy} onChange={(e) => setXuLy(e.target.value)} rows={4}
          placeholder="Kỹ thuật đã làm gì, nguyên nhân, kết quả…"
          className="mt-1" />
      </label>
    </div>
  )
}

/** Ô chọn ngày khách báo (cho phép ngày lùi, chặn tương lai bằng `max`). */
export function ONgay({ ngay, setNgay, homNay }: { ngay: string; setNgay: (s: string) => void; homNay: string }) {
  return (
    <label className="flex flex-wrap items-center gap-2 text-muted-foreground">
      Ngày khách báo
      <Input type="date" value={ngay} max={homNay} min="2020-01-01" onChange={(e) => setNgay(e.target.value)} className="w-auto" />
    </label>
  )
}

export function FormCap({ dau, moTa0 = '', xuLy0 = '', ngay0 = '', homNay = ngayVNHomNay(), onLuu, onHuy }: {
  dau: string; moTa0?: string; xuLy0?: string; ngay0?: string; homNay?: string
  onLuu: (v: { mo_ta: string; xu_ly: string; ngay: string }) => Promise<{ ok: true } | { ok: false; error: string }>
  onHuy: () => void
}) {
  const [moTa, setMoTa] = useState(moTa0)
  const [xuLy, setXuLy] = useState(xuLy0)
  const [ngay, setNgay] = useState(ngay0)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  async function luu() {
    if (!moTa.trim()) { setErr('Nhập mô tả khách báo.'); return }
    setBusy(true); setErr(null)
    const r = await onLuu({ mo_ta: moTa, xu_ly: xuLy, ngay })
    setBusy(false)
    if (!r.ok) setErr(r.error)
  }
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="font-medium">{dau}</p>
        <ONgay ngay={ngay} setNgay={setNgay} homNay={homNay} />
      </div>
      <O2Cot moTa={moTa} setMoTa={setMoTa} xuLy={xuLy} setXuLy={setXuLy} />
      <div className="flex items-center gap-3">
        <Button onClick={luu} loading={busy}>Lưu</Button>
        <Button variant="outline" onClick={onHuy} disabled={busy}>Huỷ</Button>
      </div>
      {err && <Alert color="danger"><AlertDescription>{err}</AlertDescription></Alert>}
    </Card>
  )
}

/** Lần 1 do TicketEditor cung cấp. Lần 2+ vẫn lưu qua các action của ticket_lan_loi. */
export function LanLoiTiepTheo({ code, ds, choSua, lanKe, lanDau }: {
  code: string; ds: LanLoi[]; choSua: boolean; lanKe: number; lanDau?: ReactNode
}) {
  const [dangSua, setDangSua] = useState<string | null>(null)
  const [dangThem, setDangThem] = useState(false)
  const [canXoa, setCanXoa] = useState<LanLoi | null>(null)
  const [loiXoa, setLoiXoa] = useState<string | null>(null)
  const router = useRouter()
  // Mọi lần mở sẵn, xếp theo thời gian (Lần 1 → mới nhất): kỹ thuật đọc liền một mạch lịch sử, không phải bấm mở
  // từng lần. Key theo danh sách id → thêm/xoá lần thì Accordion dựng lại, lần mới cũng mở.
  const tatCa = ['lan-1', ...ds.map((l) => l.id)]

  function xong<T extends { ok: boolean }>(r: T): T {
    if (r.ok) {
      setDangSua(null)
      setDangThem(false)
      router.refresh()
    }
    return r
  }

  async function xoa() {
    if (!canXoa) return
    setLoiXoa(null)
    const r = await xoaLanLoi(canXoa.id, code)
    if (!r.ok) {
      setLoiXoa(r.error)
      throw new Error(r.error)
    }
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <Accordion key={tatCa.join()} type="multiple" defaultValue={tatCa}>
        {lanDau}
        {ds.map((l) => (
          <MucLanLoi key={l.id} id={l.id} lan={l.lan} ngay={ngayCuaLan(l.ngay, l.created_at)} moTa={l.mo_ta} xuLy={l.xu_ly}>
            {dangSua === l.id ? (
              <FormCap dau={`Sửa lần ${l.lan}`} moTa0={l.mo_ta} xuLy0={l.xu_ly ?? ''}
                ngay0={ngayCuaLan(l.ngay, l.created_at) ?? ''}
                onLuu={async (v) => xong(await suaLanLoi(l.id, code, v))} onHuy={() => setDangSua(null)} />
            ) : (
              <div className="space-y-3">
                <NoiDungLanLoi moTa={l.mo_ta} xuLy={l.xu_ly} />
                {choSua && (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" aria-label={`Sửa lần ${l.lan}`} onClick={() => setDangSua(l.id)}>Sửa</Button>
                    <Button size="sm" variant="ghost" aria-label={`Xoá lần ${l.lan}`} onClick={() => { setLoiXoa(null); setCanXoa(l) }}>Xoá</Button>
                  </div>
                )}
              </div>
            )}
          </MucLanLoi>
        ))}
      </Accordion>

      {choSua && (dangThem ? (
        <FormCap dau={`Lần ${lanKe} — khách báo lỗi tiếp`} ngay0={ngayVNHomNay()}
          onLuu={async (v) => xong(await themLanLoi(code, v))} onHuy={() => setDangThem(false)} />
      ) : (
        <Button size="sm" variant="outline" onClick={() => setDangThem(true)}>+ Thêm lần lỗi mới</Button>
      ))}

      <ConfirmDialog
        open={canXoa !== null}
        onOpenChange={(open) => { if (!open) setCanXoa(null) }}
        pha
        tieuDe={`Xoá lần ${canXoa?.lan}?`}
        moTa="Mô tả khách báo và tóm tắt xử lý của lần này sẽ bị xoá khỏi ticket."
        nutXacNhan="Xoá lần lỗi"
        loi={loiXoa}
        onXacNhan={xoa}
      />
    </div>
  )
}
