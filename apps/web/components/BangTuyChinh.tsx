'use client'

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

import { Input } from '@/components/ui/input'
import { Combobox } from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { luuBangView, xoaBangView, type BangView } from '@/app/actions'
import { OChonTatCa, OChonDong, TieuDeCotSapXep } from '@/bang'

export type CotDef<T> = {
  key: string
  nhan: string
  batBuoc?: boolean
  sapXep?: string          // key trong whitelist sắp xếp (nếu cột này sắp được)
  /** Chiều khi bấm sang cột này lần đầu. Cột ngày nên 'desc' (mới nhất trước) — mặc định 'asc'. */
  chieuDau?: 'asc' | 'desc'
  phai?: boolean           // canh phải
  render: (r: T) => ReactNode
}

/**
 * Bảng tuỳ chỉnh cột dùng chung (Đợt C) — tách từ BangKhach để áp cho mọi bảng.
 * Chọn cột hiển thị + thứ tự (▲▼) + lưu/nạp view (cá nhân/chung) theo khoá `bang`.
 * Render ô do registry `cot` quyết định, nên ô tương tác (badge/nút) vẫn đặt được.
 * Bọc trong <KhungChon> ở trang để có chọn-nhiều-dòng.
 */
export function BangTuyChinh<T>({
  rows, keyOf, moTaOf, nhan, bang, cot, macDinh, sapMacDinh, views, choViewChung, congCu, lopDong,
}: {
  rows: T[]
  keyOf: (r: T) => string
  moTaOf: (r: T) => string
  nhan: string
  bang: string
  cot: CotDef<T>[]
  macDinh: string[]
  sapMacDinh?: string
  views: BangView[]
  /**
   * Được lưu view dùng CHUNG cho cả công ty hay không — quyền he_thong.view_chung.
   *
   * Trước đây tên là `admin` và nơi gọi truyền cờ vai trò quản lý vào. Tên theo VAI TRÒ
   * kiểu đó chính là thứ làm giao diện lệch khỏi rào thật: đọc code không ai biết
   * nó gác cái gì, nên tick lại ma trận là nút hiện/ẩn sai mà không ai ngờ.
   */
  choViewChung: boolean
  /** Nút/điều khiển thêm (Xuất Excel, Lọc ngày…) gom chung 1 hàng với View + Cột. */
  congCu?: ReactNode
  /** Class thêm cho từng `<TableRow>` (vd tô sáng dòng vừa đổi). */
  lopDong?: (r: T) => string
}) {
  const router = useRouter()
  const BAT_BUOC = cot.filter((c) => c.batBuoc).map((c) => c.key)
  const chuanHoa = (ds: string[]): string[] => {
    const hople = ds.filter((k) => cot.some((c) => c.key === k))
    for (const b of BAT_BUOC) if (!hople.includes(b)) hople.unshift(b)
    return hople.length ? hople : [...macDinh]
  }

  const [hien, setHien] = useState<string[]>(chuanHoa([...macDinh]))
  const [moCot, setMoCot] = useState(false)
  const [viewId, setViewId] = useState<string | null>(null)
  const [tenView, setTenView] = useState('')
  const [chung, setChung] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const cols = hien.map((k) => cot.find((c) => c.key === k)).filter((c): c is CotDef<T> => !!c)

  function toggle(key: string) {
    if (BAT_BUOC.includes(key)) return
    setHien((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]))
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
    const r = await luuBangView(bang, tenView, hien, chung)
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
              setHien(chuanHoa(views.find((v) => v.id === id)?.cot ?? macDinh))
            }}
          />
        </div>
        <Button onClick={() => setMoCot((v) => !v)}
          className="rounded-lg border bg-card px-3 py-1.5 text-sm text-foreground">Cột ▾</Button>
        {congCu}
      </div>

      {moCot && (
        <div className="mb-2 rounded-lg border bg-card p-3 space-y-2 max-w-md">
          <p className="text-xs font-medium text-muted-foreground">Cột hiển thị (▲▼ đổi thứ tự)</p>
          <ul className="space-y-1">
            {hien.map((k, i) => {
              const c = cot.find((x) => x.key === k)
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
          {cot.some((c) => !hien.includes(c.key)) && (
            <div className="pt-1 border-t">
              <p className="text-xs text-muted-foreground mb-1">Cột ẩn — bấm để thêm:</p>
              <div className="flex flex-wrap gap-1.5">
                {cot.filter((c) => !hien.includes(c.key)).map((c) => (
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
              <OChonTatCa nhan={nhan} />
              {cols.map((c) => c.sapXep
                ? <TieuDeCotSapXep key={c.key} cot={c.sapXep} nhan={c.nhan} chieuMacDinh={c.chieuDau ?? 'asc'} dangMacDinh={c.sapXep === sapMacDinh} />
                : <TableHead key={c.key} className={`px-4 py-3 font-medium ${c.phai ? 'text-right' : 'text-left'}`}>{c.nhan}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={keyOf(r)} className={`hover:bg-muted align-middle ${lopDong?.(r) ?? ''}`}>
                <OChonDong khoa={keyOf(r)} moTa={moTaOf(r)} />
                {cols.map((c) => <TableCell key={c.key} className={`px-4 py-3 text-foreground ${c.phai ? 'text-right' : ''}`}>{c.render(r)}</TableCell>)}
              </TableRow>
            ))}
            {rows.length === 0 && <TableRow><TableCell colSpan={cols.length + 1} className="px-4 py-10 text-center text-muted-foreground">Không có dòng nào.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
