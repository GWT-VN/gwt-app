import { Table, TableWrap, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { SalesScreen } from '@/app/sales/_ui'
import { PageHeader } from '@/components/ui/page-header'
import Link from 'next/link'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { coTheVaoSales } from '@/lib/nen-tang/gac-cong'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { BoLocChon, OTimKiem, ThanhDangLoc } from '@/bang'
import { danhSachKhach, kenhChonDuoc, kenhTrongDon, khachTrungSdt, nhanVienChonDuoc, tinhTrongKhach } from '../actions'
import { TaoKhachButton } from '../TaoKhachButton'
import { hienNgay } from '@/lib/dinh-dang-ngay'

export const metadata = { title: 'Khách hàng · GWT Sales' }
export const dynamic = 'force-dynamic'

const fmtDate = (d: string | null) => hienNgay(d)

export default async function SalesKhachPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tinh?: string; kenh?: string }>
}) {
  await requireNhanSu()
  if (!(await coTheVaoSales())) redirect('/?loi=khong_du_quyen')
  const { q, tinh, kenh } = await searchParams
  const [rows, tinhOpts, kenhOpts, kenhDim, trung, nhanVien] = await Promise.all([
    danhSachKhach(q ?? '', { tinh, kenh }),
    tinhTrongKhach(),
    kenhTrongDon(),
    kenhChonDuoc(),
    khachTrungSdt(),
    nhanVienChonDuoc(),
  ])
  const dieuKien = [
    tinh ? { nhan: 'Tỉnh/TP', giaTri: tinh } : null,
    kenh ? { nhan: 'Kênh', giaTri: kenh } : null,
  ].filter(Boolean) as { nhan: string; giaTri: string }[]

  return (
    <SalesScreen className="max-w-[1100px] space-y-4">
      <PageHeader
        tieuDe="Khách hàng"
        meta={[rows.length + ' khách', 'Mã KH… từ Sheet', 'Mã KA… tạo trên app']}
        hanhDong={<TaoKhachButton kenh={kenhDim} nhanVien={nhanVien} />}
      />

      {/* Cảnh báo trùng — CEO chốt 22/08: đếm và nói ra, không chặn cứng ở DB. */}
      {trung.length > 0 && (
        <details className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-amber-900">
            ⚠ {trung.length} số điện thoại đang có nhiều hồ sơ khách
            <span className="ml-2 font-normal text-amber-700">— bấm để xem và gộp</span>
          </summary>
          <div className="mt-3 space-y-2">
            {trung.map((t) => (
              <div key={t.sdt9} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-mono text-amber-900">…{t.sdt9}</span>
                <span className="text-amber-700">→</span>
                {t.ma.map((m, i) => (
                  <Link key={m} href={`/sales/khach/${encodeURIComponent(m)}`}
                    className="rounded-md bg-card px-2 py-0.5 text-xs ring-1 ring-amber-200 hover:ring-amber-400">
                    <span className="font-mono text-muted-foreground">{m}</span>
                    {t.ten[i] && <span className="ml-1.5 text-foreground">{t.ten[i]}</span>}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-amber-700">
            Phần lớn do Google Sheet ăn mất số 0 đầu SĐT. Sửa trong <b>ô SĐT của dòng đơn</b>
            rồi chạy <b>Dựng lại DM_KHACH → Đồng bộ khách</b> — hai hồ sơ sẽ tự gộp làm một.
          </p>
        </details>
      )}

      {/* Đọc useSearchParams -> BẮT BUỘC bọc Suspense, xem docs/CHUAN-FILTER.md */}
      <Suspense fallback={<div className="h-20" />}>
        <div className="space-y-2 rounded-xl border border-border bg-card p-3 shadow-sm">
          <OTimKiem placeholder="Tìm tên / SĐT / mã KH…" />
          <div className="flex flex-wrap items-center gap-2">
            <BoLocChon param="tinh" nhan="Tỉnh/TP" tuyChon={tinhOpts.map((t) => ({ giaTri: t, nhan: t }))} />
            <BoLocChon param="kenh" nhan="Kênh" tuyChon={kenhOpts.map((k) => ({ giaTri: k, nhan: k }))} />
          </div>
        </div>
      </Suspense>

      <ThanhDangLoc dieuKien={dieuKien} hienThi={rows.length} tong={rows.length} nhan="khách" />

      {kenh && (
        <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          Kênh của khách đang <b>suy từ đơn đã mua</b> — cột <code>channel_id</code> vừa thêm 21/08 và
          chưa có ai điền. Khách chưa có đơn nào sẽ không hiện khi lọc theo kênh.
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <TableWrap>
          <Table variant="thuong">
            <TableHeader>
              <TableRow>
                <TableHead className="px-3 py-2.5 font-medium">Mã KH</TableHead>
                <TableHead className="px-3 py-2.5 font-medium">Tên</TableHead>
                <TableHead className="px-3 py-2.5 font-medium">SĐT</TableHead>
                <TableHead className="px-3 py-2.5 font-medium">Tỉnh/TP</TableHead>
                <TableHead className="px-3 py-2.5 text-right font-medium">Đơn</TableHead>
                <TableHead className="px-3 py-2.5 font-medium">Mua gần nhất</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-3 py-10 text-center text-muted-foreground">Không có khách nào khớp.</TableCell>
                </TableRow>
              ) : (
                rows.map((c) => (
                  <TableRow key={c.customer_code} className="hover:bg-muted">
                    <TableCell className="whitespace-nowrap px-3 py-2.5 font-mono text-xs">
                      <Link href={`/sales/khach/${encodeURIComponent(c.customer_code)}`} className="text-(--color-text-info) hover:underline">
                        {c.customer_code}
                      </Link>
                    </TableCell>
                    <TableCell className="px-3 py-2.5 font-medium text-foreground">
                      <Link href={`/sales/khach/${encodeURIComponent(c.customer_code)}`} className="hover:text-(--color-text-info) hover:underline">
                        {c.name || '—'}
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{c.phone || '—'}</TableCell>
                    <TableCell className="px-3 py-2.5 text-muted-foreground">{c.province || '—'}</TableCell>
                    <TableCell className="px-3 py-2.5 text-right text-foreground">{c.total_orders ?? 0}</TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{fmtDate(c.last_order_date)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableWrap>
      </div>
    </SalesScreen>
  )
}
