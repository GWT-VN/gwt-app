'use client'

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

import { Input } from '@/components/ui/input'
import { Combobox } from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { OChonTatCa, OChonDong, TieuDeCotSapXep } from '@/bang'
import { luuBangView, xoaBangView, type BangView } from '@/app/actions'

type Kh = {
  id: string; full_name: string; primary_phone: string | null; address: string | null
  province: string | null; source: string | null; notes: string | null; machines: number
  /** Mã dùng chung hai khu (KH-2608-0108) và mã nối sang Sales (KH02419). */
  ma_kh: string | null; customer_code: string | null
}
type CotDef = { key: string; nhan: string; batBuoc?: boolean; sapXep?: string; phai?: boolean; render: (c: Kh) => ReactNode }

/** Đăng ký cột của bảng KHÁCH — thêm cột mới ở đây là picker + view tự có. */
const COT: CotDef[] = [
  { key: 'full_name', nhan: 'Khách', sapXep: 'full_name',
    render: (c) => <Link href={`/khach/${c.id}`} prefetch={false} className="text-foreground underline font-medium">{c.full_name}</Link> },
  // CEO 24/08: cầm mã khách trong tay mà bảng không hiện mã, ô tìm cũng không nhận mã
  // ⇒ không mở nổi hồ sơ. Bật sẵn cột này thay vì giấu trong picker cột.
  { key: 'ma_kh', nhan: 'Mã KH', sapXep: 'ma_kh',
    render: (c) => <span className="tabular-nums text-xs text-muted-foreground">{c.ma_kh ?? '—'}</span> },
  { key: 'customer_code', nhan: 'Mã Sales',
    render: (c) => <span className="tabular-nums text-xs text-muted-foreground">{c.customer_code ?? '—'}</span> },
  { key: 'primary_phone', nhan: 'SĐT', batBuoc: true,
    render: (c) => <span className="tabular-nums text-xs text-foreground">{c.primary_phone ?? <span className="text-(--color-text-warning)">—</span>}</span> },
  { key: 'address', nhan: 'Địa chỉ', render: (c) => c.address ?? '—' },
  { key: 'province', nhan: 'Tỉnh/TP', sapXep: 'province', render: (c) => c.province ?? '—' },
  { key: 'machines', nhan: 'Máy', phai: true, render: (c) => c.machines },
  { key: 'source', nhan: 'Nguồn', render: (c) => c.source ?? '—' },
  { key: 'notes', nhan: 'Ghi chú', render: (c) => c.notes ?? '—' },
]
const MAC_DINH = ['full_name', 'ma_kh', 'primary_phone', 'address', 'province', 'machines']
const BAT_BUOC = COT.filter((c) => c.batBuoc).map((c) => c.key)

function chuanHoa(cot: string[]): string[] {
  const hople = cot.filter((k) => COT.some((c) => c.key === k))
  for (const b of BAT_BUOC) if (!hople.includes(b)) hople.push(b)
  return hople.length ? hople : [...MAC_DINH]
}

/** Bảng khách với cột tuỳ chỉnh (bật/tắt + đổi thứ tự) + lưu/nạp view (cá nhân / chung). */
export function BangKhach({ rows, choViewChung, views }: { rows: Kh[]; choViewChung: boolean; views: BangView[] }) {
  const router = useRouter()
  const [hien, setHien] = useState<string[]>([...MAC_DINH])
  const [moCot, setMoCot] = useState(false)
  const [viewId, setViewId] = useState<string | null>(null)
  const [tenView, setTenView] = useState('')
  const [chung, setChung] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const cols = hien.map((k) => COT.find((c) => c.key === k)).filter((c): c is CotDef => !!c)

  function toggle(key: string) {
    if (BAT_BUOC.includes(key)) return
    setHien((cur) => cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key])
  }
  function doiCho(i: number, delta: number) {
    setHien((cur) => {
      const j = i + delta
      if (j < 0 || j >= cur.length) return cur
      const n = [...cur]
      ;[n[i], n[j]] = [n[j], n[i]]
      return n
    })
  }
  async function luu() {
    setBusy(true); setErr(null)
    const r = await luuBangView('cs_customers', tenView, hien, chung)
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    setTenView(''); setChung(false); router.refresh()
  }
  async function xoa(id: string) {
    if (!window.confirm('Xoá view này?')) return
    const r = await xoaBangView(id)
    if (!r.ok) setErr(r.error); else router.refresh()
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <div className="w-56 max-w-full">
          <Combobox aria-label="Chế độ xem" placeholder="View: Mặc định" searchPlaceholder="Tìm chế độ xem…"
            value={views.some((v) => v.id === viewId) ? viewId : null}
            options={views.map((v) => ({ gt: v.id, nhan: v.ten + (v.chu === 'chung' ? ' (chung)' : '') }))}
            onValueChange={(id) => {
              setViewId(id)
              setHien(chuanHoa(views.find((v) => v.id === id)?.cot ?? MAC_DINH))
            }}
          />
        </div>
        <Button onClick={() => setMoCot((v) => !v)}
          className="rounded-lg border bg-card px-3 py-1.5 text-sm text-foreground">Cột ▾</Button>
      </div>

      {moCot && (
        <div className="mb-2 rounded-lg border bg-card p-3 space-y-2 max-w-md">
          <p className="text-xs font-medium text-muted-foreground">Cột hiển thị (▲▼ đổi thứ tự)</p>
          <ul className="space-y-1">
            {hien.map((k, i) => {
              const c = COT.find((x) => x.key === k)
              if (!c) return null
              return (
                <li key={k} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked disabled={c.batBuoc} onChange={() => toggle(k)} />
                  <span className="flex-1">{c.nhan}{c.batBuoc && <span className="text-[10px] text-muted-foreground"> (bắt buộc)</span>}</span>
                  <Button onClick={() => doiCho(i, -1)} className="text-muted-foreground hover:text-foreground">▲</Button>
                  <Button onClick={() => doiCho(i, 1)} className="text-muted-foreground hover:text-foreground">▼</Button>
                </li>
              )
            })}
          </ul>
          {COT.some((c) => !hien.includes(c.key)) && (
            <div className="pt-1 border-t">
              <p className="text-xs text-muted-foreground mb-1">Cột ẩn — bấm để thêm:</p>
              <div className="flex flex-wrap gap-1.5">
                {COT.filter((c) => !hien.includes(c.key)).map((c) => (
                  <Button key={c.key} onClick={() => toggle(c.key)}
                    className="rounded border px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted">+ {c.nhan}</Button>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
            <Input value={tenView} onChange={(e) => setTenView(e.target.value)} placeholder="Tên view…"
              className="rounded border px-2 py-1 text-sm w-32 text-foreground" />
            {choViewChung && <label className="flex items-center gap-1 text-xs text-muted-foreground"><input type="checkbox" checked={chung} onChange={(e) => setChung(e.target.checked)} /> Chung (mọi người)</label>}
            <Button onClick={luu} disabled={busy || !tenView.trim()}
              className="rounded-lg bg-primary text-primary-foreground px-3 py-1 text-sm disabled:opacity-50">Lưu view</Button>
            {err && <span className="text-xs text-(--color-text-danger)">{err}</span>}
          </div>
          {views.length > 0 && (
            <div className="pt-1 text-xs text-muted-foreground border-t">
              View đã lưu:{' '}
              {views.map((v) => (
                <span key={v.id} className="mr-2 whitespace-nowrap">{v.ten}{v.chu === 'chung' && ' (chung)'}
                  <Button onClick={() => xoa(v.id)} className="text-(--color-text-danger) ml-0.5" title="Xoá view">✕</Button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-card rounded-(--radius-xl) border">
        <Table>
          <TableHeader>
            <TableRow>
              <OChonTatCa nhan="khách" />
              {cols.map((c) => c.sapXep
                ? <TieuDeCotSapXep key={c.key} cot={c.sapXep} nhan={c.nhan} chieuMacDinh="asc" dangMacDinh={c.key === 'full_name'} />
                : <TableHead key={c.key} className={`px-4 py-3 font-medium ${c.phai ? 'text-right' : 'text-left'}`}>{c.nhan}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} className="hover:bg-muted align-top">
                <OChonDong khoa={r.id} moTa={`khách ${r.full_name}`} />
                {cols.map((c) => <TableCell key={c.key} className={`px-4 py-3 text-foreground ${c.phai ? 'text-right' : ''}`}>{c.render(r)}</TableCell>)}
              </TableRow>
            ))}
            {rows.length === 0 && <TableRow><TableCell colSpan={cols.length + 1} className="px-4 py-10 text-center text-muted-foreground">Không tìm thấy khách nào.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
