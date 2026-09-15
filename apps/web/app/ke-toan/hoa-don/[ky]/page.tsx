import Link from 'next/link'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { BoLocChon, OTimKiem, ThanhDangLoc, boDau } from '@/bang'
import { dongCuaKy, danhSachMa } from '../../actions'
import { FormUpload } from './FormUpload'
import { DongSua } from './DongSua'
import { NutGuiKeToan } from './NutGuiKeToan'

export const dynamic = 'force-dynamic'
type ThamSo = { q?: string; tc?: string; tab?: string; loi?: string }
const TC_OPTS_VAO = [{ giaTri: 'cao', nhan: 'Cao' }, { giaTri: 'trung binh', nhan: 'Trung bình' }, { giaTri: 'can review', nhan: 'Cần review' }, { giaTri: 'khong ro', nhan: 'Không rõ' }]
const TC_OPTS_RA = [{ giaTri: 'cao', nhan: 'Cao' }, { giaTri: 'trung binh', nhan: 'Trung bình' }, { giaTri: 'can gan tay', nhan: 'Cần gán tay' }, { giaTri: 'trong', nhan: 'Trống' }]
const MAU_TC: Record<string, string> = { 'can review': 'bg-amber-50', 'khong ro': 'bg-amber-100' }

export default async function KyPage({ params, searchParams }: { params: Promise<{ ky: string }>; searchParams: Promise<ThamSo> }) {
  const { ky } = await params
  const { q = '', tc, tab = 'vao', loi } = await searchParams
  const direction = tab === 'ra' ? 'ra' : 'vao'
  const { period, dong } = await dongCuaKy(ky, direction) // gác quyền trong action (chanKeToan → redirect)
  if (!period) redirect('/ke-toan')
  const maTatCa = await danhSachMa()
  const ma = direction === 'ra' ? maTatCa.filter((m) => !m.gt.startsWith('cp.')) : maTatCa
  const tcOpts = direction === 'ra' ? TC_OPTS_RA : TC_OPTS_VAO
  const qd = boDau(q)
  const rows = dong.filter((d) => (!tc || d.engine_conf === tc || (tc === 'khong ro' && !d.code))
    && (!qd || boDau(`${d.ten_ban ?? ''} ${d.ten_mua ?? ''} ${d.ten_hang ?? ''} ${d.so_hd ?? ''}`).includes(qd)))
  const dieuKien = [
    q ? { nhan: 'Tìm', giaTri: q } : null,
    tc ? { nhan: 'Độ tin cậy', giaTri: tcOpts.find((o) => o.giaTri === tc)?.nhan ?? tc } : null,
  ].filter(Boolean) as { nhan: string; giaTri: string }[]
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1320px] space-y-4 p-4 sm:p-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div><Link href="/ke-toan" className="text-sm text-slate-500">← Kỳ</Link>
            <h1 className="text-xl font-semibold">Kỳ {period.ky}{period.status === 'da_gui' ? <span className="ml-2 text-sm font-normal text-emerald-700">(đã gửi kế toán)</span> : null}</h1></div>
          <div className="flex items-center gap-2">
            <a href={`/ke-toan/hoa-don/${period.ky}/xuat`} className="rounded border border-[#3f8a6a] px-3 py-1 text-[#3f8a6a]">Tải Excel _DAXULY</a>
            <NutGuiKeToan period={period} />
          </div>
        </header>
        {loi ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">Không xuất được Excel: {loi}</p> : null}
        <FormUpload ky={period.ky} />
        <nav className="flex gap-2 text-sm">
          <Link href={`/ke-toan/hoa-don/${period.ky}?tab=vao`} className={`rounded px-3 py-1 ${direction === 'vao' ? 'bg-[#3f8a6a] text-white' : 'bg-white border'}`}>HĐ đầu vào ({period.so_dong_vao})</Link>
          <Link href={`/ke-toan/hoa-don/${period.ky}?tab=ra`} className={`rounded px-3 py-1 ${direction === 'ra' ? 'bg-[#3f8a6a] text-white' : 'bg-white border'}`}>HĐ đầu ra ({period.so_dong_ra})</Link>
        </nav>
        <Suspense fallback={<div className="h-16" />}>
          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <OTimKiem placeholder="Tìm NCC / tên hàng / số HĐ…" />
            <BoLocChon param="tc" nhan="Độ tin cậy" tuyChon={tcOpts} />
          </div>
        </Suspense>
        <ThanhDangLoc dieuKien={dieuKien} hienThi={rows.length} tong={dong.length} nhan="dòng" />
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-xs">
            <thead className="bg-slate-100 text-left"><tr>
              {direction === 'ra' ? (<>
                <th className="p-2">#</th><th className="p-2">Số HĐ</th><th className="p-2">Ngày</th><th className="p-2">Người mua</th><th className="p-2">Tên hàng</th>
                <th className="p-2 text-right">Thành tiền</th><th className="p-2">Mã nội bộ (sửa)</th><th className="p-2">Ghi chú</th>
                <th className="p-2">Mã khách</th><th className="p-2">Nhóm</th><th className="p-2">Kênh</th><th className="p-2">Đại lý</th>
                <th className="p-2">Độ tin cậy</th><th className="p-2">Căn cứ</th>
              </>) : (<>
                <th className="p-2">#</th><th className="p-2">Số HĐ</th><th className="p-2">Ngày</th><th className="p-2">Người bán</th><th className="p-2">Tên hàng</th>
                <th className="p-2 text-right">Thành tiền</th><th className="p-2">Mã (sửa)</th><th className="p-2">Ghi chú</th><th className="p-2">Luật</th><th className="p-2">TK Nợ</th><th className="p-2">TK Có</th><th className="p-2">1331</th>
                <th className="p-2">Độ tin cậy</th><th className="p-2">Căn cứ</th>
              </>)}</tr></thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className={`border-t ${MAU_TC[d.engine_conf ?? ''] ?? (!d.code ? 'bg-amber-100' : '')}`}>
                  <td className="p-2 text-slate-400">{d.row_order}</td><td className="p-2">{d.ky_hieu} {d.so_hd}</td><td className="p-2">{d.ngay_lap}</td>
                  <td className="p-2 max-w-[220px] truncate" title={(direction === 'ra' ? d.ten_mua : d.ten_ban) ?? ''}>{direction === 'ra' ? d.ten_mua : d.ten_ban}</td>
                  <td className="p-2 max-w-[280px] truncate" title={d.ten_hang ?? ''}>{d.ten_hang}</td>
                  <td className="p-2 text-right tabular-nums">{d.thanh_tien?.toLocaleString('vi-VN')}</td>
                  <DongSua d={d} ma={ma} huong={direction} />
                  {direction === 'ra' ? (<>
                    <td className="p-2">{d.customer_code}</td><td className="p-2">{d.product_group}</td>
                    <td className="p-2">{d.channel_l1}{d.channel_l2 ? ` / ${d.channel_l2}` : ''}</td><td className="p-2">{d.dealer_name}</td>
                  </>) : (<>
                    <td className="p-2">{d.tk_no}</td><td className="p-2">{d.tk_co}</td><td className="p-2">{d.vat_1331}</td>
                  </>)}
                  <td className="p-2">{d.engine_conf}</td><td className="p-2 min-w-[260px] max-w-[360px] text-slate-500">{d.engine_reason}</td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
