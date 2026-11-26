import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { DetailLayout } from '@/components/ui/detail-layout'
import { PropertyList } from '@/components/ui/property-list'
import { Table, TableWrap, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { PageHeader } from '@/components/ui/page-header'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { coTheVaoSales } from '@/lib/nen-tang/gac-cong'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { chiTietDon } from '../../actions'
import { OrderActions } from '../../OrderActions'
import { Field, SalesScreen, StatusBadge, TabBadge, fmtDate, fmtQty, fmtVnd } from '../../_ui'
import {
  nhanVat, NHAN_O_SHEET, KHOI_O_SHEET, O_TICK, O_TIEN, O_NGAY,
} from '../../_types'

export const metadata = { title: 'Chi tiết đơn · GWT Sales' }
export const dynamic = 'force-dynamic'

export default async function ChiTietDonPage({ params }: { params: Promise<{ code: string }> }) {
  await requireNhanSu()
  if (!(await coTheVaoSales())) redirect('/?loi=khong_du_quyen')
  const { code } = await params
  const orderCode = decodeURIComponent(code)
  const don = await chiTietDon(orderCode)
  if (!don) notFound()
  // Đơn TẶNG chỉ có ở customer_purchases — bảng đó KHÔNG có cột tiền. Ẩn hẳn các cột
  // tiền thay vì hiện '0 ₫', vì 0 đ trông như "đã bán giá 0" chứ không phải "không có dữ liệu".
  const laDonTang = don.source_tab === 'DON_TANG'

  return (
    <SalesScreen className="max-w-[1100px] space-y-5">
      <PageHeader
        duongDan={<Link href="/sales" className="text-(--color-text-info) hover:underline">← Đơn hàng</Link>}
        tieuDe={don.order_code}
        meta={[
          <TabBadge key="loai" tab={don.source_tab} />,
          <Badge key="nguon" variant="soft" color={don.is_app ? 'info' : 'secondary'}>
            {don.is_app ? 'Đơn tạo từ app' : 'Từ Google Sheet'}
          </Badge>,
          ...(don.is_app && don.theo_sheet ? [
            <Badge key="sheet" variant="soft" color="warning" title="Đơn đã ghi lên Google Sheet Sales. Ô Sheet có (tình trạng, thanh toán, sản phẩm…) hiện theo Sheet — nguồn chuẩn. Sửa ở đây: bot chỉ ghi lên Sheet các ô vừa đổi.">
              Đang hiện bản Google Sheet
            </Badge>,
          ] : []),
          ...(don.created_by ? ['bởi ' + don.created_by] : []),
        ]}
        hanhDong={don.is_app ? <OrderActions orderCode={don.order_code} /> : undefined}
      />

      <DetailLayout
        benKhiHep="duoi"
        nhanBen="Thông tin đơn"
        chinh={
          <>
            <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="border-b border-border px-4 py-2.5 text-sm font-medium text-foreground">Sản phẩm trong đơn</div>
              <TableWrap>
                <Table variant="thuong">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-3 py-2.5 font-medium">Sản phẩm</TableHead>
                      <TableHead className="px-3 py-2.5 font-medium">Mã nội bộ</TableHead>
                      <TableHead className="px-3 py-2.5 font-medium">Danh mục</TableHead>
                      <TableHead className="px-3 py-2.5 text-right font-medium">SL</TableHead>
                      {!laDonTang && <TableHead className="px-3 py-2.5 text-right font-medium" title="Đơn giá ĐÃ GỒM VAT">Đơn giá<span className="ml-0.5 font-normal text-muted-foreground">(gồm VAT)</span></TableHead>}
                      {!laDonTang && <TableHead className="px-3 py-2.5 text-right font-medium" title="Giá niêm yết 1 đơn vị, đã gồm VAT">Niêm yết</TableHead>}
                      {!laDonTang && <TableHead className="px-3 py-2.5 text-right font-medium" title="(giá niêm yết × SL) − thành tiền">Khuyến mãi</TableHead>}
                      {!laDonTang && <TableHead className="px-3 py-2.5 text-right font-medium">VAT</TableHead>}
                      {!laDonTang && <TableHead className="px-3 py-2.5 text-right font-medium">Thành tiền</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {don.lines.map((l) => (
                      <TableRow key={l.key} className="hover:bg-muted">
                        <TableCell className="px-3 py-2.5 text-foreground">
                          <span className="inline-flex items-center gap-2">
                            {l.product_name || '—'}
                            {l.is_gift && (
                              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">Tặng</span>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-muted-foreground">{l.internal_code || '—'}</TableCell>
                        <TableCell className="px-3 py-2.5 text-muted-foreground">{[l.category_l1, l.category_l2].filter(Boolean).join(' / ') || '—'}</TableCell>
                        <TableCell className="px-3 py-2.5 text-right text-foreground">{fmtQty(l.quantity)}</TableCell>
                        {!laDonTang && <TableCell className="px-3 py-2.5 text-right text-foreground">{fmtVnd(l.unit_price_vat)}</TableCell>}
                        {!laDonTang && (
                          <TableCell className="px-3 py-2.5 text-right text-muted-foreground">
                            {l.gia_niem_yet == null ? <span title="Mã này chưa có trong bảng giá niêm yết">—</span> : fmtVnd(l.gia_niem_yet)}
                          </TableCell>
                        )}
                        {!laDonTang && (
                          <TableCell className="px-3 py-2.5 text-right">
                            {l.khuyen_mai == null ? (
                              <span className="text-slate-300" title={l.is_gift ? 'Dòng quà — theo dõi ở cột Tặng' : 'Chưa có giá niêm yết cho mã này'}>—</span>
                            ) : l.khuyen_mai > 0 ? (
                              <span className="font-medium text-emerald-700">{fmtVnd(l.khuyen_mai)}</span>
                            ) : l.khuyen_mai < 0 ? (
                              <span className="text-amber-700" title="Bán CAO hơn giá niêm yết">+{fmtVnd(-l.khuyen_mai)}</span>
                            ) : (
                              <span className="text-muted-foreground" title="Bán đúng giá niêm yết">0 ₫</span>
                            )}
                          </TableCell>
                        )}
                        {!laDonTang && (
                          <TableCell className="px-3 py-2.5 text-right text-muted-foreground">
                            {nhanVat(l.vat_pct, l.vat_loai)}
                          </TableCell>
                        )}
                        {!laDonTang && <TableCell className="px-3 py-2.5 text-right font-medium text-foreground">{fmtVnd(l.amount_vat)}</TableCell>}
                      </TableRow>
                    ))}
                  </TableBody>
                  {/* colSpan=8 vì bảng có 9 cột: SP · Mã · Danh mục · SL · Đơn giá · Niêm yết ·
                      Khuyến mãi · VAT · Thành tiền. Thêm/bớt cột thì PHẢI sửa số này. */}
                  {!laDonTang && (
                  <TableFooter className="border-t border-border bg-muted">
                    <TableRow>
                      <TableCell colSpan={8} className="px-3 py-2 text-right text-muted-foreground">Tổng trước VAT</TableCell>
                      <TableCell className="px-3 py-2 text-right text-foreground">{fmtVnd(don.total_net)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={8} className="px-3 py-2 text-right text-muted-foreground">Tiền VAT</TableCell>
                      <TableCell className="px-3 py-2 text-right text-foreground">{fmtVnd(don.total_vat_tien)}</TableCell>
                    </TableRow>
                    <TableRow className="border-t border-border">
                      <TableCell colSpan={8} className="px-3 py-2.5 text-right font-medium text-foreground">Tổng sau VAT</TableCell>
                      <TableCell className="px-3 py-2.5 text-right text-base font-semibold text-foreground">{fmtVnd(don.total_vat)}</TableCell>
                    </TableRow>
                  </TableFooter>
                  )}
                </Table>
              </TableWrap>
            </section>

            {laDonTang && (
              <p className="text-xs text-muted-foreground">
                Đơn tặng lấy từ bảng lịch sử mua (<code>customer_purchases</code>) — bảng này không lưu giá,
                nên đơn tặng không có số tiền. Không phải lỗi hiển thị.
              </p>
            )}

            {/* 31 ô Sheet bổ sung.
                CEO 24/08: *"ko biết có lưu hay ko vì ko hiển thị lại"*. Trước đây trang này
                chỉ hiện Ghi chú; muốn xem 30 ô kia phải bấm Sửa — tức là để kiểm tra app có
                ghi đúng không thì phải mở màn SỬA, nơi lỡ tay là đổi dữ liệu thật.
                Chỉ hiện ô CÓ giá trị: đơn POU mà bày 20 ô POE trống thì đọc mệt hơn là không có. */}
            {don.oSheet && <OSheet o={don.oSheet} />}

            {(don.note || don.lines.some((l) => l.note)) && (
              <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Ghi chú</div>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-foreground">
                  {don.note && <li>{don.note}</li>}
                  {don.lines.filter((l) => l.note).map((l) => (
                    <li key={l.key}>{l.note}</li>
                  ))}
                </ul>
              </section>
            )}
          </>
        }
        ben={
          <div className="space-y-4">
            <Card>
              <PropertyList>
                <Field label="Ngày" value={fmtDate(don.order_date)} />
                <Field
                  label="Khách"
                  value={
                    don.customer_code ? (
                      <Link href={`/sales/khach/${encodeURIComponent(don.customer_code)}`} className="text-(--color-text-info) hover:underline">
                        {don.customer_name || don.customer_code}
                      </Link>
                    ) : (
                      don.customer_name
                    )
                  }
                />
                <Field label="Tỉnh/TP" value={don.province} />
                <Field
                  label="Kênh"
                  value={don.channel ? don.channel + (don.channel_detail ? ` · ${don.channel_detail}` : '') : null}
                />
                <Field label="Tình trạng hàng" value={<StatusBadge value={don.fulfillment_status} />} />
                <Field label="Thanh toán" value={<StatusBadge value={don.payment_status} />} />
                <Field label="Hình thức TT" value={don.payment_method} />
                <Field label="Số dòng" value={don.lines.length} />
                {laDonTang ? (
                  <Field label="Tổng sau VAT" value={<span className="text-muted-foreground">không có dữ liệu tiền</span>} />
                ) : (
                  <Field label="Tổng sau VAT" value={<span className="font-semibold">{fmtVnd(don.total_vat)}</span>} />
                )}
              </PropertyList>
            </Card>

            {/* Cả đơn từ Sheet (05/11/2026: ô bổ sung đồng bộ từ Sheet Sales) */}
            {(don.address || don.partner_order_code || don.shipping_code || don.install_date) && (
              <Card>
                <PropertyList>
                  <Field label="Địa chỉ" value={don.address} />
                  <Field label="Mã đơn đối tác" value={don.partner_order_code} />
                  <Field label="Mã vận đơn" value={don.shipping_code} />
                  <Field label="Ngày lắp đặt" value={fmtDate(don.install_date)} />
                </PropertyList>
              </Card>
            )}
          </div>
        }
      />
    </SalesScreen>
  )
}

/** Có gì để hiện không — chuỗi rỗng, null, và `false` của ô tick đều coi như trống. */
function coGiaTri(v: unknown): boolean {
  if (v == null) return false
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') return v.trim() !== ''
  if (typeof v === 'number') return true
  return true
}

function hienGiaTri(khoa: string, v: unknown) {
  if (O_TICK.has(khoa)) return <span className="text-emerald-700">✓ có</span>
  if (O_TIEN.has(khoa)) return fmtVnd(Number(v) || 0)
  if (O_NGAY.has(khoa)) return fmtDate(String(v))
  const chu = String(v)
  // Link tracking bấm được — dán vào rồi mà phải copy tay thì thà không lưu.
  if (khoa === 'tracking_url' && /^https?:\/\//.test(chu)) {
    return (
      <a href={chu} target="_blank" rel="noopener noreferrer" className="break-all text-(--color-text-info) hover:underline">
        {chu}
      </a>
    )
  }
  return <span className="whitespace-pre-wrap">{chu}</span>
}

function OSheet({ o }: { o: Record<string, unknown> }) {
  const khoi = KHOI_O_SHEET
    .map((k) => ({ ten: k.ten, o: k.o.filter((x) => coGiaTri(o[x])) }))
    .filter((k) => k.o.length > 0)
  if (khoi.length === 0) return null
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-foreground">Thông tin thêm</div>
      <div className="space-y-4">
        {khoi.map((k) => (
          <div key={k.ten}>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{k.ten}</div>
            <PropertyList>
              {k.o.map((x) => (
                <Field key={x} label={NHAN_O_SHEET[x] ?? x} value={hienGiaTri(x, o[x])} />
              ))}
            </PropertyList>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Chỉ hiện ô đã điền. Ô để trống không hiện — bấm <b>Sửa</b> để xem và điền đủ danh sách.
      </p>
    </section>
  )
}
