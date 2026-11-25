'use client'

// PROTOTYPE vứt đi — PA E "Hồ sơ máy & khách là trung tâm" (lưới bento, đọc trước): thẻ lớn đầu trang về MÁY (bảo hành
// còn bao lâu) + KHÁCH; dưới là các thẻ: Ticket này · Chi phí (StatCard) · Lịch sử máy · Nhóm lỗi · Nhật ký gần nhất.
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { Progress } from '@/components/ui/progress'
import { PropertyList, PropertyRow } from '@/components/ui/property-list'
import { StatCard } from '@/components/ui/stat-card'
import { Timeline, type MucTimeline } from '@/components/ui/timeline'
import {
  cacLan,
  CanhBao,
  cheSdt,
  DuongDan,
  meta,
  mucGhiChu,
  ngayVN,
  NhomLoi,
  NutLichKT,
  ONguoi,
  OKhan,
  OTrangThai,
  tieuDe,
  type DuLieuCt,
} from './chung'

const NGAY = 86400e3

/** Bảo hành còn bao lâu. Ticket chưa có ngày bắt đầu BH → tạm giả định kỳ 12 tháng (đang đoán, chờ dữ liệu thật). */
function baoHanh(d: DuLieuCt) {
  const { t } = d
  if (t.warranty_activated && t.warranty_full_end) {
    const con = Math.ceil((Date.parse(t.warranty_full_end) - Date.now()) / NGAY)
    return { demo: false, con, den: t.warranty_full_end, phanTram: Math.max(0, Math.min(100, (con / 365) * 100)) }
  }
  // Ticket demo không có máy/BH → số mẫu để thấy bố cục.
  return { demo: true, con: 143, den: null, phanTram: (143 / 365) * 100 }
}

/** Lịch sử máy: dữ liệu local không có ticket khác cùng serial → mẫu Demo. */
const LICH_SU_DEMO: MucTimeline[] = [
  { id: 'ls1', ai: 'TK-DEMO-640', loai: 'thay lõi định kỳ · đã xong', luc: '2026-03-12T03:00:00Z' },
  { id: 'ls2', ai: 'TK-DEMO-712', loai: 'rò nước van cấp · đã xong', luc: '2026-07-02T03:00:00Z' },
  { id: 'ls3', ai: 'TK-DEMO-901', loai: 'ticket này', luc: '2026-11-20T03:00:00Z', color: 'danger' },
]

export function CtE({ d }: { d: DuLieuCt }) {
  const { t } = d
  const bh = baoHanh(d)
  const lan = cacLan(d)
  const cuoi = lan.at(-1)!
  const thu = d.items.reduce((s, i) => s + (i.tinh_phi ? (i.so_tien ?? 0) : 0), 0)
  const nk = mucGhiChu(d)

  return (
    <div className="flex flex-col gap-6 border-none border-current">
      <PageHeader duongDan={<DuongDan ma={t.ticket_code} />} tieuDe={tieuDe(d)} meta={meta(d)} hanhDong={<NutLichKT d={d} />} />
      <CanhBao d={d} />

      {/* Thẻ lớn: máy (trái) + khách (phải). */}
      <Card className="grid gap-6 p-5 md:grid-cols-2">
        <section aria-labelledby="e-may" className="flex min-w-0 flex-col gap-3 border-none border-current">
          <span className="ds-text-xs text-muted-foreground">Máy</span>
          <h2 id="e-may" className="m-0 ds-heading-md">
            {t.serial ? (
              <Link href={`/may/${encodeURIComponent(t.serial)}`} prefetch={false} className="text-inherit hover:underline">
                {t.product_name}
              </Link>
            ) : (
              (t.product_name ?? 'Chưa rõ model')
            )}
          </h2>
          <span className="ds-text-sm tabular-nums text-muted-foreground">Serial {t.source_serial ?? '—'}</span>
          <div className="flex flex-col gap-1.5 border-none border-current">
            <div className="flex items-center justify-between gap-2 border-none border-current ds-text-sm">
              <span>
                Bảo hành còn <b className="tabular-nums">{bh.con > 0 ? `${bh.con} ngày` : 'hết hạn'}</b>
                {bh.den && <span className="text-muted-foreground tabular-nums"> · đến {ngayVN(bh.den)}</span>}
              </span>
              {bh.demo && <Badge variant="soft">Demo</Badge>}
            </div>
            <Progress value={bh.phanTram} aria-label={`Bảo hành còn ${bh.con} ngày`} />
          </div>
        </section>
        <section aria-labelledby="e-khach" className="flex min-w-0 flex-col gap-3 border-none border-current">
          <span className="ds-text-xs text-muted-foreground">Khách</span>
          <h2 id="e-khach" className="m-0 ds-heading-md">
            {t.customer_id ? (
              <Link href={`/khach/${t.customer_id}`} prefetch={false} className="text-inherit hover:underline">
                {t.customer_name}
              </Link>
            ) : (
              (t.customer_name ?? 'Chưa gắn khách')
            )}
          </h2>
          <PropertyList>
            <PropertyRow nhan="SĐT">{cheSdt(t.primary_phone) && <span className="tabular-nums">{cheSdt(t.primary_phone)}</span>}</PropertyRow>
            <PropertyRow nhan="Tỉnh/TP">{t.province}</PropertyRow>
            <PropertyRow nhan="Nhận việc">{t.cs_ten}</PropertyRow>
          </PropertyList>
        </section>
      </Card>

      {/* Bento: 1 cột < md, 2 cột md, 3 cột lg. */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col gap-4 md:col-span-2">
          <CardHeader>
            <CardTitle>Ticket này</CardTitle>
            <CardDescription className="tabular-nums">
              {lan.length} lần lỗi · lần cuối báo {ngayVN(cuoi.ngay)}
            </CardDescription>
          </CardHeader>
          <div className="flex flex-wrap items-center gap-3 border-none border-current">
            <OTrangThai d={d} />
            <OKhan d={d} />
            <ONguoi d={d} loai="kt" />
          </div>
          <div className="grid gap-4 border-none border-current sm:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-1 border-none border-current">
              <span className="ds-text-xs text-muted-foreground">Khách nói (lần {cuoi.so})</span>
              <p className="m-0 ds-text-sm whitespace-pre-line">{cuoi.khach ?? '—'}</p>
            </div>
            <div className="flex min-w-0 flex-col gap-1 border-none border-current">
              <span className="ds-text-xs text-muted-foreground">Xử lý gần nhất</span>
              <p className="m-0 ds-text-sm whitespace-pre-line">{cuoi.xuLy ?? 'Chưa ghi xử lý.'}</p>
            </div>
          </div>
        </Card>

        <div className="grid content-start gap-4 border-none border-current">
          <StatCard nhan="Tổng thu khách" giaTri={thu} donVi="₫" />
          <StatCard nhan="Vật tư / chi phí đã ghi" giaTri={d.items.length} donVi="mục" />
        </div>

        <Card className="flex flex-col gap-4">
          <CardHeader>
            <CardTitle>Lịch sử máy</CardTitle>
            <CardDescription>Các ticket cùng serial</CardDescription>
          </CardHeader>
          <Badge variant="soft" className="self-start">
            Demo — DB local chưa có ticket khác cùng serial
          </Badge>
          <Timeline muc={LICH_SU_DEMO} aria-label="Lịch sử máy" />
        </Card>

        <Card className="flex flex-col gap-4">
          <CardHeader>
            <CardTitle>Nhóm lỗi</CardTitle>
          </CardHeader>
          {d.nhom.length > 0 ? <NhomLoi d={d} /> : <p className="m-0 ds-text-sm text-muted-foreground">Chưa xếp vào nhóm lỗi nào.</p>}
        </Card>

        <Card className="flex flex-col gap-4">
          <CardHeader>
            <CardTitle>Nhật ký gần nhất</CardTitle>
            <CardDescription>{nk.length} ghi chú</CardDescription>
          </CardHeader>
          {nk.length > 0 ? (
            // 3 mục mới nhất; nút "Hiện N hoạt động cũ hơn" của Timeline = xem hết.
            <Timeline muc={nk} hien={3} aria-label="Nhật ký gần nhất" />
          ) : (
            <p className="m-0 ds-text-sm text-muted-foreground">Chưa có ghi chú.</p>
          )}
        </Card>
      </div>
    </div>
  )
}
