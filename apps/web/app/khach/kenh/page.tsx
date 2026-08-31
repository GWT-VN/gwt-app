import Link from 'next/link'
import { Suspense } from 'react'
import { OTimKiem, PhanTrang } from '@/bang'
import { soatKenhKhach, kenhChon, type NhomKenh } from '@/app/actions'
import { DauTrang } from '@/components/DauTrang'
import { SuaKenhNhanh } from '@/components/SuaKenhNhanh'

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
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-4 p-4 sm:p-6">
        <DauTrang tieuDe="Soát kênh khách" phuDe="Xem và sửa hàng loạt — không phải mở từng hồ sơ" />

        <div className="flex flex-wrap gap-1.5">
          {TAB.map((t) => (
            <Link key={t.key} href={link(t.key)} prefetch={false}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                nhom === t.key ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'}`}>
              {t.nhan} ({dem[t.key]})
            </Link>
          ))}
        </div>
        <p className="text-xs text-slate-500">{TAB.find((t) => t.key === nhom)?.mo}</p>

        <Suspense><OTimKiem placeholder="Tên khách, SĐT hoặc mã KH…" /></Suspense>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Khách</th>
                <th className="px-3 py-2 font-medium">Tỉnh</th>
                <th className="px-3 py-2 font-medium">Máy</th>
                <th className="px-3 py-2 font-medium">Kênh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2">
                    <Link href={`/khach/${r.id}`} prefetch={false} className="text-sky-700 hover:underline">{r.ten ?? '(chưa có tên)'}</Link>
                    <div className="font-mono text-[11px] text-slate-400">{r.sdt ?? '—'}{r.ma_kh ? ` · ${r.ma_kh}` : ''}</div>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">{r.tinh ?? '—'}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{r.so_may || '—'}</td>
                  <td className="px-3 py-2">
                    <SuaKenhNhanh customerId={r.id} channelId={r.channel_id} kenhHienTai={r.kenh} tuDong={r.tu_dong} kenh={kenh} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={4} className="px-3 py-8 text-center text-sm text-slate-400">Không có khách nào trong nhóm này.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-400">{tong.toLocaleString('vi-VN')} khách trong nhóm này</p>
        <Suspense><PhanTrang trang={trang} soTrang={soTrang} /></Suspense>
      </div>
    </main>
  )
}
