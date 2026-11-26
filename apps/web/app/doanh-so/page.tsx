import { chanNeuThieuQuyen } from '@/lib/nen-tang/kiem-quyen'
import { doanhSoCskh } from '@/app/actions'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'

function tien(n: number | null) {
  return (n ?? 0).toLocaleString('vi-VN') + ' đ'
}
function thangVN(s: string) {
  const [y, m] = s.split('-')
  return `Tháng ${m}/${y}`
}

export default async function DoanhSoPage() {
  await chanNeuThieuQuyen('cs.bao_cao.doanh_so', 'ADMIN')
  const rows = await doanhSoCskh()

  // gom theo tháng
  const theoThang = new Map<string, typeof rows>()
  for (const r of rows) {
    const k = r.thang
    if (!theoThang.has(k)) theoThang.set(k, [])
    theoThang.get(k)!.push(r)
  }
  const tongTatCa = rows.reduce((s, r) => s + (r.tong_tien ?? 0), 0)

  return (
    <ManV2>
      <TrangDuLieu className="max-w-5xl">
        <div className="min-w-0 space-y-4">
          <PageHeader tieuDe="Doanh số CSKH" />

          <Alert color="info"><AlertDescription>
            Tổng hợp các hạng mục <strong>có thu phí</strong> ghi trong ticket, theo tháng × mã nội bộ.
            Mục miễn phí và đổi máy không tính vào đây.
          </AlertDescription></Alert>

          <Card className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-muted-foreground">Tổng doanh số (tất cả)</span>
            <span className="text-2xl font-semibold text-foreground">{tien(tongTatCa)}</span>
          </Card>

          {rows.length === 0 ? (
            <EmptyState tieuDe="Chưa có hạng mục thu phí nào" />
          ) : (
            [...theoThang.entries()].map(([thang, ds]) => {
              const tongThang = ds.reduce((s, r) => s + (r.tong_tien ?? 0), 0)
              return (
                <section key={thang} className="bg-card rounded-(--radius-xl) border overflow-hidden">
                  <div className="flex items-baseline justify-between px-4 py-2.5 bg-muted border-b">
                    <h2 className="font-medium text-foreground">{thangVN(thang)}</h2>
                    <span className="font-semibold text-foreground">{tien(tongThang)}</span>
                  </div>
                  <Table>
                    <TableHeader className="text-muted-foreground">
                      <TableRow>
                        <TableHead className="text-left px-4 py-2 font-medium">Hạng mục</TableHead>
                        <TableHead className="text-left px-4 py-2 font-medium">Mã</TableHead>
                        <TableHead className="text-right px-4 py-2 font-medium">Lượt</TableHead>
                        <TableHead className="text-right px-4 py-2 font-medium">SL</TableHead>
                        <TableHead className="text-right px-4 py-2 font-medium">Thành tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ds.map((r) => (
                        <TableRow key={r.catalog_code ?? 'x'}>
                          <TableCell className="px-4 py-2 text-foreground">{r.ten_hang_muc ?? '(không rõ)'}</TableCell>
                          <TableCell className="px-4 py-2 tabular-nums text-xs text-muted-foreground">{r.catalog_code ?? '—'}</TableCell>
                          <TableCell className="px-4 py-2 text-right text-muted-foreground">{r.so_luot}</TableCell>
                          <TableCell className="px-4 py-2 text-right text-muted-foreground">{r.tong_so_luong ?? '—'}</TableCell>
                          <TableCell className="px-4 py-2 text-right font-medium text-foreground">{tien(r.tong_tien)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </section>
              )
            })
          )}
        </div>
      </TrangDuLieu>
    </ManV2>
  )
}
