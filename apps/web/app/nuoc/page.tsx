import Link from 'next/link'
import { Suspense } from 'react'
import { OTimKiem, PhanTrang, LocNgay } from '@/bang'
import { hoSoNuoc } from '@/app/actions'
import { coDoNuoc } from '@/lib/nuoc'
import { ChiSoNuoc } from '@/components/ChiSoNuoc'
import { vnDate } from '@/components/Badge'
import { LocTinhNuoc } from '@/components/LocTinhNuoc'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'
import { CauHinhBangDs } from '@/components/ui/bang-ds'

/**
 * Hồ sơ chất lượng nước — TOÀN BỘ khách (CEO yêu cầu 31/08/2026).
 *
 * *"Hồ sơ cả nước tất cả các khách hàng, xem theo tỉnh thành, địa chỉ, thời gian được."*
 *
 * Dữ liệu đo nước có từ lâu trong `maintenance_visit` nhưng **chưa màn nào đọc ra**, nên
 * ghi xong coi như mất. Trang này là chỗ đọc ra; lịch sử theo TỪNG khách nằm ở hồ sơ khách.
 */
export default async function NuocPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tinh?: string; ngtu?: string; ngden?: string; trang?: string }>
}) {
  const { q = '', tinh, ngtu, ngden, trang: trangRaw } = await searchParams
  const trang = Math.max(1, Number(trangRaw) || 1)
  const { rows, tong, soTrang } = await hoSoNuoc(q, { tinh, tu: ngtu, den: ngden, trang })

  const dsTinh = [...new Set(rows.map((r) => r.tinh).filter(Boolean))].sort() as string[]

  return (
    <ManV2>
      <TrangDuLieu>
        <CauHinhBangDs>
          <div className="min-w-0 space-y-4">
            <PageHeader
              tieuDe="Hồ sơ chất lượng nước"
              meta={["Mỗi lần kiểm tra một dòng — lọc theo tỉnh, khách, địa chỉ, thời gian"]}
            />

            <Suspense>
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-[260px] flex-1">
                  <OTimKiem placeholder="Tên khách, địa chỉ hoặc bộ máy…" />
                </div>
                <LocNgay nhan="Ngày đo" />
                <LocTinhNuoc dsTinh={dsTinh} dangChon={tinh ?? ''} />
              </div>
            </Suspense>

            <p className="text-sm text-muted-foreground">
              {tong.toLocaleString('vi-VN')} lượt đã đo nước
              {(q || tinh) && (
                // Nói thẳng giới hạn thay vì để người dùng tự đoán: tên khách/tỉnh nằm ở bảng khác
                // nên chỉ lọc được TRONG TRANG. Giấu chỗ này là để CS tin nhầm một con số sai.
                <span className="text-(--color-text-warning)"> · lọc tên/tỉnh chỉ áp dụng trong trang đang xem</span>
              )}
            </p>

            <div className="overflow-x-auto rounded-(--radius-xl) border border-border bg-card">
              <Table>
                <TableHeader className="bg-muted text-left text-xs text-muted-foreground">
                  <TableRow>
                    <TableHead className="px-3 py-2 font-medium">Ngày đo</TableHead>
                    <TableHead className="px-3 py-2 font-medium">Khách</TableHead>
                    <TableHead className="px-3 py-2 font-medium">Tỉnh / địa chỉ</TableHead>
                    <TableHead className="px-3 py-2 font-medium">Bộ máy · lần</TableHead>
                    <TableHead className="px-3 py-2 font-medium">Chỉ số (trước → sau lọc)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border">
                  {rows.map((r) => (
                    <TableRow key={r.visit_id} className="align-top">
                      <TableCell className="whitespace-nowrap px-3 py-2 text-foreground">{r.ngay ? vnDate(r.ngay) : '—'}</TableCell>
                      <TableCell className="px-3 py-2">
                        {r.customer_id
                          ? <Link href={`/khach/${r.customer_id}`} prefetch={false} className="text-(--color-text-info) hover:underline">{r.ten_khach ?? 'khách chưa khớp'}</Link>
                          : <span className="text-muted-foreground">chưa khớp khách</span>}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-muted-foreground">
                        {r.tinh && <div className="text-xs font-medium text-foreground">{r.tinh}</div>}
                        <div className="line-clamp-2 text-xs text-muted-foreground">{r.dia_chi ?? '—'}</div>
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs text-muted-foreground">
                        {r.bo_may ?? '—'}{r.lan_thu ? <div className="text-muted-foreground">lần {r.lan_thu}</div> : null}
                      </TableCell>
                      <TableCell className="px-3 py-2">{coDoNuoc(r.do_nuoc) ? <ChiSoNuoc d={r.do_nuoc} /> : <span className="text-slate-300">—</span>}</TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="px-3 py-8 text-center text-sm text-muted-foreground">Chưa có lượt nào đo nước khớp bộ lọc.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <Suspense><PhanTrang trang={trang} soTrang={soTrang} /></Suspense>
          </div>
        </CauHinhBangDs>
      </TrangDuLieu>
    </ManV2>
  )
}
