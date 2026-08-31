import Link from 'next/link'
import { Suspense } from 'react'
import { OTimKiem, PhanTrang, LocNgay } from '@/bang'
import { hoSoNuoc } from '@/app/actions'
import { coDoNuoc } from '@/lib/nuoc'
import { DauTrang } from '@/components/DauTrang'
import { ChiSoNuoc } from '@/components/ChiSoNuoc'
import { vnDate } from '@/components/Badge'
import { LocTinhNuoc } from '@/components/LocTinhNuoc'

/**
 * Hồ sơ chất lượng nước — TOÀN BỘ khách (CEO yêu cầu 31/08/2026).
 *
 * *"Hồ sơ cả nước tất cả các khách hàng, xem theo tỉnh thành, địa chỉ, thời gian được."*
 *
 * Dữ liệu đo nước có từ lâu trong `maintenance_visit` nhưng **chưa màn nào đọc ra**, nên
 * ghi xong coi như mất. Trang này là chỗ đọc ra; lịch sử theo TỪNG khách nằm ở hồ sơ khách.
 */
export default async function NuocPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tinh?: string; ngtu?: string; ngden?: string; trang?: string }>
}) {
  const { q = '', tinh, ngtu, ngden, trang: trangRaw } = await searchParams
  const trang = Math.max(1, Number(trangRaw) || 1)
  const { rows, tong, soTrang } = await hoSoNuoc(q, { tinh, tu: ngtu, den: ngden, trang })

  const dsTinh = [...new Set(rows.map((r) => r.tinh).filter(Boolean))].sort() as string[]

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-4 p-4 sm:p-6">
        <DauTrang
          tieuDe="Hồ sơ chất lượng nước"
          phuDe="Mỗi lần kiểm tra một dòng — lọc theo tỉnh, khách, địa chỉ, thời gian"
        />

        <Suspense>
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[260px] flex-1">
              <OTimKiem placeholder="Tên khách, địa chỉ hoặc bộ máy…" />
            </div>
            <LocNgay nhan="Ngày đo" />
            <LocTinhNuoc dsTinh={dsTinh} dangChon={tinh ?? ''} />
          </div>
        </Suspense>

        <p className="text-sm text-slate-500">
          {tong.toLocaleString('vi-VN')} lượt đã đo nước
          {(q || tinh) && (
            // Nói thẳng giới hạn thay vì để người dùng tự đoán: tên khách/tỉnh nằm ở bảng khác
            // nên chỉ lọc được TRONG TRANG. Giấu chỗ này là để CS tin nhầm một con số sai.
            <span className="text-amber-700"> · lọc tên/tỉnh chỉ áp dụng trong trang đang xem</span>
          )}
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Ngày đo</th>
                <th className="px-3 py-2 font-medium">Khách</th>
                <th className="px-3 py-2 font-medium">Tỉnh / địa chỉ</th>
                <th className="px-3 py-2 font-medium">Bộ máy · lần</th>
                <th className="px-3 py-2 font-medium">Chỉ số (trước → sau lọc)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.visit_id} className="align-top">
                  <td className="whitespace-nowrap px-3 py-2 text-slate-700">{r.ngay ? vnDate(r.ngay) : '—'}</td>
                  <td className="px-3 py-2">
                    {r.customer_id
                      ? <Link href={`/khach/${r.customer_id}`} prefetch={false} className="text-sky-700 hover:underline">{r.ten_khach ?? 'khách chưa khớp'}</Link>
                      : <span className="text-slate-400">chưa khớp khách</span>}
                  </td>
                  <td className="px-3 py-2 text-slate-600">
                    {r.tinh && <div className="text-xs font-medium text-slate-700">{r.tinh}</div>}
                    <div className="line-clamp-2 text-xs text-slate-500">{r.dia_chi ?? '—'}</div>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">
                    {r.bo_may ?? '—'}{r.lan_thu ? <div className="text-slate-400">lần {r.lan_thu}</div> : null}
                  </td>
                  <td className="px-3 py-2">{coDoNuoc(r.do_nuoc) ? <ChiSoNuoc d={r.do_nuoc} /> : <span className="text-slate-300">—</span>}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-8 text-center text-sm text-slate-400">Chưa có lượt nào đo nước khớp bộ lọc.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <Suspense><PhanTrang trang={trang} soTrang={soTrang} /></Suspense>
      </div>
    </main>
  )
}
