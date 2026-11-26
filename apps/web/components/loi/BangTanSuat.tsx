import Link from 'next/link'
import { EmptyState } from '@/components/ui/empty-state'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import type { DongTanSuat } from '@/lib/loi/tanSuat'
import { hienNgayChay, hienTyLe } from '@/lib/loi/tanSuatTrang'

const nhanThang = (t: string) => `${t.slice(5)}/${t.slice(0, 4)}`
const ndu = (n: number | null) => (n == null ? '—' : n.toLocaleString('vi-VN'))

export function BangTanSuat({ rows, thang }: { rows: DongTanSuat[]; thang: string[] }) {
  if (!rows.length) {
    return <EmptyState kieu="loc" capTieuDe={2} tieuDe="Không có ca lỗi nào trong khoảng đã chọn." />
  }
  const tongThang = Object.fromEntries(thang.map((t) => [t, rows.reduce((s, r) => s + (r.theo_thang[t] ?? 0), 0)]))
  const tongCa = rows.reduce((s, r) => s + r.so_ca, 0)
  return (
    <div className="space-y-2">
      <TableWrap vien>
        <Table variant="thuong">
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className="whitespace-nowrap">Nhóm</TableHead><TableHead scope="col" className="whitespace-nowrap">Lỗi</TableHead><TableHead scope="col" className="whitespace-nowrap">Model</TableHead>
              {thang.map((t) => <TableHead key={t} phai scope="col" className="whitespace-nowrap">{nhanThang(t)}</TableHead>)}
              <TableHead phai scope="col" className="whitespace-nowrap">Tổng ca</TableHead>
              <TableHead phai scope="col" className="whitespace-nowrap">Bán lũy kế</TableHead><TableHead phai scope="col" className="whitespace-nowrap">% / bán</TableHead>
              <TableHead phai scope="col" className="whitespace-nowrap">Nhập lũy kế</TableHead><TableHead phai scope="col" className="whitespace-nowrap">% / nhập</TableHead>
              <TableHead phai scope="col" className="whitespace-nowrap">Ngày chạy (trung vị)</TableHead><TableHead phai scope="col" className="whitespace-nowrap">Máy báo lại</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={`${r.loi_code}|${r.internal_code}`}>
                <TableCell className="whitespace-nowrap text-muted-foreground">{r.nhom_ten}</TableCell>
                <TableCell>
                  <Link href={`/ticket?loi=${encodeURIComponent(r.loi_code)}`} className="text-[var(--color-text-info)] underline underline-offset-2">{r.loi_ten}</Link>
                </TableCell>
                <TableCell className="whitespace-nowrap font-mono text-xs">{r.internal_code}</TableCell>
                {thang.map((t) => <TableCell key={t} phai className="tabular-nums whitespace-nowrap">{r.theo_thang[t] || ''}</TableCell>)}
                <TableCell phai className="tabular-nums whitespace-nowrap font-semibold">{r.so_ca}</TableCell>
                <TableCell phai className="tabular-nums whitespace-nowrap">{ndu(r.ban_luy_ke)}</TableCell><TableCell phai className="tabular-nums whitespace-nowrap">{hienTyLe(r.ty_le_ban)}</TableCell>
                <TableCell phai className="tabular-nums whitespace-nowrap">{ndu(r.nhap_luy_ke)}</TableCell><TableCell phai className="tabular-nums whitespace-nowrap">{hienTyLe(r.ty_le_nhap)}</TableCell>
                <TableCell phai className="tabular-nums whitespace-nowrap">{hienNgayChay(r.trung_vi_ngay_chay)}</TableCell>
                <TableCell phai className="tabular-nums whitespace-nowrap">{r.so_may_lap_lai || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter className="font-semibold">
            <TableRow>
              <TableCell colSpan={3}>Tổng cộng</TableCell>
              {thang.map((t) => <TableCell key={t} phai className="tabular-nums whitespace-nowrap">{tongThang[t] || ''}</TableCell>)}
              <TableCell phai className="tabular-nums whitespace-nowrap">{tongCa}</TableCell>
              <TableCell colSpan={6} />
            </TableRow>
          </TableFooter>
        </Table>
      </TableWrap>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Mỗi dòng máy trên ticket tính là một ca (một ca cho mỗi dòng máy, không phải mỗi ticket). Tỷ lệ = số ca trong khoảng đã chọn ÷ số máy bán/nhập
        lũy kế đến hết tháng cuối; hiện “—” khi chưa có số bán/nhập của model đó. Bán = dòng đơn hàng không huỷ/hoàn, gom theo mã nội bộ (mã combo không tách).
        Nhập = serial nạp theo PO (serial_registry). Ngày chạy = từ ngày lắp tới ngày báo lỗi, chỉ tính máy có ngày lắp. Máy báo lại = số máy được báo
        từ hai ticket khác nhau trở lên.
      </p>
    </div>
  )
}
