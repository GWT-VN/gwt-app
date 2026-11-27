'use client'

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

import { Button } from '@/components/ui/button'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { kichHoatNhanh, type BHChoKichHoat } from '@/app/actions'
import { SerialPicker } from '@/components/SerialPicker'
import { vnDate } from '@/components/Badge'

const HOM_NAY = () => new Date().toISOString().slice(0, 10)

/** Khoá của 1 dòng — view không có id, dòng đơn sales phân biệt bằng mã đơn + mã máy. */
function khoa(r: BHChoKichHoat) {
  return `${r.nguon}|${r.serial ?? ''}|${r.ma_don ?? ''}|${r.ma_noi_bo ?? ''}|${r.customer_id ?? ''}`
}

/**
 * Hàng chờ kích hoạt bảo hành.
 *
 * Hai kiểu dòng:
 *  · đã lắp  -> đủ serial + khách, bấm một nút là xong.
 *  · đơn bán -> đã biết khách từ đơn, CSKH chỉ điền serial rồi bấm.
 *
 * Dòng nào chưa nối được sang khách CSKH thì không kích hoạt tại chỗ được
 * (thiếu customer_id) — đẩy sang /dang-ky-bh để chọn/tạo khách.
 */
export function BHChoKichHoatList({ items }: { items: BHChoKichHoat[] }) {
  const [serial, setSerial] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [loi, setLoi] = useState<Record<string, string>>({})
  const router = useRouter()

  async function chay(r: BHChoKichHoat) {
    const k = khoa(r)
    const sn = (r.serial ?? serial[k] ?? '').trim()
    if (!sn || !r.customer_id) return
    setBusy(k); setLoi((c) => ({ ...c, [k]: '' }))
    const kq = await kichHoatNhanh({
      serial: sn,
      customer_id: r.customer_id,
      // Dòng đã lắp giữ nguyên ngày lắp; dòng đơn bán lấy ngày đặt hàng làm mốc BH.
      install_date: (r.ngay_lap || r.ngay_dat_hang || HOM_NAY()).slice(0, 10),
      install_address: r.dia_chi ?? undefined,
    })
    setBusy(null)
    if (!kq.ok) setLoi((c) => ({ ...c, [k]: kq.error }))
    else router.refresh()   // kích hoạt xong -> view bỏ dòng này ra
  }

  if (items.length === 0) {
    return (
      <div className="bg-card rounded-(--radius-xl) border px-4 py-10 text-center text-muted-foreground">
        Không còn máy nào chờ kích hoạt bảo hành.
      </div>
    )
  }

  return (
    <div className="bg-card rounded-(--radius-xl) border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left px-4 py-3 font-medium">Khách</TableHead>
            <TableHead className="text-left px-4 py-3 font-medium">Máy</TableHead>
            <TableHead className="text-left px-4 py-3 font-medium">Đơn / ngày lắp</TableHead>
            <TableHead className="text-left px-4 py-3 font-medium">Serial</TableHead>
            <TableHead className="text-left px-4 py-3 font-medium w-px whitespace-nowrap">Kích hoạt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((r) => {
            const k = khoa(r)
            const daCoSerial = Boolean(r.serial)
            const sn = r.serial ?? serial[k] ?? ''
            const chayDuoc = Boolean(r.customer_id) && sn.trim().length > 0
            return (
              <TableRow key={k} className="hover:bg-muted align-top">
                <TableCell className="px-4 py-2.5 text-foreground">
                  {r.customer_id ? (
                    <Link href={`/khach/${r.customer_id}`} className="hover:underline">
                      {r.ten_khach ?? '—'}
                    </Link>
                  ) : (
                    <span>{r.ten_khach ?? '—'}</span>
                  )}
                  {r.sdt_khach && <div className="tabular-nums text-[10px] text-muted-foreground">{r.sdt_khach}</div>}
                  {!r.customer_id && (
                    <div className="text-[10px] text-(--color-text-warning)">chưa có hồ sơ khách CSKH</div>
                  )}
                </TableCell>
                <TableCell className="px-4 py-2.5 text-foreground">
                  {r.ten_noi_bo ?? '—'}
                  {!daCoSerial && (r.so_luong ?? 1) > 1 && (
                    <span className="ml-1.5 rounded bg-(--color-background-warning-surface) text-(--color-text-warning) px-1.5 py-0.5 text-[10px] font-medium">
                      còn {r.so_luong} máy
                    </span>
                  )}
                  <div className="tabular-nums text-[10px] text-muted-foreground">{r.ma_noi_bo ?? '—'}</div>
                </TableCell>
                <TableCell className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                  {daCoSerial ? (
                    <>lắp {vnDate(r.ngay_lap)}</>
                  ) : (
                    <>
                      {r.ma_don ?? '—'}
                      <div className="text-[10px] text-muted-foreground">{vnDate(r.ngay_dat_hang)}</div>
                    </>
                  )}
                </TableCell>
                <TableCell className="px-4 py-2.5">
                  {daCoSerial ? (
                    <span className="tabular-nums text-xs text-foreground">{r.serial}</span>
                  ) : (
                    <div className="flex min-w-56">
                      <SerialPicker
                        value={serial[k] ?? ''}
                        onChange={(v) => setSerial((c) => ({ ...c, [k]: v }))}
                        placeholder="Gõ serial máy…"
                      />
                    </div>
                  )}
                  {loi[k] && <p className="text-xs text-(--color-text-danger) mt-1">{loi[k]}</p>}
                </TableCell>
                <TableCell className="px-4 py-2.5 whitespace-nowrap">
                  {r.customer_id ? (
                    <Button
                      size="sm"
                      onClick={() => chay(r)}
                      loading={busy === k}
                      disabled={!chayDuoc}>
                      {busy === k ? 'Đang kích hoạt…' : 'Kích hoạt BH'}
                    </Button>
                  ) : (
                    <Link href="/dang-ky-bh"
                      className="rounded-lg border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted">
                      Chọn khách…
                    </Link>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
