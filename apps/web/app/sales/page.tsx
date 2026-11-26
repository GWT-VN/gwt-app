import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableWrap, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { SalesScreen, TabBadge } from './_ui'
import { PageHeader } from '@/components/ui/page-header'
import Link from 'next/link'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { coTheVaoSales } from '@/lib/nen-tang/gac-cong'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { BoLocChon, BoLocGoiY, LocNgay, OTimKiem, ThanhDangLoc } from '@/bang'
import { danhSachDon, kenhChiTietTrongDon, kenhTrongDon, spTrongDon } from './actions'
import { FULFILL_OPTS, PAYMENT_OPTS } from './_types'
import { hienNgay } from '@/lib/dinh-dang-ngay'

export const metadata = { title: 'Đơn hàng · GWT Sales' }
export const dynamic = 'force-dynamic'

const vnd = new Intl.NumberFormat('vi-VN')
const fmtVnd = (n: number) => (n ? vnd.format(Math.round(n)) + ' ₫' : '—')
const fmtDate = (d: string | null) => hienNgay(d)
const TABS = [
  { key: '', label: 'Tất cả' },
  { key: 'DON_POE', label: 'POE' },
  { key: 'DON_POU', label: 'POU' },
  { key: 'DON_OTHERS', label: 'Khác' },
  { key: 'DON_TANG', label: 'Tặng' },
]

type ThamSo = {
  q?: string; tab?: string
  // Tên tham số lọc ngày theo chuẩn TOÀN APP — xem docs/CHUAN-FILTER.md.
  ngtu?: string; ngden?: string
  tt?: string; tp?: string; kenh?: string; kenh2?: string; sp?: string
}

export default async function SalesDonPage({ searchParams }: { searchParams: Promise<ThamSo> }) {
  await requireNhanSu()
  if (!(await coTheVaoSales())) redirect('/?loi=khong_du_quyen')
  const sp0 = await searchParams
  const { q, ngtu, ngden, tt, tp, kenh, kenh2, sp } = sp0
  const curTab = sp0.tab ?? ''
  const [rows, kenhOpts, kenhCtOpts, spOpts] = await Promise.all([
    danhSachDon(q ?? '', curTab, { ngtu, ngden, tt, tp, kenh, kenh2, sp }),
    kenhTrongDon(),
    kenhChiTietTrongDon(),
    spTrongDon(),
  ])
  // Chọn kênh cấp 1 rồi thì cấp 2 chỉ hiện chi tiết THUỘC kênh đó — đỡ phải cuộn qua
  // chi tiết của kênh khác. Chưa chọn cấp 1 thì hiện tất cả.
  const kenh2Opts = (kenh ? kenhCtOpts.filter((k) => k.kenh === kenh) : kenhCtOpts)
    .map((k) => ({ giaTri: k.chiTiet, nhan: kenh ? k.chiTiet : `${k.chiTiet} (${k.kenh || '—'})` }))

  const dieuKien = [
    ngtu || ngden ? { nhan: 'Ngày', giaTri: `${ngtu || '…'} → ${ngden || '…'}` } : null,
    tt ? { nhan: 'Tình trạng', giaTri: tt } : null,
    tp ? { nhan: 'Thanh toán', giaTri: tp } : null,
    kenh ? { nhan: 'Kênh', giaTri: kenh } : null,
    kenh2 ? { nhan: 'Kênh chi tiết', giaTri: kenh2 } : null,
    sp ? { nhan: 'Sản phẩm', giaTri: sp } : null,
  ].filter(Boolean) as { nhan: string; giaTri: string }[]

  return (
    <SalesScreen className="max-w-[1100px] space-y-4">
      <PageHeader
        tieuDe="Đơn hàng"
        meta={[rows.length + ' đơn', 'Đơn gắn nhãn “App” được tạo trên app và có thể sửa hoặc xoá']}
        hanhDong={<Button asChild><Link href="/sales/don/moi">＋ Tạo đơn</Link></Button>}
      />

      {/* Mọi component dưới đây đọc useSearchParams -> BẮT BUỘC bọc Suspense,
          thiếu là `next build` fail chứ không phải cảnh báo. */}
      <Suspense fallback={<div className="h-24" />}>
        <div className="space-y-2 rounded-xl border border-border bg-card p-3 shadow-sm">
          <OTimKiem placeholder="Tìm mã đơn / tên khách / sản phẩm…" />
          <div className="flex flex-wrap items-center gap-2">
            <LocNgay nhan="Ngày đơn" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <BoLocChon param="tt" nhan="Tình trạng" tuyChon={FULFILL_OPTS.map((o) => ({ giaTri: o, nhan: o }))} />
            <BoLocChon param="tp" nhan="Thanh toán" tuyChon={PAYMENT_OPTS.map((o) => ({ giaTri: o, nhan: o }))} />
            <BoLocChon param="kenh" nhan="Kênh" tuyChon={kenhOpts.map((o) => ({ giaTri: o, nhan: o }))} />
            <BoLocChon param="kenh2" nhan="Kênh chi tiết" tuyChon={kenh2Opts} />
            {/* Sản phẩm dùng ô GÕ-ĐỂ-GỢI-Ý: danh mục quá dài để cuộn tay. Gõ mã hoặc tên đều ra. */}
            <BoLocGoiY param="sp" nhan="Sản phẩm" tuyChon={spOpts.map((o) => ({ giaTri: o.ma, nhan: o.ten }))} />
          </div>
        </div>
      </Suspense>

      <ThanhDangLoc dieuKien={dieuKien} hienThi={rows.length} tong={rows.length} nhan="đơn" />

      {sp && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Đang lọc theo sản phẩm <b>{sp}</b> — cột <b>Tổng</b> chỉ cộng các dòng khớp sản phẩm này,
          không phải tổng cả đơn.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const params = new URLSearchParams()
          for (const [k, v] of Object.entries(sp0)) if (k !== 'tab' && v) params.set(k, v)
          if (t.key) params.set('tab', t.key)
          const href = '/sales' + (params.toString() ? `?${params.toString()}` : '')
          const on = curTab === t.key
          return (
            <Link
              key={t.key || 'all'}
              href={href}
              className={'rounded-full border px-3 py-1.5 text-xs font-medium ' + (on ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:border-border')}
            >
              {t.label}
            </Link>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <TableWrap>
          <Table variant="thuong">
            <TableHeader>
              <TableRow>
                <TableHead className="px-3 py-2.5 font-medium">Mã đơn</TableHead>
                <TableHead className="px-3 py-2.5 font-medium">Ngày</TableHead>
                <TableHead className="px-3 py-2.5 font-medium">Khách</TableHead>
                <TableHead className="px-3 py-2.5 font-medium">Tình trạng</TableHead>
                <TableHead className="px-3 py-2.5 font-medium">Thanh toán</TableHead>
                <TableHead className="px-3 py-2.5 text-right font-medium">Tổng (VAT)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-3 py-10 text-center text-muted-foreground">Không có đơn nào khớp.</TableCell>
                </TableRow>
              ) : (
                rows.map((o) => (
                  <TableRow key={o.order_code} className="hover:bg-muted">
                    <TableCell className="whitespace-nowrap px-3 py-2.5">
                      <Link
                        href={`/sales/don/${encodeURIComponent(o.order_code)}`}
                        className="inline-flex items-center gap-2 font-medium text-(--color-text-info) hover:underline"
                      >
                        {o.source_tab && <TabBadge tab={o.source_tab} />}
                        {o.order_code}
                        {o.is_app && (
                          <Badge variant="soft" color="info">App</Badge>
                        )}
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{fmtDate(o.order_date)}</TableCell>
                    <TableCell className="px-3 py-2.5 text-foreground">
                      {o.customer_name || '—'}
                      {o.province ? <span className="block text-xs text-muted-foreground">{o.province}</span> : null}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-muted-foreground">{o.fulfillment_status || '—'}</TableCell>
                    <TableCell className="px-3 py-2.5 text-muted-foreground">{o.payment_status || '—'}</TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2.5 text-right font-medium text-foreground">{fmtVnd(o.total_vat)}</TableCell>
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
