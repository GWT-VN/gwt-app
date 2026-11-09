import Link from 'next/link'
import type { DongTanSuat } from '@/lib/loi/tanSuat'
import { hienNgayChay, hienTyLe } from '@/lib/loi/tanSuatTrang'

const nhanThang = (t: string) => `${t.slice(5)}/${t.slice(0, 4)}`
const ndu = (n: number | null) => (n == null ? '—' : n.toLocaleString('vi-VN'))
const th = 'px-3 py-2 text-left font-medium whitespace-nowrap'
const sh = 'px-3 py-2 text-right tabular-nums whitespace-nowrap'

export function BangTanSuat({ rows, thang }: { rows: DongTanSuat[]; thang: string[] }) {
  if (!rows.length) {
    return <div className="bg-white border border-slate-200 rounded-xl p-6 text-sm text-slate-500">Không có ca lỗi nào trong khoảng đã chọn.</div>
  }
  const tongThang = Object.fromEntries(thang.map((t) => [t, rows.reduce((s, r) => s + (r.theo_thang[t] ?? 0), 0)]))
  const tongCa = rows.reduce((s, r) => s + r.so_ca, 0)
  return (
    <div className="space-y-2">
      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs">
            <tr>
              <th className={th}>Nhóm</th><th className={th}>Lỗi</th><th className={th}>Model</th>
              {thang.map((t) => <th key={t} className={`${th} text-right`}>{nhanThang(t)}</th>)}
              <th className={`${th} text-right`}>Tổng ca</th>
              <th className={`${th} text-right`}>Bán lũy kế</th><th className={`${th} text-right`}>% / bán</th>
              <th className={`${th} text-right`}>Nhập lũy kế</th><th className={`${th} text-right`}>% / nhập</th>
              <th className={`${th} text-right`}>Ngày chạy (trung vị)</th><th className={`${th} text-right`}>Máy báo lại</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={`${r.loi_code}|${r.internal_code}`} className="hover:bg-slate-50">
                <td className="px-3 py-2 whitespace-nowrap text-slate-600">{r.nhom_ten}</td>
                <td className="px-3 py-2">
                  <Link href={`/ticket?loi=${encodeURIComponent(r.loi_code)}`} className="text-sky-700 hover:underline">{r.loi_ten}</Link>
                </td>
                <td className="px-3 py-2 whitespace-nowrap font-mono text-xs">{r.internal_code}</td>
                {thang.map((t) => <td key={t} className={sh}>{r.theo_thang[t] || ''}</td>)}
                <td className={`${sh} font-semibold`}>{r.so_ca}</td>
                <td className={sh}>{ndu(r.ban_luy_ke)}</td><td className={sh}>{hienTyLe(r.ty_le_ban)}</td>
                <td className={sh}>{ndu(r.nhap_luy_ke)}</td><td className={sh}>{hienTyLe(r.ty_le_nhap)}</td>
                <td className={sh}>{hienNgayChay(r.trung_vi_ngay_chay)}</td>
                <td className={sh}>{r.so_may_lap_lai || '—'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 font-semibold">
            <tr>
              <td className="px-3 py-2" colSpan={3}>Tổng cộng</td>
              {thang.map((t) => <td key={t} className={sh}>{tongThang[t] || ''}</td>)}
              <td className={sh}>{tongCa}</td>
              <td className="px-3 py-2" colSpan={6} />
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">
        Mỗi dòng máy trên ticket tính là một ca (một ca cho mỗi dòng máy, không phải mỗi ticket). Tỷ lệ = số ca trong khoảng đã chọn ÷ số máy bán/nhập
        lũy kế đến hết tháng cuối; hiện “—” khi chưa có số bán/nhập của model đó. Bán = dòng đơn hàng không huỷ/hoàn, gom theo mã nội bộ (mã combo không tách).
        Nhập = serial nạp theo PO (serial_registry). Ngày chạy = từ ngày lắp tới ngày báo lỗi, chỉ tính máy có ngày lắp. Máy báo lại = số máy được báo
        từ hai ticket khác nhau trở lên.
      </p>
    </div>
  )
}
