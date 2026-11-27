'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CaretDown, DownloadSimple } from '@phosphor-icons/react/ssr'
import { Button } from '@/components/ui/button'
import { Checkbox, ChoiceLabel } from '@/components/ui/checkbox'
import { useDsPortal } from '@/components/ui/ds-root'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export type CotXuat = { key: string; nhan: string; pii?: boolean }
type KetQuaXuat = { ok: true; csv: string } | { ok: true; pending: true } | { ok: false; error: string }
type KetQuaTai = { ok: true; csv: string } | { ok: false; error: string }

/** Tải CSV mã hoá UTF-16LE + BOM — Excel (Mac + Windows) đọc tiếng Việt đúng.
 *  (UTF-8+BOM bị Mac Excel bỏ qua -> lỗi font.) */
function taiCsvUtf16(text: string, ten: string) {
  const n = text.length
  const buf = new ArrayBuffer(2 + n * 2)
  const view = new DataView(buf)
  view.setUint8(0, 0xff); view.setUint8(1, 0xfe)
  for (let i = 0; i < n; i++) view.setUint16(2 + i * 2, text.charCodeAt(i), true)
  const blob = new Blob([buf], { type: 'text/csv;charset=utf-16le' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = ten; a.click()
  URL.revokeObjectURL(url)
}
const HOM_NAY = () => new Date().toISOString().slice(0, 10)

/**
 * Nút "Xuất Excel" DÙNG CHUNG cho mọi bảng: bấm mở dropdown chọn trường (cuộn được
 * khi nhiều trường), rồi Xuất. Tải bằng UTF-16LE. onXuat trả csv (tải luôn) hoặc
 * pending (chờ duyệt). daDuyet + onTai: các yêu cầu đã duyệt để tải lại (tuỳ chọn).
 */
export function NutXuat({
  cot, macDinh, tenFile, onXuat, daDuyet = [], onTai,
}: {
  cot: readonly CotXuat[]
  macDinh: readonly string[]
  tenFile: string
  onXuat: (cot: string[]) => Promise<KetQuaXuat>
  daDuyet?: { id: string; nhan?: string }[]
  onTai?: (id: string) => Promise<KetQuaTai>
}) {
  const router = useRouter()
  const dsPortal = useDsPortal()
  const [mo, setMo] = useState(false)
  const [chon, setChon] = useState<string[]>([...macDinh])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const coPii = cot.some((c) => c.pii && chon.includes(c.key))
  function toggle(key: string) {
    setChon((cur) => cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key])
    setMsg(null); setErr(null)
  }

  async function xuat() {
    setBusy(true); setErr(null); setMsg(null)
    const r = await onXuat(chon)
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    if ('csv' in r) { taiCsvUtf16(r.csv, `${tenFile}_${HOM_NAY()}.csv`); setMo(false) }
    else { setMsg('Đã gửi yêu cầu (có PII) — chờ admin duyệt.'); setMo(false); router.refresh() }
  }
  async function tai(id: string) {
    if (!onTai || !window.confirm('Tải bản đã được duyệt?')) return
    setBusy(true); setErr(null); setMsg(null)
    const r = await onTai(id)
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    taiCsvUtf16(r.csv, `${tenFile}_pii_${HOM_NAY()}.csv`); router.refresh()
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover open={mo} onOpenChange={(moi) => {
        setMo(moi)
        if (moi) { setMsg(null); setErr(null) }
      }}>
        <PopoverTrigger asChild>
          <Button loading={busy} size="sm" variant="ghost">
            <DownloadSimple aria-hidden="true" />
            Xuất Excel
            <CaretDown aria-hidden="true" className="size-3!" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          aria-label="Chọn trường xuất"
          noiTuyen={!dsPortal}
          className="w-64 max-w-(--radix-popover-content-available-width) space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Chọn trường xuất</span>
            <div className="flex gap-2 text-[11px]">
              <button onClick={() => setChon(cot.map((c) => c.key))} className="text-muted-foreground hover:underline">Tất cả</button>
              <button onClick={() => setChon([])} className="text-muted-foreground hover:underline">Bỏ hết</button>
            </div>
          </div>
          <ul className="max-h-56 overflow-auto space-y-1 pr-1">
            {cot.map((c) => (
              <li key={c.key}>
                <ChoiceLabel>
                  <Checkbox checked={chon.includes(c.key)} onCheckedChange={() => toggle(c.key)} />
                  {c.nhan}{c.pii && <span className="ml-1 text-xs text-(--color-text-warning)">(PII)</span>}
                </ChoiceLabel>
              </li>
            ))}
          </ul>
          {coPii && <p className="text-[11px] text-(--color-text-warning)">Có SĐT/địa chỉ → admin xuất ngay, CS phải chờ duyệt.</p>}
          <Button size="sm" onClick={xuat} disabled={chon.length === 0} loading={busy} className="w-full">
            {busy ? 'Đang xuất…' : coPii ? 'Xuất (cần duyệt)' : 'Xuất'}
          </Button>
        </PopoverContent>
      </Popover>

      {daDuyet.map((y) => (
        <Button key={y.id} onClick={() => tai(y.id)} disabled={busy} variant="outline" size="sm">
          <DownloadSimple aria-hidden="true" />
          Tải bản đã duyệt{y.nhan ? ` ${y.nhan}` : ''}
        </Button>
      ))}
      {msg && <span className="text-sm text-(--color-text-success)">{msg}</span>}
      {err && <span className="text-sm text-(--color-text-danger)">{err}</span>}
    </div>
  )
}
