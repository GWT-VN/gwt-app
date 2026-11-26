import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SalesScreen } from '@/app/sales/_ui'
import { PageHeader } from '@/components/ui/page-header'
import Link from 'next/link'
import { Suspense } from 'react'
import { BoLocChon, BoLocGoiY, LocNgay, ThanhDangLoc } from '@/bang'
import { danhSachCtkm, nguonChoForm, quyenCtkm } from './actions'
import { CtkmActions } from './CtkmActions'
import { nhanKieuGiam, nhanNhomKhach } from '../_ctkm'

export const metadata = { title: 'Khuyến mãi · GWT Sales' }
export const dynamic = 'force-dynamic'

const vnd = new Intl.NumberFormat('vi-VN')
const tien = (n: number | null) => (n == null ? '—' : vnd.format(n) + ' ₫')

function fmt(d: string | null): string {
  if (!d) return '—'
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d)
  return m ? `${m[3]}/${m[2]}` : d
}

const CHIP: Record<string, string> = {
  ban_hanh: 'bg-emerald-100 text-emerald-700',
  nhap: 'bg-amber-100 text-amber-700',
  ket_thuc: 'bg-muted text-muted-foreground',
}
const NHAN_TT: Record<string, string> = {
  ban_hanh: '● Đang chạy',
  nhap: 'Nháp — chưa áp cho đơn nào',
  ket_thuc: 'Đã kết thúc',
}

export default async function CtkmPage({
  searchParams,
}: {
  searchParams: Promise<{ ngtu?: string; ngden?: string; sp?: string; kenh?: string; tt?: string }>
}) {
  const { ngtu, ngden, sp, kenh, tt } = await searchParams
  const [ds, quyen, nguon] = await Promise.all([
    danhSachCtkm({ ngtu, ngden, sp, kenh, trang_thai: tt }),
    quyenCtkm(),
    nguonChoForm(),
  ])
  const tenKenh = (id: number) => {
    const k = nguon.kenh.find((x) => x.id === id)
    return k ? (k.l2 ? `${k.l1} · ${k.l2}` : k.l1) : `#${id}`
  }
  const dieuKien = [
    ngtu || ngden ? { nhan: 'Thời gian', giaTri: `${ngtu || '…'} → ${ngden || '…'}` } : null,
    sp ? { nhan: 'Sản phẩm', giaTri: sp } : null,
    kenh ? { nhan: 'Kênh', giaTri: tenKenh(Number(kenh)) } : null,
    tt ? { nhan: 'Trạng thái', giaTri: NHAN_TT[tt] ?? tt } : null,
  ].filter(Boolean) as { nhan: string; giaTri: string }[]

  return (
    <SalesScreen className="max-w-[1100px] space-y-4">
      <div className="text-sm">
        <Link href="/sales" className="text-(--color-text-info) hover:underline">← Đơn hàng</Link>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <PageHeader tieuDe="Chương trình khuyến mãi" />
          <p className="text-sm text-muted-foreground">
            Khuyến mãi cho <b>khách lẻ</b> theo kênh. Khách đã gán bậc đại lý hưởng giá theo bậc, không ăn chương trình ở đây.
          </p>
        </div>
        {quyen.soan && (
          <Button asChild><Link href="/sales/ctkm/moi">＋ Tạo chương trình</Link></Button>
        )}
      </div>

      {/* Bộ lọc chuẩn — xem docs/CHUAN-FILTER.md. Đọc useSearchParams nên PHẢI bọc Suspense. */}
      <Suspense fallback={<div className="h-20" />}>
        <div className="space-y-2 rounded-xl border border-border bg-card p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <LocNgay nhan="Thời gian chạy" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <BoLocGoiY
              param="sp"
              nhan="Sản phẩm"
              tuyChon={nguon.sp.map((s) => ({ giaTri: s.ma, nhan: s.ten }))}
            />
            <BoLocChon
              param="kenh"
              nhan="Kênh"
              tuyChon={nguon.kenh.map((k) => ({ giaTri: String(k.id), nhan: k.l2 ? `${k.l1} · ${k.l2}` : k.l1 }))}
            />
            <BoLocChon
              param="tt"
              nhan="Trạng thái"
              tuyChon={[
                { giaTri: 'ban_hanh', nhan: 'Đang chạy' },
                { giaTri: 'nhap', nhan: 'Nháp' },
                { giaTri: 'ket_thuc', nhan: 'Đã kết thúc' },
              ]}
            />
          </div>
        </div>
      </Suspense>

      <ThanhDangLoc dieuKien={dieuKien} hienThi={ds.length} tong={ds.length} nhan="chương trình" />

      {sp && (
        <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          Đang lọc theo sản phẩm <b>{sp}</b> — kết quả gồm cả chương trình <b>áp cho mọi sản phẩm</b>,
          vì mã này nằm trong đó.
        </p>
      )}

      {!quyen.duyet && (
        <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          Bạn soạn và sửa được chương trình, nhưng <b>ban hành</b> phải do người có quyền duyệt.
          Soạn xong bấm <b>Lưu nháp</b> rồi báo để duyệt.
        </p>
      )}

      {ds.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
          {dieuKien.length ? 'Không có chương trình nào khớp bộ lọc.' : 'Chưa có chương trình nào.'}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {ds.map((c) => (
            <article
              key={c.id}
              className={
                'overflow-hidden rounded-xl border border-border bg-card shadow-sm ' +
                (c.trang_thai === 'ket_thuc' ? 'opacity-60' : '')
              }
            >
              <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-foreground">{c.ten}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {fmt(c.tu_ngay)} → {c.den_ngay ? fmt(c.den_ngay) : 'vô thời hạn'}
                    {c.ma && <span className="ml-2 font-mono text-muted-foreground">{c.ma}</span>}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${CHIP[c.trang_thai] ?? CHIP.nhap}`}>
                  {NHAN_TT[c.trang_thai] ?? c.trang_thai}
                </span>
              </div>

              <dl className="space-y-2 px-4 py-3 text-sm">
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-[11px] uppercase tracking-wide text-muted-foreground">Giảm giá</dt>
                  <dd className="font-medium text-foreground">
                    {nhanKieuGiam(c.kieu_giam, c.muc_chung)}
                    {c.kieu_giam === 'PCT' && c.giam_toi_da != null && (
                      <span className="ml-1 font-normal text-muted-foreground">(tối đa {tien(c.giam_toi_da)})</span>
                    )}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-[11px] uppercase tracking-wide text-muted-foreground">Áp dụng</dt>
                  <dd className="text-foreground">
                    {nhanNhomKhach(c.nhom_khach)}
                    {' · '}
                    {c.so_sp === 0 ? 'mọi sản phẩm' : `${c.so_sp} sản phẩm`}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-[11px] uppercase tracking-wide text-muted-foreground">Kênh</dt>
                  <dd className="text-foreground">
                    {c.so_kenh === 0 ? (
                      <span className="text-rose-600">chưa chọn kênh — sẽ không áp cho đơn nào</span>
                    ) : (
                      <span className="flex flex-wrap gap-1">
                        {c.kenh_nhan.slice(0, 3).map((k) => (
                          <Badge key={k} variant="soft" color="info">{k}</Badge>
                        ))}
                        {c.so_kenh > 3 && <span className="text-xs text-muted-foreground">+{c.so_kenh - 3}</span>}
                      </span>
                    )}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-[11px] uppercase tracking-wide text-muted-foreground">Quà kèm</dt>
                  <dd className="text-foreground">{c.so_qua === 0 ? 'không có' : `${c.so_qua} món`}</dd>
                </div>
              </dl>

              <CtkmActions id={c.id} ten={c.ten} trangThai={c.trang_thai} quyen={quyen} />
            </article>
          ))}
        </div>
      )}
    </SalesScreen>
  )
}
