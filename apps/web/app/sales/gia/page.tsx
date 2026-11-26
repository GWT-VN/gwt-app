import { Table, TableWrap, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { SalesScreen } from '@/app/sales/_ui'
import { PageHeader } from '@/components/ui/page-header'
import Link from 'next/link'
import { Suspense } from 'react'
import { OTimKiem, ThanhDangLoc } from '@/bang'
import { boDau } from '@/bang'
import { bangGiaNiemYet } from './actions'

export const metadata = { title: 'Bảng giá niêm yết · GWT Sales' }
export const dynamic = 'force-dynamic'

const vnd = new Intl.NumberFormat('vi-VN')

export default async function BangGiaPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const tatCa = await bangGiaNiemYet()
  const s = boDau((q ?? '').trim())
  const ds = s ? tatCa.filter((x) => boDau(x.ma).includes(s) || boDau(x.ten).includes(s)) : tatCa

  return (
    <SalesScreen className="max-w-[1000px] space-y-4">
      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/sales/gia/chinh-sach" className="text-(--color-text-info) hover:underline">Chính sách giá đại lý →</Link>
        <Link href="/sales/gia/doi-tac" className="text-(--color-text-info) hover:underline">Đối tác đại lý →</Link>
      </div>

      <div>
        <PageHeader tieuDe="Bảng giá niêm yết" />
        <p className="text-sm text-muted-foreground">
          Gương từ Masterdata — khu Sales <b>chỉ đọc</b>. Sản phẩm chưa có giá thì không kéo về.
        </p>
      </div>

      <Suspense fallback={<div className="h-12" />}>
        <OTimKiem placeholder="Gõ mã hoặc tên sản phẩm…" />
      </Suspense>
      <ThanhDangLoc dieuKien={q ? [{ nhan: 'Tìm', giaTri: q }] : []} hienThi={ds.length} tong={tatCa.length} nhan="sản phẩm" />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <TableWrap>
          <Table variant="thuong">
            <TableHeader>
              <TableRow>
                <TableHead className="px-3 py-2.5 font-medium">Mã nội bộ</TableHead>
                <TableHead className="px-3 py-2.5 font-medium">Tên sản phẩm</TableHead>
                <TableHead className="px-3 py-2.5 text-center font-medium">Thuế</TableHead>
                <TableHead className="px-3 py-2.5 text-right font-medium">Giá niêm yết (gồm VAT)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ds.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="px-3 py-10 text-center text-muted-foreground">Không có mã nào khớp.</TableCell></TableRow>
              ) : ds.map((x) => (
                <TableRow key={x.ma} className="hover:bg-muted">
                  <TableCell className="whitespace-nowrap px-3 py-2 font-mono text-xs text-muted-foreground">{x.ma}</TableCell>
                  <TableCell className="px-3 py-2 text-foreground">{x.ten}</TableCell>
                  <TableCell className="px-3 py-2 text-center">
                    {x.vat_loai === 'KCT' || x.vat_loai === 'KAD' ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">{x.vat_loai}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">{x.vat_pct == null ? '—' : `${Math.round(x.vat_pct * 100)}%`}</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-2 text-right font-semibold tabular-nums text-foreground">
                    {vnd.format(x.gia_vat)} ₫
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrap>
      </div>
    </SalesScreen>
  )
}
