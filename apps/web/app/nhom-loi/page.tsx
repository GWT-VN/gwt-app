import Link from 'next/link'
import { Suspense } from 'react'
import { issueReport, ticketsChuaPhanNhom, goiYGomNhom, listTabView } from '@/app/actions'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { KhungChon } from '@/bang'
import { BangNhomLoi } from '@/components/BangNhomLoi'
import { ManV2 } from '@/components/khung/ManV2'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { CHON_BANG_GHIM } from '@/components/ui/table-styles'

// Danh sách nhóm lỗi — khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). Cảnh báo an toàn đứng trên
// bảng (phải đập vào mắt); ghi chú cách gom + gợi ý gom nhóm + ticket chưa vào nhóm nằm dưới bảng.
export default async function NhomLoiPage({
  searchParams,
}: {
  searchParams: Promise<{ bh?: string; q?: string; nguong?: string }>
}) {
  const { bh, q = '', nguong } = await searchParams
  const baoHangOnly = bh === '1'
  const nguongGom = Math.min(5, Math.max(2, Number(nguong) || 3))
  const [rows, chuaPhanNhom, goiY, quyen, tabRieng] = await Promise.all([
    issueReport(baoHangOnly, q),
    ticketsChuaPhanNhom(q),
    goiYGomNhom(nguongGom),
    hoiQuyen({ cauHinh: ['cs.nhom_loi.cau_hinh', 'QUANLY'], viewChung: ['he_thong.view_chung', 'QUANLY'] }),
    listTabView('nhom_loi_tab'),
  ])

  const anToan = rows.filter((r) => r.muc_do === 'an_toan')
  const thieuMoTa = chuaPhanNhom.filter((t) => t.ly_do.startsWith('thiếu mô tả')).length

  return (
    <ManV2>
      <TrangDuLieu>
        <CauHinhBangDs giaoDien={{ ...O_TIM_PILL, ...CHON_BANG_GHIM }} thanhHangLoat="surface">
          <div className="min-w-0 space-y-4">
          {anToan.length > 0 && (
            <Alert color="danger">
              <AlertTitle>Có {anToan.reduce((s, r) => s + r.so_ticket, 0)} ticket thuộc nhóm rủi ro an toàn</AlertTitle>
              <AlertDescription>
                {anToan.map((r) => r.ten).join(', ')}. Gồm ca máy tự bốc khói và ca đun nóng liên tục.
                Cần báo hãng kể cả khi ticket đã đóng.
              </AlertDescription>
            </Alert>
          )}

          <KhungChon khoaTrang={[]} tong={0} bat={false} thamSo={{ q, bh }}>
            <Suspense>
              <BangNhomLoi
                rows={rows}
                tabRieng={tabRieng}
                quyenTabChung={quyen.viewChung}
                nutChinh={quyen.cauHinh && <Button asChild><Link href="/nhom-loi/moi">Tạo nhóm lỗi</Link></Button>}
              />
            </Suspense>
          </KhungChon>

          <Alert>
            <AlertDescription>
              Nhóm được gom <strong>tự động từ nội dung mô tả lỗi</strong>, không theo &ldquo;loại ticket&rdquo; của Odoo —
              vì loại ticket là kênh tiếp nhận (&ldquo;Khác&rdquo; chiếm 25%), không phải triệu chứng.
              Một ticket có thể thuộc nhiều nhóm. Bấm vào nhóm để soi từng ticket.
            </AlertDescription>
          </Alert>

          <Card className="space-y-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-semibold">Gợi ý gom nhóm mới ({goiY.length})</h2>
                <p className="text-sm text-muted-foreground">
                  Cụm từ lặp ở ≥{nguongGom} ticket <strong>chưa có nhóm</strong> — dấu hiệu nên lập nhóm để hệ tự gom về sau.
                  {quyen.cauHinh ? ' Bấm "Tạo nhóm" để mở form đã điền sẵn mẫu.' : ' (Bạn không có quyền tạo nhóm lỗi.)'}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">Ngưỡng</span>
                {[2, 3, 4].map((n) => (
                  <Button key={n} asChild size="sm" variant={nguongGom === n ? 'default' : 'outline'}>
                    <Link href={`/nhom-loi?${new URLSearchParams({ ...(q && { q }), ...(baoHangOnly && { bh: '1' }), nguong: String(n) })}`}
                      aria-current={nguongGom === n ? 'true' : undefined}>≥{n}</Link>
                  </Button>
                ))}
              </div>
            </div>
            {goiY.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Chưa có cụm nào lặp đủ ≥{nguongGom} ticket. Khi cùng một triệu chứng xuất hiện thêm, gợi ý sẽ hiện ở đây;
                hạ ngưỡng để soi sớm hơn.
              </p>
            ) : (
              <div className="space-y-2">
                {goiY.map((c) => (
                  <div key={c.tu} className="flex flex-wrap items-center gap-2 rounded-(--radius-md) border px-3 py-2">
                    <span className="font-medium text-foreground">&ldquo;{c.tu}&rdquo;</span>
                    <span className="text-xs text-muted-foreground">{c.so} ticket</span>
                    <span className="flex flex-wrap gap-1">
                      {c.tickets.map((tc) => (
                        <Badge key={tc} asChild variant="outline" className="tabular-nums">
                          <Link href={`/ticket/${tc}`}>{tc}</Link>
                        </Badge>
                      ))}
                    </span>
                    {quyen.cauHinh && (
                      <Button asChild size="sm" className="ml-auto">
                        <Link href={`/nhom-loi/moi?${new URLSearchParams({ goi_y: c.tu, ten: c.tu, tickets: c.tickets.join(',') })}`}>
                          Tạo nhóm
                        </Link>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {chuaPhanNhom.length > 0 && (
            <Card className="space-y-2">
              <h2 className="font-medium text-foreground">
                {chuaPhanNhom.length} ticket chưa vào nhóm nào
              </h2>
              <p className="text-sm text-muted-foreground">
                {thieuMoTa > 0 && (
                  <>
                    <strong>{thieuMoTa} ticket thiếu mô tả lỗi</strong> (Odoo để trống) — không có gì để gom,
                    phải mở ticket bổ sung nội dung khách báo.{' '}
                  </>
                )}
                Số còn lại mô tả không khớp nhóm nào — cân nhắc tạo nhóm mới.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {chuaPhanNhom.map((t) => (
                  <Badge key={t.ticket_code} asChild variant="outline" className="tabular-nums">
                    <Link href={`/ticket/${t.ticket_code}`} title={t.ly_do}>{t.ticket_code}</Link>
                  </Badge>
                ))}
              </div>
            </Card>
          )}
          </div>
        </CauHinhBangDs>
      </TrangDuLieu>
    </ManV2>
  )
}
