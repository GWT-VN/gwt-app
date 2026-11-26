import Link from 'next/link'
import { Suspense } from 'react'
import { OTimKiem, PhanTrang } from '@/bang'
import { soatKenhKhach, kenhChon, type NhomKenh } from '@/app/actions'
import { SuaKenhNhanh } from '@/components/SuaKenhNhanh'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'
import { CauHinhBangDs } from '@/components/ui/bang-ds'

/**
 * Soát KÊNH của khách CSKH — CEO yêu cầu 31/08/2026.
 *
 * Nguyên văn: *"Gửi lại tôi danh sách để tôi kiểm tra chứ mở từng người 113 người bao giờ mới
 * xong. Chia ra gồm 113 máy điền, 74 người điền và 240 trống thành 3 tab cho tôi xem."*
 *
 * Ba tab đúng ba mức tin cậy khác nhau, nên phải tách chứ không gộp một bảng có cột "nguồn":
 *  · **máy điền** — hệ suy ra, CẦN NGƯỜI DUYỆT. Đây là nhóm đáng soát nhất.
 *  · **người điền** — đã có người xác nhận, chỉ xem lại khi nghi ngờ.
 *  · **còn trống** — chưa ai điền, cần điền.
 * Sửa được NGAY TẠI DÒNG: mở 113 hồ sơ để đổi một ô chọn là sai cách dùng.
 */
const TAB: { key: NhomKenh; nhan: string; mo: string }[] = [
  { key: 'may',   nhan: 'Máy điền',    mo: 'Hệ tự suy từ đơn/khách — cần anh duyệt' },
  { key: 'nguoi', nhan: 'Người điền',  mo: 'Đã có người xác nhận' },
  { key: 'trong', nhan: 'Còn trống',   mo: 'Chưa có kênh' },
]

export default async function SoatKenhPage({
  searchParams,
}: {
  searchParams: Promise<{ nhom?: string; q?: string; trang?: string }>
}) {
  const { nhom: nhomRaw, q = '', trang: trangRaw } = await searchParams
  const nhom: NhomKenh = nhomRaw === 'nguoi' || nhomRaw === 'trong' ? nhomRaw : 'may'
  const trang = Math.max(1, Number(trangRaw) || 1)
  const [{ rows, tong, soTrang, dem }, kenh] = await Promise.all([
    soatKenhKhach(nhom, q, trang),
    kenhChon(),
  ])

  const link = (k: NhomKenh) => `/khach/kenh?nhom=${k}${q ? `&q=${encodeURIComponent(q)}` : ''}`

  return (
    <ManV2>
      <TrangDuLieu>
        <CauHinhBangDs>
          <div className="min-w-0 space-y-4">
            <PageHeader tieuDe="Soát kênh khách" meta={["Xem và sửa hàng loạt — không phải mở từng hồ sơ"]} />

            <div className="flex flex-wrap gap-1.5">
              {TAB.map((t) => (
                <Link key={t.key} href={link(t.key)} prefetch={false}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    nhom === t.key ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-muted-foreground hover:bg-muted'}`}>
                  {t.nhan} ({dem[t.key]})
                </Link>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{TAB.find((t) => t.key === nhom)?.mo}</p>

            <Suspense><OTimKiem placeholder="Tên khách, SĐT hoặc mã KH…" /></Suspense>

            <div className="overflow-x-auto rounded-(--radius-xl) border border-border bg-card">
              <Table>
                <TableHeader className="bg-muted text-left text-xs text-muted-foreground">
                  <TableRow>
                    <TableHead className="px-3 py-2 font-medium">Khách</TableHead>
                    <TableHead className="px-3 py-2 font-medium">Tỉnh</TableHead>
                    <TableHead className="px-3 py-2 font-medium">Máy</TableHead>
                    <TableHead className="px-3 py-2 font-medium">Kênh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border">
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="px-3 py-2">
                        <Link href={`/khach/${r.id}`} prefetch={false} className="text-(--color-text-info) hover:underline">{r.ten ?? '(chưa có tên)'}</Link>
                        <div className="tabular-nums text-[11px] text-muted-foreground">{r.sdt ?? '—'}{r.ma_kh ? ` · ${r.ma_kh}` : ''}</div>
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs text-muted-foreground">{r.tinh ?? '—'}</TableCell>
                      <TableCell className="px-3 py-2 text-xs text-muted-foreground">{r.so_may || '—'}</TableCell>
                      <TableCell className="px-3 py-2">
                        <SuaKenhNhanh customerId={r.id} channelId={r.channel_id} kenhHienTai={r.kenh} tuDong={r.tu_dong} kenh={kenh} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="px-3 py-8 text-center text-sm text-muted-foreground">Không có khách nào trong nhóm này.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <p className="text-xs text-muted-foreground">{tong.toLocaleString('vi-VN')} khách trong nhóm này</p>
            <Suspense><PhanTrang trang={trang} soTrang={soTrang} /></Suspense>
          </div>
        </CauHinhBangDs>
      </TrangDuLieu>
    </ManV2>
  )
}
