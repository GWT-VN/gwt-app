import Link from 'next/link'
import { bhChoKichHoat, bhChoKichHoatDem } from '@/app/actions'
import { BHChoKichHoatList } from '@/components/BHChoKichHoatList'
import { dsMayChoSerial } from '@/app/may/chua-serial-actions'
import { docAnToan } from '@/lib/loi/anToan'
import { boDau } from '@/bang/timkiem'
import { hienNgay } from '@/lib/dinh-dang-ngay'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { FormLayout } from '@/components/ui/form-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'

const TAB = [
  { key: '', nhan: 'Tất cả' },
  { key: 'da_lap_chua_kich_hoat', nhan: 'Đã lắp — bấm là xong' },
  { key: 'don_sales_chua_gan_may', nhan: 'Đơn bán — cần điền serial' },
  // 18/11: đã kích hoạt BH khi chưa có serial (mã tạm TAM…) — còn phải bổ sung serial thật.
  { key: 'cho_serial', nhan: 'Đã kích hoạt — chờ bổ sung serial' },
] as const

const vnNgay = (d: string | null) => hienNgay(d)

export default async function BHChoKichHoatPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; nguon?: string }>
}) {
  const { q = '', nguon = '' } = await searchParams
  const choSerialTab = nguon === 'cho_serial'
  const [rows, dem, { data: choSerial }] = await Promise.all([
    choSerialTab ? Promise.resolve([]) : bhChoKichHoat(q, nguon || undefined),
    bhChoKichHoatDem(),
    docAnToan('dsMayChoSerial', () => dsMayChoSerial(), []),
  ])
  const k = boDau(q).toLowerCase()
  const choSerialLoc = k
    ? choSerial.filter((m) => boDau([m.serial, m.internal_code, m.parent_serial, m.ten_khach].join(' ')).toLowerCase().includes(k))
    : choSerial

  return (
    <ManV2>
      <TrangDuLieu className="max-w-6xl">
        <div className="min-w-0 space-y-4">
          <PageHeader tieuDe="Chờ kích hoạt BH" />

          <p className="text-sm text-muted-foreground">
            Máy đã bán hoặc đã lắp mà bảo hành chưa kích hoạt. Kích hoạt xong dòng tự biến mất khỏi bảng.
          </p>

          <FormLayout className="flex gap-2">
            {nguon && <input type="hidden" name="nguon" value={nguon} />}
            <Input name="q" defaultValue={q}
              placeholder="Gõ tên/SĐT khách, serial, mã máy, mã đơn…"
              className="flex-1 rounded-lg border px-4 py-2.5 text-foreground bg-card" />
            <Button type="submit">Tìm</Button>
          </FormLayout>

          <div className="flex gap-2 flex-wrap">
            {TAB.map((t) => {
              const sl = t.key === 'da_lap_chua_kich_hoat' ? dem.da_lap
                : t.key === 'don_sales_chua_gan_may' ? dem.don_sales
                : t.key === 'cho_serial' ? choSerial.length
                : dem.da_lap + dem.don_sales
              return (
                <Link key={t.key}
                  href={`/bh-cho-kich-hoat?${new URLSearchParams({ ...(q && { q }), ...(t.key && { nguon: t.key }) })}`}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${
                    nguon === t.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground'
                  }`}>
                  {t.nhan} ({sl})
                </Link>
              )
            })}
          </div>

          {choSerialTab ? (
            <>
              <p className="text-sm text-muted-foreground">
                {choSerialLoc.length} máy đã kích hoạt bảo hành bằng mã tạm — mở máy, bấm &quot;Bổ sung serial&quot;.
              </p>
              <div className="bg-card rounded-(--radius-xl) border overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted text-left text-muted-foreground">
                    <TableRow><TableHead className="px-3 py-2">Mã tạm</TableHead><TableHead className="px-3 py-2">Máy</TableHead><TableHead className="px-3 py-2">Thuộc bộ</TableHead>
                      <TableHead className="px-3 py-2">Khách</TableHead><TableHead className="px-3 py-2">Ngày lắp</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {choSerialLoc.map((m) => (
                      <TableRow key={m.serial} className="border-t">
                        <TableCell className="px-3 py-2 tabular-nums"><Link className="underline" href={`/may/${encodeURIComponent(m.serial)}`}>{m.serial}</Link></TableCell>
                        <TableCell className="px-3 py-2 tabular-nums">{m.internal_code ?? '—'}</TableCell>
                        <TableCell className="px-3 py-2 tabular-nums">{m.parent_serial ?? '—'}</TableCell>
                        <TableCell className="px-3 py-2">{m.customer_id ? <Link className="underline" href={`/khach/${m.customer_id}`}>{m.ten_khach ?? 'Khách'}</Link> : '—'}</TableCell>
                        <TableCell className="px-3 py-2">{vnNgay(m.install_date)}</TableCell>
                      </TableRow>
                    ))}
                    {!choSerialLoc.length && <TableRow><TableCell colSpan={5} className="px-3 py-6 text-center text-muted-foreground">Không có máy nào chờ bổ sung serial.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {rows.length} dòng{rows.length === 500 && ' (giới hạn 500 — gõ cụ thể hơn)'}
              </p>
              <BHChoKichHoatList items={rows} />
            </>
          )}
        </div>
      </TrangDuLieu>
    </ManV2>
  )
}
