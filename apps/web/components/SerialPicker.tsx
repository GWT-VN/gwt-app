'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { searchSerials, createSerialPending, type SerialRow } from '@/app/actions'

/**
 * Chọn serial từ kho (serial_registry). Gõ để tìm; chưa có thì "tạo chờ duyệt".
 * Không giữ state text cục bộ — dùng thẳng `value` của cha (tránh setState trong effect).
 */
export function SerialPicker({
  value, onChange, onPickRow, placeholder,
}: {
  value: string; onChange: (s: string) => void
  onPickRow?: (row: SerialRow) => void; placeholder?: string
}) {
  const [sug, setSug] = useState<SerialRow[]>([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  // Tìm gợi ý theo `value` (debounce). Chỉ setState trong callback async, không đồng bộ.
  useEffect(() => {
    const t = value.trim()
    if (!open || !t) return
    let huy = false
    const id = setTimeout(async () => {
      const r = await searchSerials(t, 8)
      if (!huy) setSug(r)
    }, 250)
    return () => { huy = true; clearTimeout(id) }
  }, [value, open])

  function pick(row: SerialRow) { onChange(row.serial); onPickRow?.(row); setOpen(false) }

  async function tao() {
    setBusy(true); setMsg(null)
    const r = await createSerialPending({ serial: value.trim() })
    setBusy(false)
    if (!r.ok) setMsg(r.error)
    else { setMsg('Đã gửi chờ duyệt'); setOpen(false) }
  }

  const t = value.trim()
  const hienGoiY = open && t
  const danhSach = t ? sug : []
  const khop = danhSach.some((s) => s.serial === t)

  return (
    <div className="relative min-w-0 flex-1" onBlur={(e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
    }}>
      <Input aria-label={placeholder ?? 'Serial máy'}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setMsg(null) }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="font-mono"
      />
      {msg && <p role="status" className="mt-1 text-sm text-muted-foreground">{msg}</p>}
      {hienGoiY && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-popover shadow-lg">
          {danhSach.map((s) => (
            <li key={s.serial}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(s)}
                className="w-full px-3 py-2 text-left font-mono text-xs hover:bg-accent focus-visible:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
                {s.serial}
                <span className="text-muted-foreground"> · {s.internal_code ?? s.model ?? ''}</span>
              </button>
            </li>
          ))}
          {!khop && (
            <li className="px-3 py-1.5 text-xs border-t">
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={tao} disabled={busy}
                className="break-words text-left text-(--color-text-warning) hover:underline disabled:opacity-50">
                {busy ? 'Đang gửi…' : `+ Chưa có — tạo “${t}” (chờ duyệt)`}
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
