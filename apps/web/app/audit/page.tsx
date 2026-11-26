import { Alert, AlertDescription } from '@/components/ui/alert'
import { BangTrangThai, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'
import { chanNeuThieuQuyen } from '@/lib/nen-tang/kiem-quyen'
import Link from 'next/link'
import { auditLog } from '@/app/actions'
import { hienNgay } from '@/lib/dinh-dang-ngay'

const NHAN_BANG: Record<string, string> = {
  cs_customers: 'khách', customer_contacts: 'SĐT phụ',
  filter_replacement: 'lịch thay lõi', installed_base: 'máy đã lắp',
}
const NHAN: Record<string, string> = {
  duyet_serial: 'Duyệt serial', tu_choi_serial: 'Từ chối serial', xoa_serial_pending: 'Xoá serial chờ',
  duyet_khach: 'Duyệt khách', kich_hoat_bh: 'Kích hoạt BH', sua_nv: 'Sửa nhân viên',
  gui_yeu_cau: 'Gửi yêu cầu (chờ duyệt)', duyet_yeu_cau: 'Duyệt yêu cầu', tu_choi_yeu_cau: 'Từ chối yêu cầu',
}

/** Nhãn hành động: ưu tiên map, còn lại suy từ mẫu <loai>_<bảng>. */
function nhanHanhDong(hd: string): string {
  if (NHAN[hd]) return NHAN[hd]
  const m = hd.match(/^(sua|xoa|doi_serial)_(.+)$/)
  if (m) {
    const loai = m[1] === 'sua' ? 'Sửa' : m[1] === 'xoa' ? 'Xoá' : 'Đổi serial'
    return `${loai} ${NHAN_BANG[m[2]] ?? m[2]}`
  }
  return hd
}

const khiNao = (iso: string) => hienNgay(iso, 'gio')
function chiTiet(o: Record<string, unknown> | null): string {
  if (!o) return '—'
  return Object.entries(o).map(([k, v]) => `${k}=${v ?? '—'}`).join(' · ')
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ n?: string }>
}) {
  await chanNeuThieuQuyen('he_thong.nhat_ky', 'ADMIN')
  const { n } = await searchParams
  const soDong = Math.min(5000, Math.max(100, Number(n) || 300))
  const rows = await auditLog(soDong)
  const conNua = rows.length === soDong

  return (
    <ManV2>
      <TrangDuLieu className="space-y-4">
        <PageHeader tieuDe="Nhật ký thao tác" />

        <Alert color="info"><AlertDescription>
          Vết mọi thao tác nhạy cảm: duyệt/kích hoạt/sửa/xoá + chi tiết. Đang hiện {rows.length} dòng gần nhất.
        </AlertDescription></Alert>

        {rows.length === 0 ? (
          <BangTrangThai trangThai="rongThat" tieuDe="Chưa có thao tác nào được ghi." />
        ) : (
          <TableWrap vien>
            <Table variant="thuong" className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Lúc</TableHead>
                  <TableHead scope="col">Người</TableHead>
                  <TableHead scope="col">Hành động</TableHead>
                  <TableHead scope="col">Đối tượng</TableHead>
                  <TableHead scope="col">Chi tiết</TableHead>
                  <TableHead scope="col">Kết quả</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} className="align-top">
                    <TableCell className="text-muted-foreground whitespace-nowrap">{khiNao(r.luc)}</TableCell>
                    <TableCell className="text-foreground whitespace-nowrap">{r.actor ?? '—'}</TableCell>
                    <TableCell className="text-foreground whitespace-nowrap">{nhanHanhDong(r.hanh_dong)}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground break-all">{r.doi_tuong ?? '—'}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-normal break-all max-w-md">{chiTiet(r.chi_tiet)}</TableCell>
                    <TableCell>
                      <Badge color={r.ket_qua === 'ok' ? 'success' : 'danger'}>{r.ket_qua}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableWrap>
        )}

        {conNua && (
          <Button asChild variant="outline">
            <Link href={`/audit?n=${soDong + 300}`}>Xem thêm 300 dòng</Link>
          </Button>
        )}
      </TrangDuLieu>
    </ManV2>
  )
}
