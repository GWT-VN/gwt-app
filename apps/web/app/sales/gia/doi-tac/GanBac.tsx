'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { FieldLabel } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

import { Table, TableWrap, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import type { MucChon } from '@/bang'
import { ganBac, goBac, timKhachChoBac, type DoiTac, type LichSuBac } from '../actions'
import type { Bac } from '../../_ctkm'

const NHAN_BAC: Record<Bac, string> = {
  NPP: 'Cấp 1 · NPP',
  DAI_LY: 'Cấp 2 · Đại lý',
  GIOI_THIEU: 'Cấp 3 · Giới thiệu',
}

function homNay(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function GanBac({
  ds, lichSu, coQuyenSoan,
}: { ds: DoiTac[]; lichSu: LichSuBac[]; coQuyenSoan: boolean }) {
  const router = useRouter()
  const [dangChay, batDau] = useTransition()
  const [loi, setLoi] = useState<string | null>(null)
  const [goiY, setGoiY] = useState<MucChon[]>([])
  // Giữ CẢ mã và tên: CEO chốt 22/08 — chọn xong phải thấy TÊN khách, không ai nhớ mã.
  const [chon, setChon] = useState<{ ma: string; ten: string } | null>(null)
  const [bac, setBac] = useState<Bac>('DAI_LY')
  const [tuNgay, setTuNgay] = useState(homNay())
  const [ghiChu, setGhiChu] = useState('')
  const [xemLichSu, setXemLichSu] = useState(false)

  function chay(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setLoi(null)
    batDau(async () => {
      const r = await fn()
      if (!r.ok) setLoi(r.error ?? 'Không thực hiện được.')
      else { setChon(null); setGhiChu(''); setTuNgay(homNay()); router.refresh() }
    })
  }

  return (
    <div className="space-y-4">
      {loi && <Alert color="danger"><AlertDescription>{loi}</AlertDescription></Alert>}

      {coQuyenSoan && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Gán bậc cho đối tác</h2>
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto_2fr_auto] sm:items-end">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Khách hàng</label>
              <TimKhach
                chon={chon}
                onChon={(m) => setChon(m)}
                goiY={goiY}
                onTim={(q) => batDau(async () => setGoiY(await timKhachChoBac(q)))}
              />
            </div>
            <div>
              <FieldLabel htmlFor="gan-bac" className="mb-1">Bậc</FieldLabel>
              <NativeSelect id="gan-bac" value={bac} onChange={(e) => setBac(e.target.value as Bac)}>
                {(Object.keys(NHAN_BAC) as Bac[]).map((b) => <NativeSelectOption key={b} value={b}>{NHAN_BAC[b]}</NativeSelectOption>)}
              </NativeSelect>
            </div>
            <div>
              <FieldLabel htmlFor="gan-bac-ngay" className="mb-1">Hiệu lực từ</FieldLabel>
              <Input id="gan-bac-ngay" type="date" className="tabular-nums"
                value={tuNgay} onChange={(e) => setTuNgay(e.target.value)} />
            </div>
            <div>
              <FieldLabel htmlFor="gan-bac-ghi-chu" className="mb-1">Ghi chú</FieldLabel>
              <Input id="gan-bac-ghi-chu" value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} placeholder="tuỳ chọn" />
            </div>
            <Button
              disabled={dangChay || !chon}
              onClick={() => chon && chay(() => ganBac(chon.ma, bac, ghiChu || null, tuNgay))}
            >Gán bậc</Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Ngày hiệu lực mặc định là <b>hôm nay</b>, sửa được nếu đối tác đã lên bậc từ trước.
            Không gán = <b>khách lẻ</b>.
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <TableWrap>
          <Table variant="thuong">
            <TableHeader>
              <TableRow>
                <TableHead className="px-3 py-2.5 font-medium">Đối tác</TableHead>
                <TableHead className="px-3 py-2.5 font-medium">Bậc</TableHead>
                <TableHead className="px-3 py-2.5 font-medium">Hiệu lực từ</TableHead>
                <TableHead className="px-3 py-2.5 font-medium">Ghi chú</TableHead>
                {coQuyenSoan && <TableHead className="px-3 py-2.5 text-center font-medium">Gỡ</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ds.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="px-3 py-10 text-center text-muted-foreground">Chưa gán bậc cho đối tác nào — mọi khách đang là khách lẻ.</TableCell></TableRow>
              ) : ds.map((d) => (
                <TableRow key={d.id} className="hover:bg-muted">
                  <TableCell className="px-3 py-2">
                    <div className="font-medium text-foreground">{d.ten ?? '(chưa có tên)'}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{d.customer_code}</div>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">{NHAN_BAC[d.bac]}</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-2 tabular-nums text-muted-foreground">{d.hieu_luc_tu}</TableCell>
                  <TableCell className="px-3 py-2 text-muted-foreground">{d.ghi_chu ?? '—'}</TableCell>
                  {coQuyenSoan && (
                    <TableCell className="px-3 py-2 text-center">
                      <Button size="sm" variant="outline"
                        disabled={dangChay}
                        title="Gỡ bậc — khách quay về khách lẻ. Lịch sử vẫn giữ ở mục dưới."
                        onClick={() => chay(() => goBac(d.customer_code))}
                      >Gỡ</Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrap>
      </div>

      {/* LỊCH SỬ — CEO chốt 22/08: gỡ rồi vẫn phải tra được từng là cấp nào, ngày nào. */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <button type="button" onClick={() => setXemLichSu((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-foreground hover:bg-muted">
          <span>Lịch sử bậc đã kết thúc <span className="ml-1 font-normal text-muted-foreground">({lichSu.length})</span></span>
          <span className="text-muted-foreground">{xemLichSu ? '▲' : '▼'}</span>
        </button>
        {xemLichSu && (
          <div className="overflow-x-auto border-t border-border">
            <Table variant="thuong">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-3 py-2.5 font-medium">Đối tác</TableHead>
                  <TableHead className="px-3 py-2.5 font-medium">Từng là bậc</TableHead>
                  <TableHead className="px-3 py-2.5 font-medium">Từ ngày</TableHead>
                  <TableHead className="px-3 py-2.5 font-medium">Đến ngày</TableHead>
                  <TableHead className="px-3 py-2.5 font-medium">Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lichSu.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="px-3 py-8 text-center text-muted-foreground">Chưa có bậc nào bị gỡ hay đổi.</TableCell></TableRow>
                ) : lichSu.map((h, i) => (
                  <TableRow key={i} className="hover:bg-muted">
                    <TableCell className="px-3 py-2">
                      <div className="text-foreground">{h.ten ?? '(chưa có tên)'}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{h.customer_code}</div>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">{NHAN_BAC[h.bac]}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2 tabular-nums text-muted-foreground">{h.hieu_luc_tu}</TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2 tabular-nums text-muted-foreground">{h.hieu_luc_den}</TableCell>
                    <TableCell className="px-3 py-2 text-muted-foreground">{h.ghi_chu ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}

/** Gõ để tìm khách — nguồn gợi ý lấy từ server (421 khách, không nạp hết). */
function TimKhach({
  chon, onChon, goiY, onTim,
}: {
  chon: { ma: string; ten: string } | null
  onChon: (m: { ma: string; ten: string } | null) => void
  goiY: MucChon[]
  onTim: (q: string) => void
}) {
  const [q, setQ] = useState('')

  // Đã chọn: hiện THẺ TÊN thay cho ô gõ — không bắt CEO đọc mã khách.
  if (chon) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">{chon.ten}</div>
          <div className="font-mono text-[11px] text-muted-foreground">{chon.ma}</div>
        </div>
        <button type="button" onClick={() => { onChon(null); setQ('') }}
          className="shrink-0 rounded px-1.5 text-muted-foreground hover:text-rose-600" title="Chọn khách khác">✕</button>
      </div>
    )
  }

  return (
    <div className="relative">
      <Input

        placeholder="Gõ tên / SĐT / mã khách…"
        value={q}
        onChange={(e) => { setQ(e.target.value); onTim(e.target.value) }}
      />
      {q.length >= 2 && goiY.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-card shadow-lg">
          {goiY.map((g) => (
            <button key={g.gt} type="button"
              className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => { onChon({ ma: g.gt, ten: g.nhan }); setQ('') }}>
              <span className="font-medium text-foreground">{g.nhan}</span>
              {g.phu && <span className="ml-2 text-xs text-muted-foreground">{g.phu}</span>}
              <span className="ml-2 font-mono text-[11px] text-slate-300">{g.gt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
