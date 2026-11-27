'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { kichHoatNhanh, type BHChoKichHoat, type TabView } from '@/app/actions'
import type { MayChoSerial } from '@/app/may/chua-serial-actions'
import { TAB_BH } from '@/app/bh-cho-kich-hoat/truong-bh'
import { BangDanhSachF, type CotF } from '@/components/BangDanhSachF'
import { SerialPicker } from '@/components/SerialPicker'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { hienNgay } from '@/lib/dinh-dang-ngay'

const HOM_NAY = () => new Date().toISOString().slice(0, 10)

/** Khoá của 1 dòng — view không có id, dòng đơn sales phân biệt bằng mã đơn + mã máy. */
function khoa(r: BHChoKichHoat) {
  return `${r.nguon}|${r.serial ?? ''}|${r.ma_don ?? ''}|${r.ma_noi_bo ?? ''}|${r.customer_id ?? ''}`
}

type ODong = {
  serial: Record<string, string>
  datSerial: (k: string, v: string) => void
  busy: string | null
  chay: (r: BHChoKichHoat) => void
}

function cotCho(x: ODong): CotF<BHChoKichHoat>[] {
  return [
    {
      id: 'khach', ten: 'Khách', kieu: 'thuong', khoa: true, toiThieu: 140, rongToiDa: 260, title: (r) => r.ten_khach,
      o: (r) => r.customer_id ? (
        <Link href={`/khach/${r.customer_id}`} prefetch={false} className="font-medium hover:underline">{r.ten_khach ?? '—'}</Link>
      ) : (
        <span className="inline-flex items-center gap-1.5">
          {r.ten_khach ?? '—'}
          <Badge variant="soft" color="warning">chưa có hồ sơ CSKH</Badge>
        </span>
      ),
    },
    { id: 'sdt', ten: 'SĐT', kieu: 'thuong', o: (r) => <span className="tabular-nums">{r.sdt_khach ?? '—'}</span> },
    {
      id: 'may', ten: 'Máy', kieu: 'thuong', rongToiDa: 260, title: (r) => r.ten_noi_bo,
      o: (r) => (
        <span className="inline-flex items-center gap-1.5">
          {r.ten_noi_bo ?? '—'}
          {!r.serial && (r.so_luong ?? 1) > 1 && <Badge variant="soft" color="warning">còn {r.so_luong} máy</Badge>}
        </span>
      ),
    },
    { id: 'ma_noi_bo', ten: 'Mã máy', kieu: 'thuong', o: (r) => <span className="tabular-nums">{r.ma_noi_bo ?? '—'}</span> },
    { id: 'ma_don', ten: 'Đơn', kieu: 'thuong', o: (r) => (r.serial ? '—' : r.ma_don ?? '—') },
    // Dòng đã lắp: ngày lắp; dòng đơn bán: ngày đặt hàng (mốc BH khi kích hoạt).
    {
      id: 'ngay', ten: 'Ngày lắp / đặt', kieu: 'thuong', ngay: true,
      o: (r, kieu) => <span className="tabular-nums text-muted-foreground">{hienNgay(r.serial ? r.ngay_lap : r.ngay_dat_hang, kieu)}</span>,
    },
    {
      id: 'serial', ten: 'Serial', kieu: 'thuong', batBuoc: true, rong: 240,
      o: (r) => {
        const k = khoa(r)
        return r.serial ? (
          <span className="tabular-nums">{r.serial}</span>
        ) : (
          <SerialPicker value={x.serial[k] ?? ''} onChange={(v) => x.datSerial(k, v)} placeholder="Gõ serial máy…" />
        )
      },
    },
    {
      id: 'kich_hoat', ten: 'Kích hoạt', kieu: 'thuong', batBuoc: true,
      o: (r) => {
        const k = khoa(r)
        const sn = r.serial ?? x.serial[k] ?? ''
        return r.customer_id ? (
          <Button size="sm" onClick={() => x.chay(r)} loading={x.busy === k} disabled={!sn.trim()}>
            {x.busy === k ? 'Đang kích hoạt…' : 'Kích hoạt BH'}
          </Button>
        ) : (
          <Button asChild size="sm" variant="outline"><Link href="/dang-ky-bh">Chọn khách…</Link></Button>
        )
      },
    },
  ]
}

const COT_SERIAL: CotF<MayChoSerial>[] = [
  {
    id: 'serial', ten: 'Mã tạm', kieu: 'thuong', khoa: true,
    o: (m) => <Link href={`/may/${encodeURIComponent(m.serial)}`} prefetch={false} className="font-medium tabular-nums hover:underline">{m.serial}</Link>,
  },
  { id: 'internal_code', ten: 'Máy', kieu: 'thuong', o: (m) => <span className="tabular-nums">{m.internal_code ?? '—'}</span> },
  { id: 'parent_serial', ten: 'Thuộc bộ', kieu: 'thuong', o: (m) => <span className="tabular-nums">{m.parent_serial ?? '—'}</span> },
  {
    id: 'khach', ten: 'Khách', kieu: 'thuong', rongToiDa: 260, title: (m) => m.ten_khach,
    o: (m) => (m.customer_id ? <Link href={`/khach/${m.customer_id}`} prefetch={false} className="hover:underline">{m.ten_khach ?? 'Khách'}</Link> : '—'),
  },
  {
    id: 'install_date', ten: 'Ngày lắp', kieu: 'thuong', ngay: true,
    o: (m, kieu) => <span className="tabular-nums text-muted-foreground">{hienNgay(m.install_date, kieu)}</span>,
  },
]

type ChungBH = { tabRieng: TabView[]; quyenTabChung: boolean }
const tabBH = (c: ChungBH) => ({
  bang: 'bh_cho_tab' as const, coDinh: TAB_BH, rieng: c.tabRieng, quyenChung: c.quyenTabChung,
  khu: 'CSKH', viDuTen: 'VD: Đơn bán Hà Nội',
})
const TIM = { placeholder: 'Tên/SĐT khách, serial, mã máy, mã đơn…', nhan: 'Tìm bảo hành chờ kích hoạt' }

/**
 * Hàng chờ kích hoạt bảo hành — khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md).
 *
 * Hai kiểu dòng:
 *  · đã lắp  -> đủ serial + khách, bấm một nút là xong.
 *  · đơn bán -> đã biết khách từ đơn, CSKH chỉ điền serial rồi bấm.
 *
 * Dòng nào chưa nối được sang khách CSKH thì không kích hoạt tại chỗ được
 * (thiếu customer_id) — đẩy sang /dang-ky-bh để chọn/tạo khách.
 * Bảng có ô sửa tại dòng (ô serial, nút) nên không đổi sang ListView trên điện thoại — bảng cuộn ngang.
 */
export function BHChoKichHoatList({ items, gioiHan, ...chung }: ChungBH & { items: BHChoKichHoat[]; gioiHan: number }) {
  const [serial, setSerial] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [loi, setLoi] = useState<Record<string, string>>({})
  const router = useRouter()

  const chay = useCallback(async (r: BHChoKichHoat) => {
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
  }, [serial, router])

  const cot = useMemo(
    () => cotCho({ serial, datSerial: (k, v) => setSerial((c) => ({ ...c, [k]: v })), busy, chay }),
    [serial, busy, chay],
  )

  return (
    <BangDanhSachF
      tieuDe="Chờ kích hoạt BH"
      nhan="dòng"
      timKiem={TIM}
      rows={items}
      khoa={khoa}
      moTa={(r) => `máy ${r.ten_noi_bo ?? r.ma_noi_bo ?? ''} của ${r.ten_khach ?? 'khách'}`}
      cot={cot}
      // Dòng chờ không có trang riêng — chi tiết là hồ sơ khách (dòng chưa có hồ sơ CSKH: không có mục mở).
      hrefDong={(r) => (r.customer_id ? `/khach/${r.customer_id}` : null)}
      tenMo="Mở hồ sơ khách"
      maDong={(r) => r.serial ?? r.ma_don}
      tenMa="serial / mã đơn"
      tong={items.length}
      tab={tabBH(chung)}
      ghiChuLoc={items.length >= gioiHan ? `Giới hạn ${gioiHan} dòng — gõ cụ thể hơn` : undefined}
      rong={{ tieuDe: 'Không còn máy nào chờ kích hoạt bảo hành', moTa: 'Kích hoạt xong dòng tự biến mất khỏi bảng.' }}
      sauDong={(r, soCot) => loi[khoa(r)] ? (
        <TableRow><TableCell colSpan={soCot} className="text-(--color-text-danger)">{loi[khoa(r)]}</TableCell></TableRow>
      ) : null}
    />
  )
}

/** Tab "Đã kích hoạt — chờ bổ sung serial": máy kích hoạt BH bằng mã tạm (TAM…), mở máy để bổ sung serial thật. */
export function BangBHChoSerial({ items, ...chung }: ChungBH & { items: MayChoSerial[] }) {
  return (
    <BangDanhSachF
      tieuDe="Chờ kích hoạt BH"
      nhan="máy"
      timKiem={TIM}
      rows={items}
      khoa={(m) => m.serial}
      moTa={(m) => `máy ${m.serial}`}
      cot={COT_SERIAL}
      cotDs={[
        {
          id: 'ten', ten: 'Mã tạm', rong: 'minmax(0,1fr)', dienThoai: 'tren',
          o: (m) => <Link href={`/may/${encodeURIComponent(m.serial)}`} prefetch={false} className="min-w-0 truncate font-medium tabular-nums hover:underline">{m.serial}</Link>,
        },
        { id: 'khach', ten: 'Khách', rong: 'minmax(0,1.4fr)', dienThoai: 'duoi', o: (m) => m.ten_khach ?? '—' },
        { id: 'ngay', ten: 'Ngày lắp', rong: 'minmax(0,1fr)', dienThoai: 'duoiPhai', o: (m) => hienNgay(m.install_date) },
      ]}
      hrefDong={(m) => `/may/${encodeURIComponent(m.serial)}`}
      maDong={(m) => m.serial}
      tenMa="mã tạm"
      tong={items.length}
      tab={tabBH(chung)}
      ghiChuLoc={items.length ? 'Mở máy, bấm "Bổ sung serial".' : undefined}
      rong={{ tieuDe: 'Không có máy nào chờ bổ sung serial' }}
    />
  )
}
