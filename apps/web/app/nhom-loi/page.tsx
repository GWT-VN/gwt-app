import Link from 'next/link'
import { Suspense } from 'react'
import { issueReport, ticketsChuaPhanNhom, goiYGomNhom } from '@/app/actions'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { MucDoBadge, BaoHangBadge } from '@/components/NhomLoiBadge'
import { OTimKiem, ThanhDangLoc } from '@/bang'
import { ManV2 } from '@/components/khung/ManV2'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'
import { BangTrangThai, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from '@/components/ui/table'

export default async function NhomLoiPage({
  searchParams,
}: {
  searchParams: Promise<{ bh?: string; q?: string; nguong?: string }>
}) {
  const { bh, q = '', nguong } = await searchParams
  const baoHangOnly = bh === '1'
  const nguongGom = Math.min(5, Math.max(2, Number(nguong) || 3))
  const [rows, chuaPhanNhom, goiY, quyen] = await Promise.all([
    issueReport(baoHangOnly, q),
    ticketsChuaPhanNhom(q),
    goiYGomNhom(nguongGom),
    hoiQuyen({ cauHinh: ['cs.nhom_loi.cau_hinh', 'QUANLY'] }),
  ])

  const anToan = rows.filter((r) => r.muc_do === 'an_toan')
  const thieuMoTa = chuaPhanNhom.filter((t) => t.ly_do.startsWith('thiếu mô tả')).length

  return (
    <ManV2>
      <CauHinhBangDs>
        <TrangDuLieu className="space-y-4">
          <PageHeader
            tieuDe="Nhóm lỗi"
            hanhDong={quyen.cauHinh && (
              <Button asChild><Link href="/nhom-loi/moi">Tạo nhóm lỗi</Link></Button>
            )}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav aria-label="Lọc nhóm báo hãng" className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant={baoHangOnly ? 'outline' : 'default'}>
                <Link href={`/nhom-loi?${new URLSearchParams({ ...(q && { q }), ...(nguong && { nguong }) })}`}
                  aria-current={!baoHangOnly ? 'true' : undefined}>Tất cả nhóm</Link>
              </Button>
              <Button asChild size="sm" variant={baoHangOnly ? 'default' : 'outline'}>
                <Link href={`/nhom-loi?${new URLSearchParams({ ...(q && { q }), ...(nguong && { nguong }), bh: '1' })}`}
                  aria-current={baoHangOnly ? 'true' : undefined}>Chỉ nhóm báo hãng</Link>
              </Button>
            </nav>
            <div className="w-full min-w-0 sm:w-72">
              <Suspense>
                <OTimKiem placeholder="Gõ tên nhóm, mô tả lỗi, mã ticket…" aria-label="Tìm nhóm lỗi" />
              </Suspense>
            </div>
          </div>

          {anToan.length > 0 && (
            <Alert color="danger">
              <AlertTitle>Có {anToan.reduce((s, r) => s + r.so_ticket, 0)} ticket thuộc nhóm rủi ro an toàn</AlertTitle>
              <AlertDescription>
                {anToan.map((r) => r.ten).join(', ')}. Gồm ca máy tự bốc khói và ca đun nóng liên tục.
                Cần báo hãng kể cả khi ticket đã đóng.
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertDescription>
              Nhóm được gom <strong>tự động từ nội dung mô tả lỗi</strong>, không theo &ldquo;loại ticket&rdquo; của Odoo —
              vì loại ticket là kênh tiếp nhận (&ldquo;Khác&rdquo; chiếm 25%), không phải triệu chứng.
              Một ticket có thể thuộc nhiều nhóm. Bấm vào nhóm để soi từng ticket.
            </AlertDescription>
          </Alert>

          <ThanhDangLoc
            dieuKien={q ? [{ nhan: 'Từ khoá', giaTri: q }] : []}
            hienThi={rows.length}
            tong={rows.length}
            nhan="nhóm lỗi"
          />

          {rows.length === 0 ? (
            <BangTrangThai trangThai={q || baoHangOnly ? 'rongLoc' : 'rongThat'} tieuDe="Không có nhóm lỗi" />
          ) : (
            <TableWrap vien className="min-w-0">
              <Table aria-label="Danh sách nhóm lỗi" className="min-w-[760px]">
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Nhóm lỗi</TableHead>
                    <TableHead scope="col">Mức</TableHead>
                    <TableHead scope="col" phai>Ticket</TableHead>
                    <TableHead scope="col" phai>Đang mở</TableHead>
                    <TableHead scope="col" phai>90 ngày</TableHead>
                    <TableHead scope="col" phai>Khách</TableHead>
                    <TableHead scope="col" phai>Máy</TableHead>
                    <TableHead scope="col">Model dính</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.code} className={r.muc_do === 'an_toan' ? '[&>td]:bg-(--color-background-danger-surface)' : undefined}>
                      <TableCell>
                        <Link href={`/nhom-loi/${r.code}`} prefetch={false} className="text-foreground underline font-medium">
                          {r.ten}
                        </Link>
                        {r.bao_hang && <span className="ml-2 inline-block"><BaoHangBadge /></span>}
                        {r.mo_ta && <div className="text-xs text-muted-foreground mt-1 max-w-xl whitespace-normal">{r.mo_ta}</div>}
                      </TableCell>
                      <TableCell><MucDoBadge muc_do={r.muc_do} /></TableCell>
                      <TableCell phai>{r.so_ticket}</TableCell>
                      <TableCell phai>
                        {r.dang_mo > 0
                          ? <span className="text-(--color-text-warning) font-medium">{r.dang_mo}</span>
                          : <span className="text-muted-foreground">0</span>}
                      </TableCell>
                      <TableCell phai>{r.trong_90_ngay}</TableCell>
                      <TableCell phai>{r.so_khach}</TableCell>
                      <TableCell phai>{r.so_may}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {r.cac_model ?? <span className="text-muted-foreground">chưa gắn máy</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrap>
          )}

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
                  <Link
                    key={t.ticket_code}
                    href={`/ticket/${t.ticket_code}`}
                    className="px-2 py-1 rounded border text-xs font-mono text-foreground hover:bg-muted"
                    title={t.ly_do}
                  >
                    {t.ticket_code}
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </TrangDuLieu>
      </CauHinhBangDs>
    </ManV2>
  )
}
